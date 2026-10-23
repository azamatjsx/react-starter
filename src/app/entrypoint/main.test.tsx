import { screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

describe("main", () => {
    beforeEach(() => {
        // main.tsx runs on import, so load a fresh copy in each test
        vi.resetModules();
        document.body.innerHTML = "";
    });

    it("renders App into #root", async () => {
        document.body.innerHTML = '<div id="root"></div>';

        await act(async () => {
            await import("./main.tsx");
        });

        expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument();
    });

    it("throws when #root is missing", async () => {
        await expect(import("./main.tsx")).rejects.toThrow('Root element "#root" not found');
    });
});
