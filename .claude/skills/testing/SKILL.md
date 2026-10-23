---
name: testing
description: How to write and run unit tests (Vitest + Testing Library) and E2E tests (Playwright) in this project. Use when writing, fixing or running tests.
---

# Testing

## Unit tests (Vitest)

- Run with `vp test` (single run), `vp test watch`, or `vp test run --coverage`.
- Config lives in the `test` block of `vite.config.ts`. Never add `vitest.config.ts`.
- Environment is `jsdom`. Setup file: `src/shared/lib/testing/setup.ts` (jest-dom matchers, cleanup after each test).
- Only `src/**/*.test.{ts,tsx}` files run. Put the test next to the file it tests: `socket.ts` → `socket.test.ts`.

Imports:

```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test"; // never from "vitest"

import { Counter } from "./counter.tsx"; // keep the .ts/.tsx extension
```

Rules:

- Test what the user sees. Query in this order: `getByRole`, `getByLabelText`, `getByText`. Avoid `getByTestId` unless nothing else fits.
- Use `userEvent.setup()` for clicks and typing, not `fireEvent`.
- Use `findBy*` (async) for anything that appears after a fetch or effect.
- Mock the network with `vi.stubGlobal("fetch", ...)`. Never call a real server.
- Override env values with `vi.stubEnv("VITE_API_URL", "...")` and reset them in `afterEach` with `vi.unstubAllEnvs()`.
- One behavior per `it`. Name it after the behavior: `"shows an error when the request fails"`.

Example:

```tsx
describe("Counter", () => {
    it("increments when clicked", async () => {
        const user = userEvent.setup();
        render(<Counter />);

        await user.click(screen.getByRole("button", { name: /count/i }));

        expect(screen.getByRole("button")).toHaveTextContent("count 1");
    });
});
```

## E2E tests (Playwright)

- Run with `vp run test:e2e`. Files live in `e2e/` as `*.spec.ts`.
- `playwright.config.ts` starts `vp dev` on `PORT` (default 5173), or reuses a dev server already running there.
- Import from `@playwright/test`. Use `page.goto("/")` with relative URLs, since `baseURL` is set.
- Prefer `getByRole` and `getByText` locators, and web-first assertions such as `await expect(locator).toBeVisible()`. Never use fixed `waitForTimeout` sleeps.
- First run on a new machine: `vp exec playwright install chromium`.

## Before finishing

Run `vp test` and `vp check`. Confirm each new test fails when the behavior it covers is broken.
