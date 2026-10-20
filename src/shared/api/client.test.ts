import {
    AxiosError,
    AxiosHeaders,
    CanceledError,
    type AxiosAdapter,
    type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { api, ApiError } from "./client.ts";

// Replace the network layer: each test decides what the "server" answers
const originalAdapter = api.defaults.adapter;

function respondWith(adapter: AxiosAdapter) {
    api.defaults.adapter = adapter;
}

function httpError(config: InternalAxiosRequestConfig, status: number, data: unknown) {
    return new AxiosError(
        `Request failed with status code ${status}`,
        "ERR_BAD_RESPONSE",
        config,
        {},
        {
            status,
            statusText: "",
            data,
            headers: {},
            config,
        },
    );
}

describe("api", () => {
    afterEach(() => {
        api.defaults.adapter = originalAdapter;
    });

    it("sends requests relative to VITE_API_URL with a timeout and the default Accept header", async () => {
        const adapter = vi.fn<AxiosAdapter>(async (config) => ({
            status: 200,
            statusText: "OK",
            data: { status: "ok" },
            headers: {},
            config,
        }));
        respondWith(adapter);

        const response = await api.get("/health");

        expect(response.data).toEqual({ status: "ok" });
        const config = adapter.mock.calls[0]![0];
        expect(config.baseURL).toBe("/api/v1"); // test.env in vite.config.ts
        expect(config.url).toBe("/health");
        expect(config.timeout).toBe(15_000);
        // axios default: prefers JSON but still accepts text and files
        expect(AxiosHeaders.from(config.headers).get("Accept")).toBe(
            "application/json, text/plain, */*",
        );
    });

    it("turns an error response into ApiError with the backend's message", async () => {
        respondWith(async (config) => {
            throw httpError(config, 404, { error: "Route GET /api/v1/nope not found" });
        });

        const error: unknown = await api.get("/nope").catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
            message: "Route GET /api/v1/nope not found",
            status: 404,
            data: { error: "Route GET /api/v1/nope not found" },
        });
        expect((error as ApiError).cause).toBeInstanceOf(AxiosError);
    });

    it("falls back to the status when the body has no message", async () => {
        respondWith(async (config) => {
            throw httpError(config, 500, "<html>Internal error</html>");
        });

        await expect(api.get("/x")).rejects.toMatchObject({
            message: "Request failed with status 500",
            status: 500,
        });
    });

    it("reports network errors and timeouts without a status", async () => {
        respondWith(async (config) => {
            throw new AxiosError("Network Error", "ERR_NETWORK", config);
        });
        await expect(api.get("/x")).rejects.toMatchObject({
            message: "Network error",
            status: undefined,
        });

        respondWith(async (config) => {
            throw new AxiosError("timeout of 15000ms exceeded", "ECONNABORTED", config);
        });
        await expect(api.get("/x")).rejects.toMatchObject({ message: "Request timed out" });
    });

    it("leaves cancelled requests as they are", async () => {
        respondWith(async () => {
            throw new CanceledError();
        });

        const error: unknown = await api.get("/x").catch((e: unknown) => e);

        expect(error).toBeInstanceOf(CanceledError);
        expect(error).not.toBeInstanceOf(ApiError);
    });
});
