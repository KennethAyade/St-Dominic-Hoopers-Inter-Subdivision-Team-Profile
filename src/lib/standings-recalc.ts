import { MatchStatus, type PrismaClient } from "../generated/prisma/client";
import { parseMatchupTeams } from "./matchup";

type CategoryInfo = {
  id: string;
  name: string;
  slug: string;
  sport: { name: string; slug: string };
};

type StandingRow = {
  id: string;
  categoryId: string;
  playerId: string | null;
  teamName: string | null;
  playerName: string | null;
  wins: number;
  losses: number;
  points: number;
  rank: number;
  scoreDifference: number;
  manualWinsDelta: number;
  manualLossesDelta: number;
  manualPointsDelta: number;
  manualScoreDifferenceDelta: number;
  manualRankOverride: number | null;
  remarks: string | null;
  updatedById: string | null;
  player?: { firstName: string; lastName: string } | null;
};

type BaseStats = {
  teamName: string;
  wins: number;
  losses: number;
  points: number;
  scoreDifference: number;
};

export type StandingBaseline = BaseStats & {
  rank: number;
};

type CategoryBaseline = {
  category: CategoryInfo;
  hasStandingImpact: boolean;
  byKey: Map<string, StandingBaseline>;
};

const ZERO_BASE: BaseStats = {
  teamName: "",
  wins: 0,
  losses: 0,
  points: 0,
  scoreDifference: 0,
};

const cleanName = (value: string) => value.trim().replace(/\s+/g, " ");

const normalizeKey = (value: string) =>
  cleanName(value)
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

function categoryContext(input: Pick<CategoryInfo, "slug" | "sport">) {
  return {
    isMlbb: input.slug === "mobile-legends" || input.sport.slug === "mobile-legends",
    isBasketball: input.sport.slug === "basketball" || input.slug.startsWith("basketball-"),
  };
}

export function normalizeStandingTeamName(value: string, category: CategoryInfo) {
  const name = cleanName(value);
  const key = normalizeKey(name);
  const context = categoryContext(category);

  if (context.isMlbb) {
    const mlbbAliases: Record<string, string> = {
      "st dominic": "St. Dominic Hoopers",
      "st dominic hoopers": "St. Dominic Hoopers",
      "bf better living": "BF Better Living",
      camella: "Camella",
      sunrise: "Sunrise",
      "happy homes": "Happy Homes",
      "pacific grande 1": "Pacific Grande 1",
    };

    return mlbbAliases[key] ?? name;
  }

  if (context.isBasketball) {
    const basketballAliases: Record<string, string> = {
      camella: "Camella Homes",
      "camella homes": "Camella Homes",
      bali: "Bali Residences",
      "bali residences": "Bali Residences",
      sunrise: "Sunrise Place",
      "sunrise place": "Sunrise Place",
      portville: "Portville Prime",
      "portville prime": "Portville Prime",
    };
    const stDominic3x3Aliases = new Set([
      "st dominic",
      "st dominics place",
      "st dominic s place",
      "st dominic st dominic s place",
      "st dominic st dominics place",
    ]);

    if (category.slug === "basketball-3x3-14-under" && stDominic3x3Aliases.has(key)) {
      return "St. Dominic / St. Dominic's Place";
    }

    if (key === "st dominic" || key === "st dominics place" || key === "st dominic s place") {
      return "St. Dominic";
    }

    return basketballAliases[key] ?? name;
  }

  return name;
}

export function standingEntryNameForRecalc(standing: StandingRow) {
  if (standing.teamName) return standing.teamName;
  if (standing.playerName) return standing.playerName;
  if (standing.player) return `${standing.player.firstName} ${standing.player.lastName}`;

  return "Entry";
}

function emptyStats(teamName: string): BaseStats {
  return { ...ZERO_BASE, teamName };
}

function addStats(stats: Map<string, BaseStats>, teamName: string, category: CategoryInfo) {
  const normalizedName = normalizeStandingTeamName(teamName, category);
  const key = normalizeKey(normalizedName);
  const existing = stats.get(key);

  if (existing) return existing;

  const created = emptyStats(normalizedName);
  stats.set(key, created);
  return created;
}

