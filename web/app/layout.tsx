import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MicLauncher } from "@/components/mic-launcher";
import { InboxLauncher } from "@/components/inbox-launcher";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Wayfair Supply — Industrial Furniture Components",
  description:
    "Wholesale catalog of frames, casters, slides, fabric, foam, panels, and hardware for furniture manufacturers.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-mc-bg text-mc-ink">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-4">
          {children}
        </main>
        <SiteFooter />
        {session ? (
          <>
            <MicLauncher />
            <InboxLauncher />
          </>
        ) : null}
      </body>
    </html>
  );
}
