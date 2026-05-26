export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-mc-border bg-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-4 gap-8 px-4 py-8 text-[12px]">
        <div>
          <h4 className="mb-2 font-semibold">Help & Support</h4>
          <ul className="space-y-1">
            <li><a href="#">Contact a Specialist</a></li>
            <li><a href="#">Order Status</a></li>
            <li><a href="#">Returns & RMA</a></li>
            <li><a href="#">Shipping & Lead Times</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">For Buyers</h4>
          <ul className="space-y-1">
            <li><a href="#">Punch-Out / cXML</a></li>
            <li><a href="#">Volume Pricing</a></li>
            <li><a href="#">Net-30 Terms</a></li>
            <li><a href="#">Tax Exemption</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Compliance</h4>
          <ul className="space-y-1">
            <li><a href="#">CARB-2 / TSCA Title VI</a></li>
            <li><a href="#">Cal 117-2013 Flammability</a></li>
            <li><a href="#">REACH / RoHS</a></li>
            <li><a href="#">SDS Library</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">About</h4>
          <p className="text-mc-ink-soft">
            Wayfair Supply is the wholesale catalog for upholstery,
            casegoods, and contract furniture manufacturers. Single SKU to
            container loads. No minimums on stocked goods.
          </p>
        </div>
      </div>
      <div className="border-t border-mc-border bg-mc-bg py-2 text-center text-[11px] text-mc-ink-soft">
        © Wayfair Supply · Catalog v2026.05 · All prices in USD
      </div>
    </footer>
  );
}
