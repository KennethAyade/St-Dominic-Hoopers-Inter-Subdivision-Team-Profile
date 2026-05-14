import { PrismaClient, PlayerStatus, Role, MatchStatus, AnnouncementCategory } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

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
  const playerSlug = slugify(seed.name);
  const player = await prisma.player.upsert({
    where: { id: playerSlug },
    update: {
      firstName,
      lastName,
      defaultRole: seed.role,
      jerseyNumber: seed.jerseyNumber,
      seedNote: seed.seedNote,
      status: PlayerStatus.ACTIVE,
    },
    create: {
      id: playerSlug,
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

async function upsertMatchSchedule(input: {
  categoryId: string;
  opponentName: string;
  matchDate: Date;
  venue: string;
  status: MatchStatus;
  homeScore?: number;
  opponentScore?: number;
  resultText?: string;
  remarks?: string;
  userId: string;
}) {
  const existing = await prisma.matchSchedule.findFirst({
    where: {
      categoryId: input.categoryId,
      opponentName: input.opponentName,
      matchDate: input.matchDate,
    },
  });

  const data = {
    categoryId: input.categoryId,
    opponentName: input.opponentName,
    matchDate: input.matchDate,
    venue: input.venue,
    status: input.status,
    homeScore: input.homeScore,
    opponentScore: input.opponentScore,
    resultText: input.resultText,
    remarks: input.remarks,
    updatedById: input.userId,
  };

  if (existing) {
    await prisma.matchSchedule.update({
      where: { id: existing.id },
      data,
    });
    return;
  }

  await prisma.matchSchedule.create({
    data: {
      ...data,
      createdById: input.userId,
    },
  });
}

async function upsertTeamStanding(input: {
  categoryId: string;
  teamName: string;
  wins: number;
  losses: number;
  points: number;
  rank: number;
  scoreDifference: number;
  remarks?: string;
  userId: string;
}) {
  const existing = await prisma.standing.findFirst({
    where: {
      categoryId: input.categoryId,
      teamName: input.teamName,
    },
  });

  const data = {
    categoryId: input.categoryId,
    teamName: input.teamName,
    wins: input.wins,
    losses: input.losses,
    points: input.points,
    rank: input.rank,
    scoreDifference: input.scoreDifference,
    remarks: input.remarks,
    updatedById: input.userId,
  };

  if (existing) {
    await prisma.standing.update({
      where: { id: existing.id },
      data,
    });
    return;
  }

  await prisma.standing.create({
    data: {
      ...data,
      createdById: input.userId,
    },
  });
}

async function seedMobileLegendsScheduleAndStandings(categoryId: string, userId: string) {
  await prisma.matchSchedule.deleteMany({ where: { categoryId } });
  await prisma.standing.deleteMany({ where: { categoryId } });

  const schedule: Array<{
    dateTime: string;
    venue: string;
    match: string;
    status?: MatchStatus;
    homeScore?: number;
    opponentScore?: number;
    resultText?: string;
    remarks?: string;
  }> = [
    {
      dateTime: "2026-05-11T19:00:00+08:00",
      venue: "St. Dominic",
      match: "BF Better Living vs St. Dominic",
      status: MatchStatus.COMPLETED,
      homeScore: 2,
      opponentScore: 0,
      resultText: "BF Better Living won 2-0",
      remarks: "Official result entered from May 11 ML schedule. Points assumed: 3-0.",
    },
    {
      dateTime: "2026-05-11T20:00:00+08:00",
      venue: "St. Dominic",
      match: "Camella vs Sunrise",
      status: MatchStatus.COMPLETED,
      homeScore: 2,
      opponentScore: 1,
      resultText: "Camella won 2-1",
      remarks: "Official result entered from May 11 ML schedule. Points assumed: 2-1.",
    },
    {
      dateTime: "2026-05-13T19:00:00+08:00",
      venue: "Pacific Grande 1",
      match: "Pacific Grande 1 vs Happy Homes",
      remarks: "Result pending official confirmation.",
    },
    {
      dateTime: "2026-05-13T20:00:00+08:00",
      venue: "Pacific Grande 1",
      match: "BF Better Living vs Sunrise",
      remarks: "Result pending official confirmation.",
    },
    {
      dateTime: "2026-05-15T19:00:00+08:00",
      venue: "Happy Homes",
      match: "St. Dominic vs Happy Homes",
    },
    {
      dateTime: "2026-05-15T20:00:00+08:00",
      venue: "Happy Homes",
      match: "Pacific Grande 1 vs Camella",
    },
    {
      dateTime: "2026-05-17T19:00:00+08:00",
      venue: "Camella",
      match: "Camella vs Happy Homes",
    },
    {
      dateTime: "2026-05-17T20:00:00+08:00",
      venue: "Camella",
      match: "Sunrise vs St. Dominic",
    },
    {
      dateTime: "2026-05-20T19:00:00+08:00",
      venue: "BF Better Living",
      match: "Pacific Grande 1 vs Sunrise",
    },
    {
      dateTime: "2026-05-20T20:00:00+08:00",
      venue: "BF Better Living",
      match: "BF Better Living vs Pacific Grande 1",
    },
    {
      dateTime: "2026-05-22T19:00:00+08:00",
      venue: "St. Dominic",
      match: "Camella vs St. Dominic",
    },
    {
      dateTime: "2026-05-22T20:00:00+08:00",
      venue: "St. Dominic",
      match: "BF Better Living vs Happy Homes",
    },
    {
      dateTime: "2026-05-25T18:00:00+08:00",
      venue: "BF Better Living",
      match: "Happy Homes vs Sunrise",
    },
    {
      dateTime: "2026-05-25T19:00:00+08:00",
      venue: "BF Better Living",
      match: "St. Dominic vs Pacific Grande 1",
    },
    {
      dateTime: "2026-05-25T20:00:00+08:00",
      venue: "BF Better Living",
      match: "Camella vs BF Better Living",
    },
  ];

  await prisma.matchSchedule.createMany({
    data: schedule.map((match) => ({
      categoryId,
      opponentName: match.match,
      matchDate: new Date(match.dateTime),
      venue: match.venue,
      status: match.status ?? MatchStatus.SCHEDULED,
      homeScore: match.homeScore,
      opponentScore: match.opponentScore,
      resultText: match.resultText,
      remarks: match.remarks,
      createdById: userId,
      updatedById: userId,
    })),
  });

  const pointRemarks =
    "ML standings seeded from official May 11 results. Points use schedule points gained convention: 2-0 = 3-0, 2-1 = 2-1.";

  const standings = [
    { teamName: "BF Better Living", wins: 1, losses: 0, points: 3, rank: 1, scoreDifference: 2 },
    { teamName: "Camella", wins: 1, losses: 0, points: 2, rank: 2, scoreDifference: 1 },
    { teamName: "Sunrise", wins: 0, losses: 1, points: 1, rank: 3, scoreDifference: -1 },
    { teamName: "Happy Homes", wins: 0, losses: 0, points: 0, rank: 4, scoreDifference: 0 },
    { teamName: "Pacific Grande 1", wins: 0, losses: 0, points: 0, rank: 5, scoreDifference: 0 },
    {
      teamName: "St. Dominic Hoopers",
      wins: 0,
      losses: 1,
      points: 0,
      rank: 6,
      scoreDifference: -2,
      remarks: "Official schedule label: St. Dominic.",
    },
  ];

  await prisma.standing.createMany({
    data: standings.map((standing) => ({
      categoryId,
      teamName: standing.teamName,
      wins: standing.wins,
      losses: standing.losses,
      points: standing.points,
      rank: standing.rank,
      scoreDifference: standing.scoreDifference,
      remarks: standing.remarks ?? pointRemarks,
      createdById: userId,
      updatedById: userId,
    })),
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
      categoryName: "Basketball Open Category",
      categorySlug: "basketball-open-category",
      categoryDescription: "Open category roster and fixtures for the Mayor's Cup / Inter-Subdivision tournament.",
      sortOrder: 1,
    }),
    upsertSportWithCategory({
      sportName: "Basketball",
      sportSlug: "basketball",
      sportDescription: "Subdivision basketball representatives for full-court and 3x3 competition.",
      categoryName: "Basketball 3x3 14 Under",
      categorySlug: "basketball-3x3-14-under",
      categoryDescription: "Youth 3x3 basketball category for players aged 14 and under.",
      sortOrder: 2,
    }),
    upsertSportWithCategory({
      sportName: "Mobile Legends",
      sportSlug: "mobile-legends",
      sportDescription: "Mobile Legends squad for the esports category.",
      categoryName: "Mobile Legends",
      categorySlug: "mobile-legends",
      categoryDescription: "Official Mobile Legends roster and match updates.",
      sortOrder: 3,
    }),
    upsertSportWithCategory({
      sportName: "Darts",
      sportSlug: "darts",
      sportDescription: "Darts representatives for individual and team match play.",
      categoryName: "Darts",
      categorySlug: "darts",
      categoryDescription: "Darts roster, match schedule, and standings.",
      sortOrder: 4,
    }),
    upsertSportWithCategory({
      sportName: "Badminton",
      sportSlug: "badminton",
      sportDescription: "Badminton representatives for singles and doubles events.",
      categoryName: "Badminton",
      categorySlug: "badminton",
      categoryDescription: "Badminton roster, match schedule, and standings.",
      sortOrder: 5,
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

  const basketballOpenRoster: PlayerSeed[] = [
    { name: "John Carlo Cadiles", role: "Player", seedNote: "Verify spelling from handwritten registration form." },
    { name: "Ralph Alvarez", role: "Player" },
    { name: "Kenz Caballes", role: "Player" },
    { name: "Nandro Gonzales", role: "Player", seedNote: "Verify spelling from handwritten registration form." },
    { name: "Joseph Brandon Velez", role: "Player" },
    { name: "Vince Gumapac", role: "Player", seedNote: "Verify Gumapac/Gumampos spelling from handwritten registration form." },
    { name: "Mark Jirah", role: "Player", seedNote: "Verify order/spelling from handwritten registration form." },
    { name: "Julian Barrientos", role: "Player" },
    { name: "Zowie Sogue", role: "Player", seedNote: "Verify Sogue/Sague spelling from handwritten registration form." },
    { name: "Laurence Alfaro", role: "Player" },
    { name: "Crist Pabatang", role: "Player" },
    { name: "Lionel Sumalinog", role: "Player" },
    { name: "Michael Esparas", role: "Player" },
    { name: "John Anthony Cabiles", role: "Team Captain", isCaptain: true, seedNote: "Team official from registration form; private fields intentionally excluded." },
    { name: "Argie Alicamen", role: "Team Coach", isCoach: true, seedNote: "Team official from registration form; private fields intentionally excluded." },
    { name: "Joel Crisolo", role: "Team Manager", isManager: true, seedNote: "Team official from registration form; private fields intentionally excluded." },
  ];

  await Promise.all(mlbbRoster.map((player) => upsertRosterPlayer(bySlug["mobile-legends"].id, player)));
  await Promise.all(
    basketballOpenRoster.map((player) => upsertRosterPlayer(bySlug["basketball-open-category"].id, player)),
  );

  await upsertMatchSchedule({
    categoryId: bySlug["basketball-open-category"].id,
    opponentName: "To be announced",
    matchDate: new Date("2026-06-01T18:00:00+08:00"),
    venue: "Lapu-Lapu City Hoops Festival Court",
    status: MatchStatus.SCHEDULED,
    remarks: "Opening fixture placeholder. Update once the official bracket is released.",
    userId: admin.id,
  });

  await upsertTeamStanding({
    categoryId: bySlug["basketball-open-category"].id,
    teamName: "St. Dominic Hoopers",
    wins: 0,
    losses: 0,
    points: 0,
    rank: 0,
    scoreDifference: 0,
    remarks: "Standings will update after official results.",
    userId: admin.id,
  });

  await seedMobileLegendsScheduleAndStandings(bySlug["mobile-legends"].id, admin.id);

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

  await prisma.galleryItem.createMany({
    data: [
      {
        title: "Team photos coming soon",
        description: "Official media will be uploaded once available.",
        displayOrder: 1,
        published: true,
        createdById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE",
      entity: "Seed",
      summary: "Seeded initial St. Dominic Hoopers portal data.",
    },
  });

  console.log("Seed complete.");
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
