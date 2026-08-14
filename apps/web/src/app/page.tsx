import Link from "next/link";
import type { CSSProperties } from "react";
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
import { HomeScrollEffects } from "@/components/home-scroll-effects";

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

const workflow = [
  [
    "Organize",
    "Crie projetos e separe development, staging e production sem misturar contextos.",
  ],
  [
    "Proteja",
    "Cada valor é criptografado no servidor antes de chegar ao PostgreSQL.",
  ],
  [
    "Entregue",
    "Use a CLI para gerar um arquivo local ou iniciar o processo com os secrets em memória.",
  ],
] as const;

const comparison = [
  [
    "Organização",
    "Projetos e ambientes reunidos em um painel",
    "Arquivos separados e convenções locais",
  ],
  [
    "Armazenamento",
    "AES-256-GCM antes da gravação no banco",
    "Valores em texto puro no arquivo",
  ],
  [
    "Entrega ao projeto",
    "CLI com pull ou injeção direta em process.env",
    "Cópia, download e atualização manuais",
  ],
  [
    "Rastreabilidade",
    "Histórico e auditoria sem registrar valores",
    "Sem trilha nativa de alterações",
  ],
  [
    "Acesso pelo terminal",
    "Tokens armazenados como hash e revogáveis",
    "Arquivos ou credenciais compartilhados",
  ],
] as const;

function Brand() {
  return (
    <a
      href="#inicio"
      aria-label="Voltar ao início"
      className="flex items-center gap-2.5 font-semibold"
    >
      <span className="grid size-7 place-items-center rounded-md border border-primary/25 bg-primary/10">
        <KeyRound className="size-3.5 text-primary" />
      </span>
      EnvVault
    </a>
  );
}

