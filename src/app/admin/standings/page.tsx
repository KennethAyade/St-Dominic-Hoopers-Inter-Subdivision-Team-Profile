import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/format";
import { compareStandings, sortStandings, standingEntryName } from "@/lib/standings";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { StandingForm } from "@/components/forms/standing-form";
import { EmptyState } from "@/components/public/empty-state";
import { CategoryFilterBar } from "@/components/public/category-filter-bar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminStandingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params?.category;
  const [categories, players] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { standings: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.player.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);
  const filterCategories = categories.filter((category) => category._count.standings > 0);
  const activeCategory = filterCategories.find((category) => category.slug === categorySlug);
  const standingRows = await prisma.standing.findMany({
    where: activeCategory ? { categoryId: activeCategory.id } : {},
    include: { category: true, player: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { category: { name: "asc" } }],
  });
  const standings = activeCategory
    ? sortStandings(standingRows)
    : [...standingRows].sort((a, b) => {
        const categoryOrder =
          a.category.sortOrder - b.category.sortOrder || a.category.name.localeCompare(b.category.name);
        return categoryOrder || compareStandings(a, b);
      });

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
      <div className="mb-6">
        <CategoryFilterBar
          basePath="/admin/standings"
          activeSlug={activeCategory?.slug}
          categories={filterCategories.map((category) => ({
            slug: category.slug,
            name: category.name,
            count: category._count.standings,
          }))}
        />
      </div>
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
                <TableCell className="font-semibold">{standingEntryName(standing)}</TableCell>
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
