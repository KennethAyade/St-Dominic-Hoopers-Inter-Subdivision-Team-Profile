"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  deleteAnnouncement,
  deleteCategory,
  deleteGalleryItem,
  deletePlayer,
  deleteRosterEntry,
  deleteSchedule,
  deleteStanding,
  deleteUser,
} from "@/actions/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteKind = "player" | "category" | "roster" | "schedule" | "standing" | "announcement" | "gallery" | "user";

const actions = {
  player: deletePlayer,
  category: deleteCategory,
  roster: deleteRosterEntry,
  schedule: deleteSchedule,
  standing: deleteStanding,
  announcement: deleteAnnouncement,
  gallery: deleteGalleryItem,
  user: deleteUser,
};

export function DeleteButton({ id, kind, label = "Delete" }: { id: string; kind: DeleteKind; label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" type="button">
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete record?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The public portal and admin tables will update after deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await actions[kind](id);
                toast[result.ok ? "success" : "error"](result.message);
                router.refresh();
              });
            }}
          >
            {pending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
