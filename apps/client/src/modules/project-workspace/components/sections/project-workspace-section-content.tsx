import type { ProjectWorkspaceTab, LocalDraftMeta, MyPagePayload, PageVersionItem } from "../../types/project-workspace";
import DevelopingSection from "./developing-section";
import HistorySection from "./history-section";
import PublishedSection from "./published-section";

interface ProjectWorkspaceSectionContentProps {
  currentTab: ProjectWorkspaceTab;
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

function ProjectWorkspaceSectionContent({
  currentTab,
  draftMeta,
  myPageData,
  myPageLoading,
  onContinue,
  onPreviewPublished,
  onPreviewVersion,
}: ProjectWorkspaceSectionContentProps) {
  if (currentTab === "developing") {
    return (
      <DevelopingSection
        draftMeta={draftMeta}
        loading={myPageLoading}
        myPageData={myPageData}
        onContinue={onContinue}
      />
    );
  }

  if (currentTab === "versions") {
    return (
      <HistorySection
        loading={myPageLoading}
        versions={myPageData?.versions ?? []}
        onPreview={onPreviewVersion}
      />
    );
  }

  return (
    <PublishedSection
      loading={myPageLoading}
      myPageData={myPageData}
      onPreview={onPreviewPublished}
    />
  );
}

export default ProjectWorkspaceSectionContent;
