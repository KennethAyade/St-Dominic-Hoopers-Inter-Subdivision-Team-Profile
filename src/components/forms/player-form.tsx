"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlayerStatus } from "@/generated/prisma/browser";
import { savePlayer } from "@/actions/admin";
import { playerSchema, type PlayerInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { PLAYER_STATUS_LABELS } from "@/lib/constants";

export function PlayerForm({ initialData }: { initialData?: Partial<PlayerInput> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<PlayerInput>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      id: initialData?.id,
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      nickname: initialData?.nickname ?? "",
      defaultRole: initialData?.defaultRole ?? "",
      jerseyNumber: initialData?.jerseyNumber ?? "",
      ageGroup: initialData?.ageGroup ?? "",
      status: initialData?.status ?? PlayerStatus.ACTIVE,
      notes: initialData?.notes ?? "",
      seedNote: initialData?.seedNote ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await savePlayer(values);
      toast[result.ok ? "success" : "error"](result.message);
      if (result.ok && !values.id) form.reset({ status: PlayerStatus.ACTIVE } as PlayerInput);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="firstName" error={form.formState.errors.firstName?.message}>
          <Input id="firstName" {...form.register("firstName")} />
        </FormField>
        <FormField label="Last name" htmlFor="lastName" error={form.formState.errors.lastName?.message}>
          <Input id="lastName" {...form.register("lastName")} />
        </FormField>
        <FormField label="Nickname" htmlFor="nickname" error={form.formState.errors.nickname?.message}>
          <Input id="nickname" {...form.register("nickname")} />
        </FormField>
        <FormField label="Default role" htmlFor="defaultRole" error={form.formState.errors.defaultRole?.message}>
          <Input id="defaultRole" placeholder="Guard, Roam, Player" {...form.register("defaultRole")} />
        </FormField>
        <FormField label="Jersey number" htmlFor="jerseyNumber" error={form.formState.errors.jerseyNumber?.message}>
          <Input id="jerseyNumber" {...form.register("jerseyNumber")} />
        </FormField>
        <FormField label="Age group" htmlFor="ageGroup" error={form.formState.errors.ageGroup?.message}>
          <Input id="ageGroup" placeholder="Open, 14U" {...form.register("ageGroup")} />
        </FormField>
      </div>
      <FormField label="Status" htmlFor="status" error={form.formState.errors.status?.message}>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PlayerStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {PLAYER_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <FormField label="Notes" htmlFor="notes" error={form.formState.errors.notes?.message}>
        <Textarea id="notes" {...form.register("notes")} />
      </FormField>
      <FormField label="Seed note / verification note" htmlFor="seedNote" error={form.formState.errors.seedNote?.message}>
        <Textarea id="seedNote" {...form.register("seedNote")} />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save player"}
      </Button>
    </form>
  );
}
