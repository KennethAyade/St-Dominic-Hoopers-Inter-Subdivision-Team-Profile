"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { auth } from "../../auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  announcementSchema,
  galleryItemSchema,
  playerSchema,
  rosterEntrySchema,
  scheduleSchema,
  sportCategorySchema,
  standingSchema,
  userSchema,
} from "@/schemas";
import type { AuditAction, Prisma } from "@/generated/prisma/client";

type ActionResult = {
  ok: boolean;
  message: string;
};

async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return session.user;
}

async function writeAudit(input: {
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  summary: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      summary: input.summary,
      metadata: input.metadata,
    },
  });
}

function revalidatePortal() {
  [
    "/",
    "/sports",
    "/rosters",
    "/schedules",
    "/standings",
    "/announcements",
    "/gallery",
    "/admin",
    "/admin/players",
    "/admin/sports",
    "/admin/rosters",
    "/admin/schedules",
    "/admin/standings",
    "/admin/announcements",
    "/admin/gallery",
    "/admin/users",
  ].forEach((path) => revalidatePath(path));
}

function actionError(error: unknown): ActionResult {
  if (error instanceof Error && error.message === "Unauthorized") {
    return { ok: false, message: "You are not authorized to perform this action." };
  }

  return { ok: false, message: "Something went wrong. Please review the fields and try again." };
}

export async function savePlayer(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const data = playerSchema.parse(input);
    const { id, categoryIds, ...playerData } = data;

    const player = id
      ? await prisma.player.update({
          where: { id },
          data: { ...playerData, updatedById: user.id },
        })
      : await prisma.player.create({
          data: { ...playerData, createdById: user.id, updatedById: user.id },
        });

    if (categoryIds) {
      await syncPlayerRosterCategories({
        playerId: player.id,
        categoryIds,
        role: player.defaultRole,
        jerseyNumber: player.jerseyNumber,
        userId: user.id,
      });
    }

    await writeAudit({
      userId: user.id,
      action: id ? "UPDATE" : "CREATE",
      entity: "Player",
      entityId: player.id,
      summary: `${id ? "Updated" : "Created"} player ${player.firstName} ${player.lastName}.`,
    });
    revalidatePortal();
    return { ok: true, message: "Player saved." };
  } catch (error) {
    return actionError(error);
  }
}

async function syncPlayerRosterCategories(input: {
  playerId: string;
  categoryIds: string[];
  role?: string | null;
  jerseyNumber?: string | null;
  userId: string;
}) {
  const categoryIds = Array.from(new Set(input.categoryIds.filter(Boolean)));
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });

  if (categories.length !== categoryIds.length) {
    throw new Error("Invalid category assignment");
  }

  const existingEntries = await prisma.rosterEntry.findMany({
    where: { playerId: input.playerId },
    select: { id: true, categoryId: true },
  });
  const existingCategoryIds = new Set(existingEntries.map((entry) => entry.categoryId));
  const entryRole = input.role?.trim() || "Player";
  const newEntries = categoryIds
    .filter((categoryId) => !existingCategoryIds.has(categoryId))
    .map((categoryId) => ({
      playerId: input.playerId,
      categoryId,
      role: entryRole,
      jerseyNumber: input.jerseyNumber || null,
      createdById: input.userId,
      updatedById: input.userId,
    }));
  const writes = [
    prisma.rosterEntry.deleteMany({
      where: {
        playerId: input.playerId,
        categoryId: { notIn: categoryIds },
      },
    }),
  ];

  if (newEntries.length) {
    writes.push(
      prisma.rosterEntry.createMany({
        data: newEntries,
        skipDuplicates: true,
      }),
    );
  }

  await prisma.$transaction(writes);
}

