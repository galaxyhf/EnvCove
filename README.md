# EnvCove

O **EnvCove** é uma aplicação SaaS para armazenar, organizar e distribuir variáveis de ambiente com segurança.

Em vez de compartilhar arquivos `.env` por mensagens, planilhas ou outros meios inseguros, cada usuário pode cadastrar seus projetos, separar as variáveis por ambiente e recuperá-las pelo terminal usando a CLI oficial.

Os valores sensíveis são criptografados com **AES-256-GCM antes de serem gravados no PostgreSQL**. A chave de criptografia fica somente no ambiente do servidor e nunca é armazenada no banco.

## O que o EnvCove faz

- Cadastro e login por email e senha com Auth.js.
- Organização de variáveis por projeto e ambiente.
- Armazenamento criptografado de secrets.
- Valores ocultos por padrão no dashboard.
- Revelação e cópia somente mediante ação explícita.
- Criação, edição e exclusão de variáveis.
- Importação de conteúdo de arquivos `.env`.
- Exportação para `.env`, `.env.local` ou outro nome escolhido.
- Histórico criptografado das versões de cada secret.
- Comparação das chaves existentes entre ambientes, sem exibir valores.
- Registro de atividades sem incluir valores sensíveis.
- Tokens revogáveis para autenticação da CLI.
- Download de secrets pelo terminal com `envcove pull`.
- Execução de processos com secrets em memória usando `envcove run`.

## Como funciona

O fluxo principal é:

```text
Dashboard do EnvCove
        ↓
Projeto e ambiente
        ↓
Criptografia AES-256-GCM
        ↓
Neon PostgreSQL
        ↓
API autenticada por token
        ↓
CLI envcove
        ↓
.env.local ou process.env
```

Ao salvar uma variável:

1. O servidor valida os dados com Zod.
2. Confirma que o projeto e o ambiente pertencem ao usuário autenticado.
3. Gera um IV exclusivo para a operação.
4. Criptografa o valor com AES-256-GCM.
5. Armazena separadamente o conteúdo criptografado, o IV e a tag de autenticação.
6. Registra a ação na auditoria sem salvar o valor da variável.

Ao usar a CLI, o token recebido é convertido em hash antes da consulta ao banco. Somente tokens válidos, não expirados e não revogados podem acessar projetos e secrets do respectivo usuário.

## Estrutura do monorepo

```text
envcove/
├── apps/
│   ├── web/                 # Next.js, dashboard e Route Handlers
│   └── cli/                 # CLI Node.js preparada para publicação no npm
├── packages/
│   ├── crypto/              # Criptografia e descriptografia AES-256-GCM
│   ├── db/                  # Schema, migration, Drizzle e conexão Neon
│   └── shared/              # Schemas Zod e utilitários compartilhados
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Tecnologias

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide Icons
- Auth.js
- PostgreSQL
- Neon PostgreSQL
- Drizzle ORM e Drizzle Kit
- Zod
- Node.js para a CLI
- AES-256-GCM para criptografia das secrets
- pnpm workspaces

## Requisitos

Antes de começar, instale:

- **Node.js 20 ou superior**
- **pnpm 11 ou superior**
- Uma conta e um banco PostgreSQL no **Neon**

Confira as versões:

```bash
node --version
pnpm --version
```

## Instalação

Entre na pasta do projeto e instale todas as dependências do monorepo:

```bash
cd /Users/caiosilva/Developer/EnvCove
pnpm install
```

## Configuração do Neon PostgreSQL

1. Crie um projeto no Neon.
2. Abra o painel do projeto.
3. Copie a connection string do banco.
4. Para Vercel ou outras plataformas serverless, prefira a connection string com pooling.

Ela terá um formato semelhante a:

```text
postgresql://usuario:senha@ep-exemplo-pooler.regiao.aws.neon.tech/envcove?sslmode=require
```

Nunca coloque uma connection string real no Git.

## Variáveis de ambiente

O projeto utiliza estas variáveis:

```env
DATABASE_URL=
AUTH_SECRET=
ENVCOVE_MASTER_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### `DATABASE_URL`

Connection string do Neon PostgreSQL.

### `AUTH_SECRET`

Chave usada pelo Auth.js para proteger as sessões. Gere uma chave exclusiva:

```bash
openssl rand -base64 32
```

### `ENVCOVE_MASTER_KEY`

