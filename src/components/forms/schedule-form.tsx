"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MatchStatus } from "@/generated/prisma/browser";
import { saveSchedule } from "@/actions/admin";
import { scheduleSchema, type ScheduleInput } from "@/schemas";
import { MATCH_STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";

type Option = { id: string; label: string };

const toLocalInput = (value?: string | Date) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

export function ScheduleForm({ initialData, categories }: { initialData?: Partial<ScheduleInput>; categories: Option[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ScheduleInput>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      id: initialData?.id,
      categoryId: initialData?.categoryId ?? "",
      opponentName: initialData?.opponentName ?? "",
      matchDate: toLocalInput(initialData?.matchDate),
      venue: initialData?.venue ?? "",
      status: initialData?.status ?? MatchStatus.SCHEDULED,
      homeScore: initialData?.homeScore,
      opponentScore: initialData?.opponentScore,
      resultText: initialData?.resultText ?? "",
      remarks: initialData?.remarks ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveSchedule(values);
      toast[result.ok ? "success" : "error"](result.message);
      if (result.ok && !values.id) form.reset({ status: MatchStatus.SCHEDULED } as ScheduleInput);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Sport/category" htmlFor="scheduleCategory" error={form.formState.errors.categoryId?.message}>
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="scheduleCategory">
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
        <FormField label="Opponent/team" htmlFor="opponentName" error={form.formState.errors.opponentName?.message}>
          <Input id="opponentName" {...form.register("opponentName")} />
        </FormField>
        <FormField label="Match date/time" htmlFor="matchDate" error={form.formState.errors.matchDate?.message}>
          <Input id="matchDate" type="datetime-local" {...form.register("matchDate")} />
        </FormField>
        <FormField label="Venue" htmlFor="venue" error={form.formState.errors.venue?.message}>
          <Input id="venue" {...form.register("venue")} />
        </FormField>
        <FormField label="Status" htmlFor="scheduleStatus" error={form.formState.errors.status?.message}>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="scheduleStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MatchStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {MATCH_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="St. Dominic score" htmlFor="homeScore" error={form.formState.errors.homeScore?.message}>
          <Input
            id="homeScore"
            type="number"
            {...form.register("homeScore", { setValueAs: (value) => (value === "" ? undefined : Number(value)) })}
          />
        </FormField>
        <FormField label="Opponent score" htmlFor="opponentScore" error={form.formState.errors.opponentScore?.message}>
          <Input
            id="opponentScore"
            type="number"
            {...form.register("opponentScore", { setValueAs: (value) => (value === "" ? undefined : Number(value)) })}
          />
        </FormField>
      </div>
      <FormField label="Score/result text" htmlFor="resultText" error={form.formState.errors.resultText?.message}>
        <Input id="resultText" placeholder="Won 78-66, Best of 3, etc." {...form.register("resultText")} />
      </FormField>
      <FormField label="Remarks" htmlFor="scheduleRemarks" error={form.formState.errors.remarks?.message}>
        <Textarea id="scheduleRemarks" {...form.register("remarks")} />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save schedule"}
      </Button>
    </form>
  );
}
