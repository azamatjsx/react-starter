---
description: Add an environment variable everywhere it needs to be declared
argument-hint: <NAME> <example value> <description>
---

Add the environment variable described here: $ARGUMENTS

Follow `docs/ENVIRONMENT.md`:

1. Add `NAME=<example value>` to `.env.example`, in the matching section.
2. If the name starts with `VITE_`:
    - add `readonly NAME: string;` to `ImportMetaEnv` in `env.d.ts`
    - add a zod rule for it to the schema in `src/shared/config/env.ts` (required, or optional with a default; convert to boolean or number there) and map it to a camelCase name in the `.transform`
    - if it is required, add a test value to `test.env` in `vite.config.ts`

    Variables without the prefix are Node only and go in none of these.

3. Add a row to the right table in `docs/ENVIRONMENT.md` ("App variables" for `VITE_`, "Dev server variables" otherwise).
4. If it is a Node-only variable, read it in `vite.config.ts` through the existing `env` from `loadEnv`.

Never read or edit `.env.local`. Tell me which line to add there myself.

If the value looks like a secret (password, private key, `sk_...` token), stop and warn me: `VITE_` variables are visible in the browser.

Run `vp check` when done.
