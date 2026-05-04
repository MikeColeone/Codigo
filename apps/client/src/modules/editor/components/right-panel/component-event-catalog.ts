import type { ComponentEventName, TComponentTypes } from "@codigo/schema";

export interface ComponentEventDefinition {
  name: ComponentEventName;
  title: string;
  description: string;
}

const COMMON_EVENT_DEFINITIONS: ComponentEventDefinition[] = [
  {
    name: "didMount",
    title: "组件渲染完成",
    description: "组件初次渲染后触发，适合初始化请求或同步状态。",
  },
];

const COMPONENT_EVENT_DEFINITIONS: Partial<
  Record<TComponentTypes, ComponentEventDefinition[]>
> = {
  button: [
    {
      name: "onClick",
      title: "按钮点击",
      description: "点击按钮时触发，适合页面跳转、提示和请求动作。",
    },
  ],
  queryFilter: [
    {
      name: "onSubmit",
      title: "筛选提交",
      description: "点击查询或提交筛选项时触发。",
    },
    {
      name: "onReset",
      title: "筛选重置",
      description: "点击重置筛选条件时触发。",
    },
  ],
  input: [
    {
      name: "onChange",
      title: "输入变化",
      description: "输入值变化时触发，适合联动状态。",
    },
    {
      name: "onPressEnter",
      title: "回车确认",
      description: "在输入框按下回车键时触发。",
    },
  ],
  textArea: [
    {
      name: "onChange",
      title: "内容变化",
      description: "文本域内容变化时触发。",
    },
    {
      name: "onPressEnter",
      title: "回车确认",
      description: "在文本域中按下回车键时触发。",
    },
  ],
  radio: [
    {
      name: "onChange",
      title: "选项切换",
      description: "切换单选项时触发。",
    },
  ],
  checkbox: [
    {
      name: "onChange",
      title: "勾选变化",
      description: "勾选项变化时触发。",
    },
  ],
  dataTable: [
    {
      name: "onPageChange",
      title: "分页变化",
      description: "页码或分页尺寸变化时触发。",
    },
    {
      name: "onRowClick",
      title: "行点击",
      description: "点击表格行时触发。",
    },
    {
      name: "onCellClick",
      title: "单元格点击",
      description: "点击单元格时触发。",
    },
    {
      name: "onSorter",
      title: "排序",
      description: "触发表格排序时触发。",
    },
    {
      name: "onFilter",
      title: "过滤",
      description: "执行筛选动作时触发。",
    },
    {
      name: "exportData",
      title: "导出数据",
      description: "触发导出行为时执行动作。",
    },
    {
      name: "clearSelection",
      title: "清除行选择",
      description: "清空当前选中行时触发。",
    },
    {
      name: "clearDataSource",
      title: "清空数据",
      description: "清空表格数据源时触发。",
    },
  ],
  table: [
    {
      name: "onPageChange",
      title: "分页变化",
      description: "页码或分页尺寸变化时触发。",
    },
    {
      name: "onRowClick",
      title: "行点击",
      description: "点击表格行时触发。",
    },
    {
      name: "onCellClick",
      title: "单元格点击",
      description: "点击单元格时触发。",
    },
    {
      name: "onSorter",
      title: "排序",
      description: "触发表格排序时触发。",
    },
    {
      name: "onFilter",
      title: "过滤",
      description: "执行筛选动作时触发。",
    },
    {
      name: "exportData",
      title: "导出数据",
      description: "触发导出行为时执行动作。",
    },
    {
      name: "clearSelection",
      title: "清除行选择",
      description: "清空当前选中行时触发。",
    },
    {
      name: "clearDataSource",
      title: "清空数据",
      description: "清空表格数据源时触发。",
    },
  ],
};

/**
 * 返回指定组件可配置的事件列表。
 */
export function getComponentEventCatalog(type: TComponentTypes) {
  const unique = new Map<ComponentEventName, ComponentEventDefinition>();
  for (const item of COMMON_EVENT_DEFINITIONS) {
    unique.set(item.name, item);
  }
  for (const item of COMPONENT_EVENT_DEFINITIONS[type] ?? []) {
    unique.set(item.name, item);
  }
  return Array.from(unique.values());
}
