import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  buildComponentTree,
  flattenComponentTree,
  type ComponentNode,
  type IPageSchema,
  type PostReleaseRequest,
} from '@codigo/schema';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import {
  Component,
  ComponentData,
  Page,
} from 'src/modules/flow/entity/low-code.entity';
import { PageVersion } from 'src/modules/flow/entity/page-version.entity';
import { DataSource, Repository } from 'typeorm';

function objectOmit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

@Injectable()
export class PageReleaseService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Component)
    private readonly componentRepository: Repository<Component>,
    @InjectRepository(ComponentData)
    private readonly componentDataRepository: Repository<ComponentData>,
    @InjectRepository(PageVersion)
    private readonly pageVersionRepository: Repository<PageVersion>,
  ) {}

  private resolveReleaseSchema(body: PostReleaseRequest): IPageSchema {
    if (body.schema?.components?.length) {
      return {
        version: body.schema.version ?? 2,
        components: body.schema.components,
      };
    }

    const components = (body.components ?? []).map((component) => ({
      id: component.node_id ?? String(component.id),
      type: component.type,
      name: component.name,
      props: component.options ?? {},
      styles: component.styles,
      slot: component.slot ?? undefined,
      meta: component.meta,
      children: [],
    })) as ComponentNode[];

    return {
      version: body.schema_version ?? 1,
      components,
    };
  }

  private buildPageSchema(
    components: Component[],
    rootIds: string[],
    version: number,
  ): IPageSchema {
    return {
      version,
      components: buildComponentTree(
        components.map((component) => ({
          id: component.node_id,
          type: component.type,
          name: component.name,
          props: component.options ?? {},
          styles: component.styles,
          slot: component.slot ?? undefined,
          meta: component.meta,
          parentId: component.parent_node_id,
        })),
        rootIds,
      ),
    };
  }

  async release(body: PostReleaseRequest, user: TCurrentUser) {
    const { schema, components, schema_version, ...otherBody } = body;
    const resolvedSchema = this.resolveReleaseSchema(body);
    const flattenedNodes = flattenComponentTree(resolvedSchema.components);
    const rootIds = resolvedSchema.components.map((item) => item.id);
    let id = 0;
    const queryRunner = this.dataSource.createQueryRunner();

    async function insertComponents(pageId: number) {
      for (const component of flattenedNodes) {
        const componentResult = await queryRunner.manager.insert(Component, {
          node_id: component.id,
          parent_node_id: component.parentId ?? null,
          type: component.type,
          options: component.props ?? {},
          styles: component.styles as Record<string, any> | undefined,
          slot: component.slot ?? null,
          name: component.name,
          meta: component.meta as Record<string, any> | undefined,
          page_id: pageId,
          account_id: user.id,
        });
      }

      await queryRunner.manager.update(Page, pageId, {
        components: rootIds,
      });
    }

    async function updatePage(existingPage: Page) {
      await queryRunner.manager.update(Page, existingPage.id, {
        ...otherBody,
        components: [],
        schema_version: schema?.version ?? schema_version ?? 2,
      });

      for (const component of existingPage.components) {
        await queryRunner.manager.delete(Component, {
          page_id: existingPage.id,
          node_id: component,
        });
      }

      await queryRunner.manager.delete(Component, {
        page_id: existingPage.id,
      });

      const componentDatas = await queryRunner.manager.findBy(ComponentData, {
        page_id: existingPage.id,
      });
      for (const componentData of componentDatas) {
        await queryRunner.manager.delete(ComponentData, componentData.id);
      }

      await insertComponents(existingPage.id);
    }

    async function createPage() {
      const createdPage = await queryRunner.manager.insert(Page, {
        ...otherBody,
        account_id: user.id,
        components: [],
        schema_version: schema?.version ?? schema_version ?? 2,
      });
      const pageId = createdPage.identifiers[0].id;
      id = pageId;
      await insertComponents(pageId);
    }

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const existingPages = await queryRunner.manager.findBy(Page, {
        account_id: user.id,
      });

      if (existingPages.length > 0) {
        id = existingPages[0].id;
        await updatePage(existingPages[0]);
      } else {
        await createPage();
      }

      const lastVersion = await queryRunner.manager.findOne(PageVersion, {
        where: { page_id: id },
        order: { version: 'DESC' },
      });
      const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

      await queryRunner.manager.insert(PageVersion, {
        page_id: id,
        account_id: user.id,
        version: nextVersion,
        desc: `Version ${nextVersion}`,
        schema_data: body as any,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`发布失败: ${String(err)}`);
    } finally {
      await queryRunner.release();
    }

    return {
      msg: '发布成功',
      data: id,
    };
  }

  async getPageVersions(pageId: number) {
    return await this.pageVersionRepository.find({
      where: { page_id: pageId },
      order: { created_at: 'DESC' },
      select: ['id', 'page_id', 'account_id', 'version', 'desc', 'created_at'],
    });
  }

  async getPageVersionDetail(pageId: number, versionId: string) {
    const version = await this.pageVersionRepository.findOne({
      where: { page_id: pageId, id: versionId },
    });
    if (!version) {
      throw new BadRequestException('版本不存在');
    }
    return version;
  }

  async getReleaseData(id: number | null, user?: TCurrentUser) {
    if (id == null) {
      return null;
    }

    const page = await this.pageRepository.findOneBy({
      id,
      account_id: user?.id,
    });
    if (!page) return;

    const components = await this.componentRepository.find({
      where: {
        page_id: page.id,
      },
      order: {
        id: 'ASC',
      },
    });
    const componentIds = page.components;
    const schema = this.buildPageSchema(
      components,
      componentIds,
      page.schema_version ?? 1,
    );

    return {
      ...objectOmit(page, ['components']),
      components,
      componentIds,
      schema_version: page.schema_version ?? 1,
      schema,
    };
  }

  async getMyReleaseData(user: TCurrentUser) {
    const page = await this.pageRepository.findOneBy({
      account_id: user.id,
    });
    if (!page) return null;

    const components = await this.componentRepository.find({
      where: {
        page_id: page.id,
      },
      order: {
        id: 'ASC',
      },
    });
    const componentIds = page.components;
    const schema = this.buildPageSchema(
      components,
      componentIds,
      page.schema_version ?? 1,
    );

    return {
      ...objectOmit(page, ['components']),
      components,
      componentIds,
      schema_version: page.schema_version ?? 1,
      schema,
    };
  }
}
