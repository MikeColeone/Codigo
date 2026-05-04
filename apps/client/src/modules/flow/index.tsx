import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { useEffect, useMemo, useRef } from "react";
import type { ActionConfig, ComponentEventName } from "@codigo/schema";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEditorComponents } from "@/modules/editor/hooks";
import { getComponentEventCatalog } from "@/modules/editor/components/right-panel/component-event-catalog";
import { flowStore } from "./stores/flow-store";
import { Toolbar } from "./components/toolbar";
import { Canvas } from "./components/canvas";
import { PropsPanel } from "./components/props-panel";

function Flow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    getComponentById,
    getPages,
    setCurrentComponent,
    updateCurrentComponentEvents,
  } = useEditorComponents();
  const setCurrentComponentRef = useRef(setCurrentComponent);
  const updateCurrentComponentEventsRef = useRef(updateCurrentComponentEvents);
  const componentId = searchParams.get("componentId") ?? "";
  const rawEventName = (searchParams.get("eventName") ?? "didMount") as ComponentEventName;
  const component = componentId ? getComponentById(componentId) : null;
  const searchParamsText = searchParams.toString();
  const pages = getPages.get();

  useEffect(() => {
    setCurrentComponentRef.current = setCurrentComponent;
    updateCurrentComponentEventsRef.current = updateCurrentComponentEvents;
  }, [setCurrentComponent, updateCurrentComponentEvents]);

  const pageOptionsKey = pages.map((page) => `${page.name}:page:${page.path}`).join("|");
  const pageOptions = useMemo(() => {
    return pages.map((page) => ({
      label: `${page.name} · page:${page.path}`,
      value: `page:${page.path}`,
    }));
  }, [pageOptionsKey]);
  const eventCatalog = useMemo(() => {
    return component ? getComponentEventCatalog(component.type) : [];
  }, [component?.type]);
  const matchedEvent = useMemo(() => {
    return (
      eventCatalog.find((item) => item.name === rawEventName)?.name ??
      eventCatalog[0]?.name ??
      "didMount"
    );
  }, [eventCatalog, rawEventName]);
  const eventOptions = useMemo(() => {
    return eventCatalog.map((item) => ({
      name: item.name,
      title: item.title,
    }));
  }, [eventCatalog]);
  const eventOptionsKey = eventOptions.map((item) => `${item.name}:${item.title}`).join("|");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        document.activeElement === document.body
      ) {
        flowStore.removeSelected();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      flowStore.clearContext();
    };
  }, []);

  useEffect(() => {
    if (!componentId || !component) {
      flowStore.clearContext();
      return;
    }

    setCurrentComponentRef.current(componentId);
  }, [component, componentId]);

  useEffect(() => {
    if (!componentId || !component) {
      return;
    }

    if (matchedEvent !== rawEventName) {
      const nextSearch = new URLSearchParams(searchParamsText);
      nextSearch.set("eventName", matchedEvent);
      navigate(
        {
          pathname: "/flow",
          search: nextSearch.toString(),
        },
        { replace: true },
      );
    }
  }, [
    component,
    componentId,
    matchedEvent,
    navigate,
    rawEventName,
    searchParamsText,
  ]);

  useEffect(() => {
    if (!componentId || !component || matchedEvent !== rawEventName) {
      return;
    }

    const nextContext = {
      componentId,
      componentLabel: component.name?.trim() || component.id || component.type,
      eventName: matchedEvent,
    };
    const isSameContext =
      flowStore.context?.componentId === componentId &&
      flowStore.context?.eventName === matchedEvent;

    if (isSameContext) {
      flowStore.context = nextContext;
      flowStore.eventOptions = eventOptions;
      flowStore.pageOptions = pageOptions;
      return;
    }

    const actions = (toJS(component.events?.[matchedEvent]) ?? []) as ActionConfig[];
    flowStore.setContext({
      context: nextContext,
      eventOptions,
      pageOptions,
      actions,
      onActionsChange: (nextActions) => {
        updateCurrentComponentEventsRef.current(matchedEvent, nextActions);
      },
    });
  }, [
    component,
    componentId,
    eventOptions,
    eventOptionsKey,
    matchedEvent,
    pageOptions,
    pageOptionsKey,
    rawEventName,
  ]);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <Toolbar />
      <div className="relative flex flex-1 overflow-hidden">
        <Canvas />
        <PropsPanel />
      </div>
      <div className="flex h-[30px] flex-shrink-0 items-center border-t border-zinc-200 bg-zinc-50 px-4 text-[11px] text-zinc-500">
        拖拽节点可调整位置 · 从节点尾部选择下一步动作 · Delete 键删除选中
      </div>
    </div>
  );
}

const FlowComponent = observer(Flow);

export default FlowComponent;

/* flow-index-padding-to-overwrite-locked-file */
