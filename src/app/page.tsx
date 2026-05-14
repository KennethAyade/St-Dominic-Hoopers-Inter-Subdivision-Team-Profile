import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, ShieldCheck, Trophy, UsersRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TEAM_NAME, TOURNAMENT_NAME } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatScheduleResult } from "@/lib/matchup";
import { RESULT_OR_COMPLETED_MATCHES_WHERE, UPCOMING_MATCHES_WHERE } from "@/lib/schedule-query";
import { SiteShell } from "@/components/public/site-shell";
import { EmptyState } from "@/components/public/empty-state";
import { AnnouncementCategoryBadge, MatchStatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, upcomingSchedules, announcements, recentResults, playerCount] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      include: {
        sport: true,
        _count: { select: { rosterEntries: true, matchSchedules: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.matchSchedule.findMany({
      where: UPCOMING_MATCHES_WHERE,
      include: { category: true },
      orderBy: { matchDate: "asc" },
      take: 3,
    }),
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.matchSchedule.findMany({
      where: RESULT_OR_COMPLETED_MATCHES_WHERE,
      include: { category: true },
      orderBy: { matchDate: "desc" },
      take: 3,
    }),
    prisma.player.count({ where: { status: { not: "REMOVED" } } }),
  ]);

  const nextGame = upcomingSchedules[0];
  const rosterEntryCount = categories.reduce((sum, category) => sum + category._count.rosterEntries, 0);

  return (
    <SiteShell>
      <section className="border-b border-green-900/10 bg-linear-to-br from-[#0f3d24] via-[#14532d] to-[#1f7a3d] text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100">Official Team Portal</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-normal sm:text-6xl">{TEAM_NAME}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/90">
              A clean tournament hub for verified rosters, fixtures, results, standings, gallery updates, and official notices for the {TOURNAMENT_NAME}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-emerald-50">
                <Link href="/rosters">
                  View roster <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/15">
                <Link href="/schedules">Match schedule</Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/15 bg-white/10 text-white shadow-xl backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-yellow-300 text-green-950">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-normal text-emerald-50">Next match</p>
                  <p className="text-xs text-emerald-50/75">Updated by team admins</p>
                </div>
              </div>
              {nextGame ? (
                <div>
                  <div className="mb-4">
                    <MatchStatusBadge status={nextGame.status} />
                  </div>
                  <h2 className="text-xl font-black">{nextGame.category.name}</h2>
                  <p className="mt-2 text-sm font-semibold text-emerald-50">vs {nextGame.opponentName}</p>
                  <p className="mt-3 text-sm text-emerald-50/80">{formatDateTime(nextGame.matchDate)}</p>
                  <p className="mt-1 text-sm text-emerald-50/80">{nextGame.venue}</p>
                </div>
              ) : (
                <p className="text-sm leading-6 text-emerald-50/80">Next official fixture will be posted once confirmed.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Sports joined", value: categories.length, icon: Trophy },
            { label: "Players listed", value: playerCount, icon: UsersRound },
            { label: "Roster entries", value: rosterEntryCount, icon: ShieldCheck },
            { label: "Upcoming matches", value: upcomingSchedules.length, icon: CalendarDays },
          ].map((item) => (
            <Card key={item.label} className="border-green-100 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-primary">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Competition</p>
              <h2 className="mt-2 text-2xl font-black">Sports categories</h2>
            </div>
            <Link href="/sports" className="text-sm font-black text-emerald-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/sports/${category.slug}`}>
                <Card className="border-green-100 bg-white shadow-sm transition-colors hover:border-emerald-300">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <h3 className="font-black">{category.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {category.sport.name} · {category._count.rosterEntries} roster entries · {category._count.matchSchedules} matches
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-emerald-700" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Official notices</p>
              <h2 className="mt-2 text-2xl font-black">Latest updates</h2>
            </div>
            <Link href="/announcements" className="text-sm font-black text-emerald-700 hover:underline">
              See all
            </Link>
          </div>
          <div className="grid gap-3">
            {announcements.length ? (
              announcements.map((announcement) => (
                <Link key={announcement.id} href={`/announcements/${announcement.slug}`}>
                  <Card className="border-green-100 bg-white shadow-sm transition-colors hover:border-emerald-300">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <AnnouncementCategoryBadge category={announcement.category} />
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatDate(announcement.publishedAt || announcement.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-black leading-tight">{announcement.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{announcement.content}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <EmptyState title="No announcements posted." />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Results</p>
            <h2 className="mt-2 text-2xl font-black">Recent results</h2>
          </div>
          <Link href="/schedules" className="text-sm font-black text-emerald-700 hover:underline">
            Events
          </Link>
        </div>
        {recentResults.length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {recentResults.map((match) => (
              <Card key={match.id} className="border-green-100 bg-white shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{match.category.name}</p>
                  <h3 className="mt-2 font-black">vs {match.opponentName}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(match.matchDate)}</p>
                  <p className="mt-4 text-lg font-black text-primary">{formatScheduleResult(match)}</p>
                  <p className="text-xs font-black uppercase text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Recent results will appear here." />
        )}
      </section>
    </SiteShell>
  );
}
