import { getComponentByType } from "@codigo/materials";
import type { PageCategory, TComponentTypes } from "@codigo/schema";
import { editorComponentCatalog, editorComponentMap } from "./catalog";
import type { EditorComponentSection, EditorComponentSectionKey } from "./types";

const sectionLabelMap: Record<EditorComponentSectionKey, string> = {
  basic: "基础",
  form: "表单",
  report: "报表",
};

const sectionOrder: EditorComponentSectionKey[] = [
  "basic",
  "form",
  "report",
];

export function getEditorComponentSections(pageCategory: PageCategory) {
  return sectionOrder.map((key) => ({
    key,
    label: sectionLabelMap[key],
    items: editorComponentCatalog.filter(
      (item) =>
        item.sectionKey === key &&
        !item.hiddenFromPalette &&
        (!item.categories?.length || item.categories.includes(pageCategory)),
    ),
  })) as EditorComponentSection[];
}

export function findEditorComponent(type?: string | null) {
  if (!type) {
    return null;
  }

  return editorComponentMap[type as TComponentTypes] ?? null;
}

export function getComponentPropsByType(type?: string | null) {
  return findEditorComponent(type)?.propsEditor ?? null;
}

export function getComponentRenderByType(type?: string | null) {
  return type ? getComponentByType(type as TComponentTypes) : null;
}

export const quickInsertComponents = editorComponentCatalog
  .filter((item) => item.quickInsert)
  .map((item) => ({
    type: item.type,
    label: item.name,
  }));

export const codeSyncComponentTypes = editorComponentCatalog
  .filter((item) => item.codeSync ?? true)
  .map((item) => item.type);
