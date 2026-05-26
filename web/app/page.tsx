import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { CategoryTile } from "@/components/category-tile";
import Link from "next/link";

export default function Home() {
  const totalSkus = PRODUCTS.length;
  return (
    <>
      {/* Ticker / status bar */}
      <div className="mb-3 flex items-center justify-between border border-mc-border bg-white px-3 py-1.5 text-[11px]">
        <span>
          <b>Catalog scope:</b> {CATEGORIES.length} departments ·{" "}
          {totalSkus.toLocaleString()} active SKUs · stocked at 2 DCs
        </span>
        <span className="flex gap-4 text-mc-ink-soft">
          <span>
            <b className="text-mc-ink">Inbound today:</b> 14 containers
          </span>
          <span>
            <b className="text-mc-ink">On-time ship rate (30d):</b> 98.4%
          </span>
          <span>
            <b className="text-mc-ink">Open RFQs:</b> 7
          </span>
        </span>
      </div>

      {/* Hero strip */}
      <section className="mb-4 grid grid-cols-3 gap-3">
        <div className="col-span-2 border border-mc-border bg-white p-4">
          <h1 className="font-serif text-2xl font-bold leading-tight">
            Industrial furniture components — single SKU to container load.
          </h1>
          <p className="mt-2 text-[13px] text-mc-ink-soft">
            Frames, foam, fabric, hardware, finishes, panels, and packaging.
            Stocked, sourced, and shipped on terms your plant manager will
            actually believe.
          </p>
          <div className="mt-3 flex gap-2 text-[12px]">
            <Link
              href="#"
              className="rounded-sm border border-black bg-mc-yellow px-3 py-1.5 font-semibold !text-black !no-underline hover:bg-mc-yellow-dark"
            >
              Upload BOM →
            </Link>
            <Link
              href="#"
              className="rounded-sm border border-mc-border bg-white px-3 py-1.5 !text-mc-ink !no-underline hover:border-black"
            >
              Request a Quote
            </Link>
            <Link
              href="#"
              className="rounded-sm border border-mc-border bg-white px-3 py-1.5 !text-mc-ink !no-underline hover:border-black"
            >
              Schedule Drop-Ship
            </Link>
          </div>
        </div>
        <aside className="border border-mc-border bg-white p-3 text-[12px]">
          <h3 className="mb-1 font-semibold">Procurement notices</h3>
          <ul className="space-y-1.5">
            <li>
              <b>05/26</b> · HR foam Cal 117 retest complete on lots
              W22–W24. <Link href="#">SDS updated</Link>.
            </li>
            <li>
              <b>05/24</b> · 14-day lead time on PU casters extended to 21
              days through July. <Link href="#">Alternatives →</Link>
            </li>
            <li>
              <b>05/20</b> · New CARB-2 compliant MDF supplier added
              (Roseburg). <Link href="#">View specs</Link>.
            </li>
          </ul>
        </aside>
      </section>

      {/* Department grid */}
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-serif text-lg font-bold">Departments</h2>
          <Link href="#" className="text-[12px]">
            Browse full A–Z index →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((c) => (
            <CategoryTile key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* Recently viewed / quick-reorder */}
      <section className="mt-6 border border-mc-border bg-white">
        <div className="flex items-center justify-between border-b border-mc-border bg-mc-bg px-3 py-1.5 text-[12px] font-semibold">
          <span>Quick re-order · Plant 14 last 30 days</span>
          <Link href="#" className="font-normal">
            Export CSV →
          </Link>
        </div>
        <table className="mc-table">
          <thead>
            <tr>
              <th>Part #</th>
              <th>Description</th>
              <th>Last Ordered</th>
              <th>Qty</th>
              <th>UoM</th>
              <th>$ / Each</th>
              <th>Avg Lead</th>
              <th>In Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.slice(0, 5).map((p) => (
              <tr key={p.id}>
                <td className="font-mono text-[12px]">{p.partNumber}</td>
                <td>
                  <Link href={`/product/${p.id}`}>{p.name}</Link>
                </td>
                <td className="text-mc-ink-soft">2026-05-{18 + (p.id.length % 7)}</td>
                <td className="text-right">{p.moq}</td>
                <td>{p.uom}</td>
                <td className="text-right">${p.pricePerEach.toFixed(2)}</td>
                <td className="text-right">{p.leadTimeDays} d</td>
                <td className="text-right">{p.inStock.toLocaleString()}</td>
                <td>
                  <button className="rounded-sm border border-black bg-mc-yellow px-2 py-0.5 text-[11px] font-semibold hover:bg-mc-yellow-dark">
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
