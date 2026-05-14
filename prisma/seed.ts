import { PrismaClient, AnnouncementCategory, PlayerStatus, Role } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { MAYORS_CUP_SCHEDULE_EXPECTED_COUNTS, seedMayorCupSchedules } from "./mayors-cup-schedules";
import { MAYORS_CUP_STANDING_EXPECTED_COUNTS, seedMayorCupStandings } from "./mayors-cup-standings";
import { recalculateAllStandings } from "../src/lib/standings-recalc";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/st_dominic_hoopers",
});

const prisma = new PrismaClient({ adapter });

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

type PlayerSeed = {
  name: string;
  role: string;
  id?: string;
  legacyIds?: string[];
  jerseyNumber?: string;
  seedNote?: string;
  isCaptain?: boolean;
  isCoach?: boolean;
  isManager?: boolean;
};

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts.slice(0, -1).join(" ") || parts[0],
    lastName: parts.length > 1 ? parts[parts.length - 1] : "Player",
  };
};

async function upsertSportWithCategory(input: {
  sportName: string;
  sportSlug: string;
  sportDescription: string;
  categoryName: string;
  categorySlug: string;
  categoryDescription: string;
  sortOrder: number;
}) {
  const sport = await prisma.sport.upsert({
    where: { slug: input.sportSlug },
    update: {
      name: input.sportName,
      description: input.sportDescription,
      sortOrder: input.sortOrder,
      isActive: true,
    },
    create: {
      name: input.sportName,
      slug: input.sportSlug,
      description: input.sportDescription,
      sortOrder: input.sortOrder,
    },
  });

  return prisma.category.upsert({
    where: { slug: input.categorySlug },
    update: {
      sportId: sport.id,
      name: input.categoryName,
      description: input.categoryDescription,
      sortOrder: input.sortOrder,
      isActive: true,
    },
    create: {
      sportId: sport.id,
      name: input.categoryName,
      slug: input.categorySlug,
      description: input.categoryDescription,
      sortOrder: input.sortOrder,
    },
  });
}

async function upsertRosterPlayer(categoryId: string, seed: PlayerSeed) {
  const { firstName, lastName } = splitName(seed.name);
  const playerId = seed.id ?? slugify(seed.name);
  const seedIds = Array.from(new Set([playerId, ...(seed.legacyIds ?? [])]));
  const existingById = await prisma.player.findMany({
    where: { id: { in: seedIds } },
  });
  const existingByName = existingById.length
    ? null
    : await prisma.player.findFirst({
        where: { firstName, lastName },
      });
  const existingPlayer = existingById.find((player) => player.id === playerId) ?? existingById[0] ?? existingByName;

  const player = existingPlayer
    ? await prisma.player.update({
        where: { id: existingPlayer.id },
        data: {
          firstName,
          lastName,
          defaultRole: seed.role,
          jerseyNumber: seed.jerseyNumber,
          seedNote: seed.seedNote,
          status: PlayerStatus.ACTIVE,
        },
      })
    : await prisma.player.create({
        data: {
          id: playerId,
          firstName,
          lastName,
          defaultRole: seed.role,
          jerseyNumber: seed.jerseyNumber,
          seedNote: seed.seedNote,
          status: PlayerStatus.ACTIVE,
        },
      });

  await prisma.rosterEntry.upsert({
    where: {
      playerId_categoryId_role: {
        playerId: player.id,
        categoryId,
        role: seed.role,
      },
    },
    update: {
      jerseyNumber: seed.jerseyNumber,
      notes: seed.seedNote,
      isCaptain: seed.isCaptain ?? false,
      isCoach: seed.isCoach ?? false,
      isManager: seed.isManager ?? false,
    },
    create: {
      playerId: player.id,
      categoryId,
      role: seed.role,
      jerseyNumber: seed.jerseyNumber,
      notes: seed.seedNote,
      isCaptain: seed.isCaptain ?? false,
      isCoach: seed.isCoach ?? false,
      isManager: seed.isManager ?? false,
    },
  });
}

