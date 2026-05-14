import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/public/site-shell";
import { PageHeader } from "@/components/public/page-header";
import { AnnouncementCard } from "@/components/public/announcement-card";
import { EmptyState } from "@/components/public/empty-state";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Announcements"
        title="News, reminders, and official notices"
        description="Latest updates from the St. Dominic Hoopers admin team."
      />
      <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        {announcements.length ? (
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        ) : (
          <EmptyState title="No announcements posted yet." />
        )}
      </section>
    </SiteShell>
  );
}
