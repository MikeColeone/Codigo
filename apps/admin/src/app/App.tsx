import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/shared/auth/AuthProvider";
import { router } from "@/app/router";
import "@/index.css"

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
