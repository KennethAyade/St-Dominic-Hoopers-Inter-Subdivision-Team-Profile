import Image from "next/image";
import { Camera } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/public/site-shell";
import { PageHeader } from "@/components/public/page-header";
import { EmptyState } from "@/components/public/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Gallery"
        title="Photos and media"
        description="Official photos can be added from the admin dashboard. Placeholder entries keep the section ready before event media arrives."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative flex aspect-video items-center justify-center bg-muted">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
                  ) : (
                    <Camera className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-5">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">{item.type}</Badge>
                    {item.category ? <Badge variant="outline">{item.category.name}</Badge> : null}
                  </div>
                  <h2 className="font-bold">{item.title}</h2>
                  {item.description ? <p className="mt-2 text-sm text-muted-foreground">{item.description}</p> : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Gallery will be updated soon." description="Admins can publish photos and media after the tournament begins." />
        )}
      </section>
    </SiteShell>
  );
}
