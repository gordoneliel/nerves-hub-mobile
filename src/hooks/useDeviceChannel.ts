import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { Channel, Socket } from "phoenix";
import type { Device, DeviceListResponse } from "../api/generated/schemas";
import { getListDevicesQueryKey } from "../api/generated/devices/devices";
import { useAuth } from "../context/AuthContext";
import { useOrgProduct } from "../context/OrgProductContext";

/**
 * Connects a Phoenix WebSocket to `product:{org}:{product}` and patches
 * the React Query device list cache on presence_diff and update events.
 */
export function useDeviceChannel() {
  const { instanceUrl, token } = useAuth();
  const { orgId, productId } = useOrgProduct();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!instanceUrl || !orgId || !productId || !token) return;

    const wsUrl = instanceUrl.replace(/^http/, "ws");
    const socket = new Socket(`${wsUrl}/socket`, {
      params: { token },
    });
    socket.connect();
    socketRef.current = socket;

    const topic = `product:${orgId}:${productId}`;
    const channel = socket.channel(topic, {});
    channelRef.current = channel;

    channel.join();

    channel.on("presence_diff", (diff) => {
      const queryKey = getListDevicesQueryKey(orgId, productId);
      const joinsSet = new Set(Object.keys(diff.joins ?? {}));
      const leavesSet = new Set(Object.keys(diff.leaves ?? {}));

      queryClient.setQueriesData<InfiniteData<DeviceListResponse>>(
        { queryKey },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data?.map((device: Device) => {
                const id = String(device.identifier);
                if (joinsSet.has(id)) return { ...device, online: true };
                if (leavesSet.has(id)) return { ...device, online: false };
                return device;
              }),
            })),
          };
        },
      );
    });

    channel.on("update", (payload) => {
      const queryKey = getListDevicesQueryKey(orgId, productId);

      queryClient.setQueriesData<InfiniteData<DeviceListResponse>>(
        { queryKey },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data?.map((device: Device) => {
                if (String(device.identifier) === String(payload.identifier)) {
                  return { ...device, ...payload };
                }
                return device;
              }),
            })),
          };
        },
      );
    });

    return () => {
      channelRef.current?.leave();
      socketRef.current?.disconnect();
      socketRef.current = null;
      channelRef.current = null;
    };
  }, [instanceUrl, orgId, productId, token, queryClient]);
}
