import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { SportCategoryForm } from "@/components/forms/sport-category-form";
import { EmptyState } from "@/components/public/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminSportsPage() {
  const categories = await prisma.category.findMany({
    include: { sport: true, _count: { select: { rosterEntries: true, matchSchedules: true, standings: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <AdminPageHeader
        title="Sports and categories"
        description="Manage sports, public category pages, and category metadata."
        actions={
          <AdminFormDialog title="Add sport/category" triggerLabel="Add category">
            <SportCategoryForm />
          </AdminFormDialog>
        }
      />
      {categories.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Counts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-semibold">{category.name}</TableCell>
                <TableCell>{category.sport.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  {category._count.rosterEntries} roster · {category._count.matchSchedules} matches · {category._count.standings} standings
                </TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? "success" : "muted"}>{category.isActive ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AdminEditDialog title="Edit sport/category">
                      <SportCategoryForm
                        initialData={{
                          sportId: category.sport.id,
                          sportName: category.sport.name,
                          sportSlug: category.sport.slug,
                          sportDescription: category.sport.description ?? "",
                          categoryId: category.id,
                          categoryName: category.name,
                          categorySlug: category.slug,
                          categoryDescription: category.description ?? "",
                          sortOrder: category.sortOrder,
                          isActive: category.isActive,
                        }}
                      />
                    </AdminEditDialog>
                    <DeleteButton id={category.id} kind="category" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="No categories yet." />
      )}
    </>
  );
}
