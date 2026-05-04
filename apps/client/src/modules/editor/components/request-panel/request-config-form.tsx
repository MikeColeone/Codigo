import { Button, Input, Select, Switch } from "antd";
import type {
  EditorRequestRecord,
  RequestFieldItem,
  RequestMappingItem,
} from "./mock-request-data";

interface RequestConfigFormProps {
  value: EditorRequestRecord;
  onChange: (next: EditorRequestRecord) => void;
}

/**
 * 渲染请求配置表单，先支持前端本地编辑和展示。
 */
export function RequestConfigForm({
  value,
  onChange,
}: RequestConfigFormProps) {
  /**
   * 更新键值对配置列表中的单个字段。
   */
  function updateFieldList(
    listKey: "headers",
    itemId: string,
    patch: Partial<RequestFieldItem>,
  ) {
    onChange({
      ...value,
      [listKey]: value[listKey].map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    });
  }

  /**
   * 更新输入输出映射列表中的单个字段。
   */
  function updateMappingList(
    listKey: "inputMappings" | "outputMappings",
    itemId: string,
    patch: Partial<RequestMappingItem>,
  ) {
    onChange({
      ...value,
      [listKey]: value[listKey].map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={value.name}
          placeholder="请求名称"
          onChange={(event) => onChange({ ...value, name: event.target.value })}
        />
        <Select
          value={value.method}
          options={[
            { label: "GET", value: "GET" },
            { label: "POST", value: "POST" },
            { label: "PUT", value: "PUT" },
          ]}
          onChange={(method) => onChange({ ...value, method })}
        />
      </div>

      <Input
        value={value.url}
        placeholder="请求地址"
        onChange={(event) => onChange({ ...value, url: event.target.value })}
      />

      <Input.TextArea
        value={value.description}
        placeholder="请求说明"
        rows={3}
        onChange={(event) =>
          onChange({ ...value, description: event.target.value })
        }
      />

      <div className="flex items-center justify-between rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-2">
        <div>
          <div className="text-[12px] font-medium text-[var(--ide-text)]">
            自动请求
          </div>
          <div className="mt-1 text-[11px] text-[var(--ide-text-muted)]">
            先只控制前端展示状态，后续再接真实执行时机。
          </div>
        </div>
        <Switch
          checked={value.autoRun}
          onChange={(autoRun) => onChange({ ...value, autoRun })}
        />
      </div>

      <ConfigSection title="请求头">
        {value.headers.map((item) => (
          <div key={item.id} className="grid grid-cols-2 gap-2">
            <Input
              value={item.key}
              placeholder="Header Key"
              onChange={(event) =>
                updateFieldList("headers", item.id, { key: event.target.value })
              }
            />
            <Input
              value={item.value}
              placeholder="Header Value"
              onChange={(event) =>
                updateFieldList("headers", item.id, { value: event.target.value })
              }
            />
          </div>
        ))}
      </ConfigSection>

      <ConfigSection title="输入映射">
        {value.inputMappings.map((item) => (
          <div key={item.id} className="grid grid-cols-2 gap-2">
            <Input
              value={item.source}
              placeholder="来源"
              onChange={(event) =>
                updateMappingList("inputMappings", item.id, {
                  source: event.target.value,
                })
              }
            />
            <Input
              value={item.target}
              placeholder="目标字段"
              onChange={(event) =>
                updateMappingList("inputMappings", item.id, {
                  target: event.target.value,
                })
              }
            />
          </div>
        ))}
      </ConfigSection>

      <ConfigSection title="输出映射">
        {value.outputMappings.map((item) => (
          <div key={item.id} className="grid grid-cols-2 gap-2">
            <Input
              value={item.source}
              placeholder="响应路径"
              onChange={(event) =>
                updateMappingList("outputMappings", item.id, {
                  source: event.target.value,
                })
              }
            />
            <Input
              value={item.target}
              placeholder="写入状态"
              onChange={(event) =>
                updateMappingList("outputMappings", item.id, {
                  target: event.target.value,
                })
              }
            />
          </div>
        ))}
      </ConfigSection>

      <div className="flex items-center gap-2">
        <Button type="primary">运行调试</Button>
        <Button>保存配置</Button>
        <span className="text-[11px] text-[var(--ide-text-muted)]">
          当前按钮只验证前端链路，不发起真实请求。
        </span>
      </div>
    </div>
  );
}

function ConfigSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-3">
      <div className="text-[12px] font-semibold text-[var(--ide-text)]">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
