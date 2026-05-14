"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-lg border bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-black">The portal could not load.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please check the database and environment configuration, then try again.
        </p>
        <Button type="button" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
