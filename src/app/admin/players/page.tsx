import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { PlayerForm } from "@/components/forms/player-form";
import { PlayerAvatar } from "@/components/public/player-avatar";
import { PlayerStatusBadge } from "@/components/public/status-badge";
import { EmptyState } from "@/components/public/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sport?: string }>;
}) {
  const { category, sport } = await searchParams;
  const [categories, players, totalPlayers] = await Promise.all([
    prisma.category.findMany({
      include: {
        sport: true,
        _count: { select: { rosterEntries: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.player.findMany({
      where: category
        ? { rosterEntries: { some: { category: { slug: category } } } }
        : sport
          ? { rosterEntries: { some: { category: { sport: { slug: sport } } } } }
          : undefined,
      include: { rosterEntries: { include: { category: { include: { sport: true } } } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.player.count(),
  ]);

  const sports = Array.from(
    categories
      .reduce((map, item) => {
        const current = map.get(item.sport.slug) ?? {
          slug: item.sport.slug,
          name: item.sport.name,
          count: 0,
        };
        current.count += item._count.rosterEntries;
        map.set(item.sport.slug, current);
        return map;
      }, new Map<string, { slug: string; name: string; count: number }>())
      .values(),
  );

  const activeLabel =
    categories.find((item) => item.slug === category)?.name ||
    sports.find((item) => item.slug === sport)?.name ||
    "All players";
  const categoryOptions = categories.map((item) => ({
    id: item.id,
    label: item.name,
    sportLabel: item.sport.name,
  }));

  return (
    <>
      <AdminPageHeader
        title="Players"
        description="Add, edit, delete, and verify player records."
        actions={
          <AdminFormDialog title="Add player" triggerLabel="Add player">
            <PlayerForm categories={categoryOptions} />
          </AdminFormDialog>
        }
      />
      <section className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black">Filter players by sport/category</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{players.length}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPlayers}</span> players: {activeLabel}
            </p>
          </div>
          {(category || sport) ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/players">Clear filter</Link>
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-normal text-muted-foreground">Sports</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant={!category && !sport ? "default" : "outline"}>
                <Link href="/admin/players">All</Link>
              </Button>
              {sports.map((item) => (
                <Button key={item.slug} asChild size="sm" variant={sport === item.slug && !category ? "default" : "outline"}>
                  <Link href={`/admin/players?sport=${item.slug}`}>
                    {item.name}
                    <Badge variant="secondary" className="ml-2">
                      {item.count}
                    </Badge>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-normal text-muted-foreground">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <Button key={item.id} asChild size="sm" variant={category === item.slug ? "default" : "outline"}>
                  <Link href={`/admin/players?category=${item.slug}`}>
                    {item.name}
                    <Badge variant="secondary" className="ml-2">
                      {item._count.rosterEntries}
                    </Badge>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
      {players.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
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
                <TableCell>
                  <PlayerAvatar name={fullName(player)} imageUrl={player.imageUrl} className="h-10 w-10 text-xs" />
                </TableCell>
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
                          imageUrl: player.imageUrl ?? "",
                          categoryIds: Array.from(new Set(player.rosterEntries.map((entry) => entry.categoryId))),
                          defaultRole: player.defaultRole ?? "",
                          jerseyNumber: player.jerseyNumber ?? "",
                          ageGroup: player.ageGroup ?? "",
                          status: player.status,
                          notes: player.notes ?? "",
                          seedNote: player.seedNote ?? "",
                        }}
                        categories={categoryOptions}
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
