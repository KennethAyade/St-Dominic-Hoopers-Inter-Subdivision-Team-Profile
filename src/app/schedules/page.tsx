import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/public/site-shell";
import { PageHeader } from "@/components/public/page-header";
import { ScheduleTable } from "@/components/public/schedule-table";
import { EmptyState } from "@/components/public/empty-state";

export const dynamic = "force-dynamic";

export default async function SchedulesPage() {
  const [upcoming, completed] = await Promise.all([
    prisma.matchSchedule.findMany({
      where: { status: { in: ["SCHEDULED", "ONGOING", "POSTPONED"] } },
      include: { category: true },
      orderBy: { matchDate: "asc" },
    }),
    prisma.matchSchedule.findMany({
      where: { status: { in: ["COMPLETED", "CANCELLED"] } },
      include: { category: true },
      orderBy: { matchDate: "desc" },
    }),
  ]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Schedules"
        title="Upcoming and completed matches"
        description="Track all confirmed fixtures with status badges for scheduled, ongoing, completed, cancelled, and postponed matches."
      />
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h2 className="mb-4 text-2xl font-black tracking-normal">Upcoming</h2>
          {upcoming.length ? <ScheduleTable schedules={upcoming} /> : <EmptyState title="No upcoming matches yet." />}
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-black tracking-normal">Completed / closed</h2>
          {completed.length ? <ScheduleTable schedules={completed} /> : <EmptyState title="Completed matches will appear here." />}
        </div>
      </section>
    </SiteShell>
  );
}
