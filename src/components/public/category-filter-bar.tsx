import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CategoryFilter = {
  slug: string;
  name: string;
  count?: number;
};

export function CategoryFilterBar({
  basePath,
  categories,
  activeSlug,
  label = "Filter by category",
}: {
  basePath: string;
  categories: CategoryFilter[];
  activeSlug?: string;
  label?: string;
}) {
  if (!categories.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant={!activeSlug ? "default" : "outline"} className="h-9">
          <Link href={basePath}>All</Link>
        </Button>
        {categories.map((category) => {
          const active = category.slug === activeSlug;

          return (
            <Button
              key={category.slug}
              asChild
              size="sm"
              variant={active ? "default" : "outline"}
              className={cn("h-9 gap-2", active && "shadow-none")}
            >
              <Link href={`${basePath}?category=${category.slug}`}>
                <span>{category.name}</span>
                {category.count !== undefined ? (
                  <Badge variant={active ? "secondary" : "outline"} className="h-5 min-w-6 justify-center px-1.5 text-[11px]">
                    {category.count}
                  </Badge>
                ) : null}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
