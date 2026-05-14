import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/public/site-shell";
import { PageHeader } from "@/components/public/page-header";
import { RosterTable } from "@/components/public/roster-table";
import { EmptyState } from "@/components/public/empty-state";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function RostersPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [categories, entries] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, include: { sport: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.rosterEntry.findMany({
      where: category ? { category: { slug: category } } : undefined,
      include: { player: true, category: { include: { sport: true } } },
      orderBy: [{ category: { sortOrder: "asc" } }, { role: "asc" }, { player: { lastName: "asc" } }],
    }),
  ]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Rosters"
        title="Official player rosters"
        description="Filter by sport/category to view active roster entries and team roles."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <Button asChild variant={!category ? "default" : "outline"} size="sm">
            <Link href="/rosters">All</Link>
          </Button>
          {categories.map((item) => (
            <Button key={item.id} asChild variant={category === item.slug ? "default" : "outline"} size="sm">
              <Link href={`/rosters?category=${item.slug}`}>{item.name}</Link>
            </Button>
          ))}
        </div>
        {entries.length ? <RosterTable entries={entries} /> : <EmptyState title="Roster will be updated soon." />}
      </section>
    </SiteShell>
  );
}
