import { fileURLToPath, URL } from "node:url";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins, loadEnv } from "vite-plus";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // "" loads every variable, not only VITE_ ones, so PORT and the proxy targets are available here
    const env = loadEnv(mode, rootDir, "");
    // Socket.IO usually runs on the API backend; set SOCKET_PROXY_TARGET only when it doesn't
    const socketProxyTarget = env.SOCKET_PROXY_TARGET || env.API_PROXY_TARGET;

    return {
        staged: {
            "*": "vp check --fix",
        },
        fmt: {
            sortImports: true,
            sortPackageJson: true,
            sortTailwindcss: true,
            tabWidth: 4,
        },
        lint: {
            plugins: ["react", "typescript", "oxc"],
            rules: {
                "react/rules-of-hooks": "error",
                "react/only-export-components": [
                    "warn",
                    {
                        allowConstantExport: true,
                    },
                ],
                "vite-plus/prefer-vite-plus-imports": "error",
            },
            options: {
                typeAware: true,
                typeCheck: true,
            },
            jsPlugins: [
                {
                    name: "vite-plus",
                    specifier: "vite-plus/oxlint-plugin",
                },
            ],
        },
        plugins: lazyPlugins(() => [
            react(),
            babel({ presets: [reactCompilerPreset()] }),
            tailwindcss(),
        ]),
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        server: {
            port: Number(env.PORT) || 5173,
            proxy: {
                // /api/v1/users -> ${API_PROXY_TARGET}/api/v1/users (path is kept as is)
                ...(env.API_PROXY_TARGET && {
                    "/api": {
                        target: env.API_PROXY_TARGET,
                        changeOrigin: true,
                    },
                }),
                // Socket.IO: /socket.io/?EIO=4... -> ${socketProxyTarget}/socket.io/..., polling and WebSocket
                ...(socketProxyTarget && {
                    "/socket.io": {
                        target: socketProxyTarget,
                        ws: true,
                        changeOrigin: true,
                    },
                }),
            },
        },
        test: {
            environment: "jsdom",
            include: ["src/**/*.test.{ts,tsx}"],
            setupFiles: ["./src/shared/lib/testing/setup.ts"],
            // Fixed values for unit tests, so they never depend on a developer's .env.local
            // and still pass in CI, where there is none
            env: {
                VITE_API_URL: "/api/v1",
                VITE_SOCKET_URL: "",
                VITE_APP_NAME: "React Starter",
                VITE_APP_VERSION: "0.0.0",
                VITE_APP_ENV: "test",
            },
            coverage: {
                provider: "v8",
                include: ["src/**/*.{ts,tsx}"],
                exclude: [
                    "src/**/*.test.{ts,tsx}",
                    "src/**/index.ts",
                    "src/shared/lib/testing/**",
                    "src/app/entrypoint/main.tsx",
                ],
                reporter: ["text", "html"],
            },
        },
    };
});
