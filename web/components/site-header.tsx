import Link from "next/link";
import { getSession } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export async function SiteHeader() {
  const session = await getSession();
  const shortPlant = session?.plant.split("·")[0]?.trim() ?? "";

  return (
    <header className="border-b border-mc-border bg-white">
      {/* Top thin utility strip */}
      <div className="border-b border-mc-border bg-mc-bg">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-1 text-[11px] text-mc-ink-soft">
          <span>
            Ships from Charlotte, NC & Reno, NV · Standard orders placed by 8 PM
            ET ship same day
          </span>
          <nav className="flex items-center gap-4">
            <Link href="#">Help</Link>
            <Link href="#">Order History</Link>
            <Link href="#">Punch-Out</Link>
            {session ? (
              <>
                <span>
                  Signed in as <b className="text-mc-ink">{session.name}</b>
                </span>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="cursor-pointer text-mc-blue-link hover:underline"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/signin">Sign in</Link>
            )}
          </nav>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-mc-yellow">
        <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-sm bg-black text-mc-yellow font-mono text-lg font-bold">
              FD
            </span>
            <span className="font-serif text-xl font-bold tracking-tight">
              Wayfair Supply
            </span>
          </Link>

          <form className="flex flex-1 items-stretch">
            <input
              type="search"
              placeholder="Search part numbers, materials, dimensions…"
              className="flex-1 rounded-l-sm border border-r-0 border-black/40 bg-white px-3 py-2 text-sm outline-none focus:border-black"
            />
            <button
              type="submit"
              className="rounded-r-sm border border-black bg-black px-5 text-sm font-semibold text-mc-yellow hover:bg-mc-ink"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-4 text-[12px]">
            <Link href="#" className="!text-black">
              Quick Order
            </Link>
            <Link href="#" className="!text-black">
              Bulk Quote
            </Link>
            <Link
              href="#"
              className="rounded-sm border border-black bg-white px-3 py-2 font-semibold !text-black hover:bg-mc-yellow-dark"
            >
              Cart (0)
            </Link>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="border-t border-black/30">
          <nav className="mx-auto flex max-w-[1400px] items-center gap-5 px-4 py-1.5 text-[12px] font-semibold">
            <Link href="/" className="!text-black hover:underline">
              Catalog
            </Link>
            <Link href="#" className="!text-black hover:underline">
              New Products
            </Link>
            <Link href="#" className="!text-black hover:underline">
              Supplier Network
            </Link>
            <Link href="#" className="!text-black hover:underline">
              Lead-Time Calendar
            </Link>
            <Link href="#" className="!text-black hover:underline">
              Drop-Ship
            </Link>
            <Link href="#" className="!text-black hover:underline">
              Returns & RMA
            </Link>
            <Link href="#" className="!text-black hover:underline">
              Compliance Docs
            </Link>
            {session ? (
              <span className="ml-auto font-normal text-black/70">
                Account:{" "}
                <b>
                  {session.name} · {shortPlant} · {session.role}
                </b>
              </span>
            ) : (
              <Link
                href="/signin"
                className="ml-auto rounded-sm border border-black bg-black px-2 py-0.5 !text-mc-yellow !no-underline hover:bg-mc-ink"
              >
                Sign in →
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
