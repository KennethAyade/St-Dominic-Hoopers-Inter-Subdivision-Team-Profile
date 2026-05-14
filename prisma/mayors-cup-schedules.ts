import { MatchStatus, type PrismaClient } from "../src/generated/prisma/client";

type ScheduleSeed = {
  sport: "Basketball" | "Mobile Legends";
  category: "Basketball 3x3 14U" | "Basketball Open" | "Basketball Under 18" | "Mobile Legends";
  date: string;
  time: string;
  venue: string;
  teamA: string;
  teamB: string;
  gameDay?: number;
  sortOrder?: number;
};

const CATEGORY_SLUG_BY_NAME: Record<ScheduleSeed["category"], string> = {
  "Basketball 3x3 14U": "basketball-3x3-14-under",
  "Basketball Open": "basketball-open-category",
  "Basketball Under 18": "basketball-under-18",
  "Mobile Legends": "mobile-legends",
};

export const MAYORS_CUP_SCHEDULE_EXPECTED_COUNTS: Record<ScheduleSeed["category"], number> = {
  "Basketball 3x3 14U": 14,
  "Basketball Open": 37,
  "Basketball Under 18": 18,
  "Mobile Legends": 15,
};

const TEAM_NAME_NORMALIZATION: Record<string, string> = {
  "BF BL": "BF Better Living",
  "St. Dom": "St. Dominic",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const normalizeTeamName = (value: string) => TEAM_NAME_NORMALIZATION[value.trim()] ?? value.trim();

const manilaDateTime = (date: string, time: string) => new Date(`${date}T${time}:00+08:00`);

const scheduleId = (schedule: ScheduleSeed) => {
  const categorySlug = CATEGORY_SLUG_BY_NAME[schedule.category];
  return [
    "mayors-cup-2026",
    categorySlug,
    schedule.date.replaceAll("-", ""),
    schedule.time.replace(":", ""),
    slugify(normalizeTeamName(schedule.teamA)),
    "vs",
    slugify(normalizeTeamName(schedule.teamB)),
  ].join("-");
};

const MAYORS_CUP_SCHEDULES: ScheduleSeed[] = [
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-11", time: "19:00", venue: "St. Dominic", teamA: "BF Better Living", teamB: "St. Dominic" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-11", time: "20:00", venue: "St. Dominic", teamA: "Camella", teamB: "Sunrise" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-13", time: "19:00", venue: "Pacific Grande 1", teamA: "Pacific Grande 1", teamB: "Happy Homes" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-13", time: "20:00", venue: "Pacific Grande 1", teamA: "BF Better Living", teamB: "Sunrise" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-15", time: "19:00", venue: "Happy Homes", teamA: "St. Dominic", teamB: "Happy Homes" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-15", time: "20:00", venue: "Happy Homes", teamA: "Pacific Grande 1", teamB: "Camella" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-17", time: "19:00", venue: "Camella", teamA: "Camella", teamB: "Happy Homes" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-17", time: "20:00", venue: "Camella", teamA: "Sunrise", teamB: "St. Dominic" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-20", time: "19:00", venue: "BF Better Living", teamA: "Pacific Grande 1", teamB: "Sunrise" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-20", time: "20:00", venue: "BF Better Living", teamA: "BF Better Living", teamB: "Pacific Grande 1" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-22", time: "19:00", venue: "St. Dominic", teamA: "Camella", teamB: "St. Dominic" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-22", time: "20:00", venue: "St. Dominic", teamA: "BF Better Living", teamB: "Happy Homes" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-25", time: "18:00", venue: "BF Better Living", teamA: "Happy Homes", teamB: "Sunrise" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-25", time: "19:00", venue: "BF Better Living", teamA: "St. Dominic", teamB: "Pacific Grande 1" },
  { sport: "Mobile Legends", category: "Mobile Legends", date: "2026-05-25", time: "20:00", venue: "BF Better Living", teamA: "Camella", teamB: "BF Better Living" },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-10", time: "17:30", venue: "Bayswater", teamA: "St. Dominics Place", teamB: "BF Country Homes", gameDay: 1, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-10", time: "18:00", venue: "Bayswater", teamA: "Deca 4", teamB: "Bayswater", gameDay: 1, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-10", time: "19:30", venue: "Bayswater", teamA: "Deca 5", teamB: "Bougainvillea", gameDay: 1, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-10", time: "21:00", venue: "Bayswater", teamA: "Fleur De Ville", teamB: "Bayswater", gameDay: 1, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-11", time: "17:30", venue: "St. Dominic", teamA: "BF Better Living", teamB: "St. Dominic", gameDay: 2, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-11", time: "18:00", venue: "St. Dominic", teamA: "Pacific Grande 1", teamB: "Bougainvillea", gameDay: 2, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-11", time: "19:30", venue: "St. Dominic", teamA: "Sunrise", teamB: "Joanna Homes", gameDay: 2, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-11", time: "21:00", venue: "St. Dominic", teamA: "Sunberry 1", teamB: "St. Dominic", gameDay: 2, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-12", time: "17:30", venue: "BF Country Homes", teamA: "Corinthians", teamB: "BF Country Homes", gameDay: 3, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-12", time: "18:00", venue: "BF Country Homes", teamA: "Camella", teamB: "Corinthians", gameDay: 3, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-12", time: "19:30", venue: "BF Country Homes", teamA: "Corinthians", teamB: "Collinwood", gameDay: 3, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-12", time: "21:00", venue: "BF Country Homes", teamA: "Happy Homes", teamB: "Camella", gameDay: 3, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-13", time: "17:30", venue: "Bali Residences", teamA: "Collinwood", teamB: "BF Better Living", gameDay: 4, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-13", time: "18:00", venue: "Bali Residences", teamA: "Collinwood", teamB: "Deca 5", gameDay: 4, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-13", time: "19:30", venue: "Bali Residences", teamA: "BF Better Living", teamB: "Pacific Grande 1", gameDay: 4, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-13", time: "21:00", venue: "Bali Residences", teamA: "Genesis", teamB: "Bali", gameDay: 4, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-14", time: "17:30", venue: "Vistabella", teamA: "Corinthians", teamB: "Vistabella", gameDay: 5, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-14", time: "18:00", venue: "Vistabella", teamA: "Deca 4", teamB: "Vistabella", gameDay: 5, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-14", time: "19:30", venue: "Vistabella", teamA: "Deca 1", teamB: "Deca 4", gameDay: 5, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-14", time: "21:00", venue: "Vistabella", teamA: "Bayswater", teamB: "Vistabella", gameDay: 5, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-15", time: "17:30", venue: "Deca 5", teamA: "BF Country Homes", teamB: "Collinwood", gameDay: 6, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-15", time: "18:00", venue: "Deca 5", teamA: "Bayswater", teamB: "Deca 5", gameDay: 6, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-15", time: "19:30", venue: "Deca 5", teamA: "St. Dominic", teamB: "Camella", gameDay: 6, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-15", time: "21:00", venue: "Deca 5", teamA: "Portville Prime", teamB: "Deca 5", gameDay: 6, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-16", time: "17:30", venue: "Corinthians", teamA: "St. Dominic", teamB: "Corinthians", gameDay: 7, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-16", time: "18:00", venue: "Corinthians", teamA: "Pacific Grande 1", teamB: "Corinthians", gameDay: 7, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-16", time: "19:30", venue: "Corinthians", teamA: "Happy Homes", teamB: "Sunberry 1", gameDay: 7, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-16", time: "21:00", venue: "Corinthians", teamA: "Fleur De Ville", teamB: "Corinthians", gameDay: 7, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-17", time: "16:30", venue: "Camella", teamA: "BF Better Living", teamB: "Vistabella", gameDay: 8, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-17", time: "17:00", venue: "Camella", teamA: "Vistabella", teamB: "Collinwood", gameDay: 8, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-17", time: "18:00", venue: "Camella", teamA: "Deca 1", teamB: "Camella", gameDay: 8, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-17", time: "19:30", venue: "Camella", teamA: "St. Dominic", teamB: "BF Better Living", gameDay: 8, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-17", time: "21:00", venue: "Camella", teamA: "Pacific Grande 1", teamB: "Camella", gameDay: 8, sortOrder: 5 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-18", time: "17:30", venue: "Deca 4", teamA: "Vistabella", teamB: "BF Country Homes", gameDay: 9, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-18", time: "18:00", venue: "Deca 4", teamA: "Deca 5", teamB: "Deca 4", gameDay: 9, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-18", time: "19:30", venue: "Deca 4", teamA: "Sunrise", teamB: "La Aldea Del Mar", gameDay: 9, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-18", time: "21:00", venue: "Deca 4", teamA: "Joanna Homes", teamB: "Deca 4", gameDay: 9, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-19", time: "17:30", venue: "Collinwood", teamA: "Corinthians", teamB: "Collinwood", gameDay: 10, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-19", time: "18:00", venue: "Collinwood", teamA: "Bayswater", teamB: "Collinwood", gameDay: 10, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-19", time: "19:30", venue: "Collinwood", teamA: "Bougainvillea", teamB: "Genesis", gameDay: 10, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-19", time: "21:00", venue: "Collinwood", teamA: "Vistabella", teamB: "Collinwood", gameDay: 10, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-20", time: "18:00", venue: "Fleur De Ville", teamA: "Camella", teamB: "Bougainvillea", gameDay: 11, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-20", time: "19:30", venue: "Fleur De Ville", teamA: "Portville", teamB: "Bali", gameDay: 11, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-20", time: "21:00", venue: "Fleur De Ville", teamA: "Collinwood", teamB: "Fleur De Ville", gameDay: 11, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-21", time: "18:00", venue: "Deca 1", teamA: "Pacific Grande 1", teamB: "Deca 4", gameDay: 12, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-21", time: "19:30", venue: "Deca 1", teamA: "La Aldea Del Mar", teamB: "Deca 4", gameDay: 12, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-21", time: "21:00", venue: "Deca 1", teamA: "Sunrise", teamB: "Deca 1", gameDay: 12, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-22", time: "17:30", venue: "St. Dominic", teamA: "Vistabella", teamB: "St. Dominic", gameDay: 13, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-22", time: "18:00", venue: "St. Dominic", teamA: "Vistabella", teamB: "Deca 5", gameDay: 13, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-22", time: "19:30", venue: "St. Dominic", teamA: "Bali", teamB: "Bougainvillea", gameDay: 13, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-22", time: "21:00", venue: "St. Dominic", teamA: "Happy Homes", teamB: "St. Dominic", gameDay: 13, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-23", time: "17:30", venue: "Sunberry Homes 1", teamA: "St. Dominic", teamB: "Collinwood", gameDay: 14, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-23", time: "18:00", venue: "Sunberry Homes 1", teamA: "Pacific Grande 1", teamB: "Camella", gameDay: 14, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-23", time: "19:30", venue: "Sunberry Homes 1", teamA: "La Aldea Del Mar", teamB: "Deca 1", gameDay: 14, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-23", time: "21:00", venue: "Sunberry Homes 1", teamA: "BF Better Living", teamB: "Sunberry 1", gameDay: 14, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-24", time: "17:00", venue: "Bayswater", teamA: "BF Better Living", teamB: "Corinthians", gameDay: 15, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-24", time: "17:00", venue: "Bayswater", teamA: "Deca 1", teamB: "Corinthians", gameDay: 15, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-24", time: "18:00", venue: "Bayswater", teamA: "Vistabella", teamB: "Bayswater", gameDay: 15, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-24", time: "19:30", venue: "Bayswater", teamA: "Sunberry 1", teamB: "Camella", gameDay: 15, sortOrder: 4 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-24", time: "21:00", venue: "Bayswater", teamA: "Corinthians", teamB: "Bayswater", gameDay: 15, sortOrder: 5 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-25", time: "18:00", venue: "Vistabella", teamA: "Portville Prime", teamB: "Bougainvillea", gameDay: 16, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-25", time: "19:30", venue: "Vistabella", teamA: "Deca 1", teamB: "Joanna Homes", gameDay: 16, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-25", time: "21:00", venue: "Vistabella", teamA: "Fleur De Ville", teamB: "Vistabella", gameDay: 16, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball 3x3 14U", date: "2026-05-26", time: "17:30", venue: "Deca 5", teamA: "BF Country Homes", teamB: "BF Better Living", gameDay: 17, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-26", time: "19:00", venue: "Deca 5", teamA: "Pacific Grande 1", teamB: "Happy Homes", gameDay: 17, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-26", time: "20:30", venue: "Deca 5", teamA: "Bali", teamB: "Deca 5", gameDay: 17, sortOrder: 3 },
  { sport: "Basketball", category: "Basketball Under 18", date: "2026-05-27", time: "18:00", venue: "Corinthians", teamA: "Bougainvillea", teamB: "Corinthians", gameDay: 18, sortOrder: 1 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-27", time: "19:30", venue: "Corinthians", teamA: "Collinwood", teamB: "Bayswater", gameDay: 18, sortOrder: 2 },
  { sport: "Basketball", category: "Basketball Open", date: "2026-05-27", time: "20:30", venue: "Corinthians", teamA: "Vistabella", teamB: "Corinthians", gameDay: 18, sortOrder: 3 },
];

