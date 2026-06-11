import { Button, Card } from "antd";
import { MarketingLayout } from "@/frontend/layouts/marketing-layout";
import { SectionTitle } from "@/frontend/components/common/section-title";

const painPoints = [
  "Rep comment chậm dễ mất khách nóng.",
  "Comment tăng nhanh khiến đội sale bỏ sót inbox.",
  "Manychat mạnh nhưng phức tạp với người mới.",
  "Người bán hàng cần flow gọn, dễ demo, dễ vận hành."
];

const steps = [
  "Khởi tạo project structure rõ ràng",
  "Kết nối Supabase Auth và profiles",
  "Thiết lập role admin và user",
  "Dựng dashboard layout để mở rộng phase sau"
];

export default function LandingPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-10 pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pt-16">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
            AutoRep Affiliate MVP
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-900 lg:text-6xl">
              Nền tảng Phase 1 cho AutoRep Affiliate
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-500">
              Hoàn thiện project structure, Supabase schema, auth, role admin/user, và dashboard layout trước khi bước sang phần Facebook integration.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="primary" size="large" href="/register">
              Bắt đầu miễn phí
            </Button>
            <Button size="large" href="/login">
              Xem dashboard
            </Button>
          </div>
        </div>
        <Card className="rounded-[32px] border-slate-200">
          <div className="space-y-5">
            <p className="text-sm font-medium text-slate-500">Phase 1 scope</p>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Foundation focus</p>
              <p className="mt-2 text-lg font-medium text-slate-900">Auth, roles, protected dashboard, and Supabase-ready architecture</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-blue-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-500">User area</p>
                <p className="mt-2 text-sm text-slate-700">Protected dashboard layout, account settings, and authenticated overview page.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin area</p>
                <p className="mt-2 text-sm text-slate-700">Admin overview and user management with active/blocked status control.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-12 lg:px-8">
        <SectionTitle eyebrow="Pain points" title="Vì sao seller cần một tool đơn giản hơn?" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {painPoints.map((item) => (
            <Card key={item} className="rounded-[28px] border-slate-200 text-slate-600">
              {item}
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-12 lg:px-8">
        <SectionTitle eyebrow="How it works" title="4 bước để hoàn thiện Phase 1" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((item, index) => (
            <Card key={item} className="rounded-[28px] border-slate-200">
              <p className="text-sm font-medium text-blue-600">Step {index + 1}</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{item}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-12 lg:px-8">
        <SectionTitle eyebrow="Features" title="Tập trung đúng phần quan trọng của MVP" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            "Next.js App Router structure với frontend/backend tách lớp rõ ràng",
            "Supabase Auth và profiles trigger tự tạo hồ sơ user",
            "Role-based access cho user và admin",
            "Protected dashboard layouts cho khu vực nội bộ",
            "Admin users management để activate/block account",
            "Sẵn sàng mở rộng sang Facebook integration ở phase tiếp theo"
          ].map((item) => (
            <Card key={item} className="rounded-[28px] border-slate-200 text-slate-600">
              {item}
            </Card>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
