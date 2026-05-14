import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/public/player-avatar";
import { fullName } from "@/lib/format";
import type { PlayerStatus } from "@/generated/prisma/browser";

type RosterProfileEntry = {
  id: string;
  role: string;
  jerseyNumber?: string | null;
  isCaptain?: boolean;
  isCoach?: boolean;
  isManager?: boolean;
  notes?: string | null;
  category: { name: string; sport?: { name: string } };
  player: {
    firstName: string;
    lastName: string;
    nickname?: string | null;
    imageUrl?: string | null;
    status: PlayerStatus;
    seedNote?: string | null;
  };
};

function groupLabel(entry: RosterProfileEntry) {
  const role = entry.role.toLowerCase();
  if (entry.isCoach || role.includes("coach")) return "Coaches";
  if (entry.isManager || role.includes("manager")) return "Managers";
  if (entry.isCaptain || role.includes("captain")) return "Team Officials";
  return "Players";
}

const groupOrder = ["Players", "Team Officials", "Coaches", "Managers"];

export function RosterProfileGrid({ entries, showCategory = false }: { entries: RosterProfileEntry[]; showCategory?: boolean }) {
  const grouped = groupOrder
    .map((label) => ({
      label,
      entries: entries.filter((entry) => groupLabel(entry) === label),
    }))
    .filter((group) => group.entries.length > 0);

  return (
    <div className="grid gap-8">
      {grouped.map((group) => (
        <section key={group.label}>
          <h2 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{group.label}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.entries.map((entry) => {
              const name = fullName(entry.player);
              return (
                <Card key={entry.id} className="border-green-100 bg-white shadow-sm transition-colors hover:border-emerald-300">
                  <CardContent className="flex min-h-36 flex-col items-center justify-center p-5 text-center">
                    <PlayerAvatar name={name} imageUrl={entry.player.imageUrl} className="mb-3 h-16 w-16" />
                    <h3 className="text-sm font-black leading-tight text-slate-950">{name}</h3>
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      {entry.jerseyNumber ? `#${entry.jerseyNumber} · ` : ""}
                      {entry.role}
                    </p>
                    {showCategory ? <p className="mt-1 text-xs text-muted-foreground">{entry.category.name}</p> : null}
                    <Badge className="mt-3 bg-primary text-white hover:bg-primary">
                      {entry.isCoach ? "Coach" : entry.isManager ? "Manager" : entry.isCaptain ? "Captain" : "Player"}
                    </Badge>
                    {entry.player.seedNote ? <p className="mt-2 text-xs text-amber-700">{entry.player.seedNote}</p> : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
