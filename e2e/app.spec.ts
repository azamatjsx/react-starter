import { expect, test } from "@playwright/test";

test("home page renders at /", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
});

test("users page renders the users table at /users", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "First Name" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "tanner" })).toBeVisible();
});

test("chart page draws the letter frequency chart at /chart", async ({ page }) => {
    await page.goto("/chart");

    await expect(page.getByRole("heading", { name: "Letter frequency" })).toBeVisible();
    const chart = page.getByLabel("English letter frequencies");
    await expect(chart).toBeVisible();
    for (const letter of ["E", "T", "A", "O", "I"]) {
        await expect(chart.getByText(letter, { exact: true })).toBeVisible();
    }
});

test("keyboard shortcuts navigate and open the shortcuts list", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("heading", { name: "Home" }).waitFor();

    await page.keyboard.press("g");
    await page.keyboard.press("u");
    await expect(page).toHaveURL(/\/users$/);

    await page.keyboard.press("g");
    await page.keyboard.press("c");
    await expect(page).toHaveURL(/\/chart$/);

    await page.keyboard.press("g");
    await page.keyboard.press("h");
    await expect(page).toHaveURL(/\/$/);

    await page.keyboard.press("Control+/");
    const dialog = page.getByRole("dialog", { name: "Keyboard shortcuts" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Go to Users")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
});
