import { lazy } from "react";
import { Navigate, createHashRouter } from "react-router-dom";
import { StudioLayout } from "@/app/layouts/studio-layout";
import SuspensedRouteElement from "@/app/router/suspensed-route-element";
import Home from "@/modules/home";
import { AdminLayout } from "@/modules/admin-console/components/admin-layout";
import { AdminRouteGuard } from "@/modules/admin-console/components/admin-route-guard";
import { EditorRouteGuard } from "@/modules/editor/components/editor-route-guard";
import { IdeThemeRouteElement } from "./ide-theme-route-element";
const AppManagement = lazy(() => import("@/modules/app-management"));
const DevDoc = lazy(() => import("@/modules/dev-document"));
const Editor = lazy(() => import("@/modules/editor"));
const Flow = lazy(() => import("@/modules/flow"));
const Preview = lazy(() => import("@/modules/preview"));
const Release = lazy(() => import("@/modules/release"));
const AdminBigScreen = lazy(() => import("@/modules/admin-console/pages/big-screen"));
const AdminDashboard = lazy(() => import("@/modules/admin-console/pages/dashboard"));
const AdminPermissions = lazy(() => import("@/modules/admin-console/pages/permissions"));
const AdminSettings = lazy(() => import("@/modules/admin-console/pages/settings"));






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
    element: (
      <SuspensedRouteElement loadingMode="fullscreen">
        <DevDoc />
      </SuspensedRouteElement>
    ),
  },
  {
    path: "/app-management",
    element: (
      <SuspensedRouteElement loadingMode="fullscreen">
        <AppManagement />
      </SuspensedRouteElement>
    ),
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
      <IdeThemeRouteElement>
        <Preview />
      </IdeThemeRouteElement>
    ),
  },
  {
    path: "/release",
    element: (
      <IdeThemeRouteElement>
        <Release />
      </IdeThemeRouteElement>
    ),
  },
  {
    path: "/release/:id",
    element: (
      <IdeThemeRouteElement>
        <Release />
      </IdeThemeRouteElement>
    ),
  },
  {
    element: <StudioLayout />,
    children: [
      {
        path: "/editor",
        element: (
          <SuspensedRouteElement>
            <EditorRouteGuard>
              <Editor />
            </EditorRouteGuard>
          </SuspensedRouteElement>
        ),
      },
      {
        path: "/flow",
        element: (
          <SuspensedRouteElement>
            <Flow />
          </SuspensedRouteElement>
        ),
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
      {
        index: true,
        element: (
          <SuspensedRouteElement>
            <AdminDashboard />
          </SuspensedRouteElement>
        ),
      },
      {
        path: "settings",
        element: (
          <SuspensedRouteElement>
            <AdminSettings />
          </SuspensedRouteElement>
        ),
      },
      {
        path: "permissions",
        element: (
          <SuspensedRouteElement>
            <AdminPermissions />
          </SuspensedRouteElement>
        ),
      },
      {
        path: "big-screen",
        element: (
          <SuspensedRouteElement>
            <AdminBigScreen />
          </SuspensedRouteElement>
        ),
      },
    ],
  },
  {
    path: "/admin/*",
    element: <Navigate to="/console" replace />,
  },
]);
