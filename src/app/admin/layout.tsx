import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <div className="flex min-w-0">
        <AdminSidebar />
        <div className="min-w-0 flex-1 overflow-x-hidden">
          <AdminMobileNav />
          <main className="mx-auto w-full max-w-7xl min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
