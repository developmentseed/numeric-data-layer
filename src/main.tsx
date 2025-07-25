import { createRoot } from "react-dom/client";
import { Provider } from "@/components/ui/Provider";
import { defaultSystem } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router";

import "./index.css";
import App from "./App.tsx";
import Animation from "./Animation.tsx";
import Titiler from "./Titiler.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider value={defaultSystem}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/animation" element={<Animation />} />
        <Route path="/numpy-tile" element={<Titiler />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);
