import { Navigate, createHashRouter } from "react-router-dom";
import Editor from "@/modules/editor";
import Home from "@/modules/home/index";
import Release from "@/modules/release";
import Preview from "@/modules/preview";
import Flow from "@/modules/flow";
import DevDoc from "@/modules/devDocument";
import AppManagement from "@/modules/appManagement/index";
import { StudioLayout } from "@/app/layouts/StudioLayout";
import { EditorRouteGuard } from "@/modules/editor/components/EditorRouteGuard";
import AdminLayout from "@/modules/adminConsole/components/AdminLayout";
import { AdminRouteGuard } from "@/modules/adminConsole/components/AdminRouteGuard";
import AdminDashboard from "@/modules/adminConsole/pages/Dashboard";
import AdminPermissions from "@/modules/adminConsole/pages/Permissions";
import AdminPlaceholder from "@/modules/adminConsole/pages/Placeholder";
import { IdeThemeLayout } from "@/app/layouts/IdeThemeLayout";

export const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/home",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/doc",
    element: <DevDoc />,
  },
  {
    path: "/app-management",
    element: <AppManagement />,
  },
  {
    path: "/login",
    element: <Navigate to="/?modal=login" replace />,
  },
  {
    path: "/profile",
    element: <Navigate to="/?modal=profile" replace />,
  },
  {
    path: "/preview",
    element: (
      <IdeThemeLayout className="h-full w-full overflow-hidden">
        <Preview />
      </IdeThemeLayout>
    ),
  },
  {
    path: "/release",
    element: (
      <IdeThemeLayout className="h-full w-full overflow-hidden">
        <Release />
      </IdeThemeLayout>
    ),
  },
  {
    path: "/release/:id",
    element: (
      <IdeThemeLayout className="h-full w-full overflow-hidden">
        <Release />
      </IdeThemeLayout>
    ),
  },
  {
    element: <StudioLayout />,
    children: [
      {
        path: "/editor",
        element: (
          <EditorRouteGuard>
            <Editor />
          </EditorRouteGuard>
        ),
      },
      {
        path: "/flow",
        element: <Flow />,
      },
    ],
  },
  {
    path: "/console",
    element: (
      <AdminRouteGuard>
        <AdminLayout />
      </AdminRouteGuard>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "settings", element: <AdminPlaceholder title="基础设置" /> },
      { path: "permissions", element: <AdminPermissions /> },
      { path: "roles", element: <AdminPlaceholder title="角色管理" /> },
      { path: "versions", element: <AdminPlaceholder title="版本管理" /> },
      { path: "snippets", element: <AdminPlaceholder title="代码片段管理" /> },
      { path: "big-screen", element: <AdminPlaceholder title="数据大屏" /> },
    ],
  },
  {
    path: "/admin/*",
    element: <Navigate to="/console" replace />,
  },
]);
