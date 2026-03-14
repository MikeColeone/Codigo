import { createHashRouter } from "react-router-dom";
import Editor from "@/modules/editor/Editor";
import Home from "@/modules/home/index";
import DataCount from "@/modules/dataCount/dataCount";
import Release from "@/modules/editor/release";
import Preview from "@/modules/editor/preview";
import LoginOrRegister from "@/modules/auth/loginOrRegister";

export const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login_or_register",
    element: <LoginOrRegister />,
  },
  {
    path: "/editor",
    element: <Editor />,
  },
  {
    path: "/dataCount",
    element: <DataCount />,
  },
  {
    path: "/preview",
    element: <Preview />,
  },
  {
    path: "/release",
    element: <Release />,
  },
]);
