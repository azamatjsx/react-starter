import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { HotkeysDevtoolsPanel } from "@tanstack/react-hotkeys-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import type { AnyRouter } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { tableDevtoolsPlugin } from "@tanstack/react-table-devtools";

import { env } from "@/shared/config";

type DevtoolsProps = {
    router: AnyRouter;
};

// Removed from production builds by the devtools() plugin in vite.config.ts
export function Devtools({ router }: DevtoolsProps) {
    // The devtools panel fails to unmount in jsdom, and tests don't need it
    if (env.mode === "test") return null;

    return (
        <TanStackDevtools
            plugins={[
                {
                    name: "TanStack Query",
                    // Uses the client from QueryClientProvider in app.tsx
                    render: <ReactQueryDevtoolsPanel />,
                },
                {
                    name: "TanStack Router",
                    render: <TanStackRouterDevtoolsPanel router={router} />,
                },
                {
                    name: "TanStack HotKeys",
                    render: <HotkeysDevtoolsPanel />,
                },
                formDevtoolsPlugin(),
                tableDevtoolsPlugin(),
            ]}
        />
    );
}