async function main() {
  const passwordHash = await hash("ChangeMeMayorCup2026!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@stdominichoopers.local" },
    update: { role: Role.ADMIN, passwordHash },
    create: {
      name: "St. Dominic Hoopers Admin",
      email: "admin@stdominichoopers.local",
      role: Role.ADMIN,
      passwordHash,
    },
  });

  const categories = await Promise.all([
    upsertSportWithCategory({
      sportName: "Basketball",
      sportSlug: "basketball",
      sportDescription: "Subdivision basketball representatives for full-court and 3x3 competition.",
      categoryName: "Basketball Open",
      categorySlug: "basketball-open-category",
      categoryDescription: "Open category roster and fixtures for the Mayor's Cup / Inter-Subdivision tournament.",
      sortOrder: 1,
    }),
    upsertSportWithCategory({
      sportName: "Basketball",
      sportSlug: "basketball",
      sportDescription: "Subdivision basketball representatives for full-court and 3x3 competition.",
      categoryName: "Basketball 3x3 14U",
      categorySlug: "basketball-3x3-14-under",
      categoryDescription: "Youth 3x3 basketball category for players aged 14 and under.",
      sortOrder: 2,
    }),
    upsertSportWithCategory({
      sportName: "Basketball",
      sportSlug: "basketball",
      sportDescription: "Subdivision basketball representatives for full-court and 3x3 competition.",
      categoryName: "Basketball Under 18",
      categorySlug: "basketball-under-18",
      categoryDescription: "Basketball Under 18 roster and fixtures for the Mayor's Cup.",
      sortOrder: 3,
    }),
    upsertSportWithCategory({
      sportName: "Mobile Legends",
      sportSlug: "mobile-legends",
      sportDescription: "Mobile Legends squad for the esports category.",
      categoryName: "Mobile Legends",
      categorySlug: "mobile-legends",
      categoryDescription: "Official Mobile Legends roster and match updates.",
      sortOrder: 4,
    }),
    upsertSportWithCategory({
      sportName: "Darts",
      sportSlug: "darts",
      sportDescription: "Darts representatives for individual and team match play.",
      categoryName: "Darts",
      categorySlug: "darts",
      categoryDescription: "Darts roster, match schedule, and standings.",
      sortOrder: 5,
    }),
    upsertSportWithCategory({
      sportName: "Badminton",
      sportSlug: "badminton",
      sportDescription: "Badminton representatives for singles and doubles events.",
      categoryName: "Badminton",
      categorySlug: "badminton",
      categoryDescription: "Badminton roster, match schedule, and standings.",
      sortOrder: 6,
    }),
  ]);

  const bySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));

  const mlbbRoster: PlayerSeed[] = [
    { name: "Dale Abadia", role: "Roam" },
    { name: "Klyx Tumampos", role: "Mid" },
    { name: "Dave Abadia", role: "Mid" },
    { name: "Kenneth Ayade", role: "Exp" },
    { name: "Fritz Jorquia", role: "Gold" },
    { name: "Aldrich Kyle Alesna", role: "Jungler" },
    { name: "Justin Viodor", role: "Jungler" },
  ];

  const basketballOpenSeedNote = "Verified from typed Mayor's Cup 2026 UHOA InterSubdivision Tournament Open roster.";
  const basketballOpenRoster: PlayerSeed[] = [
    { name: "Lawrence Alfarero", role: "Player", legacyIds: ["laurence-alfaro"], seedNote: basketballOpenSeedNote },
    { name: "Julian Barrientos", role: "Player", seedNote: basketballOpenSeedNote },
    { name: "John Cloyd Anthom Caballes", role: "Player", legacyIds: ["john-carlo-cadiles"], seedNote: basketballOpenSeedNote },
    { name: "Renz Caballes", role: "Player", legacyIds: ["kenz-caballes"], seedNote: basketballOpenSeedNote },
    { name: "Joshua Enad", role: "Player", seedNote: basketballOpenSeedNote },
    { name: "Micheal Esparas", role: "Player", legacyIds: ["michael-esparas"], seedNote: basketballOpenSeedNote },
    { name: "Vince Gipanao", role: "Player", legacyIds: ["vince-gumapac"], seedNote: basketballOpenSeedNote },
    { name: "Evander Gonzales", role: "Player", legacyIds: ["nandro-gonzales"], seedNote: basketballOpenSeedNote },
    { name: "Jeffrey Gunayan", role: "Player", seedNote: basketballOpenSeedNote },
    { name: "Mark Jilah", role: "Player", legacyIds: ["mark-jirah"], seedNote: basketballOpenSeedNote },
    { name: "Rofel Navares", role: "Player", legacyIds: ["ralph-alvarez"], seedNote: basketballOpenSeedNote },
    { name: "Crist Pabatang", role: "Player", seedNote: basketballOpenSeedNote },
    { name: "Zowie Sague", role: "Player", legacyIds: ["zowie-sogue"], seedNote: basketballOpenSeedNote },
    { name: "Lionel Sumalinog", role: "Player", seedNote: basketballOpenSeedNote },
    { name: "Joseph Brandon Velez", role: "Player", seedNote: basketballOpenSeedNote },
    { name: "John Anthony Cabiles", role: "Team Captain", isCaptain: true, seedNote: "Team official from registration form; private fields intentionally excluded." },
    { name: "Argie Alicamen", role: "Team Coach", isCoach: true, seedNote: "Team official from registration form; private fields intentionally excluded." },
    { name: "Joel Crisolo", role: "Team Manager", isManager: true, seedNote: "Team official from registration form; private fields intentionally excluded." },
  ];

  await Promise.all(mlbbRoster.map((player) => upsertRosterPlayer(bySlug["mobile-legends"].id, player)));
  await Promise.all(
    basketballOpenRoster.map((player) => upsertRosterPlayer(bySlug["basketball-open-category"].id, player)),
  );

  const scheduleSummary = await seedMayorCupSchedules(prisma, admin.id);
  const standingSummary = await seedMayorCupStandings(prisma, admin.id);
  await recalculateAllStandings(prisma, admin.id);

  await prisma.announcement.upsert({
    where: { slug: "portal-launch" },
    update: {
      title: "St. Dominic Hoopers Team Portal Launch",
      content:
        "Welcome to the official portal for St. Dominic Hoopers in the Mayor's Cup / Lapu-Lapu City Hoops Sports Festival 2026. Rosters, schedules, standings, and notices will be posted here as they are confirmed.",
      category: AnnouncementCategory.NOTICE,
      published: true,
      publishedAt: new Date(),
      updatedById: admin.id,
    },
    create: {
      title: "St. Dominic Hoopers Team Portal Launch",
      slug: "portal-launch",
      content:
        "Welcome to the official portal for St. Dominic Hoopers in the Mayor's Cup / Lapu-Lapu City Hoops Sports Festival 2026. Rosters, schedules, standings, and notices will be posted here as they are confirmed.",
      category: AnnouncementCategory.NOTICE,
      published: true,
      publishedAt: new Date(),
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  await prisma.galleryItem.upsert({
    where: { id: "gallery-placeholder-team-photos" },
    update: {
      title: "Team photos coming soon",
      description: "Official media will be uploaded once available.",
      displayOrder: 1,
      published: true,
      updatedById: admin.id,
    },
    create: {
      id: "gallery-placeholder-team-photos",
      title: "Team photos coming soon",
      description: "Official media will be uploaded once available.",
      displayOrder: 1,
      published: true,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE",
      entity: "Seed",
      summary: "Seeded St. Dominic Hoopers portal data.",
    },
  });

  console.log("Seed complete.");
  console.log(`Mayor's Cup schedules: ${scheduleSummary.total}`);
  for (const [category, expected] of Object.entries(MAYORS_CUP_SCHEDULE_EXPECTED_COUNTS)) {
    console.log(`${category}: ${scheduleSummary.counts[category] ?? 0} / ${expected}`);
  }
  console.log(`Mayor's Cup Basketball standings seed rows: ${standingSummary.total}`);
  for (const [category, expected] of Object.entries(MAYORS_CUP_STANDING_EXPECTED_COUNTS)) {
    console.log(`${category}: ${standingSummary.counts[category] ?? 0} / ${expected}`);
  }
  console.log("Admin login: admin@stdominichoopers.local / ChangeMeMayorCup2026!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
