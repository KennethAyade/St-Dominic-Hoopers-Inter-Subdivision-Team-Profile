import Link from "next/link";
import { CalendarDays, Megaphone, Trophy, UsersRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { formatScheduleResult } from "@/lib/matchup";
import { RESULT_OR_COMPLETED_MATCHES_WHERE, UPCOMING_MATCHES_WHERE } from "@/lib/schedule-query";
import { getEffectiveScheduleStatus } from "@/lib/schedule-status";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchStatusBadge } from "@/components/public/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/public/empty-state";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [players, categories, upcomingMatches, publishedAnnouncements, recentResults] = await Promise.all([
    prisma.player.count(),
    prisma.category.count(),
    prisma.matchSchedule.count({ where: UPCOMING_MATCHES_WHERE }),
    prisma.announcement.count({ where: { published: true } }),
    prisma.matchSchedule.findMany({
      where: RESULT_OR_COMPLETED_MATCHES_WHERE,
      include: { category: true },
      orderBy: { matchDate: "desc" },
      take: 6,
    }),
  ]);

  const summary = [
    { label: "Total players", value: players, href: "/admin/players", icon: UsersRound },
    { label: "Sports/categories", value: categories, href: "/admin/sports", icon: Trophy },
    { label: "Upcoming matches", value: upcomingMatches, href: "/admin/schedules", icon: CalendarDays },
    { label: "Published notices", value: publishedAnnouncements, href: "/admin/announcements", icon: Megaphone },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Manage tournament data for the St. Dominic Hoopers portal." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-3xl font-black">{item.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <item.icon className="h-6 w-6" />
              </div>
            </CardContent>
            <div className="border-t px-5 py-3">
              <Button asChild variant="link" className="h-auto p-0">
                <Link href={item.href}>Manage</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent results</CardTitle>
        </CardHeader>
        <CardContent>
          {recentResults.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentResults.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{formatDateTime(match.matchDate)}</TableCell>
                    <TableCell>{match.category.name}</TableCell>
                    <TableCell>{match.opponentName}</TableCell>
                    <TableCell>
                      <MatchStatusBadge status={getEffectiveScheduleStatus(match)} />
                    </TableCell>
                    <TableCell>{formatScheduleResult(match)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No completed results yet." />
          )}
        </CardContent>
      </Card>
    </>
  );
}
