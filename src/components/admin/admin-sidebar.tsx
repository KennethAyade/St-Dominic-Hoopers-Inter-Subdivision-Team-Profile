"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BarChart3, LogOut } from "lucide-react";
import { ADMIN_LINKS, TEAM_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 border-r bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b p-6">
          <Link href="/admin" className="flex items-center gap-3 font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
              SDH
            </span>
            <span>{TEAM_NAME}</span>
          </Link>
          <p className="mt-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">Admin dashboard</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
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
              >
                <BarChart3 className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}
