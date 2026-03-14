import { createRef, useEffect, useRef, useState } from "react";
import { useTitle } from "ahooks";
import { ConfigProvider, theme } from "antd";

import EditorHeader from "./EditorHeader";
import EditorLeftPanel from "./EditorLeftPanel";
import EditorRightPanel from "./EditorRightPanel";
import EditorCanvas from "./EditorCanvas";

import { useStoreComponents } from "@/shared/hooks";

function Editor() {
  useTitle("codigo - 页面编辑");
  const { store: storeComps, localStorageInStore } = useStoreComponents();

  //  创建容器用于调用子组件的函数
  const canvasRef = createRef<any>();
  // 创建容器绑定 dom 用于监听滚动事件
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [scrolling, setScrolling] = useState(false);

  // 从本地缓存或者服务端获取上一次配置的页面组件
  useEffect(() => {
    localStorageInStore();
  }, []);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    // 定义滚动事件处理函数
    const handleScroll = () => {
      // 如果正在滚动中则清除滚动计时
      if (scrolling) clearTimeout(scrollTimeout);

      setScrolling(true);
      // 滚动时隐藏小工具栏
      canvasRef.current?.setShowToolbar(false);

      // 一个特殊的小技巧判断是否有没有滚动完毕
      // 在30ms内没有滚动则认为滚动完毕
      scrollTimeout = setTimeout(() => {
        // 滚动完毕后将状态设置回来
        setScrolling(false);
        // 滚动完毕后将小工具栏显示出来
        canvasRef.current.setShowToolbar(true);
      }, 300);
    };

    // 绑定滚动事件监听器到画布容器元素
    canvasContainerRef.current?.addEventListener("scroll", handleScroll);

    // 组件销毁时，清除滚动事件监听器和滚动超时的函数
    return () => {
      canvasContainerRef.current?.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [scrolling]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#10b981", // emerald-500
          colorBgContainer: "rgba(255, 255, 255, 0.05)",
          colorBorder: "rgba(255, 255, 255, 0.1)",
          colorText: "#ffffff",
          colorTextSecondary: "#9ca3af", // gray-400
          borderRadius: 8,
        },
        components: {
          Button: {
            primaryShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
          },
          Layout: {
            bodyBg: "#07090f",
            headerBg: "rgba(10, 12, 20, 0.8)",
            siderBg: "rgba(10, 12, 20, 0.5)",
          },
        },
      }}
    >
      <div className="flex flex-col h-full bg-[#07090f] text-white overflow-hidden font-sans">
        {/* Background Grid */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

        {/* 头部组件 */}
        <header className="relative z-20 border-b border-white/10 bg-[#0A0C14]/80 backdrop-blur-xl px-4 py-3">
          <EditorHeader />
        </header>

        <main className="relative z-10 flex flex-1 overflow-hidden">
          {/* 左侧编辑组件 */}
          <div
            className={`w-80 border-r border-white/10 bg-[#0A0C14]/60 backdrop-blur-md px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent`}
          >
            <EditorLeftPanel />
          </div>

          {/* 中间编辑组件 */}
          <div className="flex-auto flex items-center justify-center bg-[#07090f] relative">
            {/* Canvas Glow Effect */}
            <div className="absolute w-[400px] h-[720px] bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

            <div
              ref={canvasContainerRef}
              className="editor-canvas-container relative z-10 w-[380px] h-[700px] bg-white text-left overflow-y-auto overflow-x-hidden rounded-[30px] border-[8px] border-[#1a1d26] shadow-2xl scrollbar-hide"
            >
              {/* Mobile Status Bar Simulation */}
              <div className="sticky top-0 z-50 h-6 bg-black/90 text-white text-[10px] flex items-center justify-between px-4 font-mono">
                <span>9:41</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                </div>
              </div>
              <EditorCanvas store={storeComps} onRef={canvasRef} />
            </div>
          </div>

          {/* 右侧编辑组件 */}
          <div
            className={`w-80 border-l border-white/10 bg-[#0A0C14]/60 backdrop-blur-md px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent`}
          >
            <EditorRightPanel />
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}
export default Editor;
