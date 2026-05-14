import type { ReactNode } from "react";
import { Footer } from "@/components/public/footer";
import { Navbar } from "@/components/public/navbar";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
