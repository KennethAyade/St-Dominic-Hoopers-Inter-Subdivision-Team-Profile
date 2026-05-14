"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactSchema, type ContactInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json().catch(() => ({ message: "Unable to send message." }));
      toast[response.ok ? "success" : "error"](body.message);
      if (response.ok) form.reset();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" htmlFor="contactName" error={form.formState.errors.name?.message}>
          <Input id="contactName" {...form.register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="contactEmail" error={form.formState.errors.email?.message}>
          <Input id="contactEmail" type="email" {...form.register("email")} />
        </FormField>
      </div>
      <FormField label="Subject" htmlFor="contactSubject" error={form.formState.errors.subject?.message}>
        <Input id="contactSubject" {...form.register("subject")} />
      </FormField>
      <FormField label="Message" htmlFor="contactMessage" error={form.formState.errors.message?.message}>
        <Textarea id="contactMessage" className="min-h-40" {...form.register("message")} />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
