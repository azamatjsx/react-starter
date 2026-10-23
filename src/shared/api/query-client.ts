import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a QueryClient. App code uses the shared `queryClient` below;
 * tests create a fresh one per test so cached data never leaks between them.
 */
export function createQueryClient() {
    return new QueryClient();
}

/**
 * The app's QueryClient, provided to React by `app/entrypoint/app.tsx` and to route loaders
 * through the router context.
 *
 * Inside React components and hooks prefer `useQueryClient()`. Import this directly only from
 * code outside React, e.g. axios interceptors or Socket.IO event handlers:
 *
 *     socket.on("user:created", () => queryClient.invalidateQueries({ queryKey: ["users"] }));
 */
export const queryClient = createQueryClient();
