import Link from "next/link";
import { Button } from "antd";
import { Logo } from "@/frontend/components/common/logo";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-3">
          <Button href="/login">Login</Button>
          <Button type="primary" href="/register">
            Start free
          </Button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mx-auto mt-20 max-w-7xl px-6 py-10 text-sm text-slate-500 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5">
          Built as the Phase 1 foundation for a seller-focused automation SaaS.
        </div>
      </footer>
    </div>
  );
}
