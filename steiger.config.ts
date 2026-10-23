import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

// Feature-Sliced Design linter. Run with `vp run lint:fsd`. Rules: https://github.com/feature-sliced/steiger
export default defineConfig([
    ...fsd.configs.recommended,
    {
        // Off by default; they match the import rules in CLAUDE.md
        rules: {
            "fsd/no-wildcard-exports": "error",
            "fsd/import-locality": "error",
        },
    },
    {
        // Test setup only: loaded by Vitest (test.setupFiles), never imported, so no public API
        files: ["./src/shared/lib/testing/**"],
        rules: {
            "fsd/public-api": "off",
        },
    },
]);
