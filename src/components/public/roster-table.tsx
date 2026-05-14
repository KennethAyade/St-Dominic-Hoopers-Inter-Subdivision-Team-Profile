import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlayerStatusBadge } from "@/components/public/status-badge";
import { fullName } from "@/lib/format";
import type { PlayerStatus } from "@/generated/prisma/browser";

export function RosterTable({
  entries,
}: {
  entries: {
    id: string;
    role: string;
    jerseyNumber?: string | null;
    notes?: string | null;
    category: { name: string; sport: { name: string } };
    player: {
      firstName: string;
      lastName: string;
      nickname?: string | null;
      status: PlayerStatus;
      seedNote?: string | null;
    };
  }[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Sport/category</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>No.</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-semibold">{fullName(entry.player)}</TableCell>
            <TableCell>{entry.category.name}</TableCell>
            <TableCell>{entry.role}</TableCell>
            <TableCell>{entry.jerseyNumber || "-"}</TableCell>
            <TableCell>
              <PlayerStatusBadge status={entry.player.status} />
            </TableCell>
            <TableCell className="max-w-xs text-muted-foreground">{entry.notes || entry.player.seedNote || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
