import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { standingEntryName } from "@/lib/standings";

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
    <>
      <div className="grid gap-3 md:hidden">
        {standings.map((standing) => (
          <article key={standing.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{standing.category.name}</p>
                <h3 className="mt-1 text-sm font-black leading-5">{standingEntryName(standing)}</h3>
              </div>
              <div className="rounded-md bg-secondary px-2.5 py-1 text-sm font-black text-secondary-foreground">
                #{standing.rank || "-"}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ["W", standing.wins],
                ["L", standing.losses],
                ["Pts", standing.points],
                ["Diff", standing.scoreDifference],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-muted px-2 py-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">{label}</p>
                  <p className="text-base font-black">{value}</p>
                </div>
              ))}
            </div>
            {standing.remarks ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{standing.remarks}</p> : null}
          </article>
        ))}
      </div>

      <Table containerClassName="hidden md:block">
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
              <TableCell className="font-semibold">{standingEntryName(standing)}</TableCell>
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
    </>
  );
}
