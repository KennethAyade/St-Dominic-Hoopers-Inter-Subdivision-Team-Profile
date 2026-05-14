import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MatchStatusBadge } from "@/components/public/status-badge";
import { formatDateTime } from "@/lib/format";
import { formatScheduleResult } from "@/lib/matchup";
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
    <Table>
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
              <MatchStatusBadge status={schedule.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">{formatScheduleResult(schedule)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
