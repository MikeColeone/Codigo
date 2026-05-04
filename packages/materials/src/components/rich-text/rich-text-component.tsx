import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import {
  type IRichTextComponentProps,
  richTextComponentDefaultConfig,
} from ".";

/**
 * 兼容历史富文本节点里遗留的 html 字段，统一映射到 content。
 */
function resolveRichTextContent(
  props: IRichTextComponentProps & { html?: string },
) {
  return props.content ?? props.html ?? "";
}

/**
 * 渲染富文本物料，内容为空时展示占位提示。
 */
export default function RichTextComponent(
  _props: IRichTextComponentProps & { html?: string },
) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(richTextComponentDefaultConfig),
      ..._props,
      content: resolveRichTextContent(_props),
    };
  }, [_props]);

  if (!props.content)
    return (
      <div id="placeholder" className="w-full h-20">
        请在富文本输入内输入内容
      </div>
    );

  return <div dangerouslySetInnerHTML={{ __html: props.content }} />;
}
