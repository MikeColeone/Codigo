import { Modal } from "antd";
import { REQUEST_TYPE_OPTIONS, type RequestModuleType } from "./mock-request-data";

interface RequestTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: RequestModuleType) => void;
}

/**
 * 提供请求类型选择弹窗，先用固定卡片跑通新增链路。
 */
export function RequestTypeModal({
  open,
  onClose,
  onSelect,
}: RequestTypeModalProps) {
  const groupedOptions = REQUEST_TYPE_OPTIONS.reduce<
    Array<{ category: string; items: typeof REQUEST_TYPE_OPTIONS }>
  >((groups, option) => {
    const current = groups.find((group) => group.category === option.category);
    if (current) {
      current.items.push(option);
      return groups;
    }

    groups.push({
      category: option.category,
      items: [option],
    });
    return groups;
  }, []);

  return (
    <Modal
      open={open}
      title="新增页面请求"
      footer={null}
      width={720}
      onCancel={onClose}
      destroyOnHidden
    >
      <div className="space-y-5">
        <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] px-4 py-3 text-[12px] leading-6 text-[var(--ide-text-muted)]">
          先写死请求类型入口，选择后会在编辑器下方拉起配置台，后续再接真实请求引擎。
        </div>

        {groupedOptions.map((group) => (
          <div key={group.category} className="space-y-2">
            <div className="text-[12px] font-semibold text-[var(--ide-text-muted)]">
              {group.category}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelect(item.key)}
                  className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 text-left transition-colors hover:border-[var(--ide-accent)] hover:bg-[var(--ide-hover)]"
                >
                  <div className="text-[13px] font-semibold text-[var(--ide-text)]">
                    {item.label}
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-[var(--ide-text-muted)]">
                    {item.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
