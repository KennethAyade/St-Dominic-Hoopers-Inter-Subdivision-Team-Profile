import { AnnouncementCategory, MatchStatus, PlayerStatus } from "@/generated/prisma/browser";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { ANNOUNCEMENT_CATEGORY_LABELS, MATCH_STATUS_LABELS, PLAYER_STATUS_LABELS } from "@/lib/constants";

const matchVariant: Record<MatchStatus, BadgeProps["variant"]> = {
  SCHEDULED: "secondary",
  ONGOING: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
  POSTPONED: "muted",
};

const playerVariant: Record<PlayerStatus, BadgeProps["variant"]> = {
  ACTIVE: "success",
  INJURED: "warning",
  INACTIVE: "muted",
  REMOVED: "destructive",
};

const categoryVariant: Record<AnnouncementCategory, BadgeProps["variant"]> = {
  UPDATE: "secondary",
  REMINDER: "warning",
  RESULT: "success",
  NOTICE: "default",
};

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  return <Badge variant={matchVariant[status]}>{MATCH_STATUS_LABELS[status]}</Badge>;
}

export function PlayerStatusBadge({ status }: { status: PlayerStatus }) {
  return <Badge variant={playerVariant[status]}>{PLAYER_STATUS_LABELS[status]}</Badge>;
}

export function AnnouncementCategoryBadge({ category }: { category: AnnouncementCategory }) {
  return <Badge variant={categoryVariant[category]}>{ANNOUNCEMENT_CATEGORY_LABELS[category]}</Badge>;
}
