import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import OpenSumiHostPage from "./OpenSumiHostPage";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OpenSumiHostPage />
  </StrictMode>,
);
