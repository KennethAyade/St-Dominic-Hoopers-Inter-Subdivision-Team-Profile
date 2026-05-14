"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { GalleryItemType } from "@/generated/prisma/browser";
import { saveGalleryItem } from "@/actions/admin";
import { galleryItemSchema, type GalleryItemInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";

type Option = { id: string; label: string };

export function GalleryItemForm({ initialData, categories }: { initialData?: Partial<GalleryItemInput>; categories: Option[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<GalleryItemInput>({
    resolver: zodResolver(galleryItemSchema),
    defaultValues: {
      id: initialData?.id,
      categoryId: initialData?.categoryId ?? "",
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      type: initialData?.type ?? GalleryItemType.PHOTO,
      published: initialData?.published ?? false,
      displayOrder: initialData?.displayOrder ?? 0,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveGalleryItem(values);
      toast[result.ok ? "success" : "error"](result.message);
      if (result.ok && !values.id) form.reset({ type: GalleryItemType.PHOTO, published: false, displayOrder: 0 } as GalleryItemInput);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Title" htmlFor="galleryTitle" error={form.formState.errors.title?.message}>
        <Input id="galleryTitle" {...form.register("title")} />
      </FormField>
      <FormField label="Related category" htmlFor="galleryCategory" error={form.formState.errors.categoryId?.message}>
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value || "none"} onValueChange={(value) => field.onChange(value === "none" ? "" : value)}>
              <SelectTrigger id="galleryCategory">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General media</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Image/video URL" htmlFor="imageUrl" error={form.formState.errors.imageUrl?.message}>
          <Input id="imageUrl" {...form.register("imageUrl")} />
        </FormField>
        <FormField label="Type" htmlFor="galleryType" error={form.formState.errors.type?.message}>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="galleryType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(GalleryItemType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Display order" htmlFor="displayOrder" error={form.formState.errors.displayOrder?.message}>
          <Input id="displayOrder" type="number" {...form.register("displayOrder", { valueAsNumber: true })} />
        </FormField>
        <label className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4" {...form.register("published")} />
          Published
        </label>
      </div>
      <FormField label="Description" htmlFor="galleryDescription" error={form.formState.errors.description?.message}>
        <Textarea id="galleryDescription" {...form.register("description")} />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save gallery item"}
      </Button>
    </form>
  );
}
