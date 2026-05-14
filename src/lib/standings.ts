type StandingLike = {
  rank: number;
  points: number;
  teamName?: string | null;
  playerName?: string | null;
  player?: { firstName: string; lastName: string } | null;
};

export function standingEntryName(standing: StandingLike) {
  if (standing.teamName) return standing.teamName;
  if (standing.playerName) return standing.playerName;
  if (standing.player) return `${standing.player.firstName} ${standing.player.lastName}`;

  return "Entry";
}

export function compareStandings(a: StandingLike, b: StandingLike) {
  const aRanked = a.rank > 0;
  const bRanked = b.rank > 0;

  if (aRanked !== bRanked) return aRanked ? -1 : 1;
  if (aRanked && bRanked && a.rank !== b.rank) return a.rank - b.rank;
  if (a.points !== b.points) return b.points - a.points;

  return standingEntryName(a).localeCompare(standingEntryName(b));
}

export function sortStandings<T extends StandingLike>(standings: T[]) {
  return [...standings].sort(compareStandings);
}
