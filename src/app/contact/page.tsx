import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { SiteShell } from "@/components/public/site-shell";
import { PageHeader } from "@/components/public/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Contact"
        title="Contact the team admin"
        description="Send official inquiries, schedule clarifications, correction requests, or announcement details."
      />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="grid gap-4">
          <Card>
            <CardContent className="flex gap-4 p-5">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-bold">Email notification</h2>
                <p className="mt-1 text-sm text-muted-foreground">Messages are sent to the configured admin email using SMTP.</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex gap-4 p-5">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-bold">Event coverage</h2>
                <p className="mt-1 text-sm text-muted-foreground">Mayor&apos;s Cup / Lapu-Lapu City Hoops Sports Festival 2026.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6">
            <ContactForm />
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
