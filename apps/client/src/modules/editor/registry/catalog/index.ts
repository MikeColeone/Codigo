import type { TComponentTypes } from "@codigo/schema";
import type { EditorComponentMeta } from "../types";
import { basicEditorComponents } from "./basic";
import { containerEditorComponents } from "./containers";
import { formEditorComponents } from "./form";
import { reportEditorComponents } from "./report";

export const editorComponentCatalog: EditorComponentMeta[] = [
  ...containerEditorComponents,
  ...basicEditorComponents,
  ...formEditorComponents,
  ...reportEditorComponents,
];

export const editorComponentMap = Object.fromEntries(
  editorComponentCatalog.map((item) => [item.type, item]),
) as Partial<Record<TComponentTypes, EditorComponentMeta>>;
