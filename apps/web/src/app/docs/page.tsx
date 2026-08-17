import Link from "next/link";
import { KeyRound } from "lucide-react";

function Code({ children }: { children: string }) {
  return (
    <pre className="my-5 overflow-x-auto rounded-lg border bg-[#0c0c0c] p-4 font-mono text-[13px] leading-6 text-muted-foreground">
      <code>{children}</code>
    </pre>
  );
}

const content = {
  pt: {
    alternateLanguage: "English",
    eyebrow: "Documentação",
    title: "Publique sem compartilhar arquivos .env.",
    intro:
      "Armazene variáveis criptografadas e carregue-as somente para desenvolvedores e processos autorizados.",
    gettingStarted: "Primeiros passos",
    login: "Login",
    loginText:
      "Crie um token em Dashboard → Tokens da CLI. Ele é exibido uma única vez e armazenado globalmente com permissões restritas.",
    initialize: "Inicializar um projeto",
    initializeText:
      "O comando interativo cria um arquivo .envcove.json que pode ser versionado e não contém valores secretos.",
    pulling: "Baixar variáveis",
    running: "Executar comandos",
    runningText:
      "Injete as variáveis diretamente no processo filho sem gravar um arquivo de ambiente.",
    reference: "Referência da CLI",
    security: "Segurança",
    securityText:
      "AES-256-GCM com IVs únicos, chave mestra controlada pelo servidor, senhas e tokens da CLI com hash, verificações de propriedade, endpoints sensíveis explícitos, eventos de auditoria e HTTPS em produção.",
  },
  en: {
    alternateLanguage: "Português",
    eyebrow: "Documentation",
    title: "Ship without sharing .env files.",
    intro:
      "Store encrypted variables and load them only for authorized developers and processes.",
    gettingStarted: "Getting Started",
    login: "Login",
    loginText:
      "Create a token in Dashboard → CLI Tokens. It is shown once and stored globally with restricted permissions.",
    initialize: "Initialize a Project",
    initializeText:
      "The interactive command creates a committable .envcove.json containing no secret values.",
    pulling: "Pulling Secrets",
    running: "Running Commands",
    runningText:
      "Inject secrets directly into the child process without writing an environment file.",
    reference: "CLI Reference",
    security: "Security",
    securityText:
      "AES-256-GCM with unique IVs, server-owned master key, hashed passwords and CLI tokens, ownership checks, explicit sensitive endpoints, audit events, and HTTPS in production.",
  },
} as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const language = lang === "en" ? "en" : "pt";
  const text = content[language];
  const alternateHref = language === "pt" ? "/docs?lang=en" : "/docs";

  return (
    <div className="min-h-screen" lang={language === "pt" ? "pt-BR" : "en"}>
      <header className="sticky top-0 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <KeyRound className="size-4 text-primary" />
            EnvCove Docs
          </Link>
          <div className="flex items-center text-sm">
            <Link
              href={alternateHref}
              hrefLang={language === "pt" ? "en" : "pt-BR"}
              className="rounded-md border px-3 py-1.5 text-muted-foreground hover:text-foreground"
            >
              {text.alternateLanguage}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          {text.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">{text.title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          {text.intro}
        </p>
        <section className="border-b py-10">
          <h2 className="text-2xl font-semibold">{text.gettingStarted}</h2>
          <Code>{`npm install -g envcove\nenvcove login\ncd meu-projeto\nenvcove init\nenvcove pull\nnpm run dev`}</Code>
        </section>
        <section className="border-b py-10">
          <h2 className="text-2xl font-semibold">{text.login}</h2>
          <p className="mt-3 text-muted-foreground">{text.loginText}</p>
          <Code>{`envcove login\nenvcove whoami`}</Code>
        </section>
        <section className="border-b py-10">
          <h2 className="text-2xl font-semibold">{text.initialize}</h2>
          <p className="mt-3 text-muted-foreground">{text.initializeText}</p>
          <Code>{`envcove init\n\n{\n  "projectId": "project-uuid",\n  "environment": "development",\n  "output": ".env.local"\n}`}</Code>
        </section>
        <section className="border-b py-10">
          <h2 className="text-2xl font-semibold">{text.pulling}</h2>
          <Code>{`envcove pull\nenvcove pull --env production --output .env.production\nenvcove pull --force`}</Code>
        </section>
        <section className="border-b py-10">
          <h2 className="text-2xl font-semibold">{text.running}</h2>
          <p className="mt-3 text-muted-foreground">{text.runningText}</p>
          <Code>{`envcove run npm run dev\nenvcove run node server.js`}</Code>
        </section>
        <section className="border-b py-10">
          <h2 className="text-2xl font-semibold">{text.reference}</h2>
          <Code>{`login  logout  init  pull  run\nwhoami  projects  environments`}</Code>
        </section>
        <section className="py-10">
          <h2 className="text-2xl font-semibold">{text.security}</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {text.securityText}
          </p>
        </section>
      </main>
    </div>
  );
}
