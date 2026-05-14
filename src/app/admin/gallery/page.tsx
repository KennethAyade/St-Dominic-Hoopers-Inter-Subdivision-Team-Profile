import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { GalleryItemForm } from "@/components/forms/gallery-item-form";
import { EmptyState } from "@/components/public/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const [items, categories] = await Promise.all([
    prisma.galleryItem.findMany({ include: { category: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }] }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  const categoryOptions = categories.map((category) => ({ id: category.id, label: category.name }));

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Prepare media placeholders and publish photos when available."
        actions={
          <AdminFormDialog title="Add gallery item" triggerLabel="Add media">
            <GalleryItemForm categories={categoryOptions} />
          </AdminFormDialog>
        }
      />
      {items.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-semibold">{item.title}</TableCell>
                <TableCell>{item.category?.name || "General"}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>
                  <Badge variant={item.published ? "success" : "muted"}>{item.published ? "Published" : "Draft"}</Badge>
                </TableCell>
                <TableCell>{item.displayOrder}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AdminEditDialog title="Edit gallery item">
                      <GalleryItemForm
                        categories={categoryOptions}
                        initialData={{
                          id: item.id,
                          categoryId: item.categoryId ?? "",
                          title: item.title,
                          description: item.description ?? "",
                          imageUrl: item.imageUrl ?? "",
                          type: item.type,
                          published: item.published,
                          displayOrder: item.displayOrder,
                        }}
                      />
                    </AdminEditDialog>
                    <DeleteButton id={item.id} kind="gallery" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="No gallery items yet." />
      )}
    </>
  );
}
