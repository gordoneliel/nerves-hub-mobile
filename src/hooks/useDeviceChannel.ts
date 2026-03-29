import { useCallback, useEffect, useRef, useState } from "react";
import { Channel, Socket } from "phoenix";
import { useAuth } from "../context/AuthContext";

/**
 * Subscribes to a single device's event stream channel for firmware
 * update progress. Joins `device:{identifier}` and listens for
 * `firmware_update` events with `{ percent }` payload.
 */
export function useDeviceChannel(identifier: string) {
  const { instanceUrl, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const [fwupProgress, setFwupProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!instanceUrl || !token || !identifier) return;

    const wsUrl = instanceUrl.replace(/^http/, "ws");
    const socket = new Socket(`${wsUrl}/socket`, {
      params: { token },
    });
    socket.connect();
    socketRef.current = socket;

    const channel = socket.channel(`device:${identifier}`, {});
    channelRef.current = channel;

    channel.join();

    channel.on("firmware_update", (payload: { percent: number }) => {
      setFwupProgress(payload.percent);
    });

    return () => {
      channelRef.current?.leave();
      socketRef.current?.disconnect();
      socketRef.current = null;
      channelRef.current = null;
      setFwupProgress(null);
    };
  }, [instanceUrl, token, identifier]);

  const resetProgress = useCallback(() => setFwupProgress(null), []);

  return { fwupProgress, resetProgress };
}
