import { Empty, Spin } from "antd";
import dayjs from "dayjs";
import type { MyPagePayload } from "../../types/project-workspace";
import ProjectCard from "../shared/project-card";

interface PublishedSectionProps {
  loading: boolean;
  myPageData?: MyPagePayload;
  onPreview: (
    pageId: number,
    title: string,
    subtitle: string,
  ) => void | Promise<void>;
}

function PublishedSection({
  loading,
  myPageData,
  onPreview,
}: PublishedSectionProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin />
      </div>
    );
  }

  if (myPageData?.page) {
    const page = myPageData.page;

    return (
      <ProjectCard
        actionText="查看已发布内容"
        desc={page.desc || "当前版本已发布，可向访客公开展示。"}
        meta={[
          `历史版本 ${myPageData.versions.length} 个`,
          myPageData.versions[0]
            ? `最近发布 ${dayjs(myPageData.versions[0].created_at).format("YYYY-MM-DD HH:mm")}`
            : "已发布",
        ]}
        title={page.page_name || "未命名项目"}
        onAction={() =>
          onPreview(
            page.id,
            page.page_name || "已发布项目",
            page.desc || "当前对外展示的发布内容",
          )
        }
      />
    );
  }

  return (
    <Empty
      description="你还没有已发布的项目"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );
}

export default PublishedSection;
