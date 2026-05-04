import {theme} from "antd";
const studioAntdTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "var(--ide-accent)",
    colorBgContainer: "var(--ide-sidebar-bg)",
    colorBgLayout: "var(--ide-bg)",
    colorBgElevated: "var(--ide-overlay-bg)",
    colorBorder: "var(--ide-border)",
    colorText: "var(--ide-text)",
    colorTextSecondary: "var(--ide-text-muted)",
    colorFillSecondary: "var(--ide-hover)",
    borderRadius: 2,
    fontSize: 13,
  },
  components: {
    Button: {
      borderRadius: 2,
      controlHeight: 28,
      defaultBg: "var(--ide-control-bg)",
      defaultBorderColor: "var(--ide-control-border)",
      defaultColor: "var(--ide-text)",
    },
    Layout: {
      bodyBg: "var(--ide-bg)",
      siderBg: "var(--ide-sidebar-bg)",
    },
    Tabs: {
      itemColor: "var(--ide-text-muted)",
      itemSelectedColor: "var(--ide-text)",
      itemHoverColor: "var(--ide-text)",
      cardBg: "var(--ide-header-bg)",
    },
    Input: {
      activeBorderColor: "var(--ide-accent)",
      hoverBorderColor: "var(--ide-accent)",
    },
    InputNumber: {
      activeBorderColor: "var(--ide-accent)",
      hoverBorderColor: "var(--ide-accent)",
    },
    Menu: {
      itemBg: "var(--ide-overlay-bg)",
      popupBg: "var(--ide-overlay-bg)",
      subMenuItemBg: "var(--ide-overlay-bg)",
      itemColor: "var(--ide-text)",
      itemHoverColor: "var(--ide-text)",
      itemHoverBg: "var(--ide-hover)",
      itemSelectedBg: "var(--ide-active)",
      itemSelectedColor: "var(--ide-text)",
    },
    Select: {
      selectorBg: "var(--ide-control-bg)",
      optionActiveBg: "var(--ide-hover)",
      optionSelectedBg: "var(--ide-active)",
      optionSelectedColor: "var(--ide-text)",
    },
    Switch: {
      colorPrimary: "var(--ide-accent)",
      colorPrimaryHover: "var(--ide-accent)",
    },
  },
} as const;

export default studioAntdTheme;
