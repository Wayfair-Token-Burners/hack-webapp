import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCategory,
  getProduct,
  PRODUCTS,
  productsByCategory,
} from "@/lib/catalog";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CategoryIcon } from "@/components/category-icon";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const category = getCategory(product.categorySlug);
  const related = productsByCategory(product.categorySlug)
    .filter((p) => p.id !== product.id)
    .slice(0, 6);

  const priceTiers = [
    { qty: product.moq, price: product.pricePerEach },
    { qty: product.moq * 5, price: +(product.pricePerEach * 0.94).toFixed(2) },
    { qty: product.moq * 25, price: +(product.pricePerEach * 0.87).toFixed(2) },
    { qty: product.moq * 100, price: +(product.pricePerEach * 0.78).toFixed(2) },
  ];

  return (
    <>
      <Breadcrumbs
        trail={[
          { label: "Catalog", href: "/" },
          category
            ? { label: category.name, href: `/category/${category.slug}` }
            : { label: "Catalog" },
          { label: product.partNumber },
        ]}
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Image column */}
        <div className="col-span-3">
          <div className="grid aspect-square place-items-center border border-mc-border bg-white p-6 text-mc-ink-soft">
            <CategoryIcon
              slug={product.categorySlug}
              title={product.name}
              className="h-full w-full"
            />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {(["front", "side", "detail", "exploded"] as const).map((view) => (
              <div
                key={view}
                title={`${view} view`}
                className="grid aspect-square place-items-center border border-mc-border bg-white p-1 text-mc-ink-soft hover:border-black"
              >
                <CategoryIcon
                  slug={product.categorySlug}
                  className="h-full w-full opacity-70"
                />
              </div>
            ))}
          </div>
          <div className="mt-2 text-[11px]">
            <Link href="#">Download CAD (STEP, IGES, DWG)</Link>
            <br />
            <Link href="#">Download spec sheet (PDF)</Link>
            <br />
            <Link href="#">Compliance docs</Link>
          </div>
        </div>

        {/* Main column */}
        <div className="col-span-6">
          <h1 className="font-serif text-2xl font-bold leading-tight">
            {product.name}
          </h1>
          <div className="mt-1 text-[12px] text-mc-ink-soft">
            Part <b className="font-mono text-mc-ink">{product.partNumber}</b> ·
            Supplied by <b>{product.supplier}</b> ·{" "}
            {product.subcategory}
            {product.hazmat ? (
              <span className="ml-2 rounded-sm bg-mc-red px-1 py-0.5 text-[10px] font-bold text-white">
                HAZMAT · LTL ONLY
              </span>
            ) : null}
          </div>

          <h2 className="mt-4 border-b border-mc-border pb-1 font-semibold">
            Specifications
          </h2>
          <table className="mc-table mt-2">
            <tbody>
              {Object.entries(product.specs).map(([k, v]) => (
                <tr key={k}>
                  <th className="w-[200px]">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
              <tr>
                <th>Unit of Measure</th>
                <td>{product.uom}</td>
              </tr>
              <tr>
                <th>Minimum Order Qty</th>
                <td>
                  {product.moq} {product.uom}
                </td>
              </tr>
              <tr>
                <th>Standard Lead Time</th>
                <td>{product.leadTimeDays} days from receipt of PO</td>
              </tr>
              <tr>
                <th>Stocking Position</th>
                <td>
                  {product.inStock.toLocaleString()} {product.uom} on hand · DCs
                  CLT + RNO
                </td>
              </tr>
            </tbody>
          </table>

          <h2 className="mt-6 border-b border-mc-border pb-1 font-semibold">
            Price breaks
          </h2>
          <table className="mc-table mt-2 max-w-md">
            <thead>
              <tr>
                <th>Qty</th>
                <th>$ / {product.uom}</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {priceTiers.map((t) => {
                const savings = +(
                  (1 - t.price / product.pricePerEach) *
                  100
                ).toFixed(0);
                return (
                  <tr key={t.qty}>
                    <td>{t.qty.toLocaleString()}+</td>
                    <td className="font-mono">${t.price.toFixed(2)}</td>
                    <td>{savings > 0 ? `${savings}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2 className="mt-6 border-b border-mc-border pb-1 font-semibold">
            Related items
          </h2>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-[12px]">
            {related.map((r) => (
              <li key={r.id} className="border border-mc-border bg-white p-2">
                <Link
                  href={`/product/${r.id}`}
                  className="font-mono text-[12px]"
                >
                  {r.partNumber}
                </Link>
                <div className="text-[12px]">{r.name}</div>
                <div className="mt-1 text-[11px] text-mc-ink-soft">
                  ${r.pricePerEach.toFixed(2)} / {r.uom} · {r.leadTimeDays}d
                  lead
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Order panel */}
        <aside className="col-span-3">
          <div className="sticky top-3 border border-mc-border bg-white">
            <div className="border-b border-mc-border bg-mc-bg px-3 py-1.5 text-[12px] font-semibold">
              Order
            </div>
            <div className="space-y-2 p-3 text-[12px]">
              <div className="flex items-baseline justify-between">
                <span>Unit price</span>
                <span className="font-mono text-base font-semibold">
                  ${product.pricePerEach.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-mc-ink-soft">Qty ({product.uom})</label>
                <input
                  type="number"
                  defaultValue={product.moq}
                  min={product.moq}
                  className="w-24 border border-mc-border bg-white px-1 py-0.5 text-right"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-mc-ink-soft">Ship to</label>
                <select className="border border-mc-border bg-white px-1 py-0.5">
                  <option>Plant 14 · Hickory NC</option>
                  <option>Plant 22 · High Point NC</option>
                  <option>DC West · Reno NV</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-mc-ink-soft">Need by</label>
                <input
                  type="date"
                  className="border border-mc-border bg-white px-1 py-0.5"
                />
              </div>
              <button className="w-full rounded-sm border border-black bg-mc-yellow py-2 font-semibold hover:bg-mc-yellow-dark">
                Add to Cart
              </button>
              <button className="w-full rounded-sm border border-mc-border bg-white py-1.5 hover:border-black">
                Save to BOM
              </button>
              <button className="w-full rounded-sm border border-mc-border bg-white py-1.5 hover:border-black">
                Request volume quote
              </button>
              <div className="mt-2 border-t border-mc-border pt-2 text-[11px] text-mc-ink-soft">
                <div>
                  ✓ Ships from <b className="text-mc-ink">CLT</b> · cutoff 8 PM
                  ET
                </div>
                <div>✓ Net-30 terms applied (Plant 14)</div>
                <div>
                  ✓ Returns: 30 days unopened ·{" "}
                  <Link href="#">RMA portal</Link>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
