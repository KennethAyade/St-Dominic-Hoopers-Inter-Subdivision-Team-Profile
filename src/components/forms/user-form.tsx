"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Role } from "@/generated/prisma/browser";
import { saveUser } from "@/actions/admin";
import { userSchema, type UserInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";

export function UserForm({ initialData }: { initialData?: Partial<UserInput> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      password: "",
      role: initialData?.role ?? Role.USER,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveUser(values);
      toast[result.ok ? "success" : "error"](result.message);
      if (result.ok && !values.id) form.reset({ role: Role.USER } as UserInput);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Name" htmlFor="userName" error={form.formState.errors.name?.message}>
        <Input id="userName" {...form.register("name")} />
      </FormField>
      <FormField label="Email" htmlFor="userEmail" error={form.formState.errors.email?.message}>
        <Input id="userEmail" type="email" {...form.register("email")} />
      </FormField>
      <FormField label={initialData?.id ? "New password" : "Password"} htmlFor="password" error={form.formState.errors.password?.message}>
        <Input id="password" type="password" {...form.register("password")} />
      </FormField>
      <FormField label="Role" htmlFor="role" error={form.formState.errors.role?.message}>
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Role).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save user"}
      </Button>
    </form>
  );
}
