import {
  type IRichTextComponentProps,
  fillComponentPropsByConfig,
  richTextComponentDefaultConfig,
} from "@codigo/materials";
import { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { useEditorComponents } from "@/modules/editor/hooks";

/**
 * 兼容历史富文本节点里遗留的 html 字段，统一映射到 content。
 */
function resolveRichTextContent(
  props: IRichTextComponentProps & { html?: string },
) {
  return props.content ?? props.html ?? "";
}

export default function richTextComponentProps(
  _props: IRichTextComponentProps & { html?: string },
) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(
      {
        ..._props,
        content: resolveRichTextContent(_props),
      },
      richTextComponentDefaultConfig,
    );
  }, [_props]);
  const { updateCurrentComponent } = useEditorComponents();
  const [value, setValue] = useState(props.content.value || "");

  useEffect(() => {
    setValue(props.content.value || "");
  }, [props.content.value]);

  /**
   * 只在用户真实编辑时回写 store，避免 Quill 挂载阶段归一化 HTML 抹掉模板内联样式。
   */
  const handleChange = (newValue: string, _delta: unknown, source: string) => {
    setValue(newValue);
    if (source !== "user") {
      return;
    }
    updateCurrentComponent({ content: newValue });
  };

  return (
    <div className="flex items-center justify-center">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder="请输入内容"
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, 4, false] }, "bold", "italic", "underline"],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ font: [] }],
            ["code-block"],
          ],
        }}
        className="w-full"
      />
    </div>
  );
}
