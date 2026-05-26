import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction } from "@/lib/auth-actions";
import { getSession } from "@/lib/auth";

export default async function SignInPage() {
  if (await getSession()) redirect("/");

  return (
    <div className="mx-auto my-6 max-w-[860px]">
      <div className="grid grid-cols-5 border border-mc-border bg-white">
        {/* Left: form */}
        <div className="col-span-3 border-r border-mc-border p-6">
          <h1 className="font-serif text-2xl font-bold leading-tight">
            Employee sign-in
          </h1>
          <p className="mt-1 text-[12px] text-mc-ink-soft">
            Access plant-specific pricing, lead times, and Net-30 terms. Use
            your corporate email or SSO badge ID.
          </p>

          <form action={signInAction} className="mt-5 space-y-3 text-[13px]">
            <label className="block">
              <span className="mb-1 block font-semibold">
                Corporate email
              </span>
              <input
                name="email"
                type="email"
                autoFocus
                placeholder="maria.chen@plant14.freightdesk.example"
                className="w-full border border-mc-border bg-white px-2 py-1.5 outline-none focus:border-black"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-semibold">Password</span>
              <input
                name="password"
                type="password"
                placeholder="Any value — mock auth"
                className="w-full border border-mc-border bg-white px-2 py-1.5 outline-none focus:border-black"
              />
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-sm border border-black bg-mc-yellow px-5 py-2 text-[13px] font-semibold hover:bg-mc-yellow-dark"
              >
                Sign in
              </button>
              <Link href="#" className="text-[12px]">
                Forgot password?
              </Link>
              <Link href="#" className="text-[12px]">
                Sign in with SSO
              </Link>
            </div>

            <p className="pt-3 text-[11px] text-mc-ink-soft">
              <b>Mock auth:</b> any input is accepted. Leave both fields blank
              to sign in as <i>Maria Chen · Plant 14</i>.
            </p>
          </form>
        </div>

        {/* Right: info panel */}
        <aside className="col-span-2 bg-mc-bg p-6 text-[12px]">
          <h3 className="mb-2 font-semibold">New to Wayfair Supply?</h3>
          <p className="text-mc-ink-soft">
            Accounts are provisioned by your plant procurement lead. If you
            don't have a login yet, your buyer or plant manager can request one
            in the admin portal.
          </p>

          <h3 className="mt-5 mb-2 font-semibold">What you get</h3>
          <ul className="space-y-1 text-mc-ink-soft">
            <li>✓ Plant-specific Net-30 pricing</li>
            <li>✓ Stocking position at the DC nearest your plant</li>
            <li>✓ BOM upload &amp; saved buy-lists</li>
            <li>✓ RMA portal &amp; freight-exception triage</li>
            <li>✓ cXML / Punch-Out integration with your ERP</li>
          </ul>

          <h3 className="mt-5 mb-2 font-semibold">Need help?</h3>
          <ul className="space-y-1">
            <li>
              <Link href="#">Call buyer support · 1-800-555-0140</Link>
            </li>
            <li>
              <Link href="#">Email procurement@freightdesk.example</Link>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