export async function deletePlayer(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    await prisma.player.delete({ where: { id } });
    await writeAudit({ userId: user.id, action: "DELETE", entity: "Player", entityId: id, summary: "Deleted player." });
    revalidatePortal();
    return { ok: true, message: "Player deleted." };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveSportCategory(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const data = sportCategorySchema.parse(input);

    const sportSlug = slugify(data.sportSlug || data.sportName);
    const categorySlug = slugify(data.categorySlug || data.categoryName);

    const sport = data.sportId
      ? await prisma.sport.update({
          where: { id: data.sportId },
          data: {
            name: data.sportName,
            slug: sportSlug,
            description: data.sportDescription,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        })
      : await prisma.sport.upsert({
          where: { slug: sportSlug },
          update: {
            name: data.sportName,
            description: data.sportDescription,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
          create: {
            name: data.sportName,
            slug: sportSlug,
            description: data.sportDescription,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        });

    const category = data.categoryId
      ? await prisma.category.update({
          where: { id: data.categoryId },
          data: {
            sportId: sport.id,
            name: data.categoryName,
            slug: categorySlug,
            description: data.categoryDescription,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        })
      : await prisma.category.create({
          data: {
            sportId: sport.id,
            name: data.categoryName,
            slug: categorySlug,
            description: data.categoryDescription,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        });

    await writeAudit({
      userId: user.id,
      action: data.categoryId ? "UPDATE" : "CREATE",
      entity: "Category",
      entityId: category.id,
      summary: `${data.categoryId ? "Updated" : "Created"} category ${category.name}.`,
    });
    revalidatePortal();
    return { ok: true, message: "Sport/category saved." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    await prisma.category.delete({ where: { id } });
    await writeAudit({ userId: user.id, action: "DELETE", entity: "Category", entityId: id, summary: "Deleted category." });
    revalidatePortal();
    return { ok: true, message: "Category deleted." };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveRosterEntry(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const data = rosterEntrySchema.parse(input);
    const rosterEntry = data.id
      ? await prisma.rosterEntry.update({
          where: { id: data.id },
          data: { ...data, id: undefined, updatedById: user.id },
        })
      : await prisma.rosterEntry.create({
          data: { ...data, createdById: user.id, updatedById: user.id },
        });

    await writeAudit({
      userId: user.id,
      action: data.id ? "UPDATE" : "CREATE",
      entity: "RosterEntry",
      entityId: rosterEntry.id,
      summary: `${data.id ? "Updated" : "Created"} roster entry.`,
    });
    revalidatePortal();
    return { ok: true, message: "Roster entry saved." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteRosterEntry(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    await prisma.rosterEntry.delete({ where: { id } });
    await writeAudit({ userId: user.id, action: "DELETE", entity: "RosterEntry", entityId: id, summary: "Deleted roster entry." });
    revalidatePortal();
    return { ok: true, message: "Roster entry deleted." };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveSchedule(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const data = scheduleSchema.parse(input);
    const payload = {
      categoryId: data.categoryId,
      opponentName: data.opponentName,
      matchDate: new Date(data.matchDate),
      venue: data.venue,
      status: data.status,
      homeScore: data.homeScore,
      opponentScore: data.opponentScore,
      resultText: data.resultText,
      remarks: data.remarks,
    };

    const schedule = data.id
      ? await prisma.matchSchedule.update({ where: { id: data.id }, data: { ...payload, updatedById: user.id } })
      : await prisma.matchSchedule.create({ data: { ...payload, createdById: user.id, updatedById: user.id } });

    await writeAudit({
      userId: user.id,
      action: data.id ? "UPDATE" : "CREATE",
      entity: "MatchSchedule",
      entityId: schedule.id,
      summary: `${data.id ? "Updated" : "Created"} match schedule.`,
    });
    revalidatePortal();
    return { ok: true, message: "Schedule saved." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteSchedule(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    await prisma.matchSchedule.delete({ where: { id } });
    await writeAudit({ userId: user.id, action: "DELETE", entity: "MatchSchedule", entityId: id, summary: "Deleted schedule." });
    revalidatePortal();
    return { ok: true, message: "Schedule deleted." };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveStanding(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const data = standingSchema.parse(input);
    const payload = {
      categoryId: data.categoryId,
      playerId: data.playerId,
      teamName: data.teamName,
      playerName: data.playerName,
      wins: data.wins,
      losses: data.losses,
      points: data.points,
      rank: data.rank,
      scoreDifference: data.scoreDifference,
      remarks: data.remarks,
    };

    const standing = data.id
      ? await prisma.standing.update({ where: { id: data.id }, data: { ...payload, updatedById: user.id } })
      : await prisma.standing.create({ data: { ...payload, createdById: user.id, updatedById: user.id } });

    await writeAudit({
      userId: user.id,
      action: data.id ? "UPDATE" : "CREATE",
      entity: "Standing",
      entityId: standing.id,
      summary: `${data.id ? "Updated" : "Created"} standing row.`,
    });
    revalidatePortal();
    return { ok: true, message: "Standing saved." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteStanding(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    await prisma.standing.delete({ where: { id } });
    await writeAudit({ userId: user.id, action: "DELETE", entity: "Standing", entityId: id, summary: "Deleted standing." });
    revalidatePortal();
    return { ok: true, message: "Standing deleted." };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveAnnouncement(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const data = announcementSchema.parse(input);
    const publishedAt = data.published ? new Date() : null;
    const announcement = data.id
      ? await prisma.announcement.update({
          where: { id: data.id },
          data: {
            title: data.title,
            slug: slugify(data.slug || data.title),
            content: data.content,
            category: data.category,
            published: data.published,
            publishedAt,
            updatedById: user.id,
          },
        })
      : await prisma.announcement.create({
          data: {
            title: data.title,
            slug: slugify(data.slug || data.title),
            content: data.content,
            category: data.category,
            published: data.published,
            publishedAt,
            createdById: user.id,
            updatedById: user.id,
          },
        });

    await writeAudit({
      userId: user.id,
      action: data.id ? "UPDATE" : "CREATE",
      entity: "Announcement",
      entityId: announcement.id,
      summary: `${data.id ? "Updated" : "Created"} announcement ${announcement.title}.`,
    });
    revalidatePortal();
    revalidatePath(`/announcements/${announcement.slug}`);
    return { ok: true, message: "Announcement saved." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    await prisma.announcement.delete({ where: { id } });
    await writeAudit({ userId: user.id, action: "DELETE", entity: "Announcement", entityId: id, summary: "Deleted announcement." });
    revalidatePortal();
    return { ok: true, message: "Announcement deleted." };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveGalleryItem(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const data = galleryItemSchema.parse(input);
    const galleryItem = data.id
      ? await prisma.galleryItem.update({
          where: { id: data.id },
          data: { ...data, id: undefined, updatedById: user.id },
        })
      : await prisma.galleryItem.create({
          data: { ...data, createdById: user.id, updatedById: user.id },
        });

    await writeAudit({
      userId: user.id,
      action: data.id ? "UPDATE" : "CREATE",
      entity: "GalleryItem",
      entityId: galleryItem.id,
      summary: `${data.id ? "Updated" : "Created"} gallery item.`,
    });
    revalidatePortal();
    return { ok: true, message: "Gallery item saved." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    await prisma.galleryItem.delete({ where: { id } });
    await writeAudit({ userId: user.id, action: "DELETE", entity: "GalleryItem", entityId: id, summary: "Deleted gallery item." });
    revalidatePortal();
    return { ok: true, message: "Gallery item deleted." };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveUser(input: unknown): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = userSchema.parse(input);
    const passwordHash = data.password ? await hash(data.password, 12) : undefined;

    const user = data.id
      ? await prisma.user.update({
          where: { id: data.id },
          data: {
            name: data.name,
            email: data.email,
            role: data.role,
            ...(passwordHash ? { passwordHash } : {}),
          },
        })
      : await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            role: data.role,
            passwordHash,
          },
        });

    await writeAudit({
      userId: admin.id,
      action: data.id ? "UPDATE" : "CREATE",
      entity: "User",
      entityId: user.id,
      summary: `${data.id ? "Updated" : "Created"} user ${user.email}.`,
    });
    revalidatePortal();
    return { ok: true, message: "User saved." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (admin.id === id) {
      return { ok: false, message: "You cannot delete your own admin account." };
    }
    await prisma.user.delete({ where: { id } });
    await writeAudit({ userId: admin.id, action: "DELETE", entity: "User", entityId: id, summary: "Deleted user." });
    revalidatePortal();
    return { ok: true, message: "User deleted." };
  } catch (error) {
    return actionError(error);
  }
}
