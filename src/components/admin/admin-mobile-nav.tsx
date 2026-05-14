"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ADMIN_LINKS, TEAM_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const ADMIN_MOBILE_NAV_ID = "admin-mobile-navigation";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
      <Link href="/admin" className="font-bold">
        {TEAM_NAME}
      </Link>
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label={open ? "Close admin navigation" : "Open admin navigation"}
        aria-expanded={open}
        aria-controls={ADMIN_MOBILE_NAV_ID}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {open ? (
        <div className="fixed inset-0 top-[65px] z-50 bg-black/40" onClick={() => setOpen(false)}>
          <nav
            id={ADMIN_MOBILE_NAV_ID}
            aria-label="Admin mobile navigation"
            className="ml-auto h-full w-80 max-w-[calc(100vw-2rem)] border-l bg-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 font-bold">Admin dashboard</div>
            <div className="grid gap-2">
            {ADMIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
