# Environment Variables

This project uses Vite's built-in `.env` file support. Variables are read when `vp dev`, `vp build` or `vp test` starts, and app code reads them from one typed object, `env` in `src/shared/config/env.ts`.

> [!WARNING]
> Every variable starting with `VITE_` is embedded in the JavaScript bundle and **anyone can read it in the browser**. Never put secrets in these files (see [What not to store](#what-not-to-store)).

## Quick start

1. Copy the template:

    ```bash
    cp .env.example .env.local
    ```

2. Fill in the values in `.env.local`.
3. Restart `vp dev`. Changes to `.env` files are only picked up on restart.

## Files

| File                  | Committed | Purpose                                                              |
| --------------------- | --------- | -------------------------------------------------------------------- |
| `.env.example`        | Yes       | Template listing every variable, with empty or dummy values          |
| `.env.local`          | No        | Your real values for local development                               |
| `.env.[mode].local`   | No        | Overrides for one mode only, e.g. `.env.production.local`            |
| `.env`, `.env.[mode]` | No        | Supported by Vite, but ignored in this repo so secrets never leak in |

Only `.env.example` is committed. All other `.env*` files are ignored in `.gitignore`.

### Load order

When several files define the same variable, the more specific file wins:

```
.env.[mode].local   ← highest priority
.env.[mode]
.env.local
.env                ← lowest priority
```

Variables already set in the shell (e.g. `VITE_API_URL=... vp dev`) override all files.

`[mode]` is `development` for `vp dev`, `production` for `vp build` and `test` for `vp test`. Change it with `--mode`, e.g. `vp build --mode staging` loads `.env.staging.local`.

## Variables

#### App variables (exposed to the browser)

| Name               | Example         | Description                                                   |
| ------------------ | --------------- | ------------------------------------------------------------- |
| `VITE_API_URL`     | `/api/v1`       | Base URL of the backend API. Relative (via proxy) or full URL |
| `VITE_SOCKET_URL`  | (empty)         | Socket.IO server URL. Empty = same origin (via proxy)         |
| `VITE_APP_NAME`    | `React Starter` | Display name of the app                                       |
| `VITE_APP_VERSION` | `0.0.0`         | App version shown in the UI or sent to logs                   |
| `VITE_APP_ENV`     | `development`   | Environment label, e.g. `staging`, `production`               |

#### Dev server variables (Node only, not exposed)

| Name                  | Example                 | Description                                                                                      |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `PORT`                | `5173`                  | Port for `vp dev` and Playwright. Defaults to `5173`                                             |
| `API_PROXY_TARGET`    | `http://localhost:3000` | Backend origin (no path) that `/api` requests are proxied to in `vp dev`. Optional               |
| `SOCKET_PROXY_TARGET` | (empty)                 | Socket.IO server for `/socket.io` in `vp dev`, only if it is not on `API_PROXY_TARGET`. Optional |

Keep these tables, `.env.example` and `env.d.ts` in sync. Only `VITE_` variables go in `env.d.ts`.

### Dev server and proxy

`vite.config.ts` reads `PORT`, `API_PROXY_TARGET` and `SOCKET_PROXY_TARGET` with `loadEnv`, from the same `.env` files listed above:

- **`PORT`** sets the dev server port. `playwright.config.ts` reads the same value, so E2E tests start and open the dev server on that port.
- **`API_PROXY_TARGET`** turns on a proxy in `vp dev`. Requests whose path starts with `/api` are forwarded to `API_PROXY_TARGET` with the **path unchanged**:

    ```
    /api/v1/users  →  http://localhost:3000/api/v1/users
    ```

    If `API_PROXY_TARGET` is empty, there is no proxy.

The proxy only exists in `vp dev`. It does nothing in `vp build` or `vp preview`, where the real server or hosting platform must route `/api`.

`.env.example` uses the proxy by default. `VITE_API_URL` holds the full API path the app calls, and `API_PROXY_TARGET` is only the backend's origin:

```bash
VITE_API_URL=/api/v1
API_PROXY_TARGET=http://localhost:3000
```

```ts
api.get("/users"); // `api` from @/shared/api uses env.apiUrl as its baseURL
// browser:  GET /api/v1/users
// proxy:    GET http://localhost:3000/api/v1/users
```

Requests go to the same origin as the app, so the backend does not need CORS for local development. If `VITE_API_URL` is a full URL like `http://localhost:3000/api/v1`, the browser calls the backend directly and the proxy is not used.

> [!NOTE]
> `API_PROXY_TARGET` must be the origin only, with no path. The path from `VITE_API_URL` is appended to it, so `API_PROXY_TARGET=http://localhost:3000/api/v1` would turn `/api/v1/users` into `http://localhost:3000/api/v1/api/v1/users`.

### Socket.IO proxy

Real-time features use [Socket.IO](https://socket.io/docs/v4/client-api/). The backend must run a Socket.IO server; the client cannot talk to a plain WebSocket server.

`vp dev` also proxies the `/socket.io` path, which the Socket.IO client always uses, to the same backend as the API (`API_PROXY_TARGET`). It forwards both the first HTTP polling requests and the WebSocket upgrade, with the path unchanged:

```
http://localhost:5173/socket.io/?EIO=4&transport=polling    →  http://localhost:3000/socket.io/...
ws://localhost:5173/socket.io/?EIO=4&transport=websocket    →  ws://localhost:3000/socket.io/...
```

Set `SOCKET_PROXY_TARGET` only if Socket.IO runs on a different server than the API; it then takes priority. If both are empty, there is no Socket.IO proxy. Vite's own hot reload socket is not affected.

Create sockets with `createSocket` from `@/shared/api` (`src/shared/api/socket.ts`) instead of calling `io()` yourself. Pass the backend namespace (`"/"` by default), and create each socket once, at module level in the `api` segment of the slice that uses it:

```ts
// src/features/chat/api/chat-socket.ts
import { createSocket } from "@/shared/api";

export const chatSocket = createSocket("/chat");
```

```tsx
// src/features/chat/ui/chat.tsx
import { useEffect } from "react";

import { chatSocket } from "../api/chat-socket.ts";

useEffect(() => {
    function onMessage(message: string) {
        // ...
    }

    chatSocket.on("message", onMessage);
    chatSocket.connect();

    return () => {
        chatSocket.off("message", onMessage);
        chatSocket.disconnect();
    };
}, []);
```

Sockets are created with `autoConnect: false`, so nothing connects until `.connect()` is called. Always remove listeners with `.off` in the effect cleanup. Sockets for different namespaces on the same server share one underlying connection.

`VITE_SOCKET_URL` decides where it connects:

```bash
# .env.local (development, through the proxy)
VITE_SOCKET_URL=
API_PROXY_TARGET=http://localhost:3000

# CI or hosting settings (production, direct)
VITE_SOCKET_URL=https://api.example.com
```

An empty value connects to the app's own origin, which `vp dev` proxies to the backend. A full URL connects directly; use the server's origin (`https://...`), not a `/socket.io` path, because the client adds that itself. When the app and the Socket.IO server are on different origins, the server must allow the app's origin in its `cors` option.

### Built-in variables

Vite always provides these. Do not define them yourself. The common ones are on `env` too:

| `env`        | Vite                   | Type      | Value                                              |
| ------------ | ---------------------- | --------- | -------------------------------------------------- |
| `env.mode`   | `import.meta.env.MODE` | `string`  | Current mode (`development`, `production`, `test`) |
| `env.isDev`  | `import.meta.env.DEV`  | `boolean` | `true` in `vp dev`                                 |
| `env.isProd` | `import.meta.env.PROD` | `boolean` | `true` in `vp build`                               |

## Using variables in code

Import `env` from one place instead of reading `import.meta.env` in each file:

```ts
import { env } from "@/shared/config";

document.title = `${env.appName} ${env.appVersion}`;
```

For REST requests you rarely need `env.apiUrl` directly: the axios instance `api` from `@/shared/api` already uses it as its `baseURL`, so `api.get("/users")` calls `${env.apiUrl}/users`.

| `env`            | Variable           |
| ---------------- | ------------------ |
| `env.apiUrl`     | `VITE_API_URL`     |
| `env.socketUrl`  | `VITE_SOCKET_URL`  |
| `env.appName`    | `VITE_APP_NAME`    |
| `env.appVersion` | `VITE_APP_VERSION` |
| `env.appEnv`     | `VITE_APP_ENV`     |

Only `src/shared/config/env.ts` uses `import.meta.env`.

### Validation

`env.ts` checks every variable with a [zod](https://zod.dev) schema once, when the app starts (`main.tsx` imports it first). If something is wrong, the app does not render and the browser console shows every problem at once:

```
Uncaught Error: Invalid environment variables:
  - VITE_API_URL: must be a path like /api/v1 or a full URL
  - VITE_SOCKET_URL: must be a full URL like https://api.example.com, or empty
Check .env.local (copy it from .env.example) and restart vp dev. See docs/ENVIRONMENT.md.
```

| Variable           | Rule                                           | If empty          |
| ------------------ | ---------------------------------------------- | ----------------- |
| `VITE_API_URL`     | Path starting with `/`, or an `http(s)://` URL | Error             |
| `VITE_SOCKET_URL`  | `http(s)://` or `ws(s)://` URL                 | `""` (own origin) |
| `VITE_APP_NAME`    | Any text                                       | `React Starter`   |
| `VITE_APP_VERSION` | Any text                                       | `0.0.0`           |
| `VITE_APP_ENV`     | Any text                                       | `development`     |

Trailing slashes are removed from URLs, so `/api/v1/` and `/api/v1` behave the same. `env` is read-only.

`.env` values are always strings. When a variable needs another type, convert it in the schema, so the rest of the app gets the right type:

```ts
VITE_ENABLE_DEVTOOLS: z.preprocess(emptyAsUnset, z.stringbool().default(false)),
VITE_REQUEST_TIMEOUT_MS: z.preprocess(emptyAsUnset, z.coerce.number().int().positive().default(10_000)),
```

The check runs in the browser, not during `vp build`, so a build with missing variables succeeds and fails when the page opens.

## Adding a new variable

1. Add it to `.env.local` with your real value:

    ```bash
    VITE_FEATURE_X=true
    ```

2. Add it to `.env.example` with an empty or dummy value, so teammates know it exists:

    ```bash
    VITE_FEATURE_X=
    ```

3. Add its type to `env.d.ts`:

    ```ts
    interface ImportMetaEnv {
        readonly VITE_API_URL: string;
        readonly VITE_FEATURE_X: string;
    }
    ```

4. Add it to the schema in `src/shared/config/env.ts`, and map it to a camelCase name in the `.transform` at the end:

    ```ts
    // in z.object({ ... })
    VITE_FEATURE_X: z.preprocess(emptyAsUnset, z.stringbool().default(false)),

    // in .transform((raw) => ({ ... }))
    featureX: raw.VITE_FEATURE_X,
    ```

5. Add a row to the [Variables](#variables) table and to the table in [Using variables in code](#using-variables-in-code).
6. Restart `vp dev`.

Steps 3 and 4 apply to `VITE_` variables only. Node-only variables (no prefix) are read in `vite.config.ts` instead.

### Type safety

`env.d.ts` enables Vite's `strictImportMetaEnv` option, so only variables declared in `ImportMetaEnv` are allowed in `env.ts`. A typo is a type error caught by `vp check`, and so is a typo in an `env` property anywhere else:

```ts
import.meta.env.VITE_API_ULR;
// error TS2551: Property 'VITE_API_ULR' does not exist on type 'ImportMetaEnv'.
// Did you mean 'VITE_API_URL'?
```

## What to store

Safe in `VITE_` variables, because they are public anyway:

- API and Socket.IO server URLs
- Feature flags
- App name, version, environment label
- Publishable or public keys designed for the browser: Stripe `pk_...`, Sentry DSN, PostHog project key, Firebase web config, Google Maps keys restricted by domain
- OAuth client IDs and auth domains

## What not to store

Never put these in any frontend `.env` file, even an ignored one:

- Database passwords or connection strings
- Secret API keys (`sk_live_...`, OpenAI, AWS secret keys)
- JWT signing secrets
- OAuth client **secrets**

These belong on a backend server. The frontend calls the backend, and the backend uses the secret.

Variables **without** the `VITE_` prefix are not exposed to app code. They are only readable from Node-side files such as `vite.config.ts` (via `loadEnv`) and `playwright.config.ts`. This is still not a safe place for production secrets, since `.env` files live on developer machines.

## Tests

`vp test` does not use your `.env.local` values for `VITE_` variables. The `test.env` block in `vite.config.ts` sets fixed values instead, so tests behave the same on every machine and in CI. Add a value there when you add a required variable.

`env` is parsed once, when it is first imported. To test code with other values, mock the module:

```ts
import { vi } from "vite-plus/test";

vi.mock("@/shared/config", () => ({
    env: { apiUrl: "https://staging.example.com/api", socketUrl: "" },
}));
```

To test the validation rules themselves, call `parseEnv` with an object, as `src/shared/config/env.test.ts` does.

## Deployment and CI

`.env.local` files are not in the repository, so CI and hosting platforms do not see them. Set the variables in the platform's settings instead (GitHub Actions secrets or variables, Vercel or Netlify environment settings, etc.).

Values are inlined at **build time**. Changing a variable after `vp build` has no effect until you build again.

## Further reading

- [Vite: Env Variables and Modes](https://vite.dev/guide/env-and-mode)
