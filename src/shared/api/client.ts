import axios from "axios";

import { env } from "../config/env.ts";

const TIMEOUT_MS = 15_000;

/**
 * Error thrown by `api` for every failed request (except cancelled ones).
 *
 *     try {
 *         await api.get("/users");
 *     } catch (error) {
 *         if (error instanceof ApiError && error.status === 404) { ... }
 *     }
 */
export class ApiError extends Error {
    override readonly name = "ApiError";
    /** HTTP status, or `undefined` when there was no response (network error, timeout). */
    readonly status: number | undefined;
    /** Response body as sent by the backend. */
    readonly data: unknown;

    constructor(
        message: string,
        status: number | undefined,
        data: unknown,
        options?: ErrorOptions,
    ) {
        super(message, options);
        this.status = status;
        this.data = data;
    }
}

/**
 * Axios instance for the backend REST API.
 *
 * Requests are relative to `env.apiUrl` (VITE_API_URL), e.g. `api.get("/users")`
 * calls `/api/v1/users`, which `vp dev` proxies to the backend.
 */
export const api = axios.create({
    baseURL: env.apiUrl,
    timeout: TIMEOUT_MS,
});

api.interceptors.response.use(undefined, (error: unknown) => Promise.reject(toApiError(error)));

function toApiError(error: unknown): unknown {
    // Let cancelled requests (AbortController) through unchanged, so callers can ignore them
    if (axios.isCancel(error) || !axios.isAxiosError(error)) return error;

    const status = error.response?.status;
    const data: unknown = error.response?.data;

    return new ApiError(messageFrom(data) ?? fallbackMessage(error.code, status), status, data, {
        cause: error,
    });
}

/** The backend sends errors as `{ "error": "..." }`; also accept `{ "message": "..." }`. */
function messageFrom(data: unknown): string | undefined {
    if (typeof data !== "object" || data === null) return undefined;

    const { error, message } = data as { error?: unknown; message?: unknown };
    if (typeof error === "string") return error;
    if (typeof message === "string") return message;
    return undefined;
}

function fallbackMessage(code: string | undefined, status: number | undefined): string {
    if (status) return `Request failed with status ${status}`;
    if (code === "ECONNABORTED" || code === "ETIMEDOUT") return "Request timed out";
    return "Network error";
}
