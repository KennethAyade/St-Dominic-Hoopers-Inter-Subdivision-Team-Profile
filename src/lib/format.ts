import { format } from "date-fns";

export function formatDate(value: Date | string) {
  return format(new Date(value), "MMM d, yyyy");
}

export function formatDateTime(value: Date | string) {
  return format(new Date(value), "MMM d, yyyy h:mm a");
}

export function formatTime(value: Date | string) {
  return format(new Date(value), "h:mm a");
}

export function fullName(player: { firstName: string; lastName: string; nickname?: string | null }) {
  return player.nickname
    ? `${player.firstName} "${player.nickname}" ${player.lastName}`
    : `${player.firstName} ${player.lastName}`;
}