export default function Home() {
  return (
    <main id="inicio" className="min-h-screen overflow-x-clip">
      <HomeScrollEffects />
      <div className="grid-fade pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px]" />
      <header className="home-navbar sticky top-0 z-40 border-b">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
          <Brand />
          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a className="home-nav-link" href="#recursos">
              Recursos
            </a>
            <a className="home-nav-link" href="#fluxo">
              Como funciona
            </a>
            <a className="home-nav-link" href="#comparativo">
              Comparativo
            </a>
            <a className="home-nav-link" href="#seguranca">
              Segurança
            </a>
          </div>
          <div className="flex items-center gap-2">
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
        <nav
          aria-label="Navegação da página"
          className="home-nav-mobile mx-auto flex max-w-6xl gap-5 overflow-x-auto border-t border-border/60 px-5 py-2.5 text-xs text-muted-foreground md:hidden"
        >
          <a href="#recursos">Recursos</a>
          <a href="#fluxo">Como funciona</a>
          <a href="#comparativo">Comparativo</a>
          <a href="#seguranca">Segurança</a>
          <Link href="/docs">Documentação</Link>
        </nav>
      </header>
      <section className="hero-section mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-28">
        <div className="hero-copy" data-scroll-reveal="hero-copy">
          <div className="hero-kicker mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground">
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
        <div className="terminal-perspective" data-scroll-reveal="terminal">
          <div className="terminal-scene overflow-hidden rounded-xl border border-border bg-[#0d0d0d] shadow-2xl shadow-black/50">
            <div className="flex h-11 items-center gap-1.5 border-b border-border px-4">
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/10" />
              <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                ~/projects/sqlvault
              </span>
            </div>
            <div className="terminal-content space-y-5 p-7 font-mono text-[13px] leading-6">
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
                  <span className="text-primary">$</span> envvault run npm run
                  dev
                </p>
                <p className="mt-2 text-muted-foreground">
                  <span className="text-primary">✓</span> Secrets loaded into
                  process.env
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="recursos"
        className="scroll-section border-y border-border/70 bg-card/30"
      >
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="section-intro" data-scroll-reveal="section-intro">
            <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">
              Feito para o fluxo real
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Uma fonte de verdade para todos os ambientes.
            </h2>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([Icon, title, text], index) => (
              <article
                key={title}
                className="feature-reveal bg-background p-6"
                data-scroll-reveal="feature"
                style={{ "--reveal-index": index } as CSSProperties}
              >
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
      <section
        id="fluxo"
        className="scroll-section mx-auto grid max-w-6xl gap-14 px-5 py-28 lg:grid-cols-[.8fr_1.2fr] lg:items-start"
      >
        <div
          className="section-intro lg:sticky lg:top-32"
          data-scroll-reveal="section-intro"
        >
          <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">
            Do painel ao processo
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Um fluxo simples para um problema que costuma virar improviso.
          </h2>
          <p className="mt-5 max-w-md text-pretty leading-7 text-muted-foreground">
            O EnvVault conecta armazenamento, controle de acesso e uso no
            terminal. A equipe sabe onde o secret está e o projeto sabe como
            recebê-lo.
          </p>
        </div>
        <ol className="divide-y divide-border border-y border-border">
          {workflow.map(([title, text], index) => (
            <li
              key={title}
              className="grid gap-4 py-8 sm:grid-cols-[3rem_1fr]"
              data-scroll-reveal="flow-step"
              style={{ "--reveal-index": index } as CSSProperties}
            >
              <span className="font-mono text-sm text-primary">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-xl font-medium">{title}</h3>
                <p className="mt-2 max-w-xl leading-7 text-muted-foreground">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section
        id="comparativo"
        className="scroll-section border-y border-border/70 bg-card/30"
      >
        <div className="mx-auto max-w-6xl px-5 py-28">
          <div className="section-intro" data-scroll-reveal="section-intro">
            <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">
              A diferença na prática
            </p>
            <h2 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Mais do que guardar secrets: organizar, entregar e auditar.
            </h2>
            <p className="mt-5 max-w-2xl text-pretty leading-7 text-muted-foreground">
              Em muitos projetos, o `.env` continua sendo transportado
              manualmente. O EnvVault transforma esse arquivo isolado em um
              fluxo controlado de ponta a ponta.
            </p>
          </div>
          <div
            className="comparison-shell mt-12 overflow-x-auto border-y border-border"
            data-scroll-reveal="comparison"
          >
            <table className="w-full min-w-[720px] border-collapse text-left">
              <caption className="sr-only">
                Comparação entre o EnvVault e o compartilhamento manual de
                arquivos .env
              </caption>
              <thead>
                <tr className="border-b border-border text-sm">
                  <th className="w-1/4 py-5 pr-6 font-medium text-muted-foreground">
                    Critério
                  </th>
                  <th className="w-[37.5%] px-6 py-5 font-medium text-primary">
                    EnvVault
                  </th>
                  <th className="w-[37.5%] py-5 pl-6 font-medium text-muted-foreground">
                    Fluxo manual com .env
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([criterion, envVault, manual]) => (
                  <tr key={criterion} className="border-b border-border last:border-0">
                    <th className="py-6 pr-6 text-sm font-medium">
                      {criterion}
                    </th>
                    <td className="border-x border-border bg-primary/[0.035] px-6 py-6 text-sm leading-6">
                      <span className="flex items-start gap-2.5">
                        <Check className="mt-1 size-3.5 shrink-0 text-primary" />
                        {envVault}
                      </span>
                    </td>
                    <td className="py-6 pl-6 text-sm leading-6 text-muted-foreground">
                      {manual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section
        id="seguranca"
        className="scroll-section mx-auto grid max-w-6xl gap-14 px-5 py-28 lg:grid-cols-2 lg:items-center"
      >
        <div data-scroll-reveal="security">
          <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">
            Segurança verificável
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            O valor sensível não precisa aparecer para o controle funcionar.
          </h2>
          <p className="mt-5 max-w-xl text-pretty leading-7 text-muted-foreground">
            A aplicação separa os dados necessários para operar dos valores que
            precisam permanecer secretos. Assim, comparação e auditoria
            continuam úteis sem transformar logs em um novo risco.
          </p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {[
            ["Criptografia autenticada", "AES-256-GCM com um IV exclusivo em cada operação."],
            ["Credenciais protegidas", "Senhas e tokens da CLI são persistidos somente como hash."],
            ["Autorização por propriedade", "Projetos, ambientes e secrets são validados para o usuário autenticado."],
            ["Logs sem secrets", "Valores não são gravados em auditoria, logs ou parâmetros de URL."],
          ].map(([title, text], index) => (
            <div
              key={title}
              className="py-6"
              data-scroll-reveal="feature"
              style={{ "--reveal-index": index } as CSSProperties}
            >
              <div className="flex items-center gap-2.5">
                <Check className="size-4 text-primary" />
                <h3 className="font-medium">{title}</h3>
              </div>
              <p className="mt-2 pl-6.5 text-sm leading-6 text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        className="cta-section mx-auto max-w-4xl px-5 py-28 text-center"
        data-scroll-reveal="cta"
      >
        <h2 className="cta-heading text-4xl font-semibold tracking-tight">
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
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-sm text-muted-foreground sm:grid-cols-[1fr_auto_auto] sm:items-start sm:gap-12">
          <div>
            <Brand />
            <p className="mt-3 max-w-xs text-xs leading-5">
              Variáveis de ambiente organizadas, criptografadas e prontas para
              o terminal.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground">Produto</span>
            <a href="#recursos">Recursos</a>
            <a href="#comparativo">Comparativo</a>
            <a href="#seguranca">Segurança</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground">Começar</span>
            <Link href="/docs">Documentação</Link>
            <Link href="/login">Entrar</Link>
            <Link href="/register">Criar conta</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
