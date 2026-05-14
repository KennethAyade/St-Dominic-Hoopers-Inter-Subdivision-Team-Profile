import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEditDialog, AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { UserForm } from "@/components/forms/user-form";
import { EmptyState } from "@/components/public/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { email: "asc" }] });

  return (
    <>
      <AdminPageHeader
        title="Admin users"
        description="Manage dashboard users and roles."
        actions={
          <AdminFormDialog title="Add user" triggerLabel="Add user">
            <UserForm />
          </AdminFormDialog>
        }
      />
      {users.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-semibold">{user.name || "-"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                </TableCell>
                <TableCell>{formatDateTime(user.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AdminEditDialog title="Edit user">
                      <UserForm
                        initialData={{
                          id: user.id,
                          name: user.name ?? "",
                          email: user.email,
                          role: user.role,
                        }}
                      />
                    </AdminEditDialog>
                    <DeleteButton id={user.id} kind="user" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="No users yet." />
      )}
    </>
  );
}
