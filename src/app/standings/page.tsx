import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/public/site-shell";
import { PageHeader } from "@/components/public/page-header";
import { StandingTable } from "@/components/public/standing-table";
import { BracketStandingBoard } from "@/components/public/bracket-standing-board";
import { EmptyState } from "@/components/public/empty-state";
import { CategoryFilterBar } from "@/components/public/category-filter-bar";
import { getStandingBracketLayout } from "@/lib/standing-brackets";
import { sortStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export default async function StandingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params?.category;
  const filterCategories = await prisma.category.findMany({
    where: { isActive: true, standings: { some: {} } },
    include: { _count: { select: { standings: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const activeCategory = filterCategories.find((category) => category.slug === categorySlug);

  const categories = await prisma.category.findMany({
    where: activeCategory ? { id: activeCategory.id } : { isActive: true, standings: { some: {} } },
    include: {
      sport: true,
      standings: { include: { category: true, player: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const sortedCategories = categories.map((category) => ({ ...category, standings: sortStandings(category.standings) }));

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Standings"
        title="Tournament standings"
        description="Team-based and individual standings are maintained per sport/category by the admin team."
      />
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-12 sm:px-6 lg:px-8">
        <CategoryFilterBar
          basePath="/standings"
          activeSlug={activeCategory?.slug}
          categories={filterCategories.map((category) => ({
            slug: category.slug,
            name: category.name,
            count: category._count.standings,
          }))}
        />
        {sortedCategories.map((category) => {
          const bracketLayout = getStandingBracketLayout(category.slug);

          return (
            <div key={category.id} className="min-w-0">
              <h2 className="mb-4 text-2xl font-black tracking-normal">{category.name}</h2>
              {category.standings.length ? (
                bracketLayout ? (
                  <BracketStandingBoard layout={bracketLayout} standings={category.standings} />
                ) : (
                  <StandingTable standings={category.standings} />
                )
              ) : (
                <EmptyState title="Standings will be updated soon." />
              )}
            </div>
          );
        })}
      </section>
    </SiteShell>
  );
}
