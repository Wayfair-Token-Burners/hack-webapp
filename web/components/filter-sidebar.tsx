import type { Product } from "@/lib/catalog";

export function FilterSidebar({
  subcategories,
  products,
}: {
  subcategories: string[];
  products: Product[];
}) {
  const suppliers = Array.from(new Set(products.map((p) => p.supplier)));
  const maxLead = Math.max(...products.map((p) => p.leadTimeDays), 0);
  return (
    <aside className="w-[220px] shrink-0 border border-mc-border bg-white text-[12px]">
      <FilterGroup title="Subcategory">
        {subcategories.map((s) => (
          <Check key={s} label={s} count={count(products, "subcategory", s)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Supplier">
        {suppliers.map((s) => (
          <Check key={s} label={s} count={count(products, "supplier", s)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <Check label="In Stock" defaultChecked />
        <Check label="Drop-Ship Only" />
        <Check label="Hazmat (LTL only)" />
      </FilterGroup>

      <FilterGroup title="Lead Time">
        <label className="mb-1 block">Up to {maxLead} days</label>
        <input
          type="range"
          min={1}
          max={maxLead || 1}
          defaultValue={maxLead || 1}
          className="w-full accent-mc-blue"
        />
      </FilterGroup>

      <FilterGroup title="Certifications">
        <Check label="CARB-2 / TSCA Title VI" />
        <Check label="Cal 117-2013" />
        <Check label="REACH" />
        <Check label="FSC Certified" />
      </FilterGroup>

      <div className="border-t border-mc-border p-2">
        <button className="w-full rounded-sm border border-black bg-mc-yellow py-1 font-semibold hover:bg-mc-yellow-dark">
          Apply Filters
        </button>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-mc-border p-2">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-mc-ink-soft">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Check({
  label,
  count,
  defaultChecked,
}: {
  label: string;
  count?: number;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <input type="checkbox" defaultChecked={defaultChecked} className="accent-mc-blue" />
      <span className="flex-1">{label}</span>
      {typeof count === "number" ? (
        <span className="text-mc-ink-soft">({count})</span>
      ) : null}
    </label>
  );
}

function count<K extends keyof Product>(rows: Product[], key: K, value: Product[K]) {
  return rows.filter((r) => r[key] === value).length;
}
