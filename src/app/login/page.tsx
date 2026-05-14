import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { LoginForm } from "@/components/forms/login-form";
import { SiteShell } from "@/components/public/site-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");

  return (
    <SiteShell>
      <section className="mx-auto flex w-full max-w-md flex-1 px-4 py-16 sm:px-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Admin sign in</CardTitle>
            <CardDescription>Authorized admins can manage tournament data and announcements.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
