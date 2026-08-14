"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import { importSecrets } from "@/app/actions";
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

export function EnvironmentImportDialog({
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
        await importSecrets(environmentId, formData);
        setOpen(false);
      } catch {
        setError(
          "Não foi possível importar o arquivo. Selecione um arquivo cujo nome comece com .env e tenha até 1 MB.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar .env</DialogTitle>
          <DialogDescription>
            Chaves existentes recebem uma nova versão.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="environment-file">
              Arquivo .env{" "}
              <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only"> (obrigatório)</span>
            </Label>
            <Input
              id="environment-file"
              name="file"
              type="file"
              required
            />
            <p className="text-xs text-muted-foreground">
              Aceita .env, .env.local, .env.production.local e semelhantes, até
              1 MB.
            </p>
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" /> : <Upload />}
            {pending ? "Importando..." : "Importar arquivo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
