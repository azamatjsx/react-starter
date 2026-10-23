import { Outlet } from "@tanstack/react-router";

import { GlobalShortcuts } from "@/features/keyboard-shortcuts";

/** Wraps every page. Rendered by the root route, inside the router. */
export function RootLayout() {
    return (
        <>
            <Outlet />
            {/* Inside the router so shortcuts can navigate */}
            <GlobalShortcuts />
        </>
    );
}
