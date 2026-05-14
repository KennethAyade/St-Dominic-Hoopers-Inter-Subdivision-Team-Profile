"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { ADMIN_LINKS, TEAM_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AdminMobileNav() {
  return (
    <div className="flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
      <Link href="/admin" className="font-bold">{TEAM_NAME}</Link>
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" aria-label="Open admin navigation">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="mb-6 font-bold">Admin dashboard</div>
          <nav className="grid gap-2">
            {ADMIN_LINKS.map((link) => (
              <SheetClose asChild key={link.href}>
                <Link href={link.href} className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted">
                  {link.label}
                </Link>
              </SheetClose>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
