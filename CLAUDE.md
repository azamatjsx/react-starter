<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Architecture: Feature-Sliced Design

All code under `src/` follows [Feature-Sliced Design](https://fsd.how/). Check the docs there when unsure instead of guessing.

- Layers, top to bottom: `app` → `pages` → `widgets` → `features` → `entities` → `shared`. A file may import only from layers **below** its own. Slices on the same layer never import each other (entities may use `@x` cross-imports).
- `app` and `shared` have segments only, no slices. Other layers have slices (one per business domain, e.g. `features/chat`), each split into segments by purpose: `ui`, `api`, `model`, `lib`, `config`.
- Every slice has an `index.ts` public API with named re-exports (no `export *`). Code outside the slice imports only from it: `@/features/chat`, never `@/features/chat/ui/chat.tsx`.
- Imports inside one slice (or inside `app` / `shared`) are relative with the full file path: `../config/env.ts`. Imports across slices or layers use the `@/` alias.
- Where things go: entrypoint in `app/entrypoint` (`main.tsx`, `app.tsx` with the providers, TanStack `router.ts`, `devtools.tsx`), TanStack Router file routes in `app/routes` (thin: each route renders a page from `pages/<page>`; `routeTree.gen.ts` is generated, never edit it), global styles in `app/styles`, backend clients in `shared/api` (`api` axios instance for REST, `createSocket` for Socket.IO, `queryClient` for TanStack Query: use `useQueryClient()` in components and the `queryClient` import only outside React; never call `fetch` or `axios` directly), env and global config in `shared/config`, UI kit in `shared/ui`.
- Prefer pages and features over widgets; screen-specific UI stays in its page slice. Not everything is a feature: extract one when it is reused on several pages.

These rules are checked by [Steiger](https://github.com/feature-sliced/steiger) (`steiger.config.ts`): run `vp run lint:fsd` after changing files under `src/`. It also runs in the pre-commit hook. Fix what it reports instead of disabling rules.

See `.claude/skills/react-component/SKILL.md` for file conventions.
