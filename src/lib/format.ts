const MANILA_TIME_ZONE = "Asia/Manila";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: MANILA_TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: MANILA_TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: MANILA_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: Date | string) {
  const parts = Object.fromEntries(dateTimeFormatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]));
  return `${parts.month} ${parts.day}, ${parts.year} ${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
}

export function formatTime(value: Date | string) {
  return timeFormatter.format(new Date(value));
}

export function fullName(player: { firstName: string; lastName: string; nickname?: string | null }) {
  return player.nickname
    ? `${player.firstName} "${player.nickname}" ${player.lastName}`
    : `${player.firstName} ${player.lastName}`;
}
