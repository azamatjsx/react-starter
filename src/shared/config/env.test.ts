import { describe, expect, it } from "vite-plus/test";

import { env, parseEnv } from "./env.ts";

const vite = { MODE: "development", DEV: true, PROD: false };

describe("parseEnv", () => {
    it("maps variables to env names", () => {
        expect(
            parseEnv({
                ...vite,
                VITE_API_URL: "/api/v1",
                VITE_SOCKET_URL: "https://socket.example.com",
                VITE_APP_NAME: "My App",
                VITE_APP_VERSION: "1.2.3",
                VITE_APP_ENV: "staging",
            }),
        ).toEqual({
            apiUrl: "/api/v1",
            socketUrl: "https://socket.example.com",
            appName: "My App",
            appVersion: "1.2.3",
            appEnv: "staging",
            mode: "development",
            isDev: true,
            isProd: false,
        });
    });

    it("uses defaults for optional variables that are missing or empty", () => {
        expect(parseEnv({ ...vite, VITE_API_URL: "/api", VITE_SOCKET_URL: "" })).toMatchObject({
            socketUrl: "",
            appName: "React Starter",
            appVersion: "0.0.0",
            appEnv: "development",
        });
    });

    it("accepts a full API URL and removes trailing slashes", () => {
        expect(parseEnv({ ...vite, VITE_API_URL: "https://api.example.com/v1/" }).apiUrl).toBe(
            "https://api.example.com/v1",
        );
        expect(parseEnv({ ...vite, VITE_API_URL: "/api/v1/" }).apiUrl).toBe("/api/v1");
    });

    it("names a missing required variable", () => {
        expect(() => parseEnv({ ...vite })).toThrow("VITE_API_URL: is required");
        expect(() => parseEnv({ ...vite, VITE_API_URL: "  " })).toThrow(
            "VITE_API_URL: is required",
        );
    });

    it("rejects invalid URLs", () => {
        expect(() => parseEnv({ ...vite, VITE_API_URL: "api/v1" })).toThrow(
            "VITE_API_URL: must be a path like /api/v1 or a full URL",
        );
        expect(() =>
            parseEnv({ ...vite, VITE_API_URL: "/api", VITE_SOCKET_URL: "localhost:3000" }),
        ).toThrow("VITE_SOCKET_URL: must be a full URL");
    });

    it("lists every problem at once and points to .env.local", () => {
        expect(() => parseEnv({ ...vite, VITE_SOCKET_URL: "nope" })).toThrow(
            /VITE_API_URL[\s\S]*VITE_SOCKET_URL[\s\S]*\.env\.local/,
        );
    });

    it("returns a read-only object", () => {
        const result = parseEnv({ ...vite, VITE_API_URL: "/api" });

        expect(Object.isFrozen(result)).toBe(true);
    });
});

describe("env", () => {
    it("is parsed from the test values in vite.config.ts", () => {
        expect(env.apiUrl).toBe("/api/v1");
        expect(env.mode).toBe("test");
    });
});
