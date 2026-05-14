import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/public/site-shell";
import { PageHeader } from "@/components/public/page-header";
import { EmptyState } from "@/components/public/empty-state";
import { RosterProfileGrid } from "@/components/public/roster-profile-grid";
import { ScheduleTable } from "@/components/public/schedule-table";
import { StandingTable } from "@/components/public/standing-table";
import { AnnouncementCard } from "@/components/public/announcement-card";

export const dynamic = "force-dynamic";

export default async function SportDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, announcements] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: {
        sport: true,
        rosterEntries: {
          include: { player: true, category: { include: { sport: true } } },
          orderBy: [{ role: "asc" }, { player: { lastName: "asc" } }],
        },
        matchSchedules: { include: { category: true }, orderBy: { matchDate: "asc" } },
        standings: { include: { category: true, player: true }, orderBy: [{ rank: "asc" }, { points: "desc" }] },
      },
    }),
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
  ]);

  if (!category) notFound();

  const completed = category.matchSchedules.filter((schedule) => schedule.status === "COMPLETED");

  return (
    <SiteShell>
      <PageHeader
        eyebrow={category.sport.name}
        title={category.name}
        description={category.description || "Official roster, schedules, results, standings, and notes for this category."}
      />
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-12 sm:px-6 lg:px-8">
        <div>
          <h2 className="mb-4 text-2xl font-black tracking-normal">Roster / player list</h2>
          {category.rosterEntries.length ? (
            <RosterProfileGrid entries={category.rosterEntries} />
          ) : (
            <EmptyState title="Roster will be updated soon." description="Admins can add roster entries from the dashboard when the lineup is finalized." />
          )}
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-black tracking-normal">Schedule / matches</h2>
          {category.matchSchedules.length ? <ScheduleTable schedules={category.matchSchedules} /> : <EmptyState title="No matches posted yet." />}
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-black tracking-normal">Results</h2>
          {completed.length ? <ScheduleTable schedules={completed} /> : <EmptyState title="Results will be posted after completed matches." />}
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-black tracking-normal">Standings</h2>
          {category.standings.length ? <StandingTable standings={category.standings} /> : <EmptyState title="Standings will be updated soon." />}
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-black tracking-normal">Notes and announcements</h2>
          {announcements.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          ) : (
            <EmptyState title="No notes posted yet." />
          )}
        </div>
      </section>
    </SiteShell>
  );
}
