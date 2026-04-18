export * from "@codigo/runtime-core";

export function renderCode(schemaText: string) {
  return `import React, { useEffect, useMemo, useState } from "react";
import { LowCodeRenderer } from "./LowCodeRenderer";

const pageSchema = ${schemaText};

export default function Page() {
  const initialPageState = useMemo(() => {
    const nextState = {};
    const getClickActions = (node) => {
      const configuredActions = Array.isArray(node.events?.onClick)
        ? node.events.onClick
        : [];
      const props = node.props ?? {};
      const legacyActions = [];

      if (
        props.actionType === "set-state" &&
        typeof props.stateKey === "string" &&
        props.stateKey &&
        props.stateValue !== undefined
      ) {
        legacyActions.push({
          type: "setState",
          key: props.stateKey,
          value: props.stateValue,
        });
      }

      return [...configuredActions, ...legacyActions];
    };

    const visitNodes = (nodes) => {
      nodes.forEach((node) => {
        getClickActions(node).forEach((action) => {
          if (
            action.type === "setState" &&
            action.key &&
            nextState[action.key] === undefined
          ) {
            nextState[action.key] = action.value;
          }
        });

        if (node.children?.length) {
          visitNodes(node.children);
        }
      });
    };

    visitNodes(pageSchema);
    return nextState;
  }, []);
  const [pageState, setPageState] = useState(initialPageState);

  useEffect(() => {
    setPageState(initialPageState);
  }, [initialPageState]);

  return (
    <div className="codigo-page">
      {pageSchema.map((component) => (
        <LowCodeRenderer
          key={component.id}
          component={component}
          runtime={{
            pageState,
            onAction: async (action) => {
              const getByPath = (input, path) => {
                if (!path) return input;
                const parts = String(path).split(".").filter(Boolean);
                let cur = input;
                for (const key of parts) {
                  if (cur == null) return undefined;
                  cur = cur[key];
                }
                return cur;
              };
              const resolveTemplateString = (template) => {
                return String(template ?? "").replace(
                  /\\{\\{\\s*([^}]+?)\\s*\\}\\}/g,
                  (_m, rawKey) => {
                    const key = String(rawKey ?? "").trim();
                    const value = getByPath(pageState ?? {}, key);
                    if (value === undefined || value === null) return "";
                    if (typeof value === "string") return value;
                    try {
                      return JSON.stringify(value);
                    } catch {
                      return String(value);
                    }
                  },
                );
              };

              if (action.type === "set-state" || action.type === "setState") {
                setPageState((prev) => ({
                  ...prev,
                  [action.key]: action.value,
                }));
                return;
              }

              if (action.type === "navigate") {
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
                window.alert(action.message);
                return;
              }

              if (action.type === "confirm") {
                const ok = window.confirm(action.message);
                if (!ok) return;
              }

              if (action.type === "when") {
                const op = action.op ?? "truthy";
                const stateValue = (pageState ?? {})[action.key];
                const toNumber = (v) => (typeof v === "number" ? v : Number(v));
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
                                  ? stateValue.includes(action.value)
                                  : typeof stateValue === "string"
                                    ? stateValue.includes(String(action.value ?? ""))
                                    : false
                                : op === "falsy"
                                  ? !stateValue
                                  : !!stateValue;
                if (!passed) return;
              }

              if (action.type === "request") {
                const method = (action.method ?? "GET").toUpperCase();
                const headers = { ...(action.headers ?? {}) };
                const hasContentType = Object.keys(headers).some(
                  (key) => key.toLowerCase() === "content-type",
                );
                const resolvedUrl = resolveTemplateString(action.url);
                let body;
                if (
                  method !== "GET" &&
                  method !== "HEAD" &&
                  action.body !== undefined
                ) {
                  if (typeof action.body === "string") {
                    const resolvedBody = resolveTemplateString(action.body);
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
                  headers[key] = resolveTemplateString(headers[key]);
                });

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
                if (resp.ok && action.saveToStateKey) {
                  const nextValue = action.responsePath
                    ? getByPath(data, action.responsePath)
                    : data;
                  setPageState((prev) => ({
                    ...prev,
                    [action.saveToStateKey]: nextValue,
                  }));
                  return;
                }
                if (!resp.ok) {
                  window.alert(
                    typeof data === "string" ? data : \`Request failed: \${resp.status}\`,
                  );
                }
                return;
              }

              const targetElement = document.getElementById(action.targetId);
              targetElement?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            },
          }}
        />
      ))}
    </div>
  );
}
`;
}
