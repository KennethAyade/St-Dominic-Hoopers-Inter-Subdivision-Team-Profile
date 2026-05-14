"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, TEAM_NAME } from "@/lib/constants";

const MOBILE_NAV_ID = "site-mobile-navigation";

export function MobileNav() {
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
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls={MOBILE_NAV_ID}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open ? (
        <div className="fixed inset-0 top-16 z-50 bg-black/40" onClick={() => setOpen(false)}>
          <nav
            id={MOBILE_NAV_ID}
            aria-label="Mobile navigation"
            className="ml-auto h-full w-80 max-w-[calc(100vw-2rem)] border-l bg-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-center gap-3 font-bold text-primary">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
                SDH
              </span>
              <span>{TEAM_NAME}</span>
            </div>
            <div className="grid gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted"
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                href="/login"
                onClick={() => setOpen(false)}
              >
                Admin login
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
