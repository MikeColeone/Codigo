import { RouterProvider } from "react-router-dom";
import "../assets/base.css";
import { router } from "./router";
import Editor from "@/modules/editor/EditorPage";
function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Editor />
    </>
  );
}

export default App;
