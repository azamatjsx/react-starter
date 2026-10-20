import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createSocket } from "./socket.ts";

const { io, mockEnv } = vi.hoisted(() => ({
    io: vi.fn(() => ({})),
    mockEnv: { socketUrl: "" },
}));

vi.mock("socket.io-client", () => ({ io }));
vi.mock("../config/env.ts", () => ({ env: mockEnv }));

describe("createSocket", () => {
    beforeEach(() => {
        io.mockClear();
        mockEnv.socketUrl = "";
    });

    it("connects to the default namespace on the app's own origin", () => {
        createSocket();

        expect(io).toHaveBeenCalledWith("/", { autoConnect: false });
    });

    it("connects to the given namespace", () => {
        createSocket("/chat");

        expect(io).toHaveBeenCalledWith("/chat", { autoConnect: false });
    });

    it("connects to the socket URL when it is set", () => {
        mockEnv.socketUrl = "https://api.example.com";

        createSocket("/chat");

        expect(io).toHaveBeenCalledWith("https://api.example.com/chat", { autoConnect: false });
    });
});
