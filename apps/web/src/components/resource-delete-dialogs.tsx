"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/app/actions";
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
import { Spinner } from "@/components/ui/spinner";

function DeleteDialog({
  triggerLabel,
  title,
  description,
  errorMessage,
  onDelete,
}: {
  triggerLabel: string;
  title: string;
  description: string;
  errorMessage: string;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (pending) return;
    setOpen(nextOpen);
    if (nextOpen) setError("");
  }

  function confirm() {
    startTransition(async () => {
      setError("");
      try {
        await onDelete();
      } catch {
        setError(errorMessage);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 />
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            aria-busy={pending}
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {pending ? <Spinner /> : null}
            {pending ? "Excluindo..." : "Excluir definitivamente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ProjectDeleteDialog({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();

  return (
    <DeleteDialog
      triggerLabel="Excluir projeto"
      title={`Excluir ${projectName}?`}
      description="Todos os ambientes, variáveis e históricos deste projeto serão excluídos permanentemente. Esta ação não pode ser desfeita."
      errorMessage="Não foi possível excluir o projeto. Tente novamente."
      onDelete={async () => {
        await deleteProject(projectId);
        router.push("/dashboard/projects");
        router.refresh();
      }}
    />
  );
}
