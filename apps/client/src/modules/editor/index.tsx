import { useEffect, useRef } from "react";
import { useTitle } from "ahooks";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";
import { message } from "antd";
import {
  useEditorComponents,
  useEditorPage,
  useEditorPermission,
} from "./hooks";
import { EditorViewport } from "./components/shell/editor-viewport";
import { useEditorBootstrap } from "./components/shell/use-editor-bootstrap";
import { fetchTemplateDetail } from "@/modules/template-center/api/templates";
import { writeTemplateToDraft } from "@/modules/template-center/utils/template-draft";
import { isSinglePageTemplatePreset } from "@/modules/template-center/utils/template-kind";
import { getLowCodePage } from "@/modules/editor/api/low-code";

function Editor() {
  useTitle("codigo - 页面编辑");
  const [searchParams, setSearchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));
  const templateId = Number(searchParams.get("templateId"));
  const focusComponentId = searchParams.get("componentId");

  const {
    applyTemplateToWorkspace,
    store: storeComps,
    loadPageData,
    setCurrentComponent,
  } = useEditorComponents();
  const { store: storePage, hydrateGridDashedLinesVisible } = useEditorPage();
  const { initCollaboration, cleanupCollaboration } = useEditorPermission();
  const { store: storeAuth } = useStoreAuth();
  const canvasRef = useRef<any>(null);
  const appliedTemplateRef = useRef<number | null>(null);
  const appliedFocusComponentIdRef = useRef<string | null>(null);
  const setCurrentComponentRef = useRef(setCurrentComponent);
  const focusTargetReady = Boolean(
    focusComponentId && storeComps.compConfigs[focusComponentId],
  );

  useEffect(() => {
    setCurrentComponentRef.current = setCurrentComponent;
  }, [setCurrentComponent]);

  useEffect(() => {
    hydrateGridDashedLinesVisible(pageId || null);
  }, [pageId]);

  useEffect(() => {
    if (!focusComponentId) {
      appliedFocusComponentIdRef.current = null;
      return;
    }
    if (!focusTargetReady || appliedFocusComponentIdRef.current === focusComponentId) {
      return;
    }
    setCurrentComponentRef.current(focusComponentId);
    appliedFocusComponentIdRef.current = focusComponentId;
  }, [focusComponentId, focusTargetReady]);

  useEffect(() => {
    if (!Number.isFinite(templateId) || templateId <= 0) {
      return;
    }
    if (appliedTemplateRef.current === templateId) {
      return;
    }

    appliedTemplateRef.current = templateId;

    void (async () => {
      try {
        const detail = await fetchTemplateDetail(templateId);
        if (isSinglePageTemplatePreset(detail.preset)) {
          await loadPageData(getLowCodePage);
          applyTemplateToWorkspace(detail.preset);
        } else {
          writeTemplateToDraft(detail.preset);
          await loadPageData(getLowCodePage);
        }
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete("templateId");
          return next;
        }, { replace: true });
      } catch {
        message.error("模板载入失败，请稍后重试");
      }
    })();
  }, [applyTemplateToWorkspace, loadPageData, setSearchParams, templateId]);

  useEditorBootstrap({
    pageId,
    currentPageQueryId: searchParams.get("id"),
    setSearchParams,
    loadPageData,
    initCollaboration,
    cleanupCollaboration,
    authUserId: storeAuth.details?.id,
    authUsername: storeAuth.details?.username,
  });

  return (
    <EditorViewport
      storeComps={storeComps}
      storePage={storePage}
      canvasRef={canvasRef}
    />
  );
}

const EditorComponent = observer(Editor);

export default EditorComponent;
