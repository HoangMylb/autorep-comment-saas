import { Card } from "antd";
import { MarketingLayout } from "@/frontend/layouts/marketing-layout";

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-4xl space-y-6 px-6 py-12 lg:px-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Legal</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: June 12, 2026</p>
        </div>

        <Card className="rounded-[28px] border-slate-200">
          <div className="space-y-6 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">1. Information we collect</h2>
              <p>
                We collect account data you provide directly, including your name, email address, authentication data managed through
                Supabase, and application content such as pages, posts, automations, logs, and operational metadata.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">2. How we use information</h2>
              <p>
                We use your data to authenticate access, provide dashboard functionality, process mock or Facebook-integrated automation
                workflows, store logs, and operate, secure, and improve the product.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">3. Third-party services</h2>
              <p>
                The app uses Supabase for authentication and database storage, Vercel for hosting, and may use Meta/Facebook APIs when real
                Facebook Mode is enabled. Those providers may process data according to their own policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">4. Data retention</h2>
              <p>
                We retain application records, logs, and operational metadata for service delivery, troubleshooting, and audit purposes,
                unless deletion is required by law, support process, or account closure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">5. Security</h2>
              <p>
                We apply access controls, protected routes, role-based authorization, and server-side secret handling. However, no internet
                service can guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">6. Your choices</h2>
              <p>
                You may request account updates or deletion through the service operator. Admin access and data visibility are controlled
                through role-based permissions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">7. Contact</h2>
              <p>
                If you have questions about this policy, contact the operator of this deployment through the support channel listed on the
                website or product owner documentation.
              </p>
            </section>
          </div>
        </Card>
      </section>
    </MarketingLayout>
  );
}
