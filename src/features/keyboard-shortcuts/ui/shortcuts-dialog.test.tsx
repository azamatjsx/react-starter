import { useHotkey } from "@tanstack/react-hotkeys";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { ShortcutsDialog } from "./shortcuts-dialog.tsx";

function WithHotkeys() {
    useHotkey(["G", "U"], () => {}, { meta: { name: "Go to Users" } });
    useHotkey("Escape", () => {}); // no name: not listed
    return <ShortcutsDialog open onOpenChange={() => {}} />;
}

describe("ShortcutsDialog", () => {
    it("lists named hotkeys with each step of a sequence", async () => {
        render(<WithHotkeys />);

        const dialog = await screen.findByRole("dialog", { name: "Keyboard shortcuts" });
        const item = within(dialog).getByText("Go to Users").closest("li")!;
        expect(item).toHaveTextContent("Go to UsersGthenU");
    });

    it("leaves out hotkeys without a name", async () => {
        render(<WithHotkeys />);

        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getAllByRole("listitem")).toHaveLength(1);
    });

    it("renders nothing while closed", () => {
        render(<ShortcutsDialog open={false} onOpenChange={() => {}} />);

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
