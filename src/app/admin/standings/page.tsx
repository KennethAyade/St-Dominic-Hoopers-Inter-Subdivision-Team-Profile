import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { StandingForm } from "@/components/forms/standing-form";
import { EmptyState } from "@/components/public/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminStandingsPage() {
  const [standings, categories, players] = await Promise.all([
    prisma.standing.findMany({ include: { category: true, player: true }, orderBy: [{ category: { sortOrder: "asc" } }, { rank: "asc" }] }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.player.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);

  const categoryOptions = categories.map((category) => ({ id: category.id, label: category.name }));
  const playerOptions = players.map((player) => ({ id: player.id, label: fullName(player) }));

  return (
    <>
      <AdminPageHeader
        title="Standings"
        description="Manually maintain standings per sport/category."
        actions={
          <AdminFormDialog title="Add standing row" triggerLabel="Add standing">
            <StandingForm categories={categoryOptions} players={playerOptions} />
          </AdminFormDialog>
        }
      />
      {standings.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>W</TableHead>
              <TableHead>L</TableHead>
              <TableHead>Pts</TableHead>
              <TableHead>Diff</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((standing) => (
              <TableRow key={standing.id}>
                <TableCell>{standing.category.name}</TableCell>
                <TableCell className="font-semibold">
                  {standing.teamName || standing.playerName || (standing.player ? fullName(standing.player) : "Entry")}
                </TableCell>
                <TableCell>{standing.rank || "-"}</TableCell>
                <TableCell>{standing.wins}</TableCell>
                <TableCell>{standing.losses}</TableCell>
                <TableCell>{standing.points}</TableCell>
                <TableCell>{standing.scoreDifference}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AdminEditDialog title="Edit standing">
                      <StandingForm
                        categories={categoryOptions}
                        players={playerOptions}
                        initialData={{
                          id: standing.id,
                          categoryId: standing.categoryId,
                          playerId: standing.playerId ?? "",
                          teamName: standing.teamName ?? "",
                          playerName: standing.playerName ?? "",
                          wins: standing.wins,
                          losses: standing.losses,
                          points: standing.points,
                          rank: standing.rank,
                          scoreDifference: standing.scoreDifference,
                          remarks: standing.remarks ?? "",
                        }}
                      />
                    </AdminEditDialog>
                    <DeleteButton id={standing.id} kind="standing" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="No standings yet." />
      )}
    </>
  );
}
