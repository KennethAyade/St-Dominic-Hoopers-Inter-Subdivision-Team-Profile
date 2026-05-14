import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper, Trophy, UsersRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TEAM_NAME, TOURNAMENT_NAME } from "@/lib/constants";
import { SiteShell } from "@/components/public/site-shell";
import { SportCard } from "@/components/public/sport-card";
import { AnnouncementCard } from "@/components/public/announcement-card";
import { ScheduleTable } from "@/components/public/schedule-table";
import { EmptyState } from "@/components/public/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, upcomingSchedules, announcements, playerCount] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      include: {
        sport: true,
        _count: { select: { rosterEntries: true, matchSchedules: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.matchSchedule.findMany({
      where: { status: { in: ["SCHEDULED", "ONGOING", "POSTPONED"] } },
      include: { category: true },
      orderBy: { matchDate: "asc" },
      take: 5,
    }),
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.player.count({ where: { status: { not: "REMOVED" } } }),
  ]);

  return (
    <SiteShell>
      <section className="relative isolate min-h-[72vh] overflow-hidden bg-slate-950 text-white">
        <Image src="/images/hero-court.png" alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/50 to-black/20" />
        <div className="relative mx-auto flex min-h-[72vh] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-5 bg-white text-slate-950 hover:bg-white">Official Team Portal</Badge>
            <h1 className="text-4xl font-black tracking-normal sm:text-6xl">{TEAM_NAME}</h1>
            <p className="mt-5 max-w-2xl text-lg text-white/85 sm:text-xl">
              Digital home for rosters, schedules, standings, announcements, and tournament updates for the {TOURNAMENT_NAME}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/sports">
                  View sports <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/schedules">Match schedule</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { label: "Sports categories", value: categories.length, icon: Trophy },
            { label: "Roster entries", value: categories.reduce((sum, category) => sum + category._count.rosterEntries, 0), icon: UsersRound },
            { label: "Registered players", value: playerCount, icon: UsersRound },
            { label: "Upcoming matches", value: upcomingSchedules.length, icon: CalendarDays },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-black">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-primary">Team overview</p>
          <h2 className="mt-3 text-3xl font-black tracking-normal">One subdivision, multiple competitive fronts.</h2>
        </div>
        <p className="text-base leading-7 text-muted-foreground">
          St. Dominic Hoopers represents the subdivision across basketball, esports, darts, and badminton for the Mayor&apos;s Cup / Inter-Subdivision tournament. This portal keeps players, families, supporters, and organizers aligned with verified rosters, fixtures, official notices, and standings as the festival progresses.
        </p>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-primary">Sports categories</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Participated events</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/sports">View all</Link>
            </Button>
          </div>
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
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-black tracking-normal">Upcoming matches</h2>
          </div>
          {upcomingSchedules.length ? <ScheduleTable schedules={upcomingSchedules} /> : <EmptyState title="No upcoming matches yet." description="Schedules will appear once the official bracket is confirmed." />}
        </div>
        <div>
          <div className="mb-5 flex items-center gap-3">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-black tracking-normal">Latest notices</h2>
          </div>
          <div className="grid gap-4">
            {announcements.length ? announcements.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />) : <EmptyState title="No announcements posted." />}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
