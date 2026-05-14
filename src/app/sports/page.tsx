import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/public/site-shell";
import { PageHeader } from "@/components/public/page-header";
import { SportCard } from "@/components/public/sport-card";
import { EmptyState } from "@/components/public/empty-state";

export const dynamic = "force-dynamic";

export default async function SportsPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      sport: true,
      _count: { select: { rosterEntries: true, matchSchedules: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Sports"
        title="Participated sports and categories"
        description="Browse each St. Dominic Hoopers category page for rosters, fixtures, results, standings, and notes."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {categories.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <SportCard
                key={category.id}
                name={category.name}
                sportName={category.sport.name}
                slug={category.slug}
                description={category.description}
                rosterCount={category._count.rosterEntries}
                scheduleCount={category._count.matchSchedules}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="Sports will be updated soon." />
        )}
      </section>
    </SiteShell>
  );
}
