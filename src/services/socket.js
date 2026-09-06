import { io } from "socket.io-client";
import { store } from "../context/store";

const SOCKET_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ""
).replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

let socket = null;

export function getAdminSocket() {
  const token = store.getState()?.auth?.accessToken || null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: {
        token: token || "",
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Admin connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket.IO] Admin auth/connect error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket.IO] Admin disconnected:", reason);
    });
  } else if (token && socket.auth?.token !== token) {
    // Token updated, refresh socket authentication
    socket.auth = { token };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  }

  return socket;
}

/**
 * Dynamically update the admin socket auth token on token refresh
 */
export function updateAdminSocketToken(newToken) {
  if (socket && newToken) {
    socket.auth = { token: newToken };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  }
}

export function disconnectAdminSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
