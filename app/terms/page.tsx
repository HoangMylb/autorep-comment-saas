import { Card } from "antd";
import { MarketingLayout } from "@/frontend/layouts/marketing-layout";

export default function TermsPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-4xl space-y-6 px-6 py-12 lg:px-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Legal</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Terms of Service</h1>
          <p className="text-sm text-slate-500">Last updated: June 12, 2026</p>
        </div>

        <Card className="rounded-[28px] border-slate-200">
          <div className="space-y-6 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">1. Acceptance of terms</h2>
              <p>
                By using this application, you agree to these terms and to the responsible use of all automation, messaging, and Facebook
                integration features made available in the product.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">2. Account responsibilities</h2>
              <p>
                You are responsible for maintaining control over your account credentials, Facebook access, and any actions executed through
                your connected pages, automations, or admin privileges.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">3. Acceptable use</h2>
              <p>
                You must not use the service to spam, abuse platform rules, violate Meta/Facebook policies, send unauthorized replies, or
                interfere with other users or system stability.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">4. Third-party platform dependency</h2>
              <p>
                Some features depend on Supabase, Vercel, and Meta/Facebook APIs. Those providers may change permissions, rate limits,
                availability, or review requirements, which can affect functionality without notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">5. Service availability</h2>
              <p>
                The service is provided on an as-available basis. Facebook automation features may be added, limited,
                disabled, or modified during product development.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">6. Suspension and termination</h2>
              <p>
                Access may be restricted or revoked for misuse, policy violations, security concerns, or operational requirements. Blocked
                users may lose access to protected parts of the app.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">7. Limitation of liability</h2>
              <p>
                The operator is not responsible for indirect or consequential losses arising from service interruptions, external API
                failures, token expiry, permission denial, or user misconfiguration.
              </p>
            </section>
          </div>
        </Card>
      </section>
    </MarketingLayout>
  );
}
