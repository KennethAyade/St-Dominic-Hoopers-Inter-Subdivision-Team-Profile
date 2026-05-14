import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function StandingTable({
  standings,
}: {
  standings: {
    id: string;
    teamName?: string | null;
    playerName?: string | null;
    wins: number;
    losses: number;
    points: number;
    rank: number;
    scoreDifference: number;
    remarks?: string | null;
    category: { name: string };
    player?: { firstName: string; lastName: string } | null;
  }[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Entry</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>W</TableHead>
          <TableHead>L</TableHead>
          <TableHead>Pts</TableHead>
          <TableHead>Diff</TableHead>
          <TableHead>Remarks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((standing) => (
          <TableRow key={standing.id}>
            <TableCell className="font-bold">{standing.rank || "-"}</TableCell>
            <TableCell className="font-semibold">
              {standing.teamName || standing.playerName || (standing.player ? `${standing.player.firstName} ${standing.player.lastName}` : "Entry")}
            </TableCell>
            <TableCell>{standing.category.name}</TableCell>
            <TableCell>{standing.wins}</TableCell>
            <TableCell>{standing.losses}</TableCell>
            <TableCell>{standing.points}</TableCell>
            <TableCell>{standing.scoreDifference}</TableCell>
            <TableCell className="text-muted-foreground">{standing.remarks || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
