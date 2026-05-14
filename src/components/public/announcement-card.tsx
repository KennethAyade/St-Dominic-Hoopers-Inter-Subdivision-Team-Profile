import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementCategoryBadge } from "@/components/public/status-badge";
import { formatDate } from "@/lib/format";
import type { AnnouncementCategory } from "@/generated/prisma/browser";

export function AnnouncementCard({
  announcement,
}: {
  announcement: {
    title: string;
    slug: string;
    content: string;
    category: AnnouncementCategory;
    publishedAt?: Date | null;
    createdAt: Date;
  };
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <AnnouncementCategoryBadge category={announcement.category} />
          <span className="text-xs font-medium text-muted-foreground">
            {formatDate(announcement.publishedAt || announcement.createdAt)}
          </span>
        </div>
        <CardTitle>{announcement.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">{announcement.content}</p>
        <Link href={`/announcements/${announcement.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Read notice <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
