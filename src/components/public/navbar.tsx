import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS, TEAM_NAME } from "@/lib/constants";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
            SDH
          </span>
          <span className="leading-tight">{TEAM_NAME}</span>
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
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="mb-8 flex items-center gap-3 font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
                SDH
              </span>
              {TEAM_NAME}
            </div>
            <nav className="grid gap-2">
              {NAV_LINKS.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href={link.href}>
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Link className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" href="/login">
                  Admin login
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
