import { useCallback, useEffect, useRef, useState } from "react";
import { Channel, Socket } from "phoenix";
import { useAuth } from "../context/AuthContext";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface ConsoleChannelOptions {
  /** The device identifier (e.g. serial), not the numeric DB id. */
  identifier: string;
  onOutput?: (data: string) => void;
  onMetadata?: (metadata: Record<string, unknown>) => void;
}

export function useConsoleChannel({
  identifier,
  onOutput,
  onMetadata,
}: ConsoleChannelOptions) {
  const { instanceUrl, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const onOutputRef = useRef(onOutput);
  onOutputRef.current = onOutput;
  const onMetadataRef = useRef(onMetadata);
  onMetadataRef.current = onMetadata;

  useEffect(() => {
    if (!instanceUrl || !identifier || !token) return;

    let cancelled = false;
    setStatus("connecting");

    // API-token auth uses the dedicated APISocket at /api/socket (the web UI's
    // /socket verifies a Phoenix.Token session instead). See nerves_hub_web #2741.
    const wsUrl = instanceUrl.replace(/^http/, "ws");
    const socket = new Socket(`${wsUrl}/api/socket`, {
      params: { token },
    });

    socket.onError((error) => {
      console.warn("[console] Socket error", error);
      if (!cancelled) setStatus("error");
    });
    socket.onClose(() => {
      if (!cancelled && channelRef.current) setStatus("disconnected");
    });

    socket.connect();
    socketRef.current = socket;

    const topic = `user:console:identifier-${identifier}`;
    const channel = socket.channel(topic, {});
    channelRef.current = channel;

    channel
      .join()
      .receive("ok", () => {
        if (!cancelled) setStatus("connected");
      })
      .receive("error", (reason) => {
        console.warn("[console] Channel join error", reason);
        if (!cancelled) setStatus("error");
      })
      .receive("timeout", () => {
        console.warn("[console] Channel join timeout");
        if (!cancelled) setStatus("error");
      });

    channel.on("up", (payload: { data: string }) => {
      onOutputRef.current?.(payload.data);
    });

    channel.on("metadata", (payload: Record<string, unknown>) => {
      onMetadataRef.current?.(payload);
    });

    return () => {
      cancelled = true;
      channelRef.current?.leave();
      socketRef.current?.disconnect();
      channelRef.current = null;
      socketRef.current = null;
    };
  }, [instanceUrl, identifier, token]);

  const sendInput = useCallback((data: string) => {
    channelRef.current?.push("dn", { data });
  }, []);

  const sendWindowSize = useCallback((height: number, width: number) => {
    channelRef.current?.push("window_size", { height, width });
  }, []);

  return {
    status,
    sendInput,
    sendWindowSize,
  };
}
