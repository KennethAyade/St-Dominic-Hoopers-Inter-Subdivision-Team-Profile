import { UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerStatusBadge } from "@/components/public/status-badge";
import { fullName, } from "@/lib/format";
import type { PlayerStatus } from "@/generated/prisma/browser";

export function PlayerCard({
  player,
  role,
  category,
}: {
  player: {
    firstName: string;
    lastName: string;
    nickname?: string | null;
    jerseyNumber?: string | null;
    status: PlayerStatus;
    seedNote?: string | null;
  };
  role?: string | null;
  category?: string;
}) {
  return (
    <Card>
      <CardContent className="flex gap-4 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <UserRound className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{fullName(player)}</h3>
            <PlayerStatusBadge status={player.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {role || "Player"}
            {category ? ` · ${category}` : ""}
            {player.jerseyNumber ? ` · #${player.jerseyNumber}` : ""}
          </p>
          {player.seedNote ? <p className="mt-2 text-xs font-medium text-amber-700">{player.seedNote}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
