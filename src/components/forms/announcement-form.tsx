"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AnnouncementCategory } from "@/generated/prisma/browser";
import { saveAnnouncement } from "@/actions/admin";
import { announcementSchema, type AnnouncementInput } from "@/schemas";
import { ANNOUNCEMENT_CATEGORY_LABELS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";

export function AnnouncementForm({ initialData }: { initialData?: Partial<AnnouncementInput> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      id: initialData?.id,
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      content: initialData?.content ?? "",
      category: initialData?.category ?? AnnouncementCategory.UPDATE,
      published: initialData?.published ?? false,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveAnnouncement(values);
      toast[result.ok ? "success" : "error"](result.message);
      if (result.ok && !values.id) form.reset({ category: AnnouncementCategory.UPDATE, published: false } as AnnouncementInput);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Title" htmlFor="announcementTitle" error={form.formState.errors.title?.message}>
        <Input
          id="announcementTitle"
          {...form.register("title", {
            onChange: (event) => !form.getValues("id") && form.setValue("slug", slugify(event.target.value)),
          })}
        />
      </FormField>
      <FormField label="Slug" htmlFor="announcementSlug" error={form.formState.errors.slug?.message}>
        <Input id="announcementSlug" {...form.register("slug")} />
      </FormField>
      <FormField label="Category" htmlFor="announcementCategory" error={form.formState.errors.category?.message}>
        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="announcementCategory">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AnnouncementCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {ANNOUNCEMENT_CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <FormField label="Content" htmlFor="announcementContent" error={form.formState.errors.content?.message}>
        <Textarea id="announcementContent" className="min-h-44" {...form.register("content")} />
      </FormField>
      <label className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
        <input type="checkbox" className="h-4 w-4" {...form.register("published")} />
        Published
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save announcement"}
      </Button>
    </form>
  );
}
