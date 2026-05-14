"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { saveStanding } from "@/actions/admin";
import { standingSchema, type StandingInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";

type Option = { id: string; label: string };

export function StandingForm({
  initialData,
  categories,
  players,
}: {
  initialData?: Partial<StandingInput>;
  categories: Option[];
  players: Option[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<StandingInput>({
    resolver: zodResolver(standingSchema),
    defaultValues: {
      id: initialData?.id,
      categoryId: initialData?.categoryId ?? "",
      playerId: initialData?.playerId ?? "",
      teamName: initialData?.teamName ?? "St. Dominic Hoopers",
      playerName: initialData?.playerName ?? "",
      wins: initialData?.wins ?? 0,
      losses: initialData?.losses ?? 0,
      points: initialData?.points ?? 0,
      rank: initialData?.rank ?? 0,
      scoreDifference: initialData?.scoreDifference ?? 0,
      remarks: initialData?.remarks ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveStanding(values);
      toast[result.ok ? "success" : "error"](result.message);
      if (result.ok && !values.id) form.reset({ wins: 0, losses: 0, points: 0, rank: 0, scoreDifference: 0 } as StandingInput);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Sport/category" htmlFor="standingCategory" error={form.formState.errors.categoryId?.message}>
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="standingCategory">
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
        <FormField label="Team name" htmlFor="teamName" error={form.formState.errors.teamName?.message}>
          <Input id="teamName" {...form.register("teamName")} />
        </FormField>
        <FormField label="Linked player" htmlFor="standingPlayer" error={form.formState.errors.playerId?.message}>
          <Controller
            control={form.control}
            name="playerId"
            render={({ field }) => (
              <Select value={field.value || "none"} onValueChange={(value) => field.onChange(value === "none" ? "" : value)}>
                <SelectTrigger id="standingPlayer">
                  <SelectValue placeholder="Optional player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked player</SelectItem>
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
        <FormField label="Player display name" htmlFor="playerName" error={form.formState.errors.playerName?.message}>
          <Input id="playerName" {...form.register("playerName")} />
        </FormField>
        <FormField label="Rank" htmlFor="rank" error={form.formState.errors.rank?.message}>
          <Input id="rank" type="number" {...form.register("rank", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Wins" htmlFor="wins" error={form.formState.errors.wins?.message}>
          <Input id="wins" type="number" {...form.register("wins", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Losses" htmlFor="losses" error={form.formState.errors.losses?.message}>
          <Input id="losses" type="number" {...form.register("losses", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Points" htmlFor="points" error={form.formState.errors.points?.message}>
          <Input id="points" type="number" {...form.register("points", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Score difference" htmlFor="scoreDifference" error={form.formState.errors.scoreDifference?.message}>
          <Input id="scoreDifference" type="number" {...form.register("scoreDifference", { valueAsNumber: true })} />
        </FormField>
      </div>
      <FormField label="Remarks" htmlFor="standingRemarks" error={form.formState.errors.remarks?.message}>
        <Textarea id="standingRemarks" {...form.register("remarks")} />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save standing"}
      </Button>
    </form>
  );
}
