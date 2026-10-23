# React + TypeScript + Vite+

This template provides a minimal setup to get React working with [Vite+](https://viteplus.dev/guide/) — a unified toolchain built on Vite, Rolldown, Vitest, Oxlint and Oxfmt — with HMR, the React Compiler and type-aware lint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Getting started

```bash
vp install   # install dependencies
vp dev       # start the dev server
vp check     # format, lint and type-check
vp build     # production build
```

Copy `.env.example` to `.env.local` and fill in the values. See [Environment variables](docs/ENVIRONMENT.md).

## Project structure

The code follows [Feature-Sliced Design](https://fsd.how/). A file may import only from layers below its own, and other slices only through their `index.ts`.

```
src/
  app/            entrypoint (providers, router), routes (TanStack Router), global styles
  pages/          one slice per page
  features/       user interactions reused across pages
  entities/       business concepts (user, post, ...)
  shared/
    api/          backend clients: api (axios), createSocket (Socket.IO), queryClient
    config/       validated environment variables (env)
    lib/testing/  unit test setup
```

`pages`, `features` and `entities` are created when the first slice needs them. The rules for this project are in `CLAUDE.md`.

The structure is checked by [Steiger](https://github.com/feature-sliced/steiger), the FSD linter, on every commit. To run it yourself:

```bash
vp run lint:fsd
```

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

Vite+ runs [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) through `vp lint` and `vp check`. All lint configuration lives in the `lint` block of the root `vite.config.ts` — there is no `.oxlintrc.json` or `oxlint.config.ts`, and Vite+ recommends against adding one.

### Current setup

This template ships with React and TypeScript rules, type-aware linting and the Vite+ import rule:

```ts
// vite.config.ts
import { defineConfig } from "vite-plus";

export default defineConfig({
    lint: {
        plugins: ["react", "typescript", "oxc"],
        rules: {
            "react/rules-of-hooks": "error",
            "react/only-export-components": ["warn", { allowConstantExport: true }],
            "vite-plus/prefer-vite-plus-imports": "error",
        },
        options: {
            typeAware: true,
            typeCheck: true,
        },
        jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    },
});
```

- `typeAware: true` enables rules that need TypeScript type information.
- `typeCheck: true` runs full type checking during `vp lint` and `vp check`, powered by [tsgolint](https://github.com/oxc-project/tsgolint) on the TypeScript Go toolchain. With it on, `vp check` is the single command for static checks.
- `vite-plus/prefer-vite-plus-imports` reports imports from `vite`, `vitest` or `oxlint` that should come from `vite-plus` instead.

No extra packages are needed: `oxlint` and `tsgolint` ship inside `vite-plus`.

### Adding rules

Enable more rules in `lint.rules`. Each rule takes `"off"`, `"warn"` or `"error"`, optionally with options:

```ts
lint: {
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "react/self-closing-comp": "error",
    "typescript/no-floating-promises": "error", // type-aware
    "typescript/no-explicit-any": "warn",
  },
},
```

### Ignoring files

```ts
lint: {
  ignorePatterns: ["dist/**", "coverage/**"],
},
```

### Per-file overrides

Vite+ does not support nested lint configs. Use `lint.overrides` in the root config for file-specific rules:

```ts
lint: {
  overrides: [
    {
      files: ["**/*.test.{ts,tsx}"],
      rules: {
        "typescript/no-explicit-any": "off",
      },
    },
  ],
},
```

### Custom rules with JS plugins

Write your own rules with the authoring API from `vite-plus/lint/plugins`:

```js
// lint/my-plugin.js
import { definePlugin, defineRule } from "vite-plus/lint/plugins";

const noFoo = defineRule({
    meta: { messages: { noFoo: 'Do not name things "foo".' } },
    create(context) {
        return {
            Identifier(node) {
                if (node.name === "foo") {
                    context.report({ node, messageId: "noFoo" });
                }
            },
        };
    },
});

export default definePlugin({
    meta: { name: "my" },
    rules: { "no-foo": noFoo },
});
```

Register it and turn its rules on:

```ts
lint: {
  jsPlugins: ["./lint/my-plugin.js"],
  rules: {
    "my/no-foo": "error",
  },
},
```

Import from `vite-plus/lint/plugins`, not `@oxlint/plugins`, so the API always matches the bundled Oxlint. JS plugins can also run existing ESLint plugins while you migrate.

### Running the linter

```bash
vp lint          # lint only
vp lint --fix    # apply autofixes
vp check         # format + lint + type-check
vp check --fix   # format and apply autofixes
```

Staged files are checked with `vp check --fix` on commit (see `staged` in `vite.config.ts`).

### Further reading

- [Vite+ lint guide](https://viteplus.dev/guide/lint)
- [Oxlint rules](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories
- [Oxlint configuration](https://oxc.rs/docs/guide/usage/linter/config.html)
