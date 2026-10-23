import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { HomePage } from "./home-page.tsx";

describe("HomePage", () => {
    it("shows the page heading", () => {
        render(<HomePage />);

        expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    });
});