function applyResult(input: {
  category: CategoryInfo;
  teamAStats: BaseStats;
  teamBStats: BaseStats;
  teamAScore: number;
  teamBScore: number;
}) {
  const { category, teamAStats, teamBStats, teamAScore, teamBScore } = input;
  teamAStats.scoreDifference += teamAScore - teamBScore;
  teamBStats.scoreDifference += teamBScore - teamAScore;

  if (teamAScore === teamBScore) return false;

  const teamAWon = teamAScore > teamBScore;
  const winner = teamAWon ? teamAStats : teamBStats;
  const loser = teamAWon ? teamBStats : teamAStats;
  const winnerScore = teamAWon ? teamAScore : teamBScore;
  const loserScore = teamAWon ? teamBScore : teamAScore;
  const isMlbb = categoryContext(category).isMlbb;

  winner.wins += 1;
  loser.losses += 1;

  if (isMlbb) {
    if (winnerScore === 2 && loserScore === 0) {
      winner.points += 3;
    } else if (winnerScore === 2 && loserScore === 1) {
      winner.points += 2;
      loser.points += 1;
    } else {
      winner.points += 1;
    }
  } else {
    winner.points += 1;
  }

  return true;
}

function sortStatsForRank(a: BaseStats, b: BaseStats) {
  return (
    b.points - a.points ||
    b.scoreDifference - a.scoreDifference ||
    b.wins - a.wins ||
    a.losses - b.losses ||
    a.teamName.localeCompare(b.teamName)
  );
}

function baseWithRank(stats: Map<string, BaseStats>, hasStandingImpact: boolean): Map<string, StandingBaseline> {
  const sorted = [...stats.entries()].sort(([, a], [, b]) => sortStatsForRank(a, b));

  return new Map(
    sorted.map(([key, row], index) => [
      key,
      {
        ...row,
        rank: hasStandingImpact ? index + 1 : 0,
      },
    ]),
  );
}

async function getCategory(prisma: PrismaClient, categoryId: string) {
  return prisma.category.findUniqueOrThrow({
    where: { id: categoryId },
    include: { sport: true },
  });
}

async function cleanupLegacyBlankStandingRows(prisma: PrismaClient, category: CategoryInfo) {
  if (category.slug !== "basketball-open-category") return;

  const rows = await prisma.standing.findMany({
    where: {
      categoryId: category.id,
      teamName: { in: ["St. Dominic", "St. Dominic Hoopers"] },
    },
  });
  const official = rows.find((row) => row.teamName === "St. Dominic");
  const legacy = rows.find((row) => row.teamName === "St. Dominic Hoopers");

  if (!official || !legacy) return;

  const hasStats =
    legacy.wins !== 0 ||
    legacy.losses !== 0 ||
    legacy.points !== 0 ||
    legacy.rank !== 0 ||
    legacy.scoreDifference !== 0 ||
    legacy.manualWinsDelta !== 0 ||
    legacy.manualLossesDelta !== 0 ||
    legacy.manualPointsDelta !== 0 ||
    legacy.manualScoreDifferenceDelta !== 0 ||
    legacy.manualRankOverride !== null;
  const hasCustomRemark =
    legacy.remarks &&
    !legacy.remarks.toLowerCase().includes("standings will update") &&
    !legacy.remarks.toLowerCase().includes("official results");

  if (!hasStats && !hasCustomRemark) {
    await prisma.standing.delete({ where: { id: legacy.id } });
  }
}

export async function calculateCategoryStandingBaselines(
  prisma: PrismaClient,
  categoryId: string,
  extraEntries: string[] = [],
): Promise<CategoryBaseline> {
  const category = await getCategory(prisma, categoryId);
  const schedules = await prisma.matchSchedule.findMany({
    where: {
      categoryId,
      status: { notIn: [MatchStatus.CANCELLED, MatchStatus.POSTPONED] },
      homeScore: { not: null },
      opponentScore: { not: null },
    },
    orderBy: { matchDate: "asc" },
  });
  const standings = await prisma.standing.findMany({
    where: { categoryId },
    include: { player: true },
  });
  const stats = new Map<string, BaseStats>();
  let hasStandingImpact = false;

  for (const standing of standings) {
    const entryName = normalizeStandingTeamName(standingEntryNameForRecalc(standing), category);
    const key = normalizeKey(entryName);
    if (!stats.has(key)) stats.set(key, emptyStats(entryName));
  }

  for (const entry of extraEntries) {
    const entryName = normalizeStandingTeamName(entry, category);
    const key = normalizeKey(entryName);
    if (!stats.has(key)) stats.set(key, emptyStats(entryName));
  }

  for (const schedule of schedules) {
    const teams = parseMatchupTeams(schedule.opponentName);
    if (!teams || schedule.homeScore === null || schedule.opponentScore === null) continue;

    const teamAStats = addStats(stats, teams.teamA, category);
    const teamBStats = addStats(stats, teams.teamB, category);
    const impacted = applyResult({
      category,
      teamAStats,
      teamBStats,
      teamAScore: schedule.homeScore,
      teamBScore: schedule.opponentScore,
    });

    if (impacted) hasStandingImpact = true;
  }

  return {
    category,
    hasStandingImpact,
    byKey: baseWithRank(stats, hasStandingImpact),
  };
}

