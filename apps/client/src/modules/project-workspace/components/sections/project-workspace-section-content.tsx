import { Button, Empty, Spin } from "antd";
import dayjs from "dayjs";
import type {
  LocalDraftMeta,
  MyPagePayload,
  PageVersionItem,
} from "../../types/project-workspace";
import HistorySection from "./history-section";

interface ProjectWorkspaceSectionContentProps {
  draftMeta: LocalDraftMeta | null;
  myPageData?: MyPagePayload;
  myPageLoading: boolean;
  onContinue: () => void;
  onPreviewPublished: (
    pageId: number,
    title: string,
    subtitle: string,
  ) => void | Promise<void>;
  onPreviewVersion: (version: PageVersionItem) => void | Promise<void>;
}

function WorkspaceStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] p-3">
      <div className="text-xs text-[var(--ide-text-muted)]">{label}</div>
      <div className="mt-1 text-sm font-medium text-[var(--ide-text)]">{value}</div>
    </div>
  );
}

function ProjectWorkspaceSectionContent({
  draftMeta,
  myPageData,
  myPageLoading,
  onContinue,
  onPreviewPublished,
  onPreviewVersion,
}: ProjectWorkspaceSectionContentProps) {
  const versions = myPageData?.versions ?? [];
  const page = myPageData?.page ?? null;
  const latestVersion = versions[0] ?? null;
  const developingTitle = page?.page_name || "未命名项目";
  const developingDesc = draftMeta?.isUpdatedAfterPublish
    ? "当前存在未发布草稿，建议优先回到编辑器继续完善后再同步上线。"
    : "当前草稿与最近发布版本已同步，可继续迭代页面内容与结构。";
  const developingStatus = draftMeta?.isUpdatedAfterPublish
    ? "草稿待发布"
    : draftMeta?.hasDraft
      ? "草稿已同步"
      : "暂未生成草稿";
  const publishedSubtitle = page?.desc || "当前对外展示的内容与最近一次发布结果保持一致。";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
        <div className="flex flex-col gap-6">
          <section className="rounded-md border border-[var(--ide-border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--ide-active)_65%,transparent),color-mix(in_oklab,var(--ide-control-bg)_92%,transparent))] p-5 shadow-[var(--ide-panel-shadow)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full border border-[color:color-mix(in_oklab,var(--ide-accent)_30%,var(--ide-border))] bg-[color:color-mix(in_oklab,var(--ide-accent)_14%,transparent)] px-2.5 py-0.5 text-xs font-medium text-[var(--ide-text)]">
                  开发中
                </span>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--ide-text)]">
                  {developingTitle}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ide-text-muted)]">
                  {draftMeta || page
                    ? developingDesc
                    : "当前还没有项目草稿，先从模板广场选择模板开始搭建，再回到这里统一管理开发与发布状态。"}
                </p>
              </div>
              {!myPageLoading && (draftMeta || page) ? (
                <Button type="primary" className="!rounded-sm" onClick={onContinue}>
                  继续开发
                </Button>
              ) : null}
            </div>

            <div className="mt-5">
              {myPageLoading ? (
                <div className="flex min-h-[180px] items-center justify-center">
                  <Spin />
                </div>
              ) : draftMeta || page ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <WorkspaceStat label="草稿状态" value={developingStatus} />
                  <WorkspaceStat
                    label="最近编辑"
                    value={draftMeta?.updatedAt ?? "暂无"}
                  />
                  <WorkspaceStat
                    label="版本数量"
                    value={`${versions.length} 个`}
                  />
                </div>
              ) : (
                <div className="flex min-h-[180px] items-center justify-center rounded-md border border-dashed border-[var(--ide-border)] bg-[color:color-mix(in_oklab,var(--ide-sidebar-bg)_78%,transparent)]">
                  <Empty
                    description="当前还没有项目草稿"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-5 shadow-[var(--ide-panel-shadow)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full border border-[var(--ide-control-border)] bg-[color:color-mix(in_oklab,var(--ide-hover)_82%,transparent)] px-2.5 py-0.5 text-xs font-medium text-[var(--ide-text-muted)]">
                  已发布
                </span>
                <h3 className="mt-3 text-lg font-semibold text-[var(--ide-text)]">
                  发布结果
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--ide-text-muted)]">
                  {publishedSubtitle}
                </p>
              </div>
              {!myPageLoading && page ? (
                <Button
                  size="small"
                  type="primary"
                  className="!rounded-sm"
                  onClick={() =>
                    onPreviewPublished(
                      page.id,
                      page.page_name || "已发布项目",
                      page.desc || "当前对外展示的发布内容",
                    )
                  }
                >
                  查看已发布
                </Button>
              ) : null}
            </div>

            <div className="mt-4">
              {myPageLoading ? (
                <div className="flex min-h-[140px] items-center justify-center">
                  <Spin />
                </div>
              ) : page ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <WorkspaceStat
                    label="发布状态"
                    value={latestVersion ? `v${latestVersion.version}` : "已发布"}
                  />
                  <WorkspaceStat
                    label="最新发布"
                    value={
                      latestVersion
                        ? dayjs(latestVersion.created_at).format("YYYY-MM-DD HH:mm")
                        : "已发布"
                    }
                  />
                  <WorkspaceStat label="历史版本" value={`${versions.length} 个`} />
                </div>
              ) : (
                <Empty
                  description="你还没有已发布的项目"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </section>
        </div>

        <section className="rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-5 shadow-[var(--ide-panel-shadow)]">
          <div className="mb-4 border-b border-[var(--ide-border)] pb-4">
            <div>
              <span className="inline-flex rounded-full border border-[var(--ide-control-border)] bg-[color:color-mix(in_oklab,var(--ide-hover)_82%,transparent)] px-2.5 py-0.5 text-xs font-medium text-[var(--ide-text-muted)]">
                版本记录
              </span>
              <h3 className="mt-3 text-lg font-semibold text-[var(--ide-text)]">
                全部版本
              </h3>
              <p className="mt-1 text-sm text-[var(--ide-text-muted)]">
                右侧单独承载完整版本虚拟列表，方便持续浏览与回看历史发布内容。
              </p>
            </div>
          </div>

          <HistorySection
            embedded
            loading={myPageLoading}
            versions={versions}
            onPreview={onPreviewVersion}
          />
        </section>
      </div>
    </div>
  );
}

export default ProjectWorkspaceSectionContent;
