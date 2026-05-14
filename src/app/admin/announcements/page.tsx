import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { AnnouncementForm } from "@/components/forms/announcement-form";
import { AnnouncementCategoryBadge } from "@/components/public/status-badge";
import { EmptyState } from "@/components/public/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  return (
    <>
      <AdminPageHeader
        title="Announcements"
        description="Create, publish, unpublish, and delete public notices."
        actions={
          <AdminFormDialog title="Add announcement" triggerLabel="Add announcement">
            <AnnouncementForm />
          </AdminFormDialog>
        }
      />
      {announcements.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell className="font-semibold">
                  {announcement.published ? (
                    <Link href={`/announcements/${announcement.slug}`} className="hover:underline">
                      {announcement.title}
                    </Link>
                  ) : (
                    announcement.title
                  )}
                </TableCell>
                <TableCell>
                  <AnnouncementCategoryBadge category={announcement.category} />
                </TableCell>
                <TableCell>
                  <Badge variant={announcement.published ? "success" : "muted"}>{announcement.published ? "Published" : "Draft"}</Badge>
                </TableCell>
                <TableCell>{formatDateTime(announcement.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AdminEditDialog title="Edit announcement">
                      <AnnouncementForm
                        initialData={{
                          id: announcement.id,
                          title: announcement.title,
                          slug: announcement.slug,
                          content: announcement.content,
                          category: announcement.category,
                          published: announcement.published,
                        }}
                      />
                    </AdminEditDialog>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/announcements/${announcement.slug}`}>View</Link>
                    </Button>
                    <DeleteButton id={announcement.id} kind="announcement" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="No announcements yet." />
      )}
    </>
  );
}
