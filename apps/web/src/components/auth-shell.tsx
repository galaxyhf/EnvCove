import Link from "next/link";
import { KeyRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth-form";
export function AuthShell({ mode }: { mode: "login" | "register" }) {
  const login = mode === "login";
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-[420px]">
        <Link
          href="/"
          className="mx-auto mb-8 flex w-fit items-center gap-2.5 font-semibold"
        >
          <KeyRound className="size-4 text-primary" />
          EnvCove
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {login ? "Acesse sua conta" : "Crie sua conta"}
            </CardTitle>
            <CardDescription>
              {login
                ? "Entre para gerenciar projetos, ambientes e secrets."
                : "Comece com email e senha segura."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm mode={mode} />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {login ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
          <Link
            href={login ? "/register" : "/login"}
            className="text-foreground hover:text-primary"
          >
            {login ? "Criar conta" : "Entrar"}
          </Link>
        </p>
      </div>
    </main>
  );
}
