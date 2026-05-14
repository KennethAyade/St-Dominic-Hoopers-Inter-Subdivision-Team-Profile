import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/public/site-shell";
import { PageHeader } from "@/components/public/page-header";
import { StandingTable } from "@/components/public/standing-table";
import { EmptyState } from "@/components/public/empty-state";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      sport: true,
      standings: { include: { category: true, player: true }, orderBy: [{ rank: "asc" }, { points: "desc" }] },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Standings"
        title="Tournament standings"
        description="Team-based and individual standings are maintained per sport/category by the admin team."
      />
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-12 sm:px-6 lg:px-8">
        {categories.map((category) => (
          <div key={category.id}>
            <h2 className="mb-4 text-2xl font-black tracking-normal">{category.name}</h2>
            {category.standings.length ? <StandingTable standings={category.standings} /> : <EmptyState title="Standings will be updated soon." />}
          </div>
        ))}
      </section>
    </SiteShell>
  );
}
