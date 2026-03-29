import { createRef, useEffect, useRef, useState } from "react";
import { useTitle } from "ahooks";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";

import EditorLeftPanel from "./components/leftPanel";
import EditorRightPanel from "./components/rightPanel";
import EditorCanvas from "./components/canvas";
import { SandboxCanvas } from "./components/canvas/SandboxCanvas";
import { WebIDECanvas } from "./components/canvas/WebIDECanvas";

import {
  useStoreComponents,
  useStorePage,
  useStorePermission,
  useStoreAuth,
} from "@/shared/hooks";
import { getLowCodePage } from "@/modules/editor/api/low-code";

const Editor = observer(() => {
  useTitle("codigo - 页面编辑");
  const [searchParams, setSearchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));

  const { store: storeComps, loadPageData } = useStoreComponents();
  const { store: storePage } = useStorePage();
  const { initCollaboration, cleanupCollaboration } = useStorePermission();
  const { store: storeAuth } = useStoreAuth();
  // const selectedComponent = storeComps.currentCompConfig
  //   ? storeComps.compConfigs[storeComps.currentCompConfig]
  //   : null;
  // const modeLabel =
  //   storePage.editorMode === "code"
  //     ? "源码编辑"
  //     : storePage.editorMode === "webide"
  //       ? "WebIDE"
  //       : "可视化编辑";

  const canvasRef = createRef<any>();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    loadPageData(getLowCodePage).then((data) => {
      if (data?.id && !searchParams.get("id")) {
        setSearchParams({ id: String(data.id) }, { replace: true });
      }
    });
  }, []);

  useEffect(() => {
    if (pageId && storeAuth.details?.id) {
      initCollaboration(
        pageId,
        storeAuth.details.id,
        storeAuth.details.username || "User",
      );
    }
    return () => {
      if (pageId && storeAuth.details?.id) {
        cleanupCollaboration(pageId, storeAuth.details.id);
      }
    };
  }, [pageId, storeAuth.details]);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (scrolling) clearTimeout(scrollTimeout);

      setScrolling(true);
      canvasRef.current?.setShowToolbar(false);

      scrollTimeout = setTimeout(() => {
        setScrolling(false);
        canvasRef.current.setShowToolbar(true);
      }, 300);
    };

    canvasContainerRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      canvasContainerRef.current?.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [scrolling]);

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#F8FAFC]">
      <div className="flex w-[308px] shrink-0 flex-col border-r border-slate-200/80 bg-white/88 px-4 py-4 shadow-[14px_0_40px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200/60 hover:scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <EditorLeftPanel />
        </div>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
        <div className="absolute left-10 top-16 h-44 w-44 rounded-full bg-emerald-400/10 blur-[110px] pointer-events-none" />
        <div className="absolute bottom-10 right-16 h-56 w-56 rounded-full bg-sky-400/10 blur-[140px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between px-8 pb-3 pt-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                Workspace
              </span>
              <span className="text-xs text-slate-400">
                {pageId ? `Page #${pageId}` : "未绑定页面 ID"}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 px-8 pb-8">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/40 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.65)] backdrop-blur-xl">
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-8">
              <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/8 blur-[120px] pointer-events-none" />

              {storePage.editorMode === "code" ? (
                <div className="relative z-10 h-full w-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)]">
                  <SandboxCanvas />
                </div>
              ) : storePage.editorMode === "webide" ? (
                <div className="relative z-10 h-full w-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)]">
                  <WebIDECanvas />
                </div>
              ) : (
                <div
                  ref={canvasContainerRef}
                  className={`editor-canvas-container relative z-10 overflow-y-auto overflow-x-hidden bg-white text-left ring-1 ring-slate-900/5 transition-all duration-500 ease-out ${
                    storePage.deviceType === "mobile"
                      ? "rounded-[42px] border-[12px] border-slate-900 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.45)]"
                      : "rounded-[24px] shadow-[0_28px_70px_-42px_rgba(15,23,42,0.45)] hover:shadow-[0_30px_80px_-42px_rgba(15,23,42,0.52)]"
                  }`}
                  style={{
                    width: storePage.canvasWidth,
                    height: storePage.canvasHeight,
                    maxHeight: "100%",
                  }}
                >
                  {storePage.deviceType === "mobile" && (
                    <div className="sticky top-0 z-50 flex h-7 items-center justify-between bg-slate-900 px-6 text-[11px] font-medium tracking-wider text-white select-none">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3.5 w-3.5 rounded-sm bg-white/90" />
                        <div className="h-3.5 w-3.5 rounded-full bg-white/90" />
                        <div className="h-2.5 w-4 rounded-sm bg-white/90" />
                      </div>
                    </div>
                  )}
                  <EditorCanvas store={storeComps} onRef={canvasRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-[356px] shrink-0 flex-col border-l border-slate-200/80 bg-white/88 shadow-[-14px_0_40px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="flex min-h-0 w-full flex-1 flex-col">
          <EditorRightPanel />
        </div>
      </div>
    </div>
  );
});

export default Editor;
