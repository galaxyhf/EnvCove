"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createProject } from "@/app/actions";
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
import { Textarea } from "@/components/ui/textarea";

export function ProjectCreateDialog() {
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
        await createProject(formData);
        setOpen(false);
      } catch {
        setError("Não foi possível criar o projeto. Verifique os dados.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo projeto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar projeto</DialogTitle>
          <DialogDescription>
            Organize variáveis em ambientes isolados.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">
              Nome <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only"> (obrigatório)</span>
            </Label>
            <Input
              id="project-name"
              name="name"
              placeholder="SQLVault"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Descrição</Label>
            <Textarea id="project-description" name="description" />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={pending} aria-busy={pending}>
            {pending ? <Spinner /> : null}
            {pending ? "Criando..." : "Criar projeto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
