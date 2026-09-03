import { io } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ""
).replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

let socket = null;

export function getAdminSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      query: {
        role: "admin",
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Admin connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket.IO] Admin disconnected:", reason);
    });
  }

  return socket;
}

export function disconnectAdminSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

