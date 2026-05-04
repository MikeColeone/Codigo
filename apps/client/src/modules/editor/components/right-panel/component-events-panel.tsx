import { useMemo, useState } from "react";
import {
  DownOutlined,
  EllipsisOutlined,
  PlusOutlined,
  RightOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Empty, Modal, Select } from "antd";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import type { ActionConfig, ComponentEventName } from "@codigo/schema";
import { useLocation, useNavigate } from "react-router-dom";
import { useEditorComponents } from "@/modules/editor/hooks";
import {
  ActionConfigFields,
  ActionTypeOptions,
  createDefaultAction,
  getActionTypeLabel,
} from "./action-list-editor";
import { getComponentEventCatalog } from "./component-event-catalog";

const VISIBLE_EVENT_LIMIT = 3;

/**
 * 渲染右侧事件配置面板，使用列表形式展示通用与组件专属事件。
 */
function ComponentEventsPanel() {
  const { getCurrentComponentConfig, getPages, updateCurrentComponentEvents } =
    useEditorComponents();
  const [showMore, setShowMore] = useState(false);
  const [editingEventName, setEditingEventName] =
    useState<ComponentEventName | null>(null);
  const [activeActionIndex, setActiveActionIndex] = useState(-1);
  const [selectedActionType, setSelectedActionType] = useState<
    ActionConfig["type"] | undefined
  >(undefined);
  const navigate = useNavigate();
  const location = useLocation();
  const config = getCurrentComponentConfig.get();

  const pageOptions = useMemo(() => {
    return getPages.get().map((page) => ({
      label: `${page.name} · page:${page.path}`,
      value: `page:${page.path}`,
    }));
  }, [getPages]);

  if (!config) {
    return (
      <div className="py-8 text-center">
        <div className="mb-3 text-[12px] font-medium text-[var(--ide-text)]">
          暂未选中组件
        </div>
        <div className="mb-4 text-[11px] leading-relaxed text-[var(--ide-text-muted)]">
          在画布中点击组件进行配置
        </div>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={false}
          className="!mb-0 !mt-2"
        />
      </div>
    );
  }

  const eventCatalog = getComponentEventCatalog(config.type);
  const visibleEvents = eventCatalog.slice(0, VISIBLE_EVENT_LIMIT);
  const hiddenEvents = eventCatalog.slice(VISIBLE_EVENT_LIMIT);

  /**
   * 打开事件流配置弹窗，可选择定位到当前步骤或新增下一步。
   */
  function openEventEditor(
    eventName: ComponentEventName,
    mode: "current" | "next" = "current",
  ) {
    const currentActions = getEventActions(eventName);
    setEditingEventName(eventName);

    if (mode === "next") {
      setActiveActionIndex(currentActions.length);
      setSelectedActionType(undefined);
      return;
    }

    if (currentActions.length === 0) {
      setActiveActionIndex(0);
      setSelectedActionType(undefined);
      return;
    }

    const nextIndex = currentActions.length - 1;
    setActiveActionIndex(nextIndex);
    setSelectedActionType(currentActions[nextIndex]?.type);
  }

  /**
   * 关闭当前事件流弹窗，并重置临时状态。
   */
  function closeEventEditor() {
    setEditingEventName(null);
    setActiveActionIndex(-1);
    setSelectedActionType(undefined);
  }

  /**
   * 向指定事件追加一个默认动作。
   */
  function appendAction(
    eventName: ComponentEventName,
    actionType: ActionConfig["type"] = "setState",
  ) {
    const currentActions = getEventActions(eventName);
    const nextActions = [...currentActions, createDefaultAction(actionType)];
    updateCurrentComponentEvents(eventName, nextActions);
    setActiveActionIndex(nextActions.length - 1);
    setSelectedActionType(actionType);
  }

  /**
   * 根据当前选中的动作类型创建或重置当前步骤。
   */
  function handleActionTypeChange(nextType: ActionConfig["type"]) {
    if (!editingEventName) {
      return;
    }

    const currentActions = getEventActions(editingEventName);
    const nextAction = createDefaultAction(nextType);

    if (activeActionIndex >= 0 && activeActionIndex < currentActions.length) {
      updateCurrentComponentEvents(
        editingEventName,
        currentActions.map((action, index) =>
          index === activeActionIndex ? nextAction : action,
        ),
      );
      setSelectedActionType(nextType);
      return;
    }

    appendAction(editingEventName, nextType);
  }

  /**
   * 更新当前选中步骤的动作参数。
   */
  function updateActiveAction(nextAction: ActionConfig) {
    if (!editingEventName) {
      return;
    }

    const currentActions = getEventActions(editingEventName);
    if (activeActionIndex < 0 || activeActionIndex >= currentActions.length) {
      return;
    }

    updateCurrentComponentEvents(
      editingEventName,
      currentActions.map((action, index) =>
        index === activeActionIndex ? nextAction : action,
      ),
    );
    setSelectedActionType(nextAction.type);
  }

  /**
   * 删除当前选中步骤，并自动切换到相邻步骤。
   */
  function removeActiveAction() {
    if (!editingEventName) {
      return;
    }

    const currentActions = getEventActions(editingEventName);
    if (activeActionIndex < 0 || activeActionIndex >= currentActions.length) {
      return;
    }

    const nextActions = currentActions.filter(
      (_, index) => index !== activeActionIndex,
    );
    updateCurrentComponentEvents(editingEventName, nextActions);

    if (nextActions.length === 0) {
      setActiveActionIndex(0);
      setSelectedActionType(undefined);
      return;
    }

    const nextIndex = Math.min(activeActionIndex, nextActions.length - 1);
    setActiveActionIndex(nextIndex);
    setSelectedActionType(nextActions[nextIndex]?.type);
  }

  /**
   * 在当前事件流末尾准备新增下一步。
   */
  function prepareNextAction() {
    if (!editingEventName) {
      return;
    }

    const currentActions = getEventActions(editingEventName);
    setActiveActionIndex(currentActions.length);
    setSelectedActionType(undefined);
  }

  /**
   * 跳转到流程编排工作区，并保留当前查询参数上下文。
   */
  function openFlowWorkspace() {
    navigate({
      pathname: "/flow",
      search: location.search,
    });
  }

  /**
   * 读取当前事件已配置的动作列表。
   */
  function getEventActions(eventName: ComponentEventName) {
    return (toJS(config.events?.[eventName]) ?? []) as ActionConfig[];
  }

  /**
   * 返回当前组件在弹窗标题中的展示名称。
   */
  function getCurrentComponentDisplayName() {
    return config.name?.trim() || config.id || config.type;
  }

  /**
   * 返回动作步骤在事件卡片中的摘要文案。
   */
  function getActionSummary(actions: ActionConfig[]) {
    if (!actions.length) {
      return "未配置动作";
    }

    return `${getActionTypeLabel(actions[0].type)} 等${actions.length}个动作`;
  }

  const editingEventMeta = editingEventName
    ? eventCatalog.find((item) => item.name === editingEventName)
    : null;
  const editingActions = editingEventName ? getEventActions(editingEventName) : [];
  const activeAction =
    activeActionIndex >= 0 && activeActionIndex < editingActions.length
      ? editingActions[activeActionIndex]
      : null;

  /**
   * 渲染单个事件配置卡片。
   */
  function renderEventCard(eventName: ComponentEventName) {
    const meta = eventCatalog.find((item) => item.name === eventName);
    if (!meta) {
      return null;
    }

    const actions = getEventActions(eventName);

    return (
      <button
        key={eventName}
        type="button"
        onClick={() => openEventEditor(eventName)}
        className="flex w-full items-start gap-3 overflow-hidden rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-3 py-3 text-left transition-colors hover:bg-[var(--ide-hover)]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-[var(--ide-text)]">
                {meta.title}
                <span className="ml-1 text-[12px] text-[var(--ide-text-muted)]">
                  ({eventName})
                </span>
              </div>
              <div className="mt-1 text-[11px] leading-5 text-[var(--ide-text-muted)]">
                {meta.description}
              </div>
            </div>
            <RightOutlined className="text-[11px] text-[var(--ide-text-muted)]" />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="rounded-sm bg-[var(--ide-hover)] px-2 py-1 text-[11px] text-[var(--ide-text)]">
              {getActionSummary(actions)}
            </div>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={(event) => {
                event.stopPropagation();
                openEventEditor(eventName, "next");
              }}
            />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-3 px-3 pb-8">
      <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-3">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--ide-text)]">
          <ThunderboltOutlined className="text-[var(--ide-accent)]" />
          <span>事件列表</span>
        </div>
        <div className="mt-1 text-[11px] leading-5 text-[var(--ide-text-muted)]">
          点击事件进入动作配置弹窗，按步骤配置动作；需要完整链路时可从顶部进入 Flow 编排。
        </div>
      </div>

      <div className="space-y-2">{visibleEvents.map((item) => renderEventCard(item.name))}</div>

      {hiddenEvents.length ? (
        <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)]">
          <button
            type="button"
            onClick={() => setShowMore((current) => !current)}
            className="flex w-full items-center justify-between px-3 py-3 text-left"
          >
            <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--ide-text)]">
              <EllipsisOutlined className="text-[var(--ide-text-muted)]" />
              <span>更多事件</span>
            </div>
            <DownOutlined
              className={`text-[11px] text-[var(--ide-text-muted)] transition-transform ${
                showMore ? "rotate-180" : ""
              }`}
            />
          </button>
          {showMore ? (
            <div className="space-y-2 border-t border-[var(--ide-border)] px-3 py-3">
              {hiddenEvents.map((item) => renderEventCard(item.name))}
            </div>
          ) : null}
        </div>
      ) : null}

      <Modal
        open={Boolean(editingEventName)}
        title={null}
        onCancel={closeEventEditor}
        destroyOnHidden
        width={520}
        footer={null}
      >
        <div className="space-y-4 pt-1">
          <div className="border-b border-[var(--ide-border)] pb-3">
            <button
              type="button"
              onClick={openFlowWorkspace}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <div className="text-[13px] font-medium text-[var(--ide-text)]">
                  {editingEventMeta
                    ? `${getCurrentComponentDisplayName()} ${editingEventMeta.title} (${editingEventName}) 事件流`
                    : "事件流"}
                </div>
                <div className="mt-1 text-[11px] text-[var(--ide-text-muted)]">
                  点击上方事件流进入 Flow 编排
                </div>
              </div>
              <RightOutlined className="text-[11px] text-[var(--ide-text-muted)]" />
            </button>
          </div>

          {editingActions.length ? (
            <div className="flex flex-wrap gap-2">
              {editingActions.map((action, index) => {
                const isActive = index === activeActionIndex;
                return (
                  <button
                    key={`${action.type}-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveActionIndex(index);
                      setSelectedActionType(action.type);
                    }}
                    className={`rounded-sm border px-2 py-1 text-[11px] transition-colors ${
                      isActive
                        ? "border-[var(--ide-accent)] bg-[var(--ide-active)] text-[var(--ide-text)]"
                        : "border-[var(--ide-border)] bg-[var(--ide-control-bg)] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
                    }`}
                  >
                    {`步骤 ${index + 1} · ${getActionTypeLabel(action.type)}`}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-3 py-3">
            <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
              <div className="text-[12px] text-[var(--ide-text)]">
                触发动作
                <span className="ml-1 text-[var(--ide-danger)]">*</span>
              </div>
              <Select
                value={selectedActionType}
                options={ActionTypeOptions as unknown as Array<{
                  label: string;
                  value: ActionConfig["type"];
                }>}
                onChange={handleActionTypeChange}
                className="w-full"
                placeholder="请选择动作"
              />
            </div>

            {activeAction ? (
              <div className="mt-4 border-t border-[var(--ide-border)] pt-4">
                <ActionConfigFields
                  action={activeAction}
                  onChange={updateActiveAction}
                  pageOptions={pageOptions}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-sm border border-dashed border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-6 text-center text-[11px] text-[var(--ide-text-muted)]">
                先选择动作类型，再继续配置当前步骤。
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="text"
              danger
              disabled={!activeAction}
              onClick={removeActiveAction}
              className="!px-0"
            >
              删除当前动作
            </Button>
            <Button onClick={prepareNextAction} icon={<PlusOutlined />}>
              接下来
            </Button>
          </div>

          <div className="text-[11px] leading-5 text-[var(--ide-text-muted)]">
            下拉用于切换当前步骤的动作类型；继续追加步骤时点“接下来”，复杂链路再进入 Flow。
          </div>
        </div>
      </Modal>
    </div>
  );
}

const ComponentEventsPanelComponent = observer(ComponentEventsPanel);

export default ComponentEventsPanelComponent;
