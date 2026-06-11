import axios from "axios";
import type { ApiResponse } from "@/frontend/types/api";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown>;
    if (payload?.success === false) {
      return Promise.reject(new Error(payload.error || payload.message || "Request failed"));
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message ?? error.message ?? "Request failed";
    return Promise.reject(new Error(message));
  }
);
