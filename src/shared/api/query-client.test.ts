import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vite-plus/test";

import { createQueryClient, queryClient } from "./query-client.ts";

describe("query client", () => {
    it("exports one shared client for the app", () => {
        expect(queryClient).toBeInstanceOf(QueryClient);
    });

    it("creates a separate client on every call, so tests don't share cached data", () => {
        const a = createQueryClient();
        const b = createQueryClient();
        a.setQueryData(["users"], ["Ali"]);

        expect(a).not.toBe(b);
        expect(b.getQueryData(["users"])).toBeUndefined();
        expect(queryClient.getQueryData(["users"])).toBeUndefined();
    });
});
