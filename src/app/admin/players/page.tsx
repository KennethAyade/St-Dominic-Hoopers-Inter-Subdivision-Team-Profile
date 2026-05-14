import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { PlayerForm } from "@/components/forms/player-form";
import { PlayerStatusBadge } from "@/components/public/status-badge";
import { EmptyState } from "@/components/public/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  const players = await prisma.player.findMany({
    include: { rosterEntries: { include: { category: true } } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <>
      <AdminPageHeader
        title="Players"
        description="Add, edit, delete, and verify player records."
        actions={
          <AdminFormDialog title="Add player" triggerLabel="Add player">
            <PlayerForm />
          </AdminFormDialog>
        }
      />
      {players.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>No.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-semibold">{fullName(player)}</TableCell>
                <TableCell>{player.defaultRole || "-"}</TableCell>
                <TableCell>{player.jerseyNumber || "-"}</TableCell>
                <TableCell>
                  <PlayerStatusBadge status={player.status} />
                </TableCell>
                <TableCell>{player.rosterEntries.map((entry) => entry.category.name).join(", ") || "-"}</TableCell>
                <TableCell className="max-w-xs text-muted-foreground">{player.seedNote || player.notes || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AdminEditDialog title="Edit player">
                      <PlayerForm
                        initialData={{
                          id: player.id,
                          firstName: player.firstName,
                          lastName: player.lastName,
                          nickname: player.nickname ?? "",
                          defaultRole: player.defaultRole ?? "",
                          jerseyNumber: player.jerseyNumber ?? "",
                          ageGroup: player.ageGroup ?? "",
                          status: player.status,
                          notes: player.notes ?? "",
                          seedNote: player.seedNote ?? "",
                        }}
                      />
                    </AdminEditDialog>
                    <DeleteButton id={player.id} kind="player" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="No players yet." description="Add the first player to begin building rosters." />
      )}
    </>
  );
}
