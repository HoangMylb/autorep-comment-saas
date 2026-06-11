import type { Metadata } from "next";
import "@/frontend/styles/globals.css";
import { AppProviders } from "@/frontend/components/providers/app-providers";

export const metadata: Metadata = {
  title: "AutoRep Affiliate",
  description: "Phase 1 foundation for auth, roles, and dashboard setup."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
