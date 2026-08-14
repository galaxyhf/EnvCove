import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Check,
  Clock3,
  GitCompareArrows,
  KeyRound,
  LockKeyhole,
  ScrollText,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  [
    LockKeyhole,
    "Criptografia por padrão",
    "AES-256-GCM antes de qualquer secret chegar ao PostgreSQL.",
  ],
  [
    Braces,
    "Ambientes isolados",
    "Development, staging e production organizados por projeto.",
  ],
  [
    Terminal,
    "CLI no seu fluxo",
    "Puxe um .env ou execute comandos sem criar arquivos locais.",
  ],
  [
    Clock3,
    "Histórico imutável",
    "Cada edição cria uma versão recuperável e auditável.",
  ],
  [
    ScrollText,
    "Auditoria segura",
    "Saiba quem fez o quê sem registrar valores sensíveis.",
  ],
  [
    GitCompareArrows,
    "Compare ambientes",
    "Encontre chaves ausentes sem revelar valores.",
  ],
] as const;

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold">
      <span className="grid size-7 place-items-center rounded-md border border-primary/25 bg-primary/10">
        <KeyRound className="size-3.5 text-primary" />
      </span>
      EnvVault
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="grid-fade pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px]" />
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between border-b border-border/60 px-5">
        <Brand />
        <div className="flex gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/docs">Documentação</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">
              Entrar <ArrowRight />
            </Link>
          </Button>
        </div>
      </nav>
      <section className="mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" /> Secrets sob
            controle, do dashboard ao terminal
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Variáveis de ambiente,{" "}
            <span className="text-muted-foreground">sem improviso.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
            Centralize, sincronize e recupere secrets diretamente pelo terminal
            — criptografados, auditáveis e fora do Git.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Começar agora <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/docs">Ver documentação</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-xs text-muted-foreground">
            {["AES-256-GCM", "Neon PostgreSQL", "Tokens revogáveis"].map(
              (x) => (
                <span key={x} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" />
                  {x}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-[#0d0d0d] shadow-2xl shadow-black/50">
          <div className="flex h-11 items-center gap-1.5 border-b border-border px-4">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="ml-3 font-mono text-[11px] text-muted-foreground">
              ~/projects/sqlvault
            </span>
          </div>
          <div className="space-y-5 p-7 font-mono text-[13px] leading-6">
            <div>
              <p>
                <span className="text-primary">$</span> envvault pull
              </p>
              <div className="mt-2 text-muted-foreground">
                <p>
                  <span className="text-primary">✓</span> Authenticated
                </p>
                <p>
                  <span className="text-primary">✓</span> Project:{" "}
                  <span className="text-foreground">SQLVault</span>
                </p>
                <p>
                  <span className="text-primary">✓</span> Environment:{" "}
                  <span className="text-foreground">Development</span>
                </p>
                <p>
                  <span className="text-primary">✓</span> 8 secrets loaded
                </p>
                <p>
                  <span className="text-primary">✓</span> .env.local created
                </p>
              </div>
            </div>
            <div className="border-t border-border pt-5">
              <p>
                <span className="text-primary">$</span> envvault run npm run dev
              </p>
              <p className="mt-2 text-muted-foreground">
                <span className="text-primary">✓</span> Secrets loaded into
                process.env
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-border/70 bg-card/30">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">
            Feito para o fluxo real
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Uma fonte de verdade para todos os ambientes.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([Icon, title, text]) => (
              <article key={title} className="bg-background p-6">
                <Icon className="size-5 text-primary" />
                <h3 className="mt-5 font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-28 text-center">
        <h2 className="text-4xl font-semibold tracking-tight">
          Seus secrets não pertencem a chats ou commits.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Crie seu primeiro vault e conecte um projeto em poucos minutos.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/register">
            Criar conta <ArrowRight />
          </Link>
        </Button>
      </section>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-7 text-xs text-muted-foreground">
          <Brand />
          <span>Secrets, under control.</span>
        </div>
      </footer>
    </main>
  );
}
