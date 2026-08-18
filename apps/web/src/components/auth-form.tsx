"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

function AuthSubmitButton({
  mode,
  redirecting,
}: {
  mode: "login" | "register";
  redirecting: boolean;
}) {
  const { pending: submitting } = useFormStatus();
  const pending = submitting || redirecting;

  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? <Spinner /> : null}
      {pending
        ? mode === "login"
          ? "Entrando..."
          : "Criando conta..."
        : mode === "login"
          ? "Entrar"
          : "Criar conta"}
    </Button>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  async function submit(formData: FormData) {
    setError("");
    try {
      const email = String(formData.get("email"));
      const password = String(formData.get("password"));
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: formData.get("name"), email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "Não foi possível criar a conta.");
          return;
        }
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Email ou senha inválidos.");
        return;
      }
      setRedirecting(true);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(
        mode === "login"
          ? "Não foi possível entrar. Tente novamente."
          : "Não foi possível criar a conta. Tente novamente.",
      );
    }
  }
  return (
    <form action={submit} className="space-y-5">
      {mode === "register" && (
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="voce@empresa.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={mode === "register" ? 9 : 1}
          required
        />
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <AuthSubmitButton mode={mode} redirecting={redirecting} />
    </form>
  );
}
