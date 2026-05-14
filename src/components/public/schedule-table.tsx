import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MatchStatusBadge } from "@/components/public/status-badge";
import { formatDateTime } from "@/lib/format";
import { formatScheduleResult } from "@/lib/matchup";
import { getEffectiveScheduleStatus } from "@/lib/schedule-status";
import type { MatchStatus } from "@/generated/prisma/browser";

export function ScheduleTable({
  schedules,
}: {
  schedules: {
    id: string;
    opponentName: string;
    matchDate: Date;
    venue: string;
    status: MatchStatus;
    homeScore?: number | null;
    opponentScore?: number | null;
    resultText?: string | null;
    remarks?: string | null;
    category: { name: string };
  }[];
}) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {schedules.map((schedule) => (
          <article key={schedule.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{schedule.category.name}</p>
                <h3 className="mt-1 text-sm font-black leading-5">{schedule.opponentName}</h3>
              </div>
              <MatchStatusBadge status={getEffectiveScheduleStatus(schedule)} />
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Date</span>
                <span className="text-right font-semibold">{formatDateTime(schedule.matchDate)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Venue</span>
                <span className="text-right font-semibold">{schedule.venue}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Result</span>
                <span className="text-right font-semibold">{formatScheduleResult(schedule)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Table containerClassName="hidden md:block">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Match / opponent</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">{formatDateTime(schedule.matchDate)}</TableCell>
              <TableCell>{schedule.category.name}</TableCell>
              <TableCell>{schedule.opponentName}</TableCell>
              <TableCell>{schedule.venue}</TableCell>
              <TableCell>
                <MatchStatusBadge status={getEffectiveScheduleStatus(schedule)} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatScheduleResult(schedule)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
