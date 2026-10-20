import { io } from "socket.io-client";

import { env } from "../config/env.ts";

/**
 * Creates a Socket.IO connection to a namespace of the backend, e.g. "/" or "/chat".
 *
 * An empty `env.socketUrl` (VITE_SOCKET_URL) connects to the app's own origin, so in `vp dev` the
 * `/socket.io` proxy forwards it to the backend. A full URL connects directly.
 *
 * Connections to the same server share one underlying connection; Socket.IO
 * keeps the namespaces apart on it.
 *
 * `autoConnect` is off: call `.connect()` where the connection is needed and
 * `.disconnect()` when it is not. Create each socket once per feature, at module
 * level, never inside a component.
 */
export function createSocket(namespace = "/") {
    return io(`${env.socketUrl}${namespace}`, {
        autoConnect: false,
    });
}
