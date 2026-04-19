import {
  type IRichTextComponentProps,
  fillComponentPropsByConfig,
  richTextComponentDefaultConfig,
} from "@codigo/materials";
import { useEffect, useMemo, useRef } from "react";
import { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";

import { useEditorComponents } from "@/modules/editor/hooks";

export default function RichTextComponentProps(
  _props: IRichTextComponentProps,
) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, richTextComponentDefaultConfig);
  }, [_props]);
  const { updateCurrentComponent } = useEditorComponents();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || quillRef.current) {
      return;
    }

    const editorElement = document.createElement("div");
    container.append(editorElement);

    const quill = new Quill(editorElement, {
      theme: "snow",
      placeholder: "请输入内容",
      modules: {
        toolbar: [
          [
            { header: [1, 2, 3, 4, false] },
            "bold",
            "italic",
            "underline",
            { color: [] },
            { background: [] },
            { align: [] },
            { list: "ordered" },
            { list: "bullet" },
            { font: [] },
          ],
          ["code-block"],
        ],
      },
    });

    if (props.content.value) {
      quill.clipboard.dangerouslyPasteHTML(props.content.value);
    }

    quill.on("text-change", () => {
      if (isSyncingRef.current) {
        return;
      }

      updateCurrentComponent({ content: quill.root.innerHTML });
    });

    quillRef.current = quill;

    return () => {
      quillRef.current = null;
      container.innerHTML = "";
    };
  }, [props.content.value, updateCurrentComponent]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) {
      return;
    }

    const nextValue = props.content.value || "";
    const currentValue = quill.root.innerHTML;
    if (currentValue === nextValue) {
      return;
    }

    isSyncingRef.current = true;
    const selection = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(nextValue);
    if (selection) {
      quill.setSelection(selection);
    }
    isSyncingRef.current = false;
  }, [props.content.value]);

  return (
    <div className="flex items-center justify-center">
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
