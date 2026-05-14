import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/public/mobile-nav";
import { NAV_LINKS, TEAM_NAME } from "@/lib/constants";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-green-900/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 font-bold text-primary">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground shadow-sm">
            SDH
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-black uppercase tracking-normal">{TEAM_NAME}</span>
            <span className="block truncate text-xs font-medium text-muted-foreground">Mayor&apos;s Cup 2026</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          <Button asChild size="sm" className="ml-2">
            <Link href="/login">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
