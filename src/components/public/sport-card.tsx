import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
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
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Trophy className="h-6 w-6" />
          </div>
          <CardTitle className="group-hover:text-primary">{name}</CardTitle>
          <p className="text-sm font-medium text-muted-foreground">{sportName}</p>
        </CardHeader>
        <CardContent>
          <p className="min-h-12 text-sm text-muted-foreground">{description || "Official category page for rosters, schedules, and standings."}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="secondary">{rosterCount ?? 0} roster entries</Badge>
            <Badge variant="outline">{scheduleCount ?? 0} matches</Badge>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
            View details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
