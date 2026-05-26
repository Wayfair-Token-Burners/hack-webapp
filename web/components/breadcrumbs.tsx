import Link from "next/link";

export function Breadcrumbs({
  trail,
}: {
  trail: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav className="mb-2 text-[11px] text-mc-ink-soft">
      {trail.map((t, i) => (
        <span key={i}>
          {t.href ? <Link href={t.href}>{t.label}</Link> : <span>{t.label}</span>}
          {i < trail.length - 1 ? <span className="mx-1">›</span> : null}
        </span>
      ))}
    </nav>
  );
}
