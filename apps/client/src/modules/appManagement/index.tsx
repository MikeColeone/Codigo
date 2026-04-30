import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { TemplatePreviewModal } from "@/modules/templateCenter/components/TemplatePreviewModal";
import { TopNavLayout } from "@/app/layouts/TopNavLayout";
import { useAppManagementController } from "./hooks/useAppManagementController";
import { useAppManagementViewModel } from "./hooks/useAppManagementViewModel";
import AppManagementHero from "./components/layout/AppManagementHero";
import AppManagementWorkspace from "./components/layout/AppManagementWorkspace";
import AppManagementSectionContent from "./components/sections/AppManagementSectionContent";

const AppManagement = observer(() => {
  const navigate = useNavigate();
  const {
    currentTab,
    handleOpenPublishedPage,
    handleOpenTemplatePreview,
    handleOpenVersion,
    handleTabChange,
    handleUseTemplate,
    isLoggedIn,
    localDraftMeta,
    myPageData,
    myPageLoading,
    previewLoading,
    previewState,
    publicLoading,
    publicPages,
    setPreviewState,
    templates,
  } = useAppManagementController();
  const { metrics, navigationItems } = useAppManagementViewModel({
    isLoggedIn,
    isUpdatedAfterPublish: localDraftMeta?.isUpdatedAfterPublish,
    publicLoading,
    publicPagesCount: publicPages.length,
    templatesCount: templates.length,
    versionsCount: myPageData?.versions.length ?? 0,
  });

  return (
    <TopNavLayout>
      <AppManagementWorkspace
        currentTab={currentTab}
        hero={<AppManagementHero isLoggedIn={isLoggedIn} metrics={metrics} />}
        items={navigationItems}
        onChange={handleTabChange}
      >
        <AppManagementSectionContent
          currentTab={currentTab}
          draftMeta={localDraftMeta}
          isLoggedIn={isLoggedIn}
          myPageData={myPageData}
          myPageLoading={myPageLoading}
          publicLoading={publicLoading}
          publicPages={publicPages}
          templates={templates}
          onContinue={() =>
            navigate(
              myPageData?.page?.id ? `/editor?id=${myPageData.page.id}` : "/editor",
            )
          }
          onPreviewPublished={handleOpenPublishedPage}
          onPreviewTemplate={handleOpenTemplatePreview}
          onPreviewVersion={handleOpenVersion}
          onUseTemplate={handleUseTemplate}
        />
      </AppManagementWorkspace>
      <TemplatePreviewModal
        loading={previewLoading}
        open={Boolean(previewState)}
        title={previewState?.title}
        subtitle={previewState?.subtitle}
        schema={previewState?.schema ?? null}
        onClose={() => setPreviewState(null)}
      />
    </TopNavLayout>
  );
});

export default AppManagement;
