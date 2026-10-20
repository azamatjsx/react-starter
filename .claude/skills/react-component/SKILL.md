---
name: react-component
description: Feature-Sliced Design structure and conventions for React components, hooks, API calls and utilities in this project (layers, slices, segments, public APIs, imports, file names, tests). Use when adding, moving or restructuring code under src/.
---

# React code in Feature-Sliced Design

This project follows [Feature-Sliced Design](https://fsd.how/). When unsure where something goes, read the docs there; do not invent new top-level folders.

## Layers

```
src/
  app/          App-wide setup. Segments only, no slices.
    entrypoint/   main.tsx (mounts React), app.tsx (root component)
    styles/       global CSS
    routes/       router config (when added)
  pages/        One slice per page/screen: pages/<page>/{ui,api,model}/ + index.ts
  widgets/      Avoid. Screen-specific blocks stay in their page.
  features/     User interactions reused on several pages: features/<feature>/{ui,api,model,config}/ + index.ts
  entities/     Business concepts (user, post): entities/<entity>/{ui,api,model}/ + index.ts
  shared/       No business logic. Segments only, no slices.
    api/          backend clients: api (axios instance, ApiError), createSocket (Socket.IO)
    config/       env (validated environment variables)
    ui/           UI kit, one folder + index.ts per component
    lib/          focused internal libraries, one folder + README.md each (e.g. lib/testing)
```

Create a layer or segment folder only when the first file needs it.

## Import rules

- Import only from layers **below**: `features` may use `entities` and `shared`, never `pages` or another feature.
- Slices on one layer never import each other. For entities that reference each other, use `@x` (see fsd.how, "Public API for cross-imports").
- Outside a slice, import only its public API, through the `@/` alias:

    ```ts
    import { Chat } from "@/features/chat"; // ✅
    import { Chat } from "@/features/chat/ui/chat.tsx"; // ❌ skips the public API
    ```

- Inside the same slice, or inside `app` / `shared`, use relative imports with the full path, never the slice's own `index.ts` (that causes circular imports):

    ```ts
    import { env } from "../config/env.ts";
    ```

- Shared segments are imported as `@/shared/api`, `@/shared/config`; shared UI per component: `@/shared/ui/button`.

## Public API

Each slice (and each shared segment or shared UI component) has an `index.ts` with named re-exports only:

```ts
// features/chat/index.ts
export { Chat } from "./ui/chat.tsx";
```

Never `export *`. Do not add `index.ts` inside a slice's segments (`features/chat/ui/index.ts`).

## Files and exports

- File names are kebab-case: `user-card.tsx`, `use-debounce.ts`, `chat-socket.ts`.
- One component per file, as a **named** export. No default exports.

    ```tsx
    export function UserCard({ name }: UserCardProps) {
        return <article>{name}</article>;
    }
    ```

- Props type is named `<Component>Props` and declared above the component.
- Keep the `.ts`/`.tsx` extension in relative imports.
- Segment names describe purpose (`ui`, `api`, `model`), never essence (`components`, `hooks`, `types`).

## React

- React 19 with the React Compiler enabled. Do not add `useMemo`, `useCallback` or `memo` for performance; the compiler handles it.
- Effects that fetch or subscribe must clean up (`AbortController`, `socket.off(...)` and `socket.disconnect()`).
- REST requests: use the axios instance `api` from `@/shared/api` (`baseURL` is `env.apiUrl`, 15 s timeout). Never call `fetch` or `axios` directly, and never create another axios instance. Put request functions in the `api` segment of the slice that needs them (e.g. `entities/user/api/get-users.ts`). Failed requests reject with `ApiError` (`status`, `message` from the backend's `{ error }`, `data`); cancelled ones reject with axios' `CanceledError`, so pass an `AbortController` signal and ignore that error in effect cleanups.
- Sockets: create them with `createSocket(namespace)` from `@/shared/api`, once per slice at module level in its `api` segment (e.g. `features/chat/api/chat-socket.ts`). Never call `io()` in a component.
- Env values: only through `env` from `@/shared/config` (e.g. `env.apiUrl`). Never use `import.meta.env` outside `shared/config/env.ts`. See `docs/ENVIRONMENT.md`.

## Tooling

- Formatting: 4 spaces, enforced by `vp fmt`. Do not hand-format.
- Import helpers from `vite-plus`, `vite-plus/test` and so on, not `vite` or `vitest`. The `vite-plus/prefer-vite-plus-imports` lint rule enforces this.

## Done means

1. Files are in the right layer and segment, and other slices import them only through `index.ts`.
2. A test next to the new file (see the `testing` skill).
3. `vp check`, `vp test` and `vp run lint:fsd` (Steiger, the FSD linter) pass.
