"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Copy,
  Plus,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
type Token = {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};
export function CliTokenManager({ tokens }: { tokens: Token[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copyPending, setCopyPending] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState<Token | null>(null);
  const [revokeError, setRevokeError] = useState("");
  const [revokePending, setRevokePending] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setCreated(null);
      setError("");
    }
  }
  async function create(fd: FormData) {
    setPending(true);
    setError("");
    try {
      const r = await fetch("/api/cli-tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: fd.get("name") }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError("Não foi possível criar o token. Verifique o nome.");
        return;
      }
      setCreated(data.token);
      router.refresh();
    } catch {
      setError("Não foi possível criar o token. Tente novamente.");
    } finally {
      setPending(false);
    }
  }
  async function revoke() {
    if (!tokenToRevoke) return;

    setRevokePending(true);
    setRevokeError("");
    try {
      const response = await fetch("/api/cli-tokens", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: tokenToRevoke.id }),
      });

      if (!response.ok) {
        setRevokeError("Não foi possível excluir o token. Tente novamente.");
        return;
      }

      setTokenToRevoke(null);
      router.refresh();
    } catch {
      setRevokeError("Não foi possível excluir o token. Tente novamente.");
    } finally {
      setRevokePending(false);
    }
  }
  return (
    <div>
      <div className="mb-8 flex justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Acesso</p>
          <h1 className="text-2xl font-semibold">Tokens da CLI</h1>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              Novo token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {created ? "Copie seu token" : "Criar token da CLI"}
              </DialogTitle>
              <DialogDescription>
                {created
                  ? "Ele será exibido uma única vez. Guarde-o com segurança."
                  : "Identifique o dispositivo ou pipeline."}
              </DialogDescription>
            </DialogHeader>
            {created ? (
              <div className="flex gap-2 rounded-md border p-3">
                <code className="min-w-0 flex-1 break-all text-xs text-primary">
                  {created}
                </code>
                <Button
                  size="sm"
                  disabled={copyPending}
                  aria-busy={copyPending}
                  onClick={async () => {
                    setCopyPending(true);
                    try {
                      await navigator.clipboard.writeText(created);
                      setOpen(false);
                    } finally {
                      setCopyPending(false);
                    }
                  }}
                >
                  {copyPending ? <Spinner /> : <Copy />}
                  {copyPending ? "Copiando..." : "Copiar e fechar"}
                </Button>
              </div>
            ) : (
              <form action={create} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token-name">
                    Nome{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only"> (obrigatório)</span>
                  </Label>
                  <Input
                    id="token-name"
                    name="name"
                    placeholder="Notebook pessoal"
                    required
                  />
                </div>
                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button
                  className="w-full"
                  disabled={pending}
                  aria-busy={pending}
                >
                  {pending ? <Spinner /> : null}
                  {pending ? "Gerando..." : "Gerar"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-hidden rounded-lg border">
        {tokens.length ? (
          tokens.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between border-b p-4 last:border-0"
            >
              <div className="flex gap-3">
                <TerminalSquare className="size-5" />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {t.tokenPrefix}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {t.lastUsedAt
                    ? "Usado em " +
                      new Date(t.lastUsedAt).toLocaleDateString("pt-BR")
                    : "Nunca usado"}
                </span>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Excluir token ${t.name}`}
                  onClick={() => {
                    setRevokeError("");
                    setTokenToRevoke(t);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="py-20 text-center text-sm text-muted-foreground">
            Nenhum token da CLI.
          </p>
        )}
      </div>
      <AlertDialog
        open={Boolean(tokenToRevoke)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !revokePending) setTokenToRevoke(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir token {tokenToRevoke?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Este token perderá imediatamente o acesso à CLI. Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {revokeError ? (
            <p className="text-sm text-destructive" role="alert">
              {revokeError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokePending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={revokePending}
              aria-busy={revokePending}
              onClick={(event) => {
                event.preventDefault();
                void revoke();
              }}
            >
              {revokePending ? <Spinner /> : null}
              {revokePending ? "Excluindo..." : "Excluir token"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
