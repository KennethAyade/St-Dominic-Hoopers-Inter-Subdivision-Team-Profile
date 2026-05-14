"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { saveRosterEntry } from "@/actions/admin";
import { rosterEntrySchema, type RosterEntryInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";

type Option = { id: string; label: string };

export function RosterEntryForm({
  initialData,
  players,
  categories,
}: {
  initialData?: Partial<RosterEntryInput>;
  players: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<RosterEntryInput>({
    resolver: zodResolver(rosterEntrySchema),
    defaultValues: {
      id: initialData?.id,
      playerId: initialData?.playerId ?? "",
      categoryId: initialData?.categoryId ?? "",
      role: initialData?.role ?? "",
      jerseyNumber: initialData?.jerseyNumber ?? "",
      isCaptain: initialData?.isCaptain ?? false,
      isCoach: initialData?.isCoach ?? false,
      isManager: initialData?.isManager ?? false,
      notes: initialData?.notes ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveRosterEntry(values);
      toast[result.ok ? "success" : "error"](result.message);
      if (result.ok && !values.id) form.reset({ isCaptain: false, isCoach: false, isManager: false } as RosterEntryInput);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Player" htmlFor="playerId" error={form.formState.errors.playerId?.message}>
        <Controller
          control={form.control}
          name="playerId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="playerId">
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <FormField label="Sport/category" htmlFor="categoryId" error={form.formState.errors.categoryId?.message}>
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
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
        <FormField label="Role / position" htmlFor="role" error={form.formState.errors.role?.message}>
          <Input id="role" placeholder="Guard, Jungler, Doubles Partner" {...form.register("role")} />
        </FormField>
        <FormField label="Jersey number" htmlFor="rosterJersey" error={form.formState.errors.jerseyNumber?.message}>
          <Input id="rosterJersey" {...form.register("jerseyNumber")} />
        </FormField>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4" {...form.register("isCaptain")} />
          Captain
        </label>
        <label className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4" {...form.register("isCoach")} />
          Coach
        </label>
        <label className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4" {...form.register("isManager")} />
          Manager
        </label>
      </div>
      <FormField label="Notes" htmlFor="rosterNotes" error={form.formState.errors.notes?.message}>
        <Textarea id="rosterNotes" {...form.register("notes")} />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save roster entry"}
      </Button>
    </form>
  );
}
