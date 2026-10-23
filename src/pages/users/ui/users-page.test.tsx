import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { demoUsers } from "../model/demo-users.ts";
import { UsersPage } from "./users-page.tsx";

describe("UsersPage", () => {
    it("shows the heading and a row for every demo user", () => {
        render(<UsersPage />);

        expect(screen.getByRole("heading", { name: "Users" })).toBeInTheDocument();
        // header row + one row per user
        expect(screen.getAllByRole("row")).toHaveLength(demoUsers.length + 1);
    });
});