export type MayorCupScheduleSummary = {
  total: number;
  counts: Record<string, number>;
};

export async function seedMayorCupSchedules(prisma: PrismaClient, userId: string): Promise<MayorCupScheduleSummary> {
  const categories = await prisma.category.findMany({
    where: { slug: { in: Object.values(CATEGORY_SLUG_BY_NAME) } },
    select: { id: true, name: true, slug: true },
  });
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const missingSlugs = Object.values(CATEGORY_SLUG_BY_NAME).filter((slug) => !categoryBySlug.has(slug));

  if (missingSlugs.length) {
    throw new Error(`Cannot seed schedules. Missing categories: ${missingSlugs.join(", ")}`);
  }

  const seedRows = MAYORS_CUP_SCHEDULES.map((schedule) => {
    const categorySlug = CATEGORY_SLUG_BY_NAME[schedule.category];
    const category = categoryBySlug.get(categorySlug);

    if (!category) {
      throw new Error(`Missing category ${schedule.category}.`);
    }

    const teamA = normalizeTeamName(schedule.teamA);
    const teamB = normalizeTeamName(schedule.teamB);

    return {
      id: scheduleId(schedule),
      categoryId: category.id,
      categoryName: category.name,
      opponentName: `${teamA} vs ${teamB}`,
      matchDate: manilaDateTime(schedule.date, schedule.time),
      venue: schedule.venue,
    };
  });

  const targetCategoryIds = categories.map((category) => category.id);
  const seedIds = seedRows.map((schedule) => schedule.id);

  await prisma.matchSchedule.deleteMany({
    where: {
      categoryId: { in: targetCategoryIds },
      id: { notIn: seedIds },
    },
  });

  for (const schedule of seedRows) {
    const data = {
      categoryId: schedule.categoryId,
      opponentName: schedule.opponentName,
      matchDate: schedule.matchDate,
      venue: schedule.venue,
      updatedById: userId,
    };

    await prisma.matchSchedule.upsert({
      where: { id: schedule.id },
      update: data,
      create: {
        id: schedule.id,
        ...data,
        status: MatchStatus.SCHEDULED,
        homeScore: null,
        opponentScore: null,
        resultText: null,
        remarks: null,
        createdById: userId,
      },
    });
  }

  const countRows = await prisma.matchSchedule.groupBy({
    by: ["categoryId"],
    where: { id: { in: seedIds } },
    _count: { _all: true },
  });

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  const counts = Object.fromEntries(
    countRows.map((row) => [categoryNameById.get(row.categoryId) ?? row.categoryId, row._count._all]),
  );

  return {
    total: seedRows.length,
    counts,
  };
}
