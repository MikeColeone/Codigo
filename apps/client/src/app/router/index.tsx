import { Navigate, createHashRouter } from "react-router-dom";
import Editor from "@/modules/editor";
import Home from "@/modules/home/index";
import Release from "@/modules/release";
import Preview from "@/modules/preview";
import Flow from "@/modules/flow";
import DevDoc from "@/modules/dev-document";
import AppManagement from "@/modules/app-management/index";
import { StudioLayout } from "@/app/layouts/studio-layout";
import { EditorRouteGuard } from "@/modules/editor/components/editor-route-guard";
import AdminLayout from "@/modules/admin-console/components/admin-layout";
import { AdminRouteGuard } from "@/modules/admin-console/components/admin-route-guard";
import AdminBigScreen from "@/modules/admin-console/pages/big-screen";
import AdminDashboard from "@/modules/admin-console/pages/dashboard";
import AdminPermissions from "@/modules/admin-console/pages/permissions";
import AdminSettings from "@/modules/admin-console/pages/settings";
import { IdeThemeLayout } from "@/app/layouts/ide-theme-layout";

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
      { path: "settings", element: <AdminSettings /> },
      { path: "permissions", element: <AdminPermissions /> },
      { path: "big-screen", element: <AdminBigScreen /> },
    ],
  },
  {
    path: "/admin/*",
    element: <Navigate to="/console" replace />,
  },
]);
