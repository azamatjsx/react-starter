// Validate environment variables first, so a bad .env stops the app with a clear error
import "@/shared/config";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import "../styles/index.css";
import { App } from "./app";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error('Root element "#root" not found in index.html');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
    <StrictMode>
        <App />
    </StrictMode>,
);
