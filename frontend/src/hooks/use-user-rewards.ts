import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMyRewardPoints,
  type IUserRewardPointsResponse,
} from "@/services/rewards.api";
import socket from "@/utils/socket";
import { toast } from "sonner";

const QUERY_KEYS = {
  points: ["rewards", "points"],
} as const;

export function useUserRewardPoints() {
  const queryClient = useQueryClient();

  const query = useQuery<IUserRewardPointsResponse, Error>({
    queryKey: QUERY_KEYS.points,
    queryFn: getMyRewardPoints,
  });

  // Listen for live reward updates and invalidate cache
  useEffect(() => {
    const handler = (data: unknown) => {
      if (typeof data === "object" && data !== null && "message" in data) {
        toast.success(data.message);
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.points });
    };
    socket.on("rewardsUpdated", handler);
    return () => {
      socket.off("rewardsUpdated", handler);
    };
  }, [queryClient]);

  return query;
}

// Single-endpoint requirement: history hook omitted
