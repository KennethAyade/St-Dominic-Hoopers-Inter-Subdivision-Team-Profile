import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SportCard({
  name,
  sportName,
  slug,
  description,
  rosterCount,
  scheduleCount,
}: {
  name: string;
  sportName: string;
  slug: string;
  description?: string | null;
  rosterCount?: number;
  scheduleCount?: number;
}) {
  return (
    <Link href={`/sports/${slug}`} className="group block">
      <Card className="h-full border-green-100 bg-white shadow-sm transition-colors hover:border-emerald-300">
        <CardHeader className="p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Trophy className="h-5 w-5" />
          </div>
          <CardTitle className="group-hover:text-primary">{name}</CardTitle>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">{sportName}</p>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <p className="text-sm leading-6 text-muted-foreground">{description || "Official category page for rosters, schedules, and standings."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{rosterCount ?? 0} roster entries</Badge>
            <Badge variant="outline">{scheduleCount ?? 0} matches</Badge>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-black text-emerald-700">
            View details <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
