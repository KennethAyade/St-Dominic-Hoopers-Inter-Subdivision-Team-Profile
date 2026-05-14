import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { formatScheduleResult } from "@/lib/matchup";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { ScheduleForm } from "@/components/forms/schedule-form";
import { MatchStatusBadge } from "@/components/public/status-badge";
import { EmptyState } from "@/components/public/empty-state";
import { CategoryFilterBar } from "@/components/public/category-filter-bar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminSchedulesPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params?.category;
  const categories = await prisma.category.findMany({
    include: { _count: { select: { matchSchedules: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const filterCategories = categories.filter((category) => category._count.matchSchedules > 0);
  const activeCategory = filterCategories.find((category) => category.slug === categorySlug);
  const schedules = await prisma.matchSchedule.findMany({
    where: activeCategory ? { categoryId: activeCategory.id } : {},
    include: { category: true },
    orderBy: { matchDate: "desc" },
  });

  const categoryOptions = categories.map((category) => ({ id: category.id, label: category.name }));

  return (
    <>
      <AdminPageHeader
        title="Schedules and results"
        description="Create fixtures, update statuses, and record scores."
        actions={
          <AdminFormDialog title="Add schedule" triggerLabel="Add schedule">
            <ScheduleForm categories={categoryOptions} />
          </AdminFormDialog>
        }
      />
      <div className="mb-6">
        <CategoryFilterBar
          basePath="/admin/schedules"
          activeSlug={activeCategory?.slug}
          categories={filterCategories.map((category) => ({
            slug: category.slug,
            name: category.name,
            count: category._count.matchSchedules,
          }))}
        />
      </div>
      {schedules.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Match / teams</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{formatDateTime(schedule.matchDate)}</TableCell>
                <TableCell>{schedule.category.name}</TableCell>
                <TableCell>{schedule.opponentName}</TableCell>
                <TableCell>{schedule.venue}</TableCell>
                <TableCell>
                  <MatchStatusBadge status={schedule.status} />
                </TableCell>
                <TableCell>{formatScheduleResult(schedule)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AdminEditDialog title="Edit schedule">
                      <ScheduleForm
                        categories={categoryOptions}
                        initialData={{
                          id: schedule.id,
                          categoryId: schedule.categoryId,
                          opponentName: schedule.opponentName,
                          matchDate: schedule.matchDate.toISOString(),
                          venue: schedule.venue,
                          status: schedule.status,
                          homeScore: schedule.homeScore ?? undefined,
                          opponentScore: schedule.opponentScore ?? undefined,
                          resultText: schedule.resultText ?? "",
                          remarks: schedule.remarks ?? "",
                        }}
                      />
                    </AdminEditDialog>
                    <DeleteButton id={schedule.id} kind="schedule" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="No schedules yet." />
      )}
    </>
  );
}
