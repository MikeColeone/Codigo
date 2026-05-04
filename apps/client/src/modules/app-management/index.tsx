import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { TemplatePreviewModal } from "@/modules/template-center/components/template-preview-modal";
import { TopNavLayout } from "@/app/layouts/top-nav-layout";
import { ParticleBackground } from "@/modules/home/components/background/particle-background";
import { useAppManagementController } from "./hooks/use-app-management-controller";
import { useAppManagementViewModel } from "./hooks/use-app-management-view-model";
import AppManagementHero from "./components/layout/app-management-hero";
import AppManagementWorkspace from "./components/layout/app-management-workspace";
import AppManagementSectionContent from "./components/sections/app-management-section-content";

function AppManagement() {
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
  const { navigationItems } = useAppManagementViewModel({
    isLoggedIn,
  });

  return (
    <TopNavLayout>
      <div className="relative h-full bg-[var(--ide-bg)] text-[var(--ide-text)]">
        <ParticleBackground />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,108,189,0.06),transparent_45%)]" />
        <div className="relative h-full">
          <AppManagementWorkspace
            currentTab={currentTab}
            hero={<AppManagementHero isLoggedIn={isLoggedIn} />}
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
        </div>
      </div>
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
}

const AppManagementComponent = observer(AppManagement);

export default AppManagementComponent;
