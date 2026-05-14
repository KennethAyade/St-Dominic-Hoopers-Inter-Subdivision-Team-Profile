type ScheduleResultInput = {
  opponentName: string;
  homeScore?: number | null;
  opponentScore?: number | null;
  resultText?: string | null;
  remarks?: string | null;
};

export function parseMatchupTeams(matchup: string) {
  const parts = matchup
    .split(/\s+vs\.?\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length !== 2) return null;

  return { teamA: parts[0], teamB: parts[1] };
}

export function getScoreLabelsForMatchup(matchup: string) {
  const teams = parseMatchupTeams(matchup);

  return {
    teamAScoreLabel: `${teams?.teamA ?? "Team A"} score`,
    teamBScoreLabel: `${teams?.teamB ?? "Team B"} score`,
  };
}

export function formatScheduleResult(schedule: ScheduleResultInput) {
  const resultText = schedule.resultText?.trim();
  if (resultText) return resultText;

  if (schedule.homeScore !== null && schedule.homeScore !== undefined) {
    const score = `${schedule.homeScore} - ${schedule.opponentScore ?? 0}`;
    const teams = parseMatchupTeams(schedule.opponentName);

    return teams ? `${teams.teamA} ${score} ${teams.teamB}` : score;
  }

  return schedule.remarks?.trim() || "-";
}
