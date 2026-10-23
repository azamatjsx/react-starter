import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

import { RootLayout } from "../entrypoint/root-layout.tsx";

/** Available in every route's `loader` and `beforeLoad` as `context`. */
export type RouterContext = {
    queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
});
