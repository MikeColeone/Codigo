import type { FC } from "react";
import type { ActionConfig } from "@codigo/schema";
import { Button, Collapse, Input, Select } from "antd";

const { Panel } = Collapse;

export const ActionTypeOptions = [
  { label: "设置状态", value: "setState" },
  { label: "切换视图", value: "setActiveContainer" },
  { label: "页面跳转", value: "navigate" },
  { label: "打开链接", value: "openUrl" },
  { label: "滚动定位", value: "scrollTo" },
  { label: "提示消息", value: "toast" },
  { label: "确认弹窗", value: "confirm" },
  { label: "条件判断", value: "when" },
  { label: "请求接口", value: "request" },
] as const;

/**
 * 创建指定动作类型的默认配置。
 */
export function createDefaultAction(
  type: ActionConfig["type"],
): ActionConfig {
  switch (type) {
    case "setActiveContainer":
      return { type, viewGroupId: "", containerId: "" };
    case "navigate":
      return { type, path: "page:home" };
    case "openUrl":
      return { type, url: "https://example.com", target: "_blank" };
    case "scrollTo":
      return { type, targetId: "section-overview" };
    case "toast":
      return { type, message: "操作成功", variant: "success" };
    case "confirm":
      return { type, message: "确认执行该操作？" };
    case "when":
      return { type, key: "activePanel", op: "eq", value: "overview" };
    case "request":
      return {
        type,
        method: "GET",
        url: "/api/health",
        saveToStateKey: "lastResponse",
        responsePath: "",
      };
    default:
      return { type: "setState", key: "activePanel", value: "overview" };
  }
}

/**
 * 返回动作类型对应的展示文案。
 */
export function getActionTypeLabel(type: ActionConfig["type"]) {
  return (
    ActionTypeOptions.find((item) => item.value === type)?.label ?? type
  );
}

type PageOption = { label: string; value: string };

/**
 * 渲染单个动作的配置表单，并在需要时递归编辑子步骤。
 */
