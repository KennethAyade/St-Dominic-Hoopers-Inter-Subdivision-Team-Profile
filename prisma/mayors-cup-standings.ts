import type { PrismaClient } from "../src/generated/prisma/client";

type BasketballStandingCategory =
  | "Basketball Open"
  | "Basketball 3x3 14U"
  | "Basketball Under 18";

const CATEGORY_SLUG_BY_NAME: Record<BasketballStandingCategory, string> = {
  "Basketball Open": "basketball-open-category",
  "Basketball 3x3 14U": "basketball-3x3-14-under",
  "Basketball Under 18": "basketball-under-18",
};

const BASKETBALL_STANDINGS: Record<BasketballStandingCategory, string[]> = {
  "Basketball Open": [
    "Sunberry 1",
    "BF Better Living",
    "Camella Homes",
    "St. Dominic",
    "Pacific Grande 1",
    "Happy Homes",
    "Collinwood",
    "Fleur De Ville",
    "Vistabella",
    "Bayswater",
    "Corinthians",
    "Bali Residences",
    "Bougainvillea",
    "Deca 5",
    "Genesis",
    "Portville Prime",
    "Deca 1",
    "Sunrise Place",
    "La Aldea Del Mar",
    "Deca 4",
    "Joanna Homes",
  ],
  "Basketball 3x3 14U": [
    "St. Dominic / St. Dominic's Place",
    "BF Country Homes",
    "BF Better Living",
    "Corinthians",
    "Collinwood",
    "Vistabella",
  ],
  "Basketball Under 18": [
    "Deca 4",
    "Deca 5",
    "Bayswater",
    "Collinwood",
    "Vistabella",
    "Pacific Grande 1",
    "Camella Homes",
    "Bougainvillea",
    "Deca 1",
    "Corinthians",
  ],
};

export const MAYORS_CUP_STANDING_EXPECTED_COUNTS = Object.fromEntries(
  Object.entries(BASKETBALL_STANDINGS).map(([category, teams]) => [category, teams.length]),
) as Record<BasketballStandingCategory, number>;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const standingId = (categorySlug: string, teamName: string) =>
  ["mayors-cup-2026-standing", categorySlug, slugify(teamName)].join("-");

export type MayorCupStandingSummary = {
  total: number;
  counts: Record<string, number>;
};

export async function seedMayorCupStandings(prisma: PrismaClient, userId: string): Promise<MayorCupStandingSummary> {
  const categorySlugs = Object.values(CATEGORY_SLUG_BY_NAME);
  const categories = await prisma.category.findMany({
    where: { slug: { in: categorySlugs } },
    select: { id: true, name: true, slug: true },
  });
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const missingSlugs = categorySlugs.filter((slug) => !categoryBySlug.has(slug));

  if (missingSlugs.length) {
    throw new Error(`Cannot seed standings. Missing categories: ${missingSlugs.join(", ")}`);
  }

  const seedRows = Object.entries(BASKETBALL_STANDINGS).flatMap(([categoryName, teams]) => {
    const categorySlug = CATEGORY_SLUG_BY_NAME[categoryName as BasketballStandingCategory];
    const category = categoryBySlug.get(categorySlug);

    if (!category) {
      throw new Error(`Missing category ${categoryName}.`);
    }

    return teams.map((teamName) => ({
      id: standingId(categorySlug, teamName),
      categoryId: category.id,
      categoryName,
      teamName,
    }));
  });

  for (const standing of seedRows) {
    await prisma.standing.upsert({
      where: { id: standing.id },
      update: {
        categoryId: standing.categoryId,
        teamName: standing.teamName,
        updatedById: userId,
      },
      create: {
        id: standing.id,
        categoryId: standing.categoryId,
        teamName: standing.teamName,
        wins: 0,
        losses: 0,
        points: 0,
        rank: 0,
        scoreDifference: 0,
        remarks: null,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  const countRows = await prisma.standing.groupBy({
    by: ["categoryId"],
    where: { id: { in: seedRows.map((standing) => standing.id) } },
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
