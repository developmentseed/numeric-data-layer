import { createRoot } from "react-dom/client";
import { Provider } from "@/components/ui/Provider";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider>
    <App />
  </Provider>
);
