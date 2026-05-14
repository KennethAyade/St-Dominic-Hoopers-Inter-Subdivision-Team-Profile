import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { SiteShell } from "@/components/public/site-shell";
import { PageHeader } from "@/components/public/page-header";
import { AnnouncementCategoryBadge } from "@/components/public/status-badge";

export const dynamic = "force-dynamic";

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const announcement = await prisma.announcement.findFirst({
    where: { slug, published: true },
  });

  if (!announcement) notFound();

  return (
    <SiteShell>
      <PageHeader eyebrow="Announcement" title={announcement.title} />
      <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <AnnouncementCategoryBadge category={announcement.category} />
          <span className="text-sm font-medium text-muted-foreground">
            {formatDateTime(announcement.publishedAt || announcement.createdAt)}
          </span>
        </div>
        <div className="whitespace-pre-line text-base leading-8 text-slate-700">{announcement.content}</div>
      </article>
    </SiteShell>
  );
}
