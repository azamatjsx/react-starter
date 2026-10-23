import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { App } from "./app.tsx";

describe("App", () => {
    it("renders the home page at /", async () => {
        render(<App />);

        // The router resolves the route asynchronously
        expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument();
    });
});
