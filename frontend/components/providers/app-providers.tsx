"use client";

import { ConfigProvider, App as AntApp, theme } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { makeQueryClient } from "@/frontend/lib/query-client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
          borderRadius: 18,
          colorBgLayout: "#f8fafc",
          fontFamily: "Inter, ui-sans-serif, system-ui"
        }
      }}
    >
      <AntApp>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}
