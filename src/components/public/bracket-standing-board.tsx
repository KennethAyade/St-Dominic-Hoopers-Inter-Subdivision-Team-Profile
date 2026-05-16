import { Badge } from "@/components/ui/badge";
import { StandingTable } from "@/components/public/standing-table";
import { type StandingBracketLayout, type StandingBracketTeam } from "@/lib/standing-brackets";
import { standingEntryName } from "@/lib/standings";
import { cn } from "@/lib/utils";

type BracketStanding = {
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
};

type BracketRow = {
  seed: number;
  teamName: string;
  standing?: BracketStanding;
  wins: number;
  losses: number;
  points: number;
  scoreDifference: number;
};

function normalizeTeamName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function hasActivity(row: BracketRow) {
  return row.wins !== 0 || row.losses !== 0 || row.points !== 0 || row.scoreDifference !== 0 || (row.standing?.rank ?? 0) > 0;
}

function compareBracketRows(a: BracketRow, b: BracketRow) {
  if (a.points !== b.points) return b.points - a.points;
  if (a.scoreDifference !== b.scoreDifference) return b.scoreDifference - a.scoreDifference;
  if (a.wins !== b.wins) return b.wins - a.wins;
  if (a.losses !== b.losses) return a.losses - b.losses;

  return a.seed - b.seed;
}

function findStandingForTeam(team: StandingBracketTeam, standingsByName: Map<string, BracketStanding>) {
  const names = [team.name, ...(team.aliases ?? [])];

  for (const name of names) {
    const standing = standingsByName.get(normalizeTeamName(name));
    if (standing) return standing;
  }

  return undefined;
}

function toBracketRow(team: StandingBracketTeam, seed: number, standingsByName: Map<string, BracketStanding>): BracketRow {
  const standing = findStandingForTeam(team, standingsByName);

  return {
    seed,
    teamName: team.name,
    standing,
    wins: standing?.wins ?? 0,
    losses: standing?.losses ?? 0,
    points: standing?.points ?? 0,
    scoreDifference: standing?.scoreDifference ?? 0,
  };
}

export function BracketStandingBoard({
  layout,
  standings,
}: {
  layout: StandingBracketLayout;
  standings: BracketStanding[];
}) {
  const standingsByName = new Map<string, BracketStanding>();
  standings.forEach((standing) => {
    standingsByName.set(normalizeTeamName(standingEntryName(standing)), standing);
  });

  const usedStandingIds = new Set<string>();
  const groups = layout.groups.map((group) => {
    const seededRows = group.teams.map((team, index) => toBracketRow(team, index + 1, standingsByName));
    seededRows.forEach((row) => {
      if (row.standing) usedStandingIds.add(row.standing.id);
    });

    const groupHasActivity = seededRows.some(hasActivity);
    const rows = groupHasActivity ? [...seededRows].sort(compareBracketRows) : seededRows;

    return { ...group, rows, groupHasActivity };
  });
  const unassignedStandings = standings.filter((standing) => !usedStandingIds.has(standing.id));
  const gridColumns = layout.groups.length > 2 ? "lg:grid-cols-4" : "md:grid-cols-2";

  return (
    <div className="grid min-w-0 gap-5">
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Official bracket layout</p>
            <h3 className="mt-2 text-xl font-black tracking-normal">{layout.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{layout.description}</p>
          </div>
          <Badge variant="success" className="w-fit shrink-0">
            Top {layout.advancingPerGroup} advance
          </Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {layout.formatNotes.map((note) => (
            <span key={note} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {note}
            </span>
          ))}
        </div>
      </div>

      <div className={cn("grid min-w-0 gap-4 md:grid-cols-2", gridColumns)}>
        {groups.map((group) => (
          <article key={group.name} className="min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-secondary px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-black tracking-normal">{group.name}</h3>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {group.groupHasActivity ? "Current group order" : "Bracket order pending official results"}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-xs font-black text-primary-foreground">
                  Top {layout.advancingPerGroup}
                </span>
              </div>
            </div>

            <div className="divide-y divide-border">
              {group.rows.map((row, index) => {
                const isQualifying = group.groupHasActivity && index < layout.advancingPerGroup;

                return (
                  <div key={row.teamName} className="grid min-w-0 gap-3 p-4">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-sm font-black text-primary">
                          {row.seed}
                        </span>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-black">{row.teamName}</h4>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {group.groupHasActivity ? `Group rank ${index + 1}` : `Bracket seed ${row.seed}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isQualifying ? "success" : group.groupHasActivity ? "muted" : "outline"} className="shrink-0">
                        {isQualifying ? "Qualifying" : group.groupHasActivity ? "Chasing" : "Pending"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        ["W", row.wins],
                        ["L", row.losses],
                        ["Pts", row.points],
                        ["Diff", row.scoreDifference],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-md bg-muted px-2 py-2">
                          <p className="text-[10px] font-black uppercase text-muted-foreground">{label}</p>
                          <p className="text-sm font-black">{value}</p>
                        </div>
                      ))}
                    </div>

                    {row.standing?.remarks ? <p className="text-xs leading-5 text-muted-foreground">{row.standing.remarks}</p> : null}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      {unassignedStandings.length ? (
        <div className="min-w-0 rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-black tracking-normal">Unassigned entries</h3>
            <p className="mt-1 text-sm text-muted-foreground">These standings are not listed in the official bracket poster yet.</p>
          </div>
          <StandingTable standings={unassignedStandings} />
        </div>
      ) : null}
    </div>
  );
}

