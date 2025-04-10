import { createRoot } from "react-dom/client";
import { Provider } from "@/components/ui/Provider";
import { defaultSystem } from "@chakra-ui/react";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider value={defaultSystem}>
    <App />
  </Provider>
);
