"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password.");
        return;
      }

      toast.success("Signed in.");
      router.push(searchParams.get("callbackUrl") || "/admin");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Email" htmlFor="loginEmail" error={form.formState.errors.email?.message}>
        <Input id="loginEmail" type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <FormField label="Password" htmlFor="loginPassword" error={form.formState.errors.password?.message}>
        <Input id="loginPassword" type="password" autoComplete="current-password" {...form.register("password")} />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