export const ActionConfigFields: FC<{
  action: ActionConfig;
  onChange: (next: ActionConfig) => void;
  pageOptions: PageOption[];
  depth?: number;
}> = ({ action, onChange, pageOptions, depth = 0 }) => {
  const updateAction = (patch: Partial<Record<string, unknown>>) => {
    onChange({ ...action, ...patch } as ActionConfig);
  };

  const renderNested = (
    sections: Array<{
      key: string;
      title: string;
      value: ActionConfig[] | undefined;
      onChange: (next: ActionConfig[]) => void;
    }>,
  ) => {
    if (depth >= 2) {
      return null;
    }

    return (
      <Collapse
        size="small"
        ghost
        className="mt-2 [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-header]:!py-1 [&_.ant-collapse-content-box]:!px-0 [&_.ant-collapse-content-box]:!py-2"
      >
        {sections.map((section) => (
          <Panel
            key={`${action.type}-${section.key}`}
            header={
              <div className="text-[11px] font-semibold text-[var(--ide-text)]">
                {section.title}
              </div>
            }
          >
            <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-2">
              <ActionListEditor
                value={section.value ?? []}
                onChange={section.onChange}
                pageOptions={pageOptions}
                depth={depth + 1}
                emptyText="无子步骤"
              />
            </div>
          </Panel>
        ))}
      </Collapse>
    );
  };

  return (
    <>
      {action.type === "setState" ? (
        <div className="grid grid-cols-2 gap-1.5">
          <Input
            value={action.key}
            size="small"
            onChange={(event) =>
              updateAction({
                key: event.target.value,
              })
            }
            placeholder="键"
            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
          />
          <Input
            value={String(action.value ?? "")}
            size="small"
            onChange={(event) =>
              updateAction({
                value: event.target.value,
              })
            }
            placeholder="值"
            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
          />
        </div>
      ) : null}

      {action.type === "setActiveContainer" ? (
        <div className="grid grid-cols-2 gap-1.5">
          <Input
            value={action.viewGroupId ?? ""}
            size="small"
            onChange={(event) =>
              updateAction({
                viewGroupId: event.target.value,
              })
            }
            placeholder="viewGroupId(可选)"
            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
          />
          <Input
            value={action.containerId}
            size="small"
            onChange={(event) =>
              updateAction({
                containerId: event.target.value,
              })
            }
            placeholder="containerId"
            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
          />
        </div>
      ) : null}

      {action.type === "navigate" ? (
        <div className="space-y-1.5">
          <Select
            value={
              pageOptions.some((item) => item.value === action.path)
                ? action.path
                : undefined
            }
            size="small"
            options={pageOptions}
            allowClear
            placeholder="选择页面"
            onChange={(next) =>
              updateAction({
                path: next || action.path,
              })
            }
            className="w-full"
          />
          <Input
            value={action.path}
            size="small"
            onChange={(event) =>
              updateAction({
                path: event.target.value,
              })
            }
            placeholder="路径"
            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
          />
        </div>
      ) : null}

      {action.type === "openUrl" ? (
        <div className="grid grid-cols-1 gap-1.5">
          <Input
            value={action.url}
            size="small"
            onChange={(event) =>
              updateAction({
                url: event.target.value,
              })
            }
            placeholder="https://..."
            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
          />
          <Select
            value={action.target ?? "_blank"}
            size="small"
            options={[
              { label: "新窗口", value: "_blank" },
              { label: "当前窗口", value: "_self" },
            ]}
            onChange={(target) => updateAction({ target })}
            className="w-full"
          />
        </div>
      ) : null}

      {action.type === "scrollTo" ? (
        <Input
          value={action.targetId}
          size="small"
          onChange={(event) =>
            updateAction({
              targetId: event.target.value,
            })
          }
          placeholder="锚点 ID"
          className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
        />
      ) : null}

      {action.type === "toast" ? (
        <div className="space-y-1.5">
          <Input
            value={action.message}
            size="small"
            onChange={(event) =>
              updateAction({
                message: event.target.value,
              })
            }
            placeholder="提示内容"
            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
          />
          <Select
            value={action.variant ?? "info"}
            size="small"
            options={[
              { label: "成功", value: "success" },
              { label: "错误", value: "error" },
              { label: "信息", value: "info" },
              { label: "警告", value: "warning" },
            ]}
            onChange={(variant) => updateAction({ variant })}
            className="w-full"
          />
        </div>
      ) : null}

      {action.type === "confirm" ? (
        <>
          <Input
            value={action.message}
            size="small"
            onChange={(event) =>
              updateAction({
                message: event.target.value,
              })
            }
            placeholder="确认文案"
            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
          />
          {renderNested([
            {
              key: "ok",
              title: "确认后",
              value: action.onOk,
              onChange: (next) => updateAction({ onOk: next }),
            },
            {
              key: "cancel",
              title: "取消后",
              value: action.onCancel,
              onChange: (next) => updateAction({ onCancel: next }),
            },
          ])}
        </>
      ) : null}

      {action.type === "when" ? (
        <>
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <Input
                value={action.key}
                size="small"
                onChange={(event) =>
                  updateAction({
                    key: event.target.value,
                  })
                }
                placeholder="状态键"
                className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
              />
              <Select
                value={action.op ?? "truthy"}
                size="small"
                options={[
                  { label: "等于", value: "eq" },
                  { label: "不等于", value: "ne" },
                  { label: "大于", value: "gt" },
                  { label: "大于等于", value: "gte" },
                  { label: "小于", value: "lt" },
                  { label: "小于等于", value: "lte" },
                  { label: "包含", value: "includes" },
                  { label: "为真", value: "truthy" },
                  { label: "为假", value: "falsy" },
                ]}
                onChange={(op) => updateAction({ op })}
                className="w-full"
              />
            </div>
            {(action.op ?? "truthy") === "eq" ||
            (action.op ?? "truthy") === "ne" ||
            (action.op ?? "truthy") === "gt" ||
            (action.op ?? "truthy") === "gte" ||
            (action.op ?? "truthy") === "lt" ||
            (action.op ?? "truthy") === "lte" ||
            (action.op ?? "truthy") === "includes" ? (
              <Input
                value={String(action.value ?? "")}
                size="small"
                onChange={(event) =>
                  updateAction({
                    value: event.target.value,
                  })
                }
                placeholder="比较值"
                className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
              />
            ) : null}
          </div>
          {renderNested([
            {
              key: "true",
              title: "条件为真",
              value: action.onTrue,
              onChange: (next) => updateAction({ onTrue: next }),
            },
            {
              key: "false",
              title: "条件为假",
              value: action.onFalse,
              onChange: (next) => updateAction({ onFalse: next }),
            },
          ])}
        </>
      ) : null}

      {action.type === "request" ? (
        <>
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <Select
                value={action.method ?? "GET"}
                size="small"
                options={[
                  { label: "GET", value: "GET" },
                  { label: "POST", value: "POST" },
                  { label: "PUT", value: "PUT" },
                  { label: "PATCH", value: "PATCH" },
                  { label: "DELETE", value: "DELETE" },
                ]}
                onChange={(method) => updateAction({ method })}
                className="w-full"
              />
              <Input
                value={action.saveToStateKey ?? ""}
                size="small"
                onChange={(event) =>
                  updateAction({
                    saveToStateKey: event.target.value,
                  })
                }
                placeholder="保存到状态键(可选)"
                className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
              />
            </div>
            <Input
              value={action.responsePath ?? ""}
              size="small"
              onChange={(event) =>
                updateAction({ responsePath: event.target.value })
              }
              placeholder="响应取值路径(可选) 例如 data.list"
              className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
            />
            <Input.TextArea
              value={action.headers ? JSON.stringify(action.headers) : ""}
              onChange={(event) => {
                const text = event.target.value;
                if (!text.trim()) {
                  updateAction({ headers: undefined });
                  return;
                }
                try {
                  const parsed = JSON.parse(text) as unknown;
                  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                    return;
                  }
                  const nextHeaders: Record<string, string> = {};
                  Object.entries(parsed as Record<string, unknown>).forEach(
                    ([key, value]) => {
                      nextHeaders[key] = String(value ?? "");
                    },
                  );
                  updateAction({ headers: nextHeaders });
                } catch {
                  return;
                }
              }}
              placeholder='Headers JSON（可选）例如 {"Authorization":"Bearer {{token}}"}'
              autoSize={{ minRows: 2, maxRows: 6 }}
              className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
            />
            <Input
              value={action.url}
              size="small"
              onChange={(event) => updateAction({ url: event.target.value })}
              placeholder="/api/... 支持 {{stateKey}}"
              className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
            />
            <Input.TextArea
              value={typeof action.body === "string" ? action.body : ""}
              onChange={(event) => updateAction({ body: event.target.value })}
              placeholder="Body（可选，字符串或 JSON，支持 {{stateKey}}）"
              autoSize={{ minRows: 2, maxRows: 6 }}
              className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
            />
          </div>
          {renderNested([
            {
              key: "success",
              title: "请求成功",
              value: action.onSuccess,
              onChange: (next) => updateAction({ onSuccess: next }),
            },
            {
              key: "error",
              title: "请求失败",
              value: action.onError,
              onChange: (next) => updateAction({ onError: next }),
            },
          ])}
        </>
      ) : null}

      {renderNested([
        {
          key: "branches",
          title: "并发后续",
          value: action.branches,
          onChange: (next) => updateAction({ branches: next.length ? next : undefined }),
        },
      ])}
    </>
  );
};

