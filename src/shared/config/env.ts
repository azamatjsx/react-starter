import { z } from "zod";

/**
 * The one place app code reads environment variables from.
 *
 *     import { env } from "@/shared/config";
 *     fetch(`${env.apiUrl}/users`);
 *
 * Variables are validated once, when the app starts. If one is missing or invalid,
 * the app stops with an error that names it. Do not use `import.meta.env` anywhere
 * else. To add a variable, see docs/ENVIRONMENT.md.
 */

// `NAME=` in a .env file gives "", not undefined. Treat it as unset so defaults apply.
const emptyAsUnset = (value: unknown) => (value === "" ? undefined : value);

const URL_PROTOCOLS = ["http:", "https:", "ws:", "wss:"];

// URL.canParse alone accepts "localhost:3000" (as a "localhost:" scheme), so check the protocol too
const isUrl = (value: string) =>
    URL.canParse(value) && URL_PROTOCOLS.includes(new URL(value).protocol);

const envSchema = z
    .object({
        VITE_API_URL: z
            .string("is required")
            .trim()
            .min(1, "is required")
            .refine(
                (value) => value.startsWith("/") || isUrl(value),
                "must be a path like /api/v1 or a full URL",
            )
            // "/api/v1/" and "/api/v1" behave the same
            .transform((value) => value.replace(/\/+$/, "")),
        VITE_SOCKET_URL: z.preprocess(
            emptyAsUnset,
            z
                .string()
                .trim()
                .refine(isUrl, "must be a full URL like https://api.example.com, or empty")
                .transform((value) => value.replace(/\/+$/, ""))
                .default(""),
        ),
        VITE_APP_NAME: z.preprocess(emptyAsUnset, z.string().default("React Starter")),
        VITE_APP_VERSION: z.preprocess(emptyAsUnset, z.string().default("0.0.0")),
        VITE_APP_ENV: z.preprocess(emptyAsUnset, z.string().default("development")),

        // Built into Vite
        MODE: z.string(),
        DEV: z.boolean(),
        PROD: z.boolean(),
    })
    .transform((raw) => ({
        /** Base URL of the backend API, without a trailing slash: "/api/v1" or a full URL. */
        apiUrl: raw.VITE_API_URL,
        /** Socket.IO server URL. Empty means the app's own origin (through the dev proxy). */
        socketUrl: raw.VITE_SOCKET_URL,
        appName: raw.VITE_APP_NAME,
        appVersion: raw.VITE_APP_VERSION,
        /** Environment label, e.g. "development", "staging", "production". */
        appEnv: raw.VITE_APP_ENV,
        /** "development" in `vp dev`, "production" in `vp build`, "test" in `vp test`. */
        mode: raw.MODE,
        isDev: raw.DEV,
        isProd: raw.PROD,
    }));

export type Env = z.output<typeof envSchema>;

/** Validates raw variables. Exported for tests; app code uses `env`. */
export function parseEnv(source: object): Env {
    const result = envSchema.safeParse(source);

    if (!result.success) {
        const problems = result.error.issues
            .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
            .join("\n");

        throw new Error(
            `Invalid environment variables:\n${problems}\n` +
                "Check .env.local (copy it from .env.example) and restart vp dev. See docs/ENVIRONMENT.md.",
        );
    }

    return Object.freeze(result.data);
}

export const env = parseEnv(import.meta.env);
