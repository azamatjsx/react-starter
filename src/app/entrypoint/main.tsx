// Validate environment variables first, so a bad .env stops the app with a clear error
import "@/shared/config";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../styles/index.css";
import { App } from "./app.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error('Root element "#root" not found in index.html');
}

const root = createRoot(rootElement);

root.render(
    <StrictMode>
        <App />
    </StrictMode>,
);
