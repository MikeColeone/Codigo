import { useEffect, useState } from "react";
import { Button, Input } from "antd";
import type { SidebarSectionItem } from "@/modules/editor/utils/sidebarLayout";

interface SidebarLayoutSectionRowProps {
  item: SidebarSectionItem;
  isFirst: boolean;
  isLast: boolean;
  onMoveDown: (stateValue: string) => void;
  onMoveUp: (stateValue: string) => void;
  onRemove: (stateValue: string) => void;
  onRename: (stateValue: string, label: string) => void;
}

/**
 * 渲染侧栏布局的单个导航项配置行。
 */
export default function SidebarLayoutSectionRow(
  props: SidebarLayoutSectionRowProps,
) {
  const [label, setLabel] = useState(props.item.label);

  useEffect(() => {
    setLabel(props.item.label);
  }, [props.item.label]);

  /**
   * 提交当前导航项名称。
   */
  const commitLabel = () => {
    const nextLabel = label.trim();
    if (!nextLabel || nextLabel === props.item.label) {
      setLabel(props.item.label);
      return;
    }

    props.onRename(props.item.stateValue, nextLabel);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-3">
      <div className="flex flex-col gap-2">
        <Input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onBlur={commitLabel}
          onPressEnter={commitLabel}
          className="w-full min-w-0"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={props.isFirst}
            onClick={() => props.onMoveUp(props.item.stateValue)}
          >
            上移
          </Button>
          <Button
            disabled={props.isLast}
            onClick={() => props.onMoveDown(props.item.stateValue)}
          >
            下移
          </Button>
          <Button danger onClick={() => props.onRemove(props.item.stateValue)}>
            删除
          </Button>
        </div>
      </div>

      <div className="mt-2 text-[11px] leading-5 text-slate-500">
        {props.item.panel ? "已绑定右侧内容区" : "右侧内容区缺失，可点击同步内容区补齐"}
      </div>
    </div>
  );
}