Chave mestre usada na criptografia AES-256-GCM. Ela precisa representar exatamente 32 bytes em Base64:

```bash
openssl rand -base64 32
```

Use uma chave diferente de `AUTH_SECRET`.

> Atenção: não substitua a master key depois que houver secrets cadastradas. Uma troca direta torna os dados criptografados existentes impossíveis de descriptografar. A rotação futura deve recriptografar os valores de forma controlada.

### `NEXT_PUBLIC_APP_URL`

URL pública da aplicação:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Em produção, use a URL HTTPS real:

```env
NEXT_PUBLIC_APP_URL=https://env-cove-web.vercel.app
```

## Arquivos de ambiente para desenvolvimento

Crie o arquivo utilizado pelo Next.js:

```bash
cp .env.example apps/web/.env.local
```

Edite `apps/web/.env.local` e preencha todas as variáveis.

O Drizzle Kit é executado dentro de `packages/db`, portanto crie também o arquivo usado pelos comandos de migration:

```bash
cp .env.example packages/db/.env
```

No arquivo `packages/db/.env`, a variável obrigatória é `DATABASE_URL`. É recomendável manter os demais valores vazios nesse arquivo.

Os arquivos `.env`, `.env.local` e `.env.*` estão ignorados pelo Git.

## Preparação do banco

O projeto já possui uma migration inicial em `packages/db/drizzle`.

Para aplicá-la ao banco configurado:

```bash
pnpm db:migrate
```

Esse comando cria as tabelas:

- `users`
- `projects`
- `environments`
- `secrets`
- `secret_versions`
- `audit_logs`
- `cli_tokens`

Use o comando abaixo somente quando alterar o schema do Drizzle e precisar gerar uma nova migration:

```bash
pnpm db:generate
```

Sempre confira o SQL gerado antes de aplicar uma migration em produção.

## Rodando em desenvolvimento

Depois de configurar as variáveis e aplicar a migration:

```bash
pnpm dev
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

Rotas principais:

| Rota                    | Finalidade             |
| ----------------------- | ---------------------- |
| `/`                     | Landing page           |
| `/login`                | Login                  |
| `/register`             | Criação de conta       |
| `/dashboard`            | Visão geral            |
| `/dashboard/projects`   | Projetos e ambientes   |
| `/dashboard/activity`   | Auditoria              |
| `/dashboard/cli-tokens` | Tokens da CLI          |
| `/dashboard/settings`   | Configurações da conta |
| `/docs`                 | Documentação de uso    |

## Primeiro uso do dashboard

1. Acesse `http://localhost:3000/register`.
2. Crie uma conta com nome, email e uma senha de pelo menos 9 caracteres.
3. Crie um projeto.
4. O ambiente `Development` será criado automaticamente.
5. Abra o projeto e adicione as variáveis.
6. Crie outros ambientes quando necessário.
7. Gere um token em **CLI Tokens** para conectar o terminal.

## Importando um `.env`

Na página do ambiente, use a opção **Import** e cole o conteúdo:

```env
# Banco de dados
DATABASE_URL="postgresql://localhost/envcove"

AUTH_SECRET="valor-local"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

O parser:

- ignora comentários;
- ignora linhas vazias;
- aceita valores entre aspas;
- valida o nome das chaves;
- cria uma nova versão quando a chave já existe.

## Exportando variáveis

Na página do ambiente, use **Export**. A resposta é entregue como arquivo de texto e nunca é armazenada no navegador ou em `localStorage`.

Depois de usar o arquivo, mantenha-o no `.gitignore`.

## Preparando a CLI localmente

Compile a CLI:

```bash
pnpm --filter envcove build
```

Para disponibilizar o comando globalmente durante o desenvolvimento:

```bash
cd apps/cli
pnpm add --global .
cd ../..
```

Confirme a instalação:

```bash
envcove --version
envcove --help
```

Quando o pacote estiver publicado no npm, a instalação poderá ser feita com:

```bash
npm install -g envcove
```

## Publicando a CLI no npm

O pacote público se chama `envcove`, enquanto o nome apresentado ao usuário é **EnvCove**. A versão é definida somente em `apps/cli/package.json`; o comando `envcove --version` lê esse valor durante o build.

Antes de publicar, valide exatamente o conteúdo do pacote:

```bash
pnpm cli:pack
```

O empacotamento executa typecheck e build automaticamente. Depois de conferir a lista de arquivos e estar autenticado na conta correta do npm:

```bash
cd apps/cli
npm whoami
npm publish
```

O `publishConfig.access` já está definido como `public`. O comando de publicação não faz parte dos scripts automáticos para evitar releases acidentais.

## Fluxo completo da CLI

### 1. Criar um token

No dashboard, acesse **CLI Tokens**, crie um token e copie-o. Ele será exibido somente uma vez.

### 2. Fazer login

Faça login informando o token criado no dashboard:

```bash
envcove login
```

O endereço padrão do servidor fica embutido na CLI e aponta para
`https://env-cove-web.vercel.app`.

