import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CATEGORIES,
  getCategory,
  productsByCategory,
} from "@/lib/catalog";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FilterSidebar } from "@/components/filter-sidebar";
import { CategoryIcon } from "@/components/category-icon";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const products = productsByCategory(slug);
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specs))),
  ).slice(0, 4);

  return (
    <>
      <Breadcrumbs
        trail={[
          { label: "Catalog", href: "/" },
          { label: category.name },
        ]}
      />

      <div className="mb-3 flex items-end justify-between border-b border-mc-border pb-2">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight">
            {category.name}
          </h1>
          <p className="text-[12px] text-mc-ink-soft">{category.blurb}</p>
        </div>
        <div className="text-right text-[11px] text-mc-ink-soft">
          Showing <b>{products.length}</b> of{" "}
          <b>{products.length.toLocaleString()}</b> SKUs
          <div className="mt-1 flex justify-end gap-2">
            <label>
              Sort:{" "}
              <select className="border border-mc-border bg-white px-1 py-0.5">
                <option>Most Ordered</option>
                <option>Price: Low → High</option>
                <option>Price: High → Low</option>
                <option>Lead Time</option>
                <option>Part Number</option>
              </select>
            </label>
            <label>
              View:{" "}
              <select className="border border-mc-border bg-white px-1 py-0.5">
                <option>Table</option>
                <option>Spec Cards</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <FilterSidebar
          subcategories={category.subcategories}
          products={products}
        />

        <section className="flex-1">
          {/* Subcategory pills */}
          <div className="mb-2 flex flex-wrap gap-1.5 text-[11px]">
            {category.subcategories.map((s) => (
              <span
                key={s}
                className="border border-mc-border bg-white px-2 py-0.5 hover:border-black"
              >
                {s}
              </span>
            ))}
          </div>

          {products.length === 0 ? (
            <div className="border border-mc-border bg-white p-6 text-center text-mc-ink-soft">
              No SKUs published yet in this department. Contact a specialist for
              custom sourcing.
            </div>
          ) : (
            <table className="mc-table">
              <thead>
                <tr>
                  <th className="w-[80px]"></th>
                  <th>Part #</th>
                  <th>Description</th>
                  {allSpecKeys.map((k) => (
                    <th key={k}>{k}</th>
                  ))}
                  <th className="text-right">$ / {products[0].uom}</th>
                  <th className="text-right">MOQ</th>
                  <th className="text-right">Lead</th>
                  <th className="text-right">Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="grid h-14 w-16 place-items-center border border-mc-border bg-white text-mc-ink-soft">
                        <CategoryIcon
                          slug={p.categorySlug}
                          className="h-10 w-10"
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap font-mono text-[12px]">
                      <Link href={`/product/${p.id}`}>{p.partNumber}</Link>
                    </td>
                    <td>
                      <Link href={`/product/${p.id}`} className="font-medium">
                        {p.name}
                      </Link>
                      <div className="text-[11px] text-mc-ink-soft">
                        {p.subcategory} · {p.supplier}
                        {p.hazmat ? (
                          <span className="ml-2 rounded-sm bg-mc-red px-1 text-[10px] font-bold text-white">
                            HAZMAT
                          </span>
                        ) : null}
                      </div>
                    </td>
                    {allSpecKeys.map((k) => (
                      <td key={k} className="text-[12px]">
                        {p.specs[k] ?? "—"}
                      </td>
                    ))}
                    <td className="text-right font-mono">
                      ${p.pricePerEach.toFixed(2)}
                    </td>
                    <td className="text-right">
                      {p.moq} {p.uom}
                    </td>
                    <td className="text-right">{p.leadTimeDays} d</td>
                    <td className="text-right">
                      {p.inStock.toLocaleString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={p.moq}
                          className="w-14 border border-mc-border bg-white px-1 py-0.5 text-right text-[12px]"
                        />
                        <button className="rounded-sm border border-black bg-mc-yellow px-2 py-0.5 text-[11px] font-semibold hover:bg-mc-yellow-dark">
                          Add
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-2 flex items-center justify-between text-[11px] text-mc-ink-soft">
            <span>Prices shown net of contract discount · USD</span>
            <span>
              Page 1 of 1 · <Link href="#">Export results to CSV</Link>
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
