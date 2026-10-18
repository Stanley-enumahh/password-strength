import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UserContext } from "./contexts/context.ts";

const user = {
  name: "emma",
  id: 335,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserContext.Provider value={user}>
      <App />
    </UserContext.Provider>
  </StrictMode>,
);
