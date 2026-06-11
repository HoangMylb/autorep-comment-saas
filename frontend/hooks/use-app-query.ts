"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/frontend/lib/api-client";
import type { ApiSuccessResponse } from "@/frontend/types/api";

export function useAppQuery<T>(key: string[], url: string) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccessResponse<T>>(url);
      return response.data.data;
    }
  });
}
