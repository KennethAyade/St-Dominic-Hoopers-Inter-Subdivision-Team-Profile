import { z } from "zod";
import { AnnouncementCategory, GalleryItemType, MatchStatus, PlayerStatus, Role } from "@/generated/prisma/browser";

const optionalText = z.string().trim().optional();
const optionalNumber = z.number().int().optional();

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().email("Enter a valid email address."),
  subject: z.string().trim().min(4, "Subject is required."),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
});

export const playerSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  nickname: optionalText,
  imageUrl: optionalText,
  defaultRole: optionalText,
  jerseyNumber: optionalText,
  ageGroup: optionalText,
  status: z.nativeEnum(PlayerStatus),
  notes: optionalText,
  seedNote: optionalText,
});

export const sportCategorySchema = z.object({
  sportId: z.string().optional(),
  sportName: z.string().trim().min(1, "Sport name is required."),
  sportSlug: z.string().trim().min(1, "Sport slug is required."),
  sportDescription: optionalText,
  categoryId: z.string().optional(),
  categoryName: z.string().trim().min(1, "Category name is required."),
  categorySlug: z.string().trim().min(1, "Category slug is required."),
  categoryDescription: optionalText,
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export const rosterEntrySchema = z.object({
  id: z.string().optional(),
  playerId: z.string().min(1, "Player is required."),
  categoryId: z.string().min(1, "Category is required."),
  role: z.string().trim().min(1, "Role is required."),
  jerseyNumber: optionalText,
  isCaptain: z.boolean(),
  isCoach: z.boolean(),
  isManager: z.boolean(),
  notes: optionalText,
});

export const scheduleSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, "Category is required."),
  opponentName: z.string().trim().min(1, "Opponent is required."),
  matchDate: z.string().min(1, "Match date and time are required."),
  venue: z.string().trim().min(1, "Venue is required."),
  status: z.nativeEnum(MatchStatus),
  homeScore: optionalNumber,
  opponentScore: optionalNumber,
  resultText: optionalText,
  remarks: optionalText,
});

export const standingSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, "Category is required."),
  playerId: optionalText,
  teamName: optionalText,
  playerName: optionalText,
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  points: z.number().int(),
  rank: z.number().int().min(0),
  scoreDifference: z.number().int(),
  remarks: optionalText,
});

export const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Title is required."),
  slug: z.string().trim().min(2, "Slug is required."),
  content: z.string().trim().min(10, "Content must be at least 10 characters."),
  category: z.nativeEnum(AnnouncementCategory),
  published: z.boolean(),
});

export const galleryItemSchema = z.object({
  id: z.string().optional(),
  categoryId: optionalText,
  title: z.string().trim().min(2, "Title is required."),
  description: optionalText,
  imageUrl: optionalText,
  type: z.nativeEnum(GalleryItemType),
  published: z.boolean(),
  displayOrder: z.number().int(),
});

export const userSchema = z.object({
  id: z.string().optional(),
  name: optionalText,
  email: z.string().email("Enter a valid email address."),
  password: z.string().optional(),
  role: z.nativeEnum(Role),
}).superRefine((value, ctx) => {
  if (!value.id && (!value.password || value.password.length < 8)) {
    ctx.addIssue({
      code: "custom",
      path: ["password"],
      message: "New users need a password of at least 8 characters.",
    });
  }
  if (value.password && value.password.length > 0 && value.password.length < 8) {
    ctx.addIssue({
      code: "custom",
      path: ["password"],
      message: "Password must be at least 8 characters.",
    });
  }
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type PlayerInput = z.infer<typeof playerSchema>;
export type SportCategoryInput = z.infer<typeof sportCategorySchema>;
export type RosterEntryInput = z.infer<typeof rosterEntrySchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type StandingInput = z.infer<typeof standingSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
export type UserInput = z.infer<typeof userSchema>;
