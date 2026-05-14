"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { saveSportCategory } from "@/actions/admin";
import { sportCategorySchema, type SportCategoryInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { slugify } from "@/lib/utils";

export function SportCategoryForm({ initialData }: { initialData?: Partial<SportCategoryInput> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<SportCategoryInput>({
    resolver: zodResolver(sportCategorySchema),
    defaultValues: {
      sportId: initialData?.sportId,
      sportName: initialData?.sportName ?? "",
      sportSlug: initialData?.sportSlug ?? "",
      sportDescription: initialData?.sportDescription ?? "",
      categoryId: initialData?.categoryId,
      categoryName: initialData?.categoryName ?? "",
      categorySlug: initialData?.categorySlug ?? "",
      categoryDescription: initialData?.categoryDescription ?? "",
      sortOrder: initialData?.sortOrder ?? 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveSportCategory(values);
      toast[result.ok ? "success" : "error"](result.message);
      if (result.ok && !values.categoryId) form.reset({ sortOrder: 0, isActive: true } as SportCategoryInput);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Sport name" htmlFor="sportName" error={form.formState.errors.sportName?.message}>
          <Input
            id="sportName"
            {...form.register("sportName", {
              onChange: (event) => !form.getValues("sportId") && form.setValue("sportSlug", slugify(event.target.value)),
            })}
          />
        </FormField>
        <FormField label="Sport slug" htmlFor="sportSlug" error={form.formState.errors.sportSlug?.message}>
          <Input id="sportSlug" {...form.register("sportSlug")} />
        </FormField>
      </div>
      <FormField label="Sport description" htmlFor="sportDescription" error={form.formState.errors.sportDescription?.message}>
        <Textarea id="sportDescription" {...form.register("sportDescription")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Category name" htmlFor="categoryName" error={form.formState.errors.categoryName?.message}>
          <Input
            id="categoryName"
            {...form.register("categoryName", {
              onChange: (event) => !form.getValues("categoryId") && form.setValue("categorySlug", slugify(event.target.value)),
            })}
          />
        </FormField>
        <FormField label="Category slug" htmlFor="categorySlug" error={form.formState.errors.categorySlug?.message}>
          <Input id="categorySlug" {...form.register("categorySlug")} />
        </FormField>
      </div>
      <FormField label="Category description" htmlFor="categoryDescription" error={form.formState.errors.categoryDescription?.message}>
        <Textarea id="categoryDescription" {...form.register("categoryDescription")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Sort order" htmlFor="sortOrder" error={form.formState.errors.sortOrder?.message}>
          <Input id="sortOrder" type="number" {...form.register("sortOrder", { valueAsNumber: true })} />
        </FormField>
        <label className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4" {...form.register("isActive")} />
          Active category
        </label>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save sport/category"}
      </Button>
    </form>
  );
}
