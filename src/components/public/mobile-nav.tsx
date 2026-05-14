"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, TEAM_NAME } from "@/lib/constants";

const MOBILE_NAV_ID = "site-mobile-navigation";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
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
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
              <button
                type="button"
                aria-label="Close navigation"
                className="absolute inset-0 h-full w-full bg-black/45"
                onClick={() => setOpen(false)}
              />
              <nav
                id={MOBILE_NAV_ID}
                aria-label="Mobile navigation"
                className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l bg-background shadow-2xl"
              >
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3 font-bold text-primary">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
                      SDH
                    </span>
                    <span className="truncate">{TEAM_NAME}</span>
                  </div>
                  <Button type="button" variant="outline" size="icon" aria-label="Close navigation" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
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
                </div>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
