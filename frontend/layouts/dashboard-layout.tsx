"use client";

import { Button, Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/frontend/components/common/logo";
import { apiClient } from "@/frontend/lib/api-client";
import type { ApiSuccessResponse, AuthPayload } from "@/frontend/types/api";

const { Sider, Header, Content } = Layout;

export function DashboardLayout({
  title,
  items,
  children
}: {
  title: string;
  items: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems: MenuProps["items"] = items.map((item) => ({
    key: item.href,
    label: (
      <Link href={item.href} prefetch onMouseEnter={() => router.prefetch(item.href)}>
        {item.label}
      </Link>
    )
  }));

  const logout = async () => {
    try {
      const response = await apiClient.post<ApiSuccessResponse<AuthPayload>>("/auth/logout");
      toast.success(response.data.message);
      router.replace(response.data.data.redirectTo);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed");
    }
  };

  return (
    <Layout className="min-h-screen bg-slate-50">
      <Sider width={280} theme="light" className="border-r border-slate-200 !bg-white px-4 py-5">
        <Logo />
        <div className="mt-8 rounded-[28px] bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{title}</p>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          className="mt-6 border-none"
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-end border-b border-slate-200 bg-white px-6">
          <Button onClick={logout}>Logout</Button>
        </Header>
        <Content className="p-6 lg:p-8">{children}</Content>
      </Layout>
    </Layout>
  );
}