function adjustedStandingStats(standing: StandingRow, baseline: StandingBaseline) {
  return {
    wins: Math.max(0, baseline.wins + standing.manualWinsDelta),
    losses: Math.max(0, baseline.losses + standing.manualLossesDelta),
    points: baseline.points + standing.manualPointsDelta,
    scoreDifference: baseline.scoreDifference + standing.manualScoreDifferenceDelta,
  };
}

export async function recalculateCategoryStandings(prisma: PrismaClient, categoryId: string, userId?: string | null) {
  const category = await getCategory(prisma, categoryId);
  await cleanupLegacyBlankStandingRows(prisma, category);

  const baselines = await calculateCategoryStandingBaselines(prisma, categoryId);
  const existing = await prisma.standing.findMany({
    where: { categoryId },
    include: { player: true },
  });
  const existingKeys = new Set(
    existing.map((standing) =>
      normalizeKey(normalizeStandingTeamName(standingEntryNameForRecalc(standing), baselines.category)),
    ),
  );

  for (const [key, baseline] of baselines.byKey.entries()) {
    if (existingKeys.has(key)) continue;

    const created = await prisma.standing.create({
      data: {
        id: `auto-standing-${baselines.category.slug}-${slugify(baseline.teamName)}`,
        categoryId,
        teamName: baseline.teamName,
        wins: 0,
        losses: 0,
        points: 0,
        rank: 0,
        scoreDifference: 0,
        manualWinsDelta: 0,
        manualLossesDelta: 0,
        manualPointsDelta: 0,
        manualScoreDifferenceDelta: 0,
        manualRankOverride: null,
        createdById: userId ?? null,
        updatedById: userId ?? null,
      },
    });
    existing.push({ ...created, player: null });
  }

  const adjustedRows = existing.map((standing) => {
    const key = normalizeKey(normalizeStandingTeamName(standingEntryNameForRecalc(standing), baselines.category));
    const baseline = baselines.byKey.get(key) ?? {
      ...ZERO_BASE,
      teamName: standingEntryNameForRecalc(standing),
      rank: 0,
    };
    const adjusted = adjustedStandingStats(standing, baseline);

    return {
      standing,
      baseline,
      adjusted,
    };
  });
  const autoRankById = new Map<string, number>();

  if (baselines.hasStandingImpact) {
    [...adjustedRows]
      .sort((a, b) =>
        sortStatsForRank(
          { teamName: standingEntryNameForRecalc(a.standing), ...a.adjusted },
          { teamName: standingEntryNameForRecalc(b.standing), ...b.adjusted },
        ),
      )
      .forEach((row, index) => autoRankById.set(row.standing.id, index + 1));
  }

  for (const row of adjustedRows) {
    await prisma.standing.update({
      where: { id: row.standing.id },
      data: {
        wins: row.adjusted.wins,
        losses: row.adjusted.losses,
        points: row.adjusted.points,
        scoreDifference: row.adjusted.scoreDifference,
        rank: row.standing.manualRankOverride ?? autoRankById.get(row.standing.id) ?? 0,
        updatedById: userId ?? row.standing.updatedById,
      },
    });
  }
}

export async function recalculateAllStandings(prisma: PrismaClient, userId?: string | null) {
  const categories = await prisma.category.findMany({ select: { id: true } });

  for (const category of categories) {
    await recalculateCategoryStandings(prisma, category.id, userId);
  }
}

export function baselineForEntry(baselines: CategoryBaseline, entryName: string) {
  const normalizedName = normalizeStandingTeamName(entryName, baselines.category);
  const key = normalizeKey(normalizedName);

  return (
    baselines.byKey.get(key) ?? {
      ...ZERO_BASE,
      teamName: normalizedName,
      rank: 0,
    }
  );
}
