import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { RosterEntryForm } from "@/components/forms/roster-entry-form";
import { EmptyState } from "@/components/public/empty-state";
import { PlayerAvatar } from "@/components/public/player-avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminRostersPage() {
  const [entries, players, categories] = await Promise.all([
    prisma.rosterEntry.findMany({
      include: { player: true, category: { include: { sport: true } } },
      orderBy: [{ category: { sortOrder: "asc" } }, { role: "asc" }],
    }),
    prisma.player.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    prisma.category.findMany({ include: { sport: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  const playerOptions = players.map((player) => ({ id: player.id, label: fullName(player) }));
  const categoryOptions = categories.map((category) => ({ id: category.id, label: category.name }));

  return (
    <>
      <AdminPageHeader
        title="Roster entries"
        description="Assign players to one or more sport/category rosters with sport-specific roles."
        actions={
          <AdminFormDialog title="Add roster entry" triggerLabel="Add roster entry">
            <RosterEntryForm players={playerOptions} categories={categoryOptions} />
          </AdminFormDialog>
        }
      />
      {entries.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>No.</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <PlayerAvatar name={fullName(entry.player)} imageUrl={entry.player.imageUrl} className="h-10 w-10 text-xs" />
                </TableCell>
                <TableCell className="font-semibold">{fullName(entry.player)}</TableCell>
                <TableCell>{entry.category.name}</TableCell>
                <TableCell>{entry.role}</TableCell>
                <TableCell>{entry.jerseyNumber || "-"}</TableCell>
                <TableCell>
                  {[entry.isCaptain && "Captain", entry.isCoach && "Coach", entry.isManager && "Manager"].filter(Boolean).join(", ") || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AdminEditDialog title="Edit roster entry">
                      <RosterEntryForm
                        players={playerOptions}
                        categories={categoryOptions}
                        initialData={{
                          id: entry.id,
                          playerId: entry.playerId,
                          categoryId: entry.categoryId,
                          role: entry.role,
                          jerseyNumber: entry.jerseyNumber ?? "",
                          isCaptain: entry.isCaptain,
                          isCoach: entry.isCoach,
                          isManager: entry.isManager,
                          notes: entry.notes ?? "",
                        }}
                      />
                    </AdminEditDialog>
                    <DeleteButton id={entry.id} kind="roster" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="No roster entries yet." />
      )}
    </>
  );
}
