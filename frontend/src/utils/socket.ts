import { config } from "@/config";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

export const SOCKET_API_URL = config.baseUrl || "http://localhost:5000";

interface ServerToClientEvents {
  connect_error: (error: Error) => void;
  disconnect: (reason: string) => void;
  rewardsUpdated?: () => void;
}

interface ClientToServerEvents {
  joinUserRoom?: (
    data: { userId: string },
    callback: (
      response:
        | { success: boolean; message: string }
        | { error: { message: string } }
    ) => void
  ) => void;
  leaveUserRoom?: (
    data: { userId: string },
    callback: (
      response:
        | { success: boolean; message: string }
        | { error: { message: string } }
    ) => void
  ) => void;
}

// Single optimized socket: connect to users namespace for all app realtime
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `${SOCKET_API_URL}`,
  {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 10000,
    autoConnect: true,
    forceNew: true,
  }
);

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (error: Error) => {
  console.error("❌ Connection error:", error.message);
});

socket.on("disconnect", (reason: string) => {
  console.warn("🔌 Disconnected:", reason);
});

export function ensureConnected(): Promise<void> {
  if (socket.connected) return Promise.resolve();
  return new Promise((resolve) => {
    const onConnect = () => {
      socket.off("connect", onConnect);
      resolve();
    };
    socket.on("connect", onConnect);
    try {
      if (!socket.active) socket.connect();
    } catch {
      // ignore
    }
  });
}

export const socketEmitter = <TResponse>(
  event: keyof ClientToServerEvents,
  data?: unknown
): Promise<TResponse> => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) return reject(new Error("Socket not connected"));
    const emitWithAck = socket.emit.bind(socket) as (
      e: keyof ClientToServerEvents,
      d: unknown,
      cb: (r: unknown) => void
    ) => void;
    emitWithAck(event, data, (response: unknown) => {
      const obj = response as Record<string, unknown> | null;
      const err = obj && (obj["error"] as Record<string, unknown> | undefined);
      if (err && typeof err["message"] === "string") {
        return reject(new Error(String(err["message"])));
      }
      resolve(response as TResponse);
    });
  });
};

export default socket;
