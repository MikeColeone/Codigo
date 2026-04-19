import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/modules/home";
import { storeAuth } from "@/shared/hooks/useStoreAuth";

vi.mock("@/modules/templateCenter/api/templates", () => {
  return {
    fetchTemplateList: vi.fn(async () => [
      {
        id: 1,
        key: "admin",
        name: "Admin Template",
        desc: "A preset for admin console",
        tags: ["admin"],
        pageTitle: "Admin",
        pageCategory: "admin",
        layoutMode: "grid",
        deviceType: "pc",
        canvasWidth: 1200,
        canvasHeight: 800,
        activePagePath: "home",
        pagesCount: 1,
      },
    ]),
    fetchTemplateDetail: vi.fn(async (id: number) => ({
      id,
      key: "admin",
      version: 1,
      preset: {
        key: "admin",
        name: "Admin Template",
        desc: "A preset for admin console",
        tags: ["admin"],
        pageTitle: "Admin",
        pageCategory: "admin",
        layoutMode: "grid",
        deviceType: "pc",
        canvasWidth: 1200,
        canvasHeight: 800,
        activePagePath: "home",
        pages: [
          {
            name: "首页",
            path: "home",
            components: [],
          },
        ],
      },
    })),
  };
});

vi.mock("@codigo/materials", () => {
  return {
    builtinComponentDefinitions: [
      {
        type: "button",
        name: "Button",
        description: "按钮组件，可配合事件编排触发动作链路。",
        defaultConfig: {},
        render: () => null,
        isContainer: false,
      },
    ],
  };
});

describe("Home plazas", () => {
  beforeEach(() => {
    storeAuth.token = "Bearer test";
    storeAuth.details = { id: 1, username: "tester" } as any;
  });

  afterEach(() => {
    storeAuth.token = "";
    storeAuth.details = null;
  });

  it("renders template plaza nav and supports hover actions + use template navigation", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        { path: "/", element: <Home /> },
        { path: "/editor", element: <div>editor</div> },
      ],
      { initialEntries: ["/"] },
    );

    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "模板广场" }));
    expect(await screen.findByText("模板广场")).toBeInTheDocument();
    expect(screen.queryByText("© 2026 Codigo System. All rights reserved.")).toBeNull();

    const title = await screen.findByText("Admin Template");
    const card = title.closest("article");
    expect(card).not.toBeNull();

    fireEvent.mouseEnter(card as HTMLElement);
    const useButton = await screen.findByRole("button", { name: "使用模板" });
    const previewButton = await screen.findByRole("button", { name: "预览模板" });
    expect(useButton).toBeInTheDocument();
    expect(previewButton).toBeInTheDocument();

    await user.click(useButton);
    expect(router.state.location.pathname).toBe("/editor");
    expect(router.state.location.search).toBe("?templateId=1");
  });

  it("navigates to dev docs when clicking material in plaza", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        { path: "/", element: <Home /> },
        { path: "/doc", element: <div>doc</div> },
      ],
      { initialEntries: ["/?view=materials"] },
    );

    render(<RouterProvider router={router} />);

    await screen.findByText("物料广场");
    await user.click(screen.getByRole("button", { name: "Button" }));
    expect(router.state.location.pathname).toBe("/doc");
    expect(router.state.location.search).toContain("page=materials");
    expect(router.state.location.search).toContain("section=materials-button");
  });
});