O parâmetro `--url` continua disponível somente para desenvolvimento, testes ou
uma instalação alternativa:

```bash
envcove login --url http://localhost:3001
```

O token fica salvo em:

```text
Linux/macOS: ~/.envcove/config.json
Windows:     %USERPROFILE%\.envcove\config.json
```

O arquivo é criado com permissões restritas quando o sistema operacional oferece suporte.

### 3. Conectar um repositório ao EnvCove

Dentro do projeto que receberá as variáveis:

```bash
cd caminho/do/seu-projeto
envcove init
```

Escolha o projeto, o ambiente e o arquivo de saída. Será criado um `.envcove.json` semelhante a:

```json
{
  "projectId": "uuid-do-projeto",
  "environment": "development",
  "output": ".env.local"
}
```

Esse arquivo não contém secrets e pode ser commitado.

### 4. Baixar as variáveis

```bash
envcove pull
```

Para selecionar outro ambiente ou arquivo:

```bash
envcove pull --env production
envcove pull --output .env
envcove pull --env staging --output .env.staging
```

Se o arquivo já existir, a CLI solicitará confirmação. Para sobrescrever sem perguntar:

```bash
envcove pull --force
```

O arquivo é criado com permissões restritas e deve permanecer no `.gitignore`.

### 5. Executar sem criar um `.env`

```bash
envcove run npm run dev
```

Nesse modo, a CLI:

1. autentica o token;
2. carrega as secrets;
3. injeta os valores em `process.env`;
4. inicia o processo solicitado;
5. não grava um arquivo com os valores.

Também é possível executar:

```bash
envcove run node server.js
envcove run pnpm test
```

## Referência da CLI

| Comando                        | Descrição                                         |
| ------------------------------ | ------------------------------------------------- |
| `envcove login`               | Autentica usando um token do dashboard            |
| `envcove logout`              | Remove as credenciais locais                      |
| `envcove init`                | Conecta o diretório atual a um projeto e ambiente |
| `envcove pull`                | Gera o arquivo de variáveis configurado           |
| `envcove run <comando>`       | Executa um processo com secrets em memória        |
| `envcove whoami`              | Exibe o usuário e o token autenticados            |
| `envcove projects`            | Lista os projetos disponíveis                     |
| `envcove environments`        | Lista os ambientes do projeto atual               |
| `envcove environments <slug>` | Lista os ambientes de um projeto específico       |

## Endpoints utilizados pela CLI

Todos exigem um token no header:

```http
Authorization: Bearer ec_live_xxxxxxxxx
```

Endpoints:

```text
POST /api/cli/auth/verify
GET  /api/cli/projects
GET  /api/cli/projects/:projectId/environments
GET  /api/cli/projects/:projectId/environments/:environment/secrets
```

Os endpoints validam o proprietário do projeto antes de retornar informações.

## Scripts disponíveis

Execute os comandos na raiz do monorepo:

| Comando                        | Função                                    |
| ------------------------------ | ----------------------------------------- |
| `pnpm dev`                     | Inicia o Next.js em desenvolvimento       |
| `pnpm build`                   | Compila todos os pacotes e aplicações     |
| `pnpm lint`                    | Executa as validações estáticas           |
| `pnpm typecheck`               | Verifica os tipos TypeScript              |
| `pnpm cli:pack`                | Valida o pacote npm da CLI sem publicar   |
| `pnpm db:generate`             | Gera uma migration após mudança no schema |
| `pnpm db:migrate`              | Aplica migrations ao banco configurado    |
| `pnpm --filter envcove build` | Compila somente a CLI                     |

Para iniciar o build web compilado:

```bash
pnpm --filter @envcove/web start
```

Execute `pnpm build` antes de usar `start`.

## Modelo de segurança

