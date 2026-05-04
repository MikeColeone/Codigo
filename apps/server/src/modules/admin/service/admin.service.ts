import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ALL_ADMIN_PERMISSIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  resolveAdminPermissions,
  type AdminBigScreenComponentStat,
  type AdminBigScreenDistributionItem,
  type AdminBigScreenOverviewResponse,
  type AdminBigScreenRecentReleaseItem,
  type AdminBigScreenSummary,
  type AdminBigScreenTrendPoint,
  type AdminPermission,
  type GlobalRole,
} from '@codigo/schema';
import { DataSource, Repository } from 'typeorm';
import {
  Component,
  ComponentData,
  Page,
} from 'src/modules/flow/entity/low-code.entity';
import { OperationLog } from 'src/modules/flow/entity/operation-log.entity';
import { PageCollaborator } from 'src/modules/flow/entity/page-collaborator.entity';
import { PageVersion } from 'src/modules/flow/entity/page-version.entity';
import { Template } from 'src/modules/template/entity/template.entity';
import { User } from 'src/modules/user/entity/user.entity';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import { SecretTool } from 'src/shared/utils/secret.tool';

const BIG_SCREEN_DAYS = 7;
const BIG_SCREEN_COMPONENT_FALLBACK: AdminBigScreenComponentStat[] = [
  { type: 'lineChart', instanceCount: 18, pageCount: 6 },
  { type: 'dataTable', instanceCount: 15, pageCount: 5 },
  { type: 'cardGrid', instanceCount: 12, pageCount: 5 },
  { type: 'pieChart', instanceCount: 9, pageCount: 4 },
  { type: 'geoMap', instanceCount: 6, pageCount: 3 },
];
const BIG_SCREEN_TEMPLATE_TAG_FALLBACK: AdminBigScreenDistributionItem[] = [
  { name: 'admin', value: 8 },
  { name: 'screen', value: 4 },
  { name: 'analytics', value: 3 },
  { name: 'devops', value: 2 },
];

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly secretTool: SecretTool,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Component)
    private readonly componentRepository: Repository<Component>,
    @InjectRepository(ComponentData)
    private readonly componentDataRepository: Repository<ComponentData>,
    @InjectRepository(PageCollaborator)
    private readonly pageCollaboratorRepository: Repository<PageCollaborator>,
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
    @InjectRepository(PageVersion)
    private readonly pageVersionRepository: Repository<PageVersion>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async onModuleInit() {
    await this.ensureSuperAdmin();
  }

  async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.where('user.username LIKE :search OR user.phone LIKE :search', {
        search: `%${search}%`,
      });
    }

    query.skip((page - 1) * limit).take(limit);
    query.orderBy('user.id', 'DESC');

    const [users, total] = await query.getManyAndCount();

    return {
      list: users.map((user) => this.toSafeUser(user)),
      total,
      page,
      limit,
    };
  }

  async updateUserRole(
    id: number,
    role: GlobalRole,
    currentUser: TCurrentUser,
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('用户不存在');
    const previousRole = user.global_role;

    if (user.global_role === 'SUPER_ADMIN') {
      throw new BadRequestException('不能修改超级管理员角色');
    }

    if (currentUser.id === id && role !== currentUser.global_role) {
      throw new BadRequestException('不能修改自己的角色');
    }

    if (role === 'SUPER_ADMIN' && currentUser.global_role !== 'SUPER_ADMIN') {
      throw new BadRequestException('只有超级管理员可以创建新的超级管理员');
    }

    user.global_role = role;
    user.admin_permissions = this.resolveRolePermissions(
      role,
      previousRole,
      user,
    );
    if (role === 'SUPER_ADMIN') {
      user.status = 'active';
    }
    await this.userRepository.save(user);
    return { message: '角色修改成功' };
  }

  async updateUserStatus(
    id: number,
    status: 'active' | 'frozen',
    currentUser: TCurrentUser,
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('用户不存在');

    if (user.global_role === 'SUPER_ADMIN') {
      throw new BadRequestException('不能冻结超级管理员');
    }

    if (currentUser.id === id && status === 'frozen') {
      throw new BadRequestException('不能冻结当前登录账号');
    }

    user.status = status;
    await this.userRepository.save(user);
    return {
      message: `用户状态已更新为${status === 'active' ? '正常' : '冻结'}`,
    };
  }

  async updateUserPermissions(
    id: number,
    permissions: AdminPermission[],
    currentUser: TCurrentUser,
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('用户不存在');

    if (user.global_role === 'SUPER_ADMIN') {
      throw new BadRequestException('超级管理员不需要单独分配权限');
    }

    if (user.global_role !== 'ADMIN') {
      throw new BadRequestException('只有管理员支持分配后台权限');
    }

    const normalizedPermissions = this.normalizePermissions(permissions);
    if (
      currentUser.global_role !== 'SUPER_ADMIN' &&
      normalizedPermissions.includes('PERMISSION_ASSIGN')
    ) {
      throw new BadRequestException('只有超级管理员可以授予权限分配能力');
    }

    user.admin_permissions = normalizedPermissions;
    await this.userRepository.save(user);

    return { message: '后台权限更新成功' };
  }

  async getAllPages(page: number = 1, limit: number = 10, search?: string) {
    const query = this.pageRepository
      .createQueryBuilder('page')
      .leftJoin(User, 'owner', 'owner.id = page.account_id')
      .select([
        'page.id AS id',
        'page.account_id AS account_id',
        'page.page_name AS page_name',
        'page.desc AS page_desc',
        'page.lockEditing AS lock_editing',
        'owner.username AS owner_name',
        'owner.phone AS owner_phone',
      ]);

    if (search) {
      query.where(
        'page.page_name LIKE :search OR owner.username LIKE :search OR owner.phone LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const total = await query.getCount();
    const rows = await query
      .clone()
      .orderBy('page.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{
        id: number;
        account_id: number;
        page_name: string;
        page_desc: string;
        lock_editing: boolean | number | string;
        owner_name: string;
        owner_phone: string;
      }>();

    const pageIds = rows.map((row) => Number(row.id));
    const [componentCountMap, collaboratorCountMap, versionCountMap] =
      await Promise.all([
        this.buildCountMap(this.componentRepository, 'page_id', pageIds),
        this.buildCountMap(this.pageCollaboratorRepository, 'page_id', pageIds),
        this.buildCountMap(this.pageVersionRepository, 'page_id', pageIds),
      ]);

    return {
      list: rows.map((row) => ({
        id: Number(row.id),
        account_id: Number(row.account_id),
        page_name: row.page_name,
        desc: row.page_desc,
        lockEditing:
          row.lock_editing === true ||
          row.lock_editing === 1 ||
          row.lock_editing === '1',
        owner_name: row.owner_name,
        owner_phone: row.owner_phone,
        component_count: componentCountMap.get(Number(row.id)) ?? 0,
        collaborator_count: collaboratorCountMap.get(Number(row.id)) ?? 0,
        version_count: versionCountMap.get(Number(row.id)) ?? 0,
      })),
      total,
      page,
      limit,
    };
  }

  async getAdminPageVersions(pageId: number) {
    await this.ensurePageExists(pageId);
    return this.pageVersionRepository.find({
      where: { page_id: pageId },
      order: { version: 'DESC' },
      select: ['id', 'page_id', 'version', 'desc', 'created_at'],
    });
  }

  async deletePage(pageId: number) {
    await this.ensurePageExists(pageId);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(Component, { page_id: pageId });
      await manager.delete(ComponentData, { page_id: pageId });
      await manager.delete(PageCollaborator, { page_id: pageId });
      await manager.delete(OperationLog, { page_id: pageId });
      await manager.delete(PageVersion, { page_id: pageId });
      await manager.delete(Page, { id: pageId });
    });

    return { message: '页面删除成功' };
  }

  /**
   * 聚合后台数据大屏所需的统计结果，并在真实数据稀疏时补齐展示型 mock。
   */
  async getBigScreenOverview(
    user: TCurrentUser,
  ): Promise<AdminBigScreenOverviewResponse> {
    const todayStart = this.startOfDay(new Date());
    const trendStartDate = this.startOfDayOffset(todayStart, -(BIG_SCREEN_DAYS - 1));
    const expiringThreshold = this.startOfDayOffset(todayStart, BIG_SCREEN_DAYS);

    const [
      publishedSiteCount,
      publicSiteCount,
      privateSiteCount,
      expiringSiteCount,
      versionCount,
      publishedTodayCount,
      templateCount,
      publishedTemplateCount,
      collaboratorCount,
      collaborationPageCount,
      componentRows,
      publishTrendRows,
      recentReleaseRows,
      layoutModeRows,
      templates,
    ] = await Promise.all([
      this.pageRepository.countBy({ account_id: user.id }),
      this.pageRepository.countBy({ account_id: user.id, visibility: 'public' }),
      this.pageRepository.countBy({ account_id: user.id, visibility: 'private' }),
      this.pageRepository
        .createQueryBuilder('page')
        .where('page.account_id = :userId', { userId: user.id })
        .andWhere('page.expire_at IS NOT NULL')
        .andWhere('page.expire_at >= :todayStart', { todayStart })
        .andWhere('page.expire_at < :expiringThreshold', { expiringThreshold })
        .getCount(),
      this.pageVersionRepository.countBy({ account_id: user.id }),
      this.pageVersionRepository
        .createQueryBuilder('version')
        .select('COUNT(DISTINCT version.page_id)', 'count')
        .where('version.account_id = :userId', { userId: user.id })
        .andWhere('version.created_at >= :todayStart', { todayStart })
        .getRawOne<{ count: string | null }>(),
      this.templateRepository.count(),
      this.templateRepository.countBy({ status: 'published' }),
      this.pageCollaboratorRepository
        .createQueryBuilder('collaborator')
        .leftJoin(Page, 'page', 'page.id = collaborator.page_id')
        .where('page.account_id = :userId', { userId: user.id })
        .getCount(),
      this.pageCollaboratorRepository
        .createQueryBuilder('collaborator')
        .leftJoin(Page, 'page', 'page.id = collaborator.page_id')
        .select('COUNT(DISTINCT collaborator.page_id)', 'count')
        .where('page.account_id = :userId', { userId: user.id })
        .getRawOne<{ count: string | null }>(),
      this.componentRepository
        .createQueryBuilder('component')
        .select('component.type', 'type')
        .addSelect('COUNT(*)', 'instanceCount')
        .addSelect('COUNT(DISTINCT component.page_id)', 'pageCount')
        .where('component.account_id = :userId', { userId: user.id })
        .groupBy('component.type')
        .orderBy('instanceCount', 'DESC')
        .getRawMany<{
          type: string;
          instanceCount: string;
          pageCount: string;
        }>(),
      this.pageVersionRepository
        .createQueryBuilder('version')
        .select('DATE(version.created_at)', 'date')
        .addSelect('COUNT(DISTINCT version.page_id)', 'count')
        .where('version.account_id = :userId', { userId: user.id })
        .andWhere('version.created_at >= :trendStartDate', { trendStartDate })
        .groupBy('DATE(version.created_at)')
        .orderBy('DATE(version.created_at)', 'ASC')
        .getRawMany<{ date: string; count: string }>(),
      this.pageVersionRepository
        .createQueryBuilder('version')
        .leftJoin(Page, 'page', 'page.id = version.page_id')
        .leftJoin(User, 'owner', 'owner.id = version.account_id')
        .where('version.account_id = :userId', { userId: user.id })
        .select([
          'version.page_id AS pageId',
          'page.page_name AS pageName',
          'owner.username AS ownerName',
          'version.version AS version',
          'page.visibility AS visibility',
          'version.created_at AS publishedAt',
        ])
        .orderBy('version.created_at', 'DESC')
        .take(6)
        .getRawMany<{
          pageId: number;
          pageName: string;
          ownerName: string;
          version: string;
          visibility: 'public' | 'private';
          publishedAt: string;
        }>(),
      this.pageRepository
        .createQueryBuilder('page')
        .select('page.layoutMode', 'name')
        .addSelect('COUNT(*)', 'value')
        .where('page.account_id = :userId', { userId: user.id })
        .groupBy('page.layoutMode')
        .orderBy('value', 'DESC')
        .getRawMany<{ name: string; value: string }>(),
      this.templateRepository.find({
        select: ['id', 'tags'],
      }),
    ]);

    const componentTypeStats = componentRows.map((row) => ({
      type: row.type,
      instanceCount: Number(row.instanceCount),
      pageCount: Number(row.pageCount),
    }));
    const materialInstanceCount = componentTypeStats.reduce(
      (sum, item) => sum + item.instanceCount,
      0,
    );
    const summary: AdminBigScreenSummary = {
      publishedSiteCount,
      publishedTodayCount: Number(publishedTodayCount?.count ?? 0),
      publishActionCount: versionCount,
      templateCount,
      publishedTemplateCount,
      materialTypeCount: componentTypeStats.length,
      materialInstanceCount,
      collaboratorCount,
      collaborationPageCount: Number(collaborationPageCount?.count ?? 0),
      publicSiteCount,
      privateSiteCount,
      expiringSiteCount,
      versionCount,
      averageComponentsPerSite: publishedSiteCount
        ? Number((materialInstanceCount / publishedSiteCount).toFixed(1))
        : 0,
      pageViewCount: 0,
      uniqueVisitorCount: 0,
    };

    const mockedSections: string[] = [];
    const trafficSummary = this.buildMockTrafficSummary(summary, mockedSections);
    summary.pageViewCount = trafficSummary.pageViewCount;
    summary.uniqueVisitorCount = trafficSummary.uniqueVisitorCount;

    return {
      generatedAt: new Date().toISOString(),
      mockedSections,
      summary,
      publishTrend: this.buildPublishTrend(
        publishTrendRows,
        Math.max(summary.publishedSiteCount, 1),
        mockedSections,
      ),
      visibilityStats: this.buildVisibilityStats(summary, mockedSections),
      layoutModeStats: this.buildLayoutModeStats(layoutModeRows, mockedSections),
      templateTagStats: this.buildTemplateTagStats(templates, mockedSections),
      componentTypeStats: this.buildComponentTypeStats(
        componentTypeStats,
        mockedSections,
      ),
      recentReleases: this.buildRecentReleases(recentReleaseRows, mockedSections),
    };
  }

  async getComponentStats(search?: string) {
    const query = this.componentRepository
      .createQueryBuilder('component')
      .select('component.type', 'type')
      .addSelect('COUNT(*)', 'instance_count')
      .addSelect('COUNT(DISTINCT component.page_id)', 'page_count')
      .groupBy('component.type')
      .orderBy('instance_count', 'DESC');

    if (search) {
      query.where('component.type LIKE :search', { search: `%${search}%` });
    }

    const rows = await query.getRawMany<{
      type: string;
      instance_count: string;
      page_count: string;
    }>();

    return rows.map((row) => ({
      type: row.type,
      instance_count: Number(row.instance_count),
      page_count: Number(row.page_count),
    }));
  }

  async getAllComponents(
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: string,
  ) {
    const query = this.componentRepository
      .createQueryBuilder('component')
      .leftJoin(Page, 'page', 'page.id = component.page_id')
      .leftJoin(User, 'owner', 'owner.id = page.account_id')
      .select([
        'component.id AS id',
        'component.type AS type',
        'component.page_id AS page_id',
        'page.page_name AS page_name',
        'owner.username AS owner_name',
        'owner.phone AS owner_phone',
      ]);

    if (type) {
      query.andWhere('component.type = :type', { type });
    }

    if (search) {
      query.andWhere(
        'component.type LIKE :search OR page.page_name LIKE :search OR owner.username LIKE :search OR owner.phone LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const total = await query.getCount();
    const rows = await query
      .clone()
      .orderBy('component.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{
        id: number;
        type: string;
        page_id: number;
        page_name: string;
        owner_name: string;
        owner_phone: string;
      }>();

    return {
      list: rows.map((row) => ({
        id: Number(row.id),
        type: row.type,
        page_id: Number(row.page_id),
        page_name: row.page_name,
        owner_name: row.owner_name,
        owner_phone: row.owner_phone,
      })),
      total,
      page,
      limit,
    };
  }

  async deleteComponent(componentId: number) {
    const component = await this.componentRepository.findOneBy({
      id: componentId,
    });
    if (!component) {
      throw new NotFoundException('组件不存在');
    }

    const page = await this.pageRepository.findOneBy({ id: component.page_id });
    if (!page) {
      throw new NotFoundException('页面不存在');
    }

    const nextComponents = page.components.filter(
      (item) => item !== String(componentId),
    );

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Page, page.id, { components: nextComponents });
      await manager.delete(Component, { id: componentId });
    });

    return { message: '组件实例删除成功' };
  }

  private async ensureSuperAdmin() {
    const existedSuperAdmin = await this.userRepository.findOneBy({
      global_role: 'SUPER_ADMIN',
    });

    if (existedSuperAdmin) {
      if (!Array.isArray(existedSuperAdmin.admin_permissions)) {
        existedSuperAdmin.admin_permissions = [...ALL_ADMIN_PERMISSIONS];
        await this.userRepository.save(existedSuperAdmin);
      }
      return existedSuperAdmin;
    }

    const phone = process.env.SUPER_ADMIN_PHONE;
    const username = process.env.SUPER_ADMIN_USERNAME ?? '超级管理员';
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!phone || !password) {
      return null;
    }

    const passwordHash = this.secretTool.getSecret(password);
    const existedUser = await this.userRepository.findOneBy({ phone });

    if (existedUser) {
      return null;
    }

    return this.userRepository.save({
      username,
      head_img: '',
      phone,
      password: passwordHash,
      open_id: '',
      global_role: 'SUPER_ADMIN',
      admin_permissions: [...ALL_ADMIN_PERMISSIONS],
      status: 'active',
    });
  }

  private async ensurePageExists(pageId: number) {
    const page = await this.pageRepository.findOneBy({ id: pageId });
    if (!page) {
      throw new NotFoundException('页面不存在');
    }
    return page;
  }

  private async buildCountMap<T extends { page_id: number }>(
    repository: Repository<T>,
    fieldName: string,
    pageIds: number[],
  ) {
    if (pageIds.length === 0) {
      return new Map<number, number>();
    }

    const rows = await repository
      .createQueryBuilder('record')
      .select(`record.${fieldName}`, 'page_id')
      .addSelect('COUNT(*)', 'count')
      .where(`record.${fieldName} IN (:...pageIds)`, { pageIds })
      .groupBy(`record.${fieldName}`)
      .getRawMany<{ page_id: string; count: string }>();

    return new Map(rows.map((row) => [Number(row.page_id), Number(row.count)]));
  }

  /**
   * 以天为粒度构建最近 7 天发布趋势，并在低样本时生成更适合展示的曲线。
   */
  private buildPublishTrend(
    rows: Array<{ date: string; count: string }>,
    seed: number,
    mockedSections: string[],
  ): AdminBigScreenTrendPoint[] {
    const today = this.startOfDay(new Date());
    const startDate = this.startOfDayOffset(today, -(BIG_SCREEN_DAYS - 1));
    const valueMap = new Map(
      rows.map((row) => [row.date.slice(0, 10), Number(row.count ?? 0)]),
    );
    const realValues = Array.from({ length: BIG_SCREEN_DAYS }, (_, index) => {
      const currentDate = this.startOfDayOffset(startDate, index);
      return valueMap.get(this.formatDateKey(currentDate)) ?? 0;
    });
    const shouldMock =
      realValues.reduce((sum, item) => sum + item, 0) === 0 ||
      realValues.filter((item) => item > 0).length < 3;

    if (shouldMock) {
      mockedSections.push('publishTrend');
    }

    const mockValues = this.buildMockSeries(BIG_SCREEN_DAYS, seed);

    return realValues.map((realValue, index) => {
      const currentDate = this.startOfDayOffset(startDate, index);
      return {
        date: this.formatDateKey(currentDate),
        label: this.formatShortDate(currentDate),
        realValue,
        displayValue: shouldMock ? Math.max(realValue, mockValues[index]) : realValue,
        isMock: shouldMock && realValue === 0,
      };
    });
  }

  /**
   * 根据页面可见性汇总公开/私密站点分布。
   */
  private buildVisibilityStats(
    summary: AdminBigScreenSummary,
    mockedSections: string[],
  ): AdminBigScreenDistributionItem[] {
    const stats = [
      { name: '公开发布', value: summary.publicSiteCount },
      { name: '私密发布', value: summary.privateSiteCount },
    ].filter((item) => item.value > 0);

    if (stats.length > 0) {
      return stats;
    }

    mockedSections.push('visibilityStats');
    return [
      { name: '公开发布', value: 6 },
      { name: '私密发布', value: 3 },
    ];
  }

  /**
   * 汇总页面布局模式分布，便于展示配置结构概况。
   */
  private buildLayoutModeStats(
    rows: Array<{ name: string; value: string }>,
    mockedSections: string[],
  ): AdminBigScreenDistributionItem[] {
    const stats = rows
      .map((row) => ({
        name: row.name === 'grid' ? '栅格布局' : '绝对布局',
        value: Number(row.value),
      }))
      .filter((item) => item.value > 0);

    if (stats.length > 0) {
      return stats;
    }

    mockedSections.push('layoutModeStats');
    return [
      { name: '绝对布局', value: 8 },
      { name: '栅格布局', value: 3 },
    ];
  }

  /**
   * 从模板标签中提取出现频次最高的分类，没有数据时提供截图友好的兜底项。
   */
  private buildTemplateTagStats(
    templates: Array<Pick<Template, 'id' | 'tags'>>,
    mockedSections: string[],
  ): AdminBigScreenDistributionItem[] {
    const counter = new Map<string, number>();

    for (const template of templates) {
      for (const tag of template.tags ?? []) {
        counter.set(tag, (counter.get(tag) ?? 0) + 1);
      }
    }

    const stats = Array.from(counter.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    if (stats.length > 0) {
      return stats;
    }

    mockedSections.push('templateTagStats');
    return BIG_SCREEN_TEMPLATE_TAG_FALLBACK;
  }

  /**
   * 输出物料类型排行；当真实实例为空时回退到预置样例。
   */
  private buildComponentTypeStats(
    stats: AdminBigScreenComponentStat[],
    mockedSections: string[],
  ) {
    if (stats.length > 0) {
      return stats.slice(0, 6);
    }

    mockedSections.push('componentTypeStats');
    return BIG_SCREEN_COMPONENT_FALLBACK;
  }

  /**
   * 整理最近发布动态，没有真实数据时生成占位示例。
   */
  private buildRecentReleases(
    rows: Array<{
      pageId: number;
      pageName: string;
      ownerName: string;
      version: string;
      visibility: 'public' | 'private';
      publishedAt: string;
    }>,
    mockedSections: string[],
  ): AdminBigScreenRecentReleaseItem[] {
    if (rows.length > 0) {
      return rows.map((row) => ({
        pageId: Number(row.pageId),
        pageName: row.pageName,
        ownerName: row.ownerName,
        version: Number(row.version),
        visibility: row.visibility,
        publishedAt: new Date(row.publishedAt).toISOString(),
      }));
    }

    mockedSections.push('recentReleases');
    return Array.from({ length: 4 }, (_, index) => ({
      pageId: index + 1,
      pageName: `示例站点 ${index + 1}`,
      ownerName: 'system',
      version: index + 2,
      visibility: index % 2 === 0 ? 'public' : 'private',
      publishedAt: new Date(
        Date.now() - index * 6 * 60 * 60 * 1000,
      ).toISOString(),
    }));
  }

  /**
   * 生成截图观感更平滑的 mock 数列，同时保持与真实规模接近。
   */
  private buildMockSeries(length: number, seed: number) {
    const base = Math.max(2, Math.min(18, seed + 2));
    return Array.from({ length }, (_, index) => {
      const wave = index % 3 === 0 ? 3 : index % 2 === 0 ? 1 : 5;
      return base + wave + index;
    });
  }

  /**
   * 当前仓库尚未落真实访问埋点，先按站点体量生成截图可用的 PV / UV mock 值。
   */
  private buildMockTrafficSummary(
    summary: AdminBigScreenSummary,
    mockedSections: string[],
  ) {
    mockedSections.push('trafficSummary');
    const pageViewCount =
      summary.publishedSiteCount * 168 +
      summary.publishActionCount * 42 +
      summary.publicSiteCount * 96 +
      320;
    const uniqueVisitorCount = Math.max(
      summary.publishedSiteCount * 24 + summary.publicSiteCount * 16 + 68,
      Math.floor(pageViewCount * 0.28),
    );

    return {
      pageViewCount,
      uniqueVisitorCount,
    };
  }

  /**
   * 归一化为当天 00:00:00，避免统计边界受当前时刻影响。
   */
  private startOfDay(date: Date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /**
   * 按天偏移时间，用于构造趋势范围与 mock 时间点。
   */
  private startOfDayOffset(date: Date, offsetDays: number) {
    return new Date(date.getTime() + offsetDays * 86400000);
  }

  /**
   * 格式化为 YYYY-MM-DD，供趋势图与聚合键统一使用。
   */
  private formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 格式化为更适合图表横轴展示的短日期。
   */
  private formatShortDate(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  }

  private normalizePermissions(
    permissions: AdminPermission[],
  ): AdminPermission[] {
    const normalizedPermissions = ALL_ADMIN_PERMISSIONS.filter((permission) =>
      permissions.includes(permission),
    );

    if (
      normalizedPermissions.includes('PERMISSION_ASSIGN') &&
      !normalizedPermissions.includes('USER_MANAGE')
    ) {
      return ['USER_MANAGE', ...normalizedPermissions] as AdminPermission[];
    }

    return normalizedPermissions;
  }

  private resolveRolePermissions(
    role: GlobalRole,
    previousRole: GlobalRole,
    user: User,
  ) {
    if (role === 'SUPER_ADMIN') {
      return [...ALL_ADMIN_PERMISSIONS];
    }

    if (role === 'ADMIN') {
      if (previousRole === 'ADMIN' && Array.isArray(user.admin_permissions)) {
        return this.normalizePermissions(user.admin_permissions);
      }

      return [...DEFAULT_ADMIN_PERMISSIONS];
    }

    return [];
  }

  private toSafeUser(user: User) {
    const { password, ...rest } = user;

    return {
      ...rest,
      admin_permissions: resolveAdminPermissions(
        rest.global_role,
        rest.admin_permissions,
      ),
    };
  }
}
