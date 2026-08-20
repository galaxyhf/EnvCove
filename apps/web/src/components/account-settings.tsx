"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Laptop, LogOut, Save, ShieldCheck } from "lucide-react";
import {
  changePassword,
  revokeOtherWebSessions,
  revokeWebSession,
  updateProfile,
} from "@/app/account-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WebSession = {
  id: string;
  device: string;
  ipAddress: string | null;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
};

export function AccountSettings({
  user,
  sessions,
}: {
  user: { name: string; email: string };
  sessions: WebSession[];
}) {
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();

  function saveProfile(formData: FormData) {
    startProfileTransition(async () => {
      setProfileError("");
      setProfileMessage("");
      try {
        await updateProfile(formData);
        setProfileMessage("Perfil atualizado.");
        router.refresh();
      } catch {
        setProfileError(
          "Não foi possível atualizar. Confira os dados e a senha atual.",
        );
      }
    });
  }

  function savePassword(formData: FormData) {
    startPasswordTransition(async () => {
      setPasswordError("");
      setPasswordMessage("");
      try {
        await changePassword(formData);
        setPasswordMessage("Senha alterada e outras sessões encerradas.");
        router.refresh();
      } catch {
        setPasswordError(
          "Não foi possível alterar. Confirme a senha atual e use ao menos 9 caracteres.",
        );
      }
    });
  }

  async function revoke(sessionId: string) {
    if (revokingId || revokingOthers) return;
    setRevokingId(sessionId);
    setSessionError("");
    try {
      await revokeWebSession(sessionId);
      router.refresh();
    } catch {
      setSessionError("Não foi possível encerrar esta sessão.");
    } finally {
      setRevokingId(null);
    }
  }

  async function revokeOthers() {
    if (revokingId || revokingOthers) return;
    setRevokingOthers(true);
    setSessionError("");
    try {
      await revokeOtherWebSessions();
      router.refresh();
    } catch {
      setSessionError("Não foi possível encerrar as outras sessões.");
    } finally {
      setRevokingOthers(false);
    }
  }

  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="security">Segurança</TabsTrigger>
        <TabsTrigger value="sessions">Sessões</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>
              Atualize a identidade exibida no dashboard e na auditoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-lg">
            <form action={saveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nome</Label>
                <Input
                  id="profile-name"
                  name="name"
                  defaultValue={user.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-current-password">Senha atual</Label>
                <Input
                  id="profile-current-password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Necessária para confirmar alterações na conta.
                </p>
              </div>
              {profileError ? (
                <p className="text-sm text-destructive" role="alert">
                  {profileError}
                </p>
              ) : null}
              {profileMessage ? (
                <p className="text-sm text-primary" role="status">
                  {profileMessage}
                </p>
              ) : null}
              <Button disabled={profilePending} aria-busy={profilePending}>
                {profilePending ? <Spinner /> : <Save />}
                {profilePending ? "Salvando..." : "Salvar perfil"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Alterar senha</CardTitle>
            <CardDescription>
              A alteração encerra todas as outras sessões da conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-lg">
            <form action={savePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-current">Senha atual</Label>
                <Input
                  id="password-current"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-new">Nova senha</Label>
                <Input
                  id="password-new"
                  name="newPassword"
                  type="password"
                  minLength={9}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-confirm">Confirmar nova senha</Label>
                <Input
                  id="password-confirm"
                  name="confirmPassword"
                  type="password"
                  minLength={9}
                  autoComplete="new-password"
                  required
                />
              </div>
              {passwordError ? (
                <p className="text-sm text-destructive" role="alert">
                  {passwordError}
                </p>
              ) : null}
              {passwordMessage ? (
                <p className="text-sm text-primary" role="status">
                  {passwordMessage}
                </p>
              ) : null}
              <Button disabled={passwordPending} aria-busy={passwordPending}>
                {passwordPending ? <Spinner /> : <ShieldCheck />}
                {passwordPending ? "Alterando..." : "Alterar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="sessions">
        <Card>
          <CardHeader>
            <CardTitle>Sessões ativas</CardTitle>
            <CardDescription>
              Navegadores autorizados a acessar esta conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {sessions.some((session) => !session.current) ? (
              <div className="flex items-center justify-between gap-4 border-b p-4">
                <p className="text-xs text-muted-foreground">
                  Não reconhece as demais sessões?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={Boolean(revokingId) || revokingOthers}
                  aria-busy={revokingOthers}
                  onClick={() => void revokeOthers()}
                >
                  {revokingOthers ? <Spinner /> : <LogOut />}
                  {revokingOthers
                    ? "Encerrando..."
                    : "Encerrar outras sessões"}
                </Button>
              </div>
            ) : null}
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 border-b p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <Laptop className="mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {session.device}
                      {session.current ? (
                        <span className="ml-2 text-xs text-primary">
                          Sessão atual
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Último acesso em{" "}
                      {new Date(session.lastSeenAt).toLocaleString("pt-BR")}
                      {session.ipAddress ? ` · ${session.ipAddress}` : ""}
                    </p>
                  </div>
                </div>
                {!session.current ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={Boolean(revokingId) || revokingOthers}
                    aria-busy={revokingId === session.id}
                    onClick={() => void revoke(session.id)}
                  >
                    {revokingId === session.id ? <Spinner /> : <LogOut />}
                    {revokingId === session.id ? "Encerrando..." : "Encerrar"}
                  </Button>
                ) : null}
              </div>
            ))}
            {sessionError ? (
              <p className="border-t p-4 text-sm text-destructive" role="alert">
                {sessionError}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
