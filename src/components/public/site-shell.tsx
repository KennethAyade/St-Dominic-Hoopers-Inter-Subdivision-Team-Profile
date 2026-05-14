import type { ReactNode } from "react";
import { Footer } from "@/components/public/footer";
import { Navbar } from "@/components/public/navbar";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
