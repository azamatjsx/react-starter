import { useHotkey } from "@tanstack/react-hotkeys";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { ShortcutsDialog } from "./shortcuts-dialog.tsx";

/**
 * App-wide shortcuts. Rendered once by the root route, so they work on every page.
 * `meta` names them for the shortcuts dialog and the TanStack Devtools Hotkeys panel.
 */
export function GlobalShortcuts() {
    const navigate = useNavigate();
    const [helpOpen, setHelpOpen] = useState(false);

    useHotkey(["G", "H"], () => navigate({ to: "/" }), {
        meta: { name: "Go to Home", group: "Navigation" },
    });
    useHotkey(["G", "U"], () => navigate({ to: "/users" }), {
        meta: { name: "Go to Users", group: "Navigation" },
    });
    useHotkey(["G", "C"], () => navigate({ to: "/chart" }), {
        meta: { name: "Go to Chart", group: "Navigation" },
    });
    useHotkey("Mod+/", () => setHelpOpen((open) => !open), {
        meta: { name: "Show keyboard shortcuts", group: "Help" },
    });

    return <ShortcutsDialog open={helpOpen} onOpenChange={setHelpOpen} />;
}
