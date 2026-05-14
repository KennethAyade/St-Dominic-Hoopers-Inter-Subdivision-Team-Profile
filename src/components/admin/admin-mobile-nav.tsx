"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BarChart3, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ADMIN_LINKS, TEAM_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ADMIN_MOBILE_NAV_ID = "admin-mobile-navigation";

export function AdminMobileNav() {
  const pathname = usePathname();
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
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex min-w-0 items-center gap-3 font-bold">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
            SDH
          </span>
          <span className="truncate">{TEAM_NAME}</span>
        </Link>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Open admin navigation"
          aria-expanded={open}
          aria-controls={ADMIN_MOBILE_NAV_ID}
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
              <button
                type="button"
                aria-label="Close admin navigation"
                className="absolute inset-0 h-full w-full bg-black/45"
                onClick={() => setOpen(false)}
              />
              <aside
                id={ADMIN_MOBILE_NAV_ID}
                aria-label="Admin mobile navigation"
                className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l bg-background shadow-2xl"
              >
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{TEAM_NAME}</p>
                    <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">Admin dashboard</p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Close admin navigation"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4">
                  <div className="grid gap-1">
                    {ADMIN_LINKS.map((link) => {
                      const active = pathname === link.href;

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
                            active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                          )}
                          onClick={() => setOpen(false)}
                        >
                          <BarChart3 className="h-4 w-4" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </nav>
                <div className="border-t p-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
