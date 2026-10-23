import type { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { queryClient } from "@/shared/api";

import { routeTree } from "../routes/routeTree.gen.ts";

export function createAppRouter(client: QueryClient) {
    return createRouter({
        routeTree,
        // Loaders can prefetch with `context.queryClient.ensureQueryData(...)`
        context: { queryClient: client },
        // React Query owns caching, so the router always asks it instead of keeping its own copy
        defaultPreloadStaleTime: 0,
    });
}

export const router = createAppRouter(queryClient);

// Type-safe <Link to>, useParams, useSearch etc. across the app
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