- As secrets são criptografadas com AES-256-GCM.
- Cada criptografia usa um IV aleatório de 12 bytes.
- A tag de autenticação detecta alterações no conteúdo criptografado.
- A master key nunca é armazenada no banco.
- Senhas usam bcrypt com custo 12.
- Tokens da CLI possuem alta entropia e são armazenados somente como SHA-256.
- Cookies de sessão são HttpOnly e usam Secure em produção.
- Todas as operações sensíveis verificam autenticação e propriedade.
- Consultas usam Drizzle ORM com parâmetros, reduzindo risco de SQL injection.
- Entradas são validadas com Zod.
- Secrets não são armazenadas em `localStorage`.
- Secrets não aparecem em query strings, auditoria ou logs da aplicação.
- Revelação, exportação e download são operações explícitas.
- Endpoints sensíveis possuem rate limiting básico.
- HTTPS é obrigatório em produção.

O rate limiting atual é mantido em memória e funciona por instância. Antes de escalar horizontalmente em produção, substitua-o por Redis ou outro armazenamento compartilhado.

## Build de produção

Valide o projeto antes do deploy:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Caso o Turbopack não consiga executar no ambiente local por restrição de processos ou portas, valide especificamente a aplicação web com Webpack:

```bash
pnpm --filter @envcove/web exec next build --webpack
```

## Deploy na Vercel

1. Envie o monorepo para um repositório Git.
2. Importe o repositório na Vercel.
3. Defina `apps/web` como **Root Directory** do projeto.
4. Mantenha os comandos automáticos de instalação e build. O pnpm usará o `pnpm-workspace.yaml` da raiz do repositório para incluir a aplicação e os pacotes internos.
5. Cadastre `DATABASE_URL`, `AUTH_SECRET`, `ENVCOVE_MASTER_KEY` e `NEXT_PUBLIC_APP_URL`.
6. Use a connection string pooled do Neon.
7. Aplique as migrations ao banco de produção.
8. Faça o deploy.
9. Defina `NEXT_PUBLIC_APP_URL=https://env-cove-web.vercel.app` no ambiente de produção.

A Vercel fornece HTTPS automaticamente para os domínios publicados.

## Erros comuns

### `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`

Esse erro ocorre quando a instalação não encontra pacotes internos como `@envcove/crypto`. O monorepo deve ter apenas o `pnpm-workspace.yaml` da raiz; não crie outro arquivo de workspace dentro de `apps/web`.

### `DATABASE_URL is not configured`

Confirme se a variável existe em `apps/web/.env.local`. Para migrations, confirme também `packages/db/.env`.

### `ENVCOVE_MASTER_KEY is not configured`

Crie uma chave Base64 de 32 bytes e reinicie o servidor:

```bash
openssl rand -base64 32
```

### `ENVCOVE_MASTER_KEY must be 32 bytes encoded as base64`

A chave fornecida não representa exatamente 32 bytes. Gere outra usando o comando acima, sem remover ou alterar seus caracteres.

### CLI retorna `Unauthorized`

O token pode estar incorreto, expirado ou revogado. Crie outro token no dashboard e execute novamente:

```bash
envcove login
```

### `.envcove.json not found`

Execute o comando dentro do repositório que deseja conectar:

```bash
envcove init
```

### A porta 3000 já está em uso

Inicie o Next.js em outra porta:

```bash
pnpm --filter @envcove/web dev -- --port 3001
```

Depois use a nova URL no login da CLI.

## Boas práticas

- Nunca commite `.env`, `.env.local` ou `packages/db/.env`.
- Nunca reutilize `AUTH_SECRET` como `ENVCOVE_MASTER_KEY`.
- Use uma master key diferente em desenvolvimento, preview e produção.
- Revogue tokens de dispositivos que não são mais utilizados.
- Use nomes claros para tokens, como `Notebook pessoal` ou `CI produção`.
- Não copie secrets para logs ou sistemas de analytics.
- Revise as migrations antes de aplicá-las.
- Faça backup seguro da master key de produção.

## Próximos passos

- GitHub e Google OAuth
- Times, organizações e permissões
- Integração com Vercel e GitHub Actions
- Rotação controlada de secrets
- Service accounts e tokens com escopos
- Webhooks e integrações CI/CD
- Armazenamento da credencial da CLI no keychain do sistema
- Rate limiting distribuído com Redis
- Extensão para VS Code

## Licença

Projeto privado. Defina uma licença antes de disponibilizá-lo publicamente.
