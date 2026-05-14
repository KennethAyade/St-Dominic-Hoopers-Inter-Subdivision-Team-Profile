export const SITE_NAME = "St. Dominic Hoopers Mayor's Cup Team Portal";
export const TEAM_NAME = "St. Dominic Hoopers";
export const TOURNAMENT_NAME = "Mayor's Cup / Lapu-Lapu City Hoops Sports Festival 2026";

export const NAV_LINKS = [
  { href: "/sports", label: "Sports" },
  { href: "/rosters", label: "Rosters" },
  { href: "/schedules", label: "Schedules" },
  { href: "/standings", label: "Standings" },
  { href: "/announcements", label: "Announcements" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/sports", label: "Sports" },
  { href: "/admin/rosters", label: "Rosters" },
  { href: "/admin/schedules", label: "Schedules" },
  { href: "/admin/standings", label: "Standings" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/users", label: "Users" },
];

export const MATCH_STATUS_LABELS = {
  SCHEDULED: "Scheduled",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  POSTPONED: "Postponed",
} as const;

export const PLAYER_STATUS_LABELS = {
  ACTIVE: "Active",
  INJURED: "Injured",
  INACTIVE: "Inactive",
  REMOVED: "Removed",
} as const;

export const ANNOUNCEMENT_CATEGORY_LABELS = {
  UPDATE: "Update",
  REMINDER: "Reminder",
  RESULT: "Result",
  NOTICE: "Notice",
} as const;
