import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { App } from "./app.tsx";

describe("App", () => {
    it("renders the app", () => {
        render(<App />);

        expect(screen.getByText("App")).toBeInTheDocument();
    });
});
