"use client";
import { useState, useTransition } from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  History,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { deleteSecret, saveSecret } from "@/app/actions";
import { Button } from "@/components/ui/button";
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
export type SecretListItem = {
  id: string;
  key: string;
  description: string;
  updatedAt: string;
  versions: string[];
};
export function SecretRow({
  secret,
  environmentId,
}: {
  secret: SecretListItem;
  environmentId: string;
}) {
  const [value, setValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState("");
  const [updating, startUpdateTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, startDeleteTransition] = useTransition();
  async function reveal() {
    if (value !== null) return setValue(null);
    const r = await fetch(`/api/secrets/${secret.id}/reveal`, {
      method: "POST",
    });
    const data = await r.json();
    if (r.ok) {
      setValue(data.value);
      setTimeout(() => setValue(null), 30000);
    }
  }
  async function copy() {
    let current = value;
    if (current === null) {
      const r = await fetch(`/api/secrets/${secret.id}/reveal`, {
        method: "POST",
      });
      const data = await r.json();
      if (!r.ok) return;
      current = data.value;
    }
    await navigator.clipboard.writeText(current ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  function update(formData: FormData) {
    startUpdateTransition(async () => {
      setEditError("");
      try {
        await saveSecret(environmentId, formData);
        setEditOpen(false);
      } catch {
        setEditError("Não foi possível atualizar a variável. Tente novamente.");
      }
    });
  }
  function confirmDelete() {
    startDeleteTransition(async () => {
      setDeleteError("");
      try {
        await deleteSecret(secret.id);
        setDeleteOpen(false);
      } catch {
        setDeleteError("Não foi possível excluir a variável. Tente novamente.");
      }
    });
  }
  return (
    <div className="grid gap-3 border-b p-4 last:border-0 lg:grid-cols-[1fr_1.2fr_110px_auto] lg:items-center">
      <div>
        <p className="font-mono text-sm font-medium">{secret.key}</p>
        <p className="truncate text-xs text-muted-foreground">
          {secret.description || "Sem descrição"}
        </p>
      </div>
      <code className="truncate rounded-md bg-muted/60 px-3 py-2 text-xs">
        {value ?? "••••••••••••••••"}
      </code>
      <time className="text-xs text-muted-foreground">
        {new Date(secret.updatedAt).toLocaleDateString("pt-BR")}
      </time>
      <div className="flex justify-end gap-1">
        <Button size="icon-sm" variant="ghost" onClick={reveal}>
          {value ? <EyeOff /> : <Eye />}
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={copy}>
          {copied ? <Check /> : <Copy />}
        </Button>
        <Dialog
          open={editOpen}
          onOpenChange={(nextOpen) => {
            if (updating) return;
            setEditOpen(nextOpen);
            if (nextOpen) setEditError("");
          }}
        >
          <DialogTrigger asChild>
            <Button size="icon-sm" variant="ghost">
              <Pencil />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar {secret.key}</DialogTitle>
              <DialogDescription>
                O valor atual permanece protegido. Salvar cria uma nova versão.
              </DialogDescription>
            </DialogHeader>
            <form action={update} className="space-y-4">
              <input type="hidden" name="key" value={secret.key} />
              <input
                type="hidden"
                name="description"
                value={secret.description}
              />
              <div className="space-y-2">
                <Label htmlFor={`secret-value-${secret.id}`}>
                  Novo valor{" "}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only"> (obrigatório)</span>
                </Label>
                <Input
                  id={`secret-value-${secret.id}`}
                  name="value"
                  type="password"
                  required
                />
              </div>
              {editError ? (
                <p className="text-sm text-destructive" role="alert">
                  {editError}
                </p>
              ) : null}
              <Button className="w-full" disabled={updating}>
                {updating ? <LoaderCircle className="animate-spin" /> : null}
                {updating ? "Salvando..." : "Salvar nova versão"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon-sm" variant="ghost">
              <History />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Histórico de {secret.key}</DialogTitle>
              <DialogDescription>
                Versões criptografadas mantidas para auditoria e recuperação.
              </DialogDescription>
            </DialogHeader>
            {secret.versions.map((date, i) => (
              <div
                key={date + i}
                className="flex justify-between border-b py-3 text-sm"
              >
                <span>Versão {secret.versions.length - i}</span>
                <time className="text-muted-foreground">
                  {new Date(date).toLocaleString("pt-BR")}
                </time>
              </div>
            ))}
          </DialogContent>
        </Dialog>
        <AlertDialog
          open={deleteOpen}
          onOpenChange={(nextOpen) => {
            if (deleting) return;
            setDeleteOpen(nextOpen);
            if (nextOpen) setDeleteError("");
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-destructive"
              aria-label={`Excluir ${secret.key}`}
            >
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {secret.key}?</AlertDialogTitle>
              <AlertDialogDescription>
                A variável e todo o histórico de versões serão excluídos
                permanentemente. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError ? (
              <p className="text-sm text-destructive" role="alert">
                {deleteError}
              </p>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleting}
                onClick={(event) => {
                  event.preventDefault();
                  confirmDelete();
                }}
              >
                {deleting ? "Excluindo..." : "Excluir definitivamente"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
