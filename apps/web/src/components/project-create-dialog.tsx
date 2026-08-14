"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Plus } from "lucide-react";
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
            <Label htmlFor="project-name">Nome</Label>
            <Input
              id="project-name"
              name="name"
              placeholder="SQLVault"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-slug">Identificador (slug)</Label>
            <Input
              id="project-slug"
              name="slug"
              placeholder="sqlvault"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              title="Use apenas letras minúsculas, números e hífens."
              aria-describedby="project-slug-help"
              required
            />
            <p
              id="project-slug-help"
              className="text-xs leading-relaxed text-muted-foreground"
            >
              Nome curto usado em URLs e comandos, sem espaços. Exemplo:
              sqlvault-api.
            </p>
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
          <Button className="w-full" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" /> : null}
            {pending ? "Criando..." : "Criar projeto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
