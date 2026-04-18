import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { FloatButton, message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CaretLeftOutlined } from "@ant-design/icons";
import {
  generateComponent,
  resolveInitialPageState,
  type RuntimeAction,
} from "@/modules/editor/runtime";
import { useStorePage } from "@/shared/hooks";
import { useEditorComponents } from "@/modules/editor/hooks";
import type { ComponentNode, IEditorPageSchema, RuntimeStateValue } from "@codigo/schema";
import { AdminShell } from "./components/AdminShell";

function resolvePreviewPage(
  pages: IEditorPageSchema[],
  requestedPath: string | null,
) {
  if (!pages.length) {
    return null;
  }

  return (
    pages.find((page) => page.path === requestedPath) ??
    pages.find((page) => page.path === "home") ??
    pages[0]
  );
}

const PreviewCanvas = observer(() => {
  const { getPages, loadPageData } = useEditorComponents();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitializedRef = useRef(false);
  const pages = getPages.get();
  const requestedPagePath = searchParams.get("page");
  const activePage = useMemo(
    () => resolvePreviewPage(pages, requestedPagePath),
    [pages, requestedPagePath],
  );
  const componentTree = activePage?.components ?? [];
  const initialPageState = useMemo(
    () => resolveInitialPageState(componentTree),
    [componentTree],
  );
  const [pageState, setPageState] = useState<Record<string, RuntimeStateValue>>(
    () => initialPageState,
  );
  const pageStateRef = useRef(pageState);
  const lastPageSignatureRef = useRef<string>("");

  useEffect(() => {
    pageStateRef.current = pageState;
  }, [pageState]);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;
    void loadPageData(undefined, { silent: true });
  }, [loadPageData]);

  useEffect(() => {
    const stack = [...componentTree];
    const ids: string[] = [];
    while (stack.length) {
      const node = stack.pop();
      if (!node) {
        continue;
      }
      ids.push(node.id);
      const children = Array.isArray(node.children) ? node.children : [];
      for (let i = 0; i < children.length; i += 1) {
        stack.push(children[i]);
      }
    }

    const nextSignature = `${activePage?.id ?? ""}|${activePage?.path ?? ""}|${ids.join(",")}`;
    if (nextSignature === lastPageSignatureRef.current) {
      return;
    }

    lastPageSignatureRef.current = nextSignature;
    setPageState(initialPageState);
  }, [activePage?.id, activePage?.path, componentTree, initialPageState]);

  const runtime = useMemo(() => {
    const getByPath = (input: unknown, path: string) => {
      if (!path) {
        return input;
      }

      const parts = path.split(".").filter(Boolean);
      let cur: any = input;
      for (const key of parts) {
        if (cur == null) {
          return undefined;
        }
        cur = cur[key];
      }
      return cur;
    };

    const resolveTemplateString = (
      template: string,
      state: Record<string, RuntimeStateValue>,
    ) => {
      return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_m, rawKey) => {
        const key = String(rawKey ?? "").trim();
        const value = getByPath(state, key);
        if (value === undefined || value === null) {
          return "";
        }
        if (typeof value === "string") {
          return value;
        }
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      });
    };

    const runActions = async (actions: RuntimeAction[] | undefined) => {
      const list = Array.isArray(actions) ? actions : [];
      for (const item of list) {
        await onAction(item);
      }
    };

    const onAction = async (action: RuntimeAction) => {
        if (action.type === "set-state") {
          pageStateRef.current = {
            ...pageStateRef.current,
            [action.key]: action.value,
          };
          setPageState(pageStateRef.current);
          return;
        }

        if (action.type === "setState") {
          pageStateRef.current = {
            ...pageStateRef.current,
            [action.key]: action.value,
          };
          setPageState(pageStateRef.current);
          return;
        }

        if (action.type === "navigate") {
          if (action.path.startsWith("page:")) {
            const pagePath = action.path.slice(5);
            setSearchParams((prev) => {
              const nextParams = new URLSearchParams(prev);
              nextParams.set("page", pagePath);
              return nextParams;
            });
            return;
          }
          window.location.assign(action.path);
          return;
        }

        if (action.type === "openUrl") {
          window.open(
            action.url,
            action.target ?? "_blank",
            "noopener,noreferrer",
          );
          return;
        }

        if (action.type === "toast") {
          message.open({
            content: action.message,
            type: action.variant ?? "info",
          });
          return;
        }

        if (action.type === "confirm") {
          const ok = window.confirm(action.message);
          if (ok) {
            await runActions(action.onOk);
            return;
          }
          await runActions(action.onCancel);
          throw new Error("ACTION_CANCELLED");
        }

        if (action.type === "when") {
          const stateValue = (pageStateRef.current ?? {})[action.key];
          const op = action.op ?? "truthy";
          const toNumber = (v: unknown) => (typeof v === "number" ? v : Number(v));
          const passed =
            op === "eq"
              ? stateValue === action.value
              : op === "ne"
                ? stateValue !== action.value
                : op === "gt"
                  ? toNumber(stateValue) > toNumber(action.value)
                  : op === "gte"
                    ? toNumber(stateValue) >= toNumber(action.value)
                    : op === "lt"
                      ? toNumber(stateValue) < toNumber(action.value)
                      : op === "lte"
                        ? toNumber(stateValue) <= toNumber(action.value)
                        : op === "includes"
                          ? Array.isArray(stateValue)
                            ? stateValue.includes(action.value as never)
                            : typeof stateValue === "string"
                              ? stateValue.includes(String(action.value ?? ""))
                              : false
                          : op === "falsy"
                            ? !stateValue
                            : !!stateValue;

          if (passed) {
            await runActions(action.onTrue);
          } else {
            await runActions(action.onFalse);
          }
          return;
        }

        if (action.type === "request") {
          const method = (action.method ?? "GET").toUpperCase();
          const headers: Record<string, string> = { ...(action.headers ?? {}) };
          const resolvedUrl = resolveTemplateString(
            action.url,
            pageStateRef.current ?? {},
          );
          const hasContentType = Object.keys(headers).some(
            (key) => key.toLowerCase() === "content-type",
          );

          let body: BodyInit | undefined;
          if (method !== "GET" && method !== "HEAD" && action.body !== undefined) {
            if (typeof action.body === "string") {
              const resolvedBody = resolveTemplateString(
                action.body,
                pageStateRef.current ?? {},
              );
              try {
                const parsed = JSON.parse(resolvedBody);
                body = JSON.stringify(parsed);
                if (!hasContentType) {
                  headers["Content-Type"] = "application/json";
                }
              } catch {
                body = resolvedBody;
                if (!hasContentType) {
                  headers["Content-Type"] = "text/plain;charset=UTF-8";
                }
              }
            } else {
              body = JSON.stringify(action.body);
              if (!hasContentType) {
                headers["Content-Type"] = "application/json";
              }
            }
          }

          Object.keys(headers).forEach((key) => {
            headers[key] = resolveTemplateString(
              String(headers[key]),
              pageStateRef.current ?? {},
            );
          });

          try {
            const resp = await fetch(resolvedUrl, {
              method,
              headers,
              body,
              credentials: "include",
            });
            const contentType = resp.headers.get("content-type") ?? "";
            const data = contentType.includes("application/json")
              ? await resp.json()
              : await resp.text();

            if (resp.ok) {
              if (action.saveToStateKey) {
                const nextValue = action.responsePath
                  ? getByPath(data, action.responsePath)
                  : data;
                pageStateRef.current = {
                  ...pageStateRef.current,
                  [action.saveToStateKey]: nextValue,
                };
                setPageState(pageStateRef.current);
              }
              await runActions(action.onSuccess);
              return;
            }

            if (Array.isArray(action.onError) && action.onError.length) {
              await runActions(action.onError);
              return;
            }

            const errorMessage =
              typeof data === "string" ? data : `Request failed: ${resp.status}`;
            message.open({ content: errorMessage, type: "error" });
            throw new Error(errorMessage);
          } catch (err) {
            if (Array.isArray(action.onError) && action.onError.length) {
              await runActions(action.onError);
              return;
            }
            message.open({
              content: err instanceof Error ? err.message : "请求失败",
              type: "error",
            });
            throw err;
          }
        }

        const targetElement = document.getElementById(action.targetId);
        targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return { pageState, onAction };
  }, [pageState, setSearchParams]);

  const handleSelectPagePath = (path: string) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set("page", path);
      return nextParams;
    });
  };

  const canvas = (
    <div
      className="relative"
      style={{
        minHeight: `${Math.max(700, componentTree.length * 220)}px`,
      }}
    >
      {componentTree.map(function renderTreeNode(node: ComponentNode) {
        const renderedChildren =
          node.children?.map((child) => renderTreeNode(child)) ?? [];
        return (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: node.styles?.left as string | number | undefined,
              top: node.styles?.top as string | number | undefined,
            }}
          >
            <div className="relative">
              {generateComponent(node, undefined, renderedChildren, runtime)}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    pages.length ? (
      <AdminShell
        pages={pages}
        activePagePath={activePage?.path ?? null}
        onSelectPagePath={handleSelectPagePath}
      >
        {canvas}
      </AdminShell>
    ) : (
      canvas
    )
  );
});

export default observer(function Preview() {
  const nav = useNavigate();
  const { store } = useStorePage();

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden bg-slate-50">
      <div
        className={`bg-white text-left overflow-y-auto overflow-x-hidden shadow-2xl transition-all duration-300 ${
          store.deviceType === "mobile"
            ? "rounded-[30px] border-[8px] border-slate-800 scrollbar-hide"
            : "rounded-lg border border-slate-200"
        }`}
        style={{
          width: store.canvasWidth,
          height: store.canvasHeight,
        }}
      >
        {store.deviceType === "mobile" && (
          <div className="sticky top-0 z-50 h-6 bg-black/90 text-white text-[10px] flex items-center justify-between px-4 font-mono">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-white/20 rounded-full"></div>
              <div className="w-3 h-3 bg-white/20 rounded-full"></div>
            </div>
          </div>
        )}
        <PreviewCanvas />
        <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
      </div>
    </div>
  );
});
