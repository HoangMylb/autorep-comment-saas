export function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="space-y-2">
      {eyebrow ? <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">{eyebrow}</p> : null}
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
      {description ? <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
  );
}
