"use client";
import { useState } from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  History,
  Pencil,
  Trash2,
} from "lucide-react";
import { deleteSecret, saveSecret } from "@/app/actions";
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
        <Dialog>
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
            <form
              action={saveSecret.bind(null, environmentId)}
              className="space-y-4"
            >
              <input type="hidden" name="key" value={secret.key} />
              <input
                type="hidden"
                name="description"
                value={secret.description}
              />
              <div className="space-y-2">
                <Label htmlFor={`secret-value-${secret.id}`}>Novo valor</Label>
                <Input
                  id={`secret-value-${secret.id}`}
                  name="value"
                  type="password"
                  required
                />
              </div>
              <Button className="w-full">Salvar nova versão</Button>
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
        <form action={deleteSecret.bind(null, secret.id)}>
          <Button size="icon-sm" variant="ghost" className="text-destructive">
            <Trash2 />
          </Button>
        </form>
      </div>
    </div>
  );
}
