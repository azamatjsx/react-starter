import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { alphabet } from "../model/demo-data.ts";
import { ChartPage } from "./chart-page.tsx";

describe("ChartPage", () => {
    it("shows the heading and a labelled chart", () => {
        render(<ChartPage />);

        expect(screen.getByRole("heading", { name: "Letter frequency" })).toBeInTheDocument();
        expect(screen.getByLabelText("English letter frequencies")).toBeInTheDocument();
    });

    it("draws one bar label per letter", () => {
        render(<ChartPage />);

        expect(alphabet.length).toBeGreaterThan(0);
        for (const { letter } of alphabet) {
            expect(screen.getByText(letter)).toBeInTheDocument();
        }
    });
});
