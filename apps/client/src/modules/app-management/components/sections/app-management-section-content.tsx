import type { AppManagementTab, LocalDraftMeta, MyPagePayload, PageVersionItem, PublicPageItem } from "../../types/app-management";
import { TemplateGallery } from "@/modules/template-center/components/template-gallery";
import type { TemplateListItem } from "@codigo/schema";
import DevelopingSection from "./developing-section";
import HistorySection from "./history-section";
import PublishedSection from "./published-section";

interface AppManagementSectionContentProps {
  currentTab: AppManagementTab;
  draftMeta: LocalDraftMeta | null;
  isLoggedIn: boolean;
  myPageData?: MyPagePayload;
  myPageLoading: boolean;
  onContinue: () => void;
  onPreviewPublished: (
    pageId: number,
    title: string,
    subtitle: string,
  ) => void | Promise<void>;
  onPreviewTemplate: (template: TemplateListItem) => void;
  onPreviewVersion: (version: PageVersionItem) => void | Promise<void>;
  onUseTemplate: (template: TemplateListItem) => void;
  publicLoading: boolean;
  publicPages: PublicPageItem[];
  templates: TemplateListItem[];
}

function AppManagementSectionContent({
  currentTab,
  draftMeta,
  isLoggedIn,
  myPageData,
  myPageLoading,
  onContinue,
  onPreviewPublished,
  onPreviewTemplate,
  onPreviewVersion,
  onUseTemplate,
  publicLoading,
  publicPages,
  templates,
}: AppManagementSectionContentProps) {
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

  if (currentTab === "templates") {
    return (
      <TemplateGallery
        canUseTemplate={isLoggedIn}
        templates={templates}
        virtualized
        onPreview={onPreviewTemplate}
        onUse={onUseTemplate}
      />
    );
  }

  return (
    <PublishedSection
      isLoggedIn={isLoggedIn}
      loading={myPageLoading}
      myPageData={myPageData}
      publicLoading={publicLoading}
      publicPages={publicPages}
      onPreview={onPreviewPublished}
    />
  );
}

export default AppManagementSectionContent;
