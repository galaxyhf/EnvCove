"use client";

import { useId, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createEnvironment } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export function EnvironmentCreateDialog({ projectId }: { projectId: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setError("");
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      setError("");
      try {
        await createEnvironment(projectId, formData);
        setOpen(false);
      } catch {
        setError("Não foi possível criar o ambiente. Verifique os dados.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo ambiente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar ambiente</DialogTitle>
          <DialogDescription>
            Isole um novo conjunto de variáveis.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>
              Nome <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only"> (obrigatório)</span>
            </Label>
            <Input id={`${id}-name`} name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-description`}>Descrição</Label>
            <Input id={`${id}-description`} name="description" />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={pending} aria-busy={pending}>
            {pending ? <Spinner /> : null}
            {pending ? "Criando..." : "Criar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
