# shared/lib/testing

Setup for unit tests (Vitest + Testing Library). Only test tooling belongs here; never import it from app code.

- `setup.ts` runs before every test file (registered in `test.setupFiles` in `vite.config.ts`): adds the jest-dom matchers and cleans up rendered components after each test.

See `.claude/skills/testing/SKILL.md` for how to write tests.
