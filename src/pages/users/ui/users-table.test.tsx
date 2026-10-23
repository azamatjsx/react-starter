import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import type { User } from "../model/user.ts";
import { UsersTable } from "./users-table.tsx";

const users: User[] = [
    { firstName: "ali", lastName: "valiyev", age: 30 },
    { firstName: "gani", lastName: "karimov", age: 41 },
];

describe("UsersTable", () => {
    it("renders a header for each column", () => {
        render(<UsersTable users={users} />);

        const headers = screen.getAllByRole("columnheader").map((th) => th.textContent);
        expect(headers).toEqual(["First Name", "Last Name", "Age"]);
    });

    it("renders one row per user with their values", () => {
        render(<UsersTable users={users} />);

        const [, ...rows] = screen.getAllByRole("row"); // first row is the header
        expect(rows).toHaveLength(2);
        expect(
            within(rows[0]!)
                .getAllByRole("cell")
                .map((td) => td.textContent),
        ).toEqual(["ali", "valiyev", "30"]);
    });

    it("renders no data rows for an empty list", () => {
        render(<UsersTable users={[]} />);

        expect(screen.getAllByRole("row")).toHaveLength(1);
    });
});
