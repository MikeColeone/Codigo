import { SearchOutlined } from "@ant-design/icons";
import { Empty, Input } from "antd";
import { getComponentContainerMeta } from "@codigo/materials";
import type { DragEvent, FC } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  useEditorComponents,
  useEditorPage,
  useEditorPermission,
} from "@/modules/editor/hooks";
import {
  editorComponentCatalog,
  getEditorComponentSections,
  type EditorComponentMeta,
} from "@/modules/editor/registry/components";

export const components = editorComponentCatalog;

const EditorComponent: FC<EditorComponentMeta> = ({ icon, name, type }) => {
  const store = useEditorComponents();
  const { can } = useEditorPermission();
  const allowInsert = can("edit_structure");

  function handleClick() {
    if (!allowInsert) return;
    const current = store.getCurrentComponentConfig.get();
    if (current) {
      const meta = getComponentContainerMeta(current.type);
      if (meta.isContainer) {
        const slotName =
          store.getAvailableSlots(current.type)[0]?.name ?? "default";
        store.push(
          type,
          { left: 24, top: 24 },
          undefined,
          { parentId: current.id, slot: slotName },
        );
        return;
      }
    }
    store.push(type);
  }

  function handleDragStart(e: DragEvent) {
    if (!allowInsert) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("componentType", type);
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div
      onClick={handleClick}
      draggable={allowInsert}
      onDragStart={handleDragStart}
      className={`group relative overflow-hidden border p-2 text-left select-none transition-all ${
        allowInsert
          ? "cursor-grab border-[var(--ide-border)] bg-[var(--ide-control-bg)] hover:border-[var(--ide-accent)] hover:bg-[var(--ide-hover)] active:cursor-grabbing"
          : "cursor-not-allowed border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] opacity-40"
      }`}
    >
      <div className="pointer-events-none mb-1.5 flex h-7 w-7 items-center justify-center rounded-sm bg-[var(--ide-active)] text-sm text-[var(--ide-text)] transition-colors group-hover:bg-[var(--ide-accent)] group-hover:text-white">
        {icon}
      </div>
      <div className="pointer-events-none">
        <div className="truncate text-[11px] font-medium text-[var(--ide-text)]">{name}</div>
      </div>
    </div>
  );
};

export default function ComponentList() {
  const [keyword, setKeyword] = useState("");
  const [activeSectionKey, setActiveSectionKey] = useState<string>("");
  const { store: storePage } = useEditorPage();
  const normalizedKeyword = keyword.trim().toLowerCase();

  const sections = useMemo(() => {
    const commonItems = editorComponentCatalog.filter(
      (item) =>
        item.quickInsert &&
        !item.hiddenFromPalette &&
        (!item.categories?.length || item.categories.includes(storePage.pageCategory)),
    );
    const baseSections = getEditorComponentSections(storePage.pageCategory);
    const result = [
      ...(commonItems.length
        ? [
            {
              key: "common",
              label: "常用",
              items: commonItems,
            },
          ]
        : []),
      ...baseSections,
    ];

    return result.map((section) => ({
      ...section,
      items: normalizedKeyword
        ? section.items.filter((item) =>
            `${item.name} ${item.type}`.toLowerCase().includes(normalizedKeyword),
          )
        : section.items,
    }));
  }, [normalizedKeyword, storePage.pageCategory]);

  useEffect(() => {
    const firstAvailable = sections.find((s) => s.items.length)?.key ?? sections[0]?.key ?? "";
    if (!activeSectionKey || !sections.some((s) => s.key === activeSectionKey)) {
      setActiveSectionKey(firstAvailable);
      return;
    }
    const current = sections.find((s) => s.key === activeSectionKey);
    if (!current?.items.length) {
      setActiveSectionKey(firstAvailable);
    }
  }, [activeSectionKey, sections]);

  const activeSection = sections.find((s) => s.key === activeSectionKey) ?? sections[0];

  return (
    <div className="flex h-full flex-col bg-[var(--ide-sidebar-bg)]">
      <div className="px-2 pb-2">
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索物料..."
          prefix={<SearchOutlined className="text-[var(--ide-text-muted)]" />}
          allowClear
          size="small"
          className="!rounded-sm !border-[var(--ide-control-border)] !bg-[var(--ide-control-bg)] !text-[var(--ide-text)]"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-2 pb-3">
        <div className="flex h-full min-h-0 gap-2">
          <div className="w-[76px] shrink-0 border-r border-[var(--ide-border)] pr-2">
            <div className="h-full overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-[var(--ide-border)] hover:scrollbar-thumb-[var(--ide-text-muted)] scrollbar-track-transparent">
              {sections.map((section) => {
                const isActive = section.key === activeSectionKey;
                const disabled = section.items.length === 0;
                return (
                  <button
                    key={section.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => setActiveSectionKey(section.key)}
                    className={`mb-1 flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-[11px] transition-colors ${
                      disabled
                        ? "cursor-not-allowed text-[var(--ide-text-muted)] opacity-40"
                        : isActive
                          ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                          : "text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]"
                    }`}
                  >
                    <span className="truncate">{section.label}</span>
                    <span className="ml-1 text-[10px] opacity-80">{section.items.length}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="h-full overflow-y-auto pb-1 scrollbar-thin scrollbar-thumb-[var(--ide-border)] hover:scrollbar-thumb-[var(--ide-text-muted)] scrollbar-track-transparent">
              {activeSection?.items?.length ? (
                <div className="pb-2">
                  <div className="mb-2 flex items-center justify-between pr-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text)]">
                      {activeSection.label}
                    </span>
                    <span className="text-[10px] text-[var(--ide-text-muted)]">
                      {activeSection.items.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {activeSection.items.map((item) => (
                      <EditorComponent {...item} key={item.type} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[var(--ide-border)] bg-[var(--ide-hover)] py-10">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span className="text-[var(--ide-text-muted)]">无匹配物料</span>}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