const ActionListEditor: FC<{
  value: ActionConfig[];
  onChange: (next: ActionConfig[]) => void;
  pageOptions: PageOption[];
  depth?: number;
  emptyText?: string;
  hideAddActions?: boolean;
}> = ({
  value,
  onChange,
  pageOptions,
  depth = 0,
  emptyText = "无步骤",
  hideAddActions = false,
}) => {
  const actions = Array.isArray(value) ? value : [];

  const updateAction = (index: number, nextAction: ActionConfig) => {
    onChange(
      actions.map((action, actionIndex) => {
        if (actionIndex !== index) return action;
        return nextAction;
      }),
    );
  };

  const resetActionType = (index: number, nextType: ActionConfig["type"]) => {
    onChange(
      actions.map((action, actionIndex) => {
        if (actionIndex !== index) return action;
        return createDefaultAction(nextType);
      }),
    );
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const addAction = (type: ActionConfig["type"]) => {
    onChange([...actions, createDefaultAction(type)]);
  };

  return (
    <div className="space-y-2">
      {!hideAddActions ? (
        <div className="flex flex-wrap gap-1">
          {ActionTypeOptions.map((item) => (
            <Button
              key={item.value}
              size="small"
              onClick={() => addAction(item.value)}
              className="!bg-[var(--ide-control-bg)] !text-[11px] !text-[var(--ide-text)] !border-[var(--ide-control-border)] hover:!bg-[var(--ide-active)]"
            >
              {item.label}
            </Button>
          ))}
        </div>
      ) : null}

      {actions.length ? (
        actions.map((action, index) => (
          <div
            key={`${action.type}-${index}`}
            className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-[var(--ide-accent)]">
                #{index + 1}
              </span>
              <Select
                value={action.type}
                size="small"
                options={ActionTypeOptions as unknown as Array<{
                  label: string;
                  value: ActionConfig["type"];
                }>}
                onChange={(nextType) => resetActionType(index, nextType)}
                className="flex-1"
              />
              <Button
                size="small"
                danger
                type="text"
                onClick={() => removeAction(index)}
                className="!p-0"
              >
                删除
              </Button>
            </div>

            <ActionConfigFields
              action={action}
              onChange={(nextAction) => updateAction(index, nextAction)}
              pageOptions={pageOptions}
              depth={depth}
            />
          </div>
        ))
      ) : (
        <div className="py-4 text-center text-[11px] text-[var(--ide-text-muted)]">
          {emptyText}
        </div>
      )}
    </div>
  );
};

export { ActionListEditor };
