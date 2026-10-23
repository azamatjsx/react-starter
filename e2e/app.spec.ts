import { expect, test } from "@playwright/test";

test("home page renders the app", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("App", { exact: true })).toBeVisible();
});
