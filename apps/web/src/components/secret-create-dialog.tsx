"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { saveSecret } from "@/app/actions";
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

export function SecretCreateDialog({
  environmentId,
}: {
  environmentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (pending) return;
    setOpen(nextOpen);
    if (nextOpen) setError("");
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      setError("");
      try {
        await saveSecret(environmentId, formData);
        setOpen(false);
      } catch {
        setError("Não foi possível criar a variável. Verifique os dados.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Adicionar variável
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar variável</DialogTitle>
          <DialogDescription>
            Criptografada antes de ser armazenada.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secret-key">
              Chave <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only"> (obrigatório)</span>
            </Label>
            <Input id="secret-key" name="key" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret-value">
              Valor <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only"> (obrigatório)</span>
            </Label>
            <Input
              id="secret-value"
              name="value"
              type="password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret-description">Descrição</Label>
            <Input id="secret-description" name="description" />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" /> : null}
            {pending ? "Salvando..." : "Criptografar e salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
