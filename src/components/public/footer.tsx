import Link from "next/link";
import { NAV_LINKS, TEAM_NAME, TOURNAMENT_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_2fr] lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-3 font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
              SDH
            </span>
            {TEAM_NAME}
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Official subdivision team portal for the {TOURNAMENT_NAME}.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground" href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link className="text-sm font-medium text-muted-foreground hover:text-foreground" href="/login">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
