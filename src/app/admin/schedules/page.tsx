import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { ScheduleForm } from "@/components/forms/schedule-form";
import { MatchStatusBadge } from "@/components/public/status-badge";
import { EmptyState } from "@/components/public/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminSchedulesPage() {
  const [schedules, categories] = await Promise.all([
    prisma.matchSchedule.findMany({ include: { category: true }, orderBy: { matchDate: "desc" } }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

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
      {schedules.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Opponent</TableHead>
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
                <TableCell>{schedule.resultText || "-"}</TableCell>
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
