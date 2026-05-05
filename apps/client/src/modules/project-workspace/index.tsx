import { observer } from "mobx-react-lite";
import { useTitle } from "ahooks";
import { useNavigate } from "react-router-dom";
import { TemplatePreviewModal } from "@/modules/template-center/components/template-preview-modal";
import { useProjectWorkspaceController } from "./hooks/use-project-workspace-controller";
import ProjectWorkspaceHero from "./components/layout/project-workspace-hero";
import ProjectWorkspaceLayout from "./components/layout/project-workspace-layout";
import ProjectWorkspaceSectionContent from "./components/sections/project-workspace-section-content";

function ProjectWorkspace() {
  useTitle("Codigo - 我的项目");
  const navigate = useNavigate();
  const {
    handleOpenPublishedPage,
    handleOpenVersion,
    localDraftMeta,
    myPageData,
    myPageLoading,
    previewLoading,
    previewState,
    setPreviewState,
  } = useProjectWorkspaceController();

  return (
    <div className="relative h-full bg-[var(--ide-bg)] text-[var(--ide-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(15,108,189,0.08),transparent_70%)]" />
      <div className="relative h-full">
        <ProjectWorkspaceLayout hero={<ProjectWorkspaceHero />}>
          <ProjectWorkspaceSectionContent
            draftMeta={localDraftMeta}
            myPageData={myPageData}
            myPageLoading={myPageLoading}
            onContinue={() =>
              navigate(
                myPageData?.page?.id ? `/editor?id=${myPageData.page.id}` : "/editor",
              )
            }
            onPreviewPublished={handleOpenPublishedPage}
            onPreviewVersion={handleOpenVersion}
          />
        </ProjectWorkspaceLayout>
      </div>
      <TemplatePreviewModal
        loading={previewLoading}
        open={Boolean(previewState)}
        title={previewState?.title}
        subtitle={previewState?.subtitle}
        schema={previewState?.schema ?? null}
        onClose={() => setPreviewState(null)}
      />
    </div>
  );
}

const ProjectWorkspaceComponent = observer(ProjectWorkspace);

export default ProjectWorkspaceComponent;
