import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { buildComponentTree, type PageWorkspaceResponse, type SyncSchemaItem } from '@codigo/schema';
import { Repository } from 'typeorm';
import { Component, Page } from 'src/modules/flow/entity/low-code.entity';
import { PageCollaborator } from 'src/modules/flow/entity/page-collaborator.entity';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Component)
    private readonly componentRepository: Repository<Component>,
    @InjectRepository(PageCollaborator)
    private readonly pageCollaboratorRepository: Repository<PageCollaborator>,
  ) {}

  async getPageWorkspace(
    pageId: number,
    user: TCurrentUser,
  ): Promise<PageWorkspaceResponse> {
    const page = await this.ensurePageAccess(pageId, user.id);
    const schema = await this.buildPageSchema(page);
    const repositoryRoot = this.resolveRepositoryRoot();
    const metadata = this.buildWorkspaceMetadata(page, repositoryRoot);

    return {
      ...metadata,
      componentCount: schema.length,
      schema,
    };
  }

  async syncPageWorkspace(
    pageId: number,
    user: TCurrentUser,
  ): Promise<PageWorkspaceResponse> {
    const page = await this.ensurePageAccess(pageId, user.id);
    const schema = await this.buildPageSchema(page);
    const repositoryRoot = this.resolveRepositoryRoot();
    const templateRoot = this.resolveTemplateRoot(repositoryRoot);
    const metadata = this.buildWorkspaceMetadata(page, repositoryRoot);

    await rm(metadata.workspaceRoot, { recursive: true, force: true });
    await mkdir(metadata.workspaceRoot, { recursive: true });
    await cp(templateRoot, metadata.workspaceRoot, { recursive: true });

    await this.rewriteWorkspacePackageJson(
      metadata.packageJsonPath,
      metadata.workspaceName,
      page.page_name,
    );
    await mkdir(join(metadata.workspaceRoot, 'src'), { recursive: true });
    await writeFile(
      metadata.schemaFilePath,
      JSON.stringify(schema, null, 2),
      'utf8',
    );

    return {
      ...metadata,
      exists: true,
      componentCount: schema.length,
      lastSyncedAt: new Date().toISOString(),
      schema,
    };
  }

  private async ensurePageAccess(pageId: number, userId: number) {
    const page = await this.pageRepository.findOneBy({ id: pageId });
    if (!page) {
      throw new NotFoundException('页面不存在');
    }

    if (page.account_id === userId) {
      return page;
    }

    const collaborator = await this.pageCollaboratorRepository.findOneBy({
      page_id: pageId,
      user_id: userId,
    });

    if (!collaborator) {
      throw new ForbiddenException('当前用户无权访问该页面源码工作区');
    }

    return page;
  }

  private async buildPageSchema(page: Page): Promise<SyncSchemaItem[]> {
    const flatComponents = await this.componentRepository.find({
      where: {
        page_id: page.id,
      },
      order: {
        id: 'ASC',
      },
    });

    return buildComponentTree(
      flatComponents.map((component) => ({
        id: component.node_id,
        type: component.type,
        name: component.name,
        props: component.options ?? {},
        styles: component.styles,
        slot: component.slot ?? undefined,
        meta: component.meta,
        parentId: component.parent_node_id,
      })),
      page.components,
    );
  }

  private buildWorkspaceMetadata(
    page: Page,
    repositoryRoot: string,
  ): PageWorkspaceResponse {
    const workspaceId = `page-${page.id}`;
    const workspaceDirectoryName = `workspace-${workspaceId}`;
    const workspaceRoot = join(
      repositoryRoot,
      'packages',
      workspaceDirectoryName,
    );
    const templateRoot = join(repositoryRoot, 'packages', 'template');

    return {
      pageId: page.id,
      pageName: page.page_name,
      workspaceId,
      workspaceName: `@codigo/${workspaceDirectoryName}`,
      workspaceRoot,
      workspaceRelativePath: this.toPosixPath(
        relative(repositoryRoot, workspaceRoot),
      ),
      templateRoot,
      packageJsonPath: join(workspaceRoot, 'package.json'),
      schemaFilePath: join(workspaceRoot, 'src', 'schema.json'),
      entryFilePath: join(workspaceRoot, 'src', 'main.tsx'),
      packageManager: 'pnpm',
      installCommand: 'pnpm install',
      devCommand: 'pnpm dev',
      exists: existsSync(workspaceRoot),
      componentCount: 0,
    };
  }

  private resolveRepositoryRoot() {
    let currentDirectory = resolve(process.cwd());

    while (true) {
      if (existsSync(join(currentDirectory, 'pnpm-workspace.yaml'))) {
        return currentDirectory;
      }

      const parentDirectory = resolve(currentDirectory, '..');
      if (parentDirectory === currentDirectory) {
        throw new InternalServerErrorException('未找到仓库根目录');
      }
      currentDirectory = parentDirectory;
    }
  }

  private resolveTemplateRoot(repositoryRoot: string) {
    const templateRoot = join(repositoryRoot, 'packages', 'template');
    if (!existsSync(templateRoot)) {
      throw new InternalServerErrorException(
        '未找到源码模板包 packages/template',
      );
    }
    return templateRoot;
  }

  private async rewriteWorkspacePackageJson(
    packageJsonPath: string,
    workspaceName: string,
    pageName: string,
  ) {
    if (!existsSync(packageJsonPath)) {
      throw new InternalServerErrorException('模板 package.json 不存在');
    }

    const packageJsonContent = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent) as Record<
      string,
      unknown
    >;
    packageJson.name = workspaceName;
    packageJson.description = `workspace for page ${pageName}`;
    await writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf8',
    );
  }

  private toPosixPath(pathValue: string) {
    return pathValue.replaceAll('\\', '/');
  }
}
