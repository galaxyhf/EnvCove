# EnvCove CLI

CLI oficial do EnvCove para conectar projetos e carregar variáveis de ambiente pelo terminal.

Use a CLI para gerar arquivos `.env` ou executar processos com os secrets diretamente em memória.

## Requisitos

- Node.js 20 ou superior
- Uma conta no EnvCove
- Um token criado em **Tokens da CLI** no dashboard

## Instalação

```bash
npm install --global envcove
```

Confirme a instalação:

```bash
envcove --version
envcove --help
```

## Início rápido

### 1. Autentique o terminal

Crie um token no dashboard e execute:

```bash
envcove login
```

O token completo aparece somente uma vez no dashboard e não é exibido enquanto você o informa no terminal.

### 2. Conecte um projeto

Dentro do projeto que receberá as variáveis:

```bash
envcove init
```

Selecione o projeto, o ambiente e o arquivo de saída. A CLI criará um `.envcove.json` com essa configuração, sem armazenar secrets nele.

### 3. Baixe as variáveis

```bash
envcove pull
```

Também é possível escolher o ambiente ou arquivo:

```bash
envcove pull --env production
envcove pull --output .env
envcove pull --env staging --output .env.staging
```

Para sobrescrever um arquivo existente sem confirmação:

```bash
envcove pull --force
```

Mantenha arquivos `.env*` com valores sensíveis fora do Git.

### 4. Execute sem criar arquivo

```bash
envcove run npm run dev
envcove run node server.js
envcove run pnpm test
```

O processo recebe os valores por `process.env`, sem gerar um arquivo `.env`.

## Comandos

| Comando | Descrição |
| --- | --- |
| `envcove login` | Autentica o terminal |
| `envcove logout` | Remove as credenciais locais |
| `envcove whoami` | Mostra o usuário autenticado |
| `envcove projects` | Lista os projetos disponíveis |
| `envcove environments` | Lista os ambientes do projeto conectado |
| `envcove environments <slug>` | Lista os ambientes de outro projeto |
| `envcove init` | Conecta o diretório atual a um projeto |
| `envcove pull` | Gera o arquivo de variáveis configurado |
| `envcove run <comando>` | Executa um processo com secrets em memória |

Consulte as opções de um comando com `--help`:

```bash
envcove pull --help
envcove run --help
```

## Segurança

- A API valida o token e o proprietário do projeto antes de entregar secrets.
- Tokens da CLI são armazenados no servidor somente como hash.
- Tokens podem expirar ou ser revogados pelo dashboard.
- Arquivos gerados recebem permissões restritas quando possível.
- `envcove run` evita gravar secrets em um arquivo local.

As credenciais da CLI ficam em:

```text
Linux/macOS: ~/.envcove/config.json
Windows:     %USERPROFILE%\.envcove\config.json
```

Não compartilhe nem versione esse arquivo.

## Solução de problemas

### `envcove: command not found`

Reinstale o pacote e abra um novo terminal:

```bash
npm install --global envcove
```

### `Unauthorized`

O token pode estar incorreto, expirado ou revogado. Crie outro token e autentique novamente:

```bash
envcove logout
envcove login
```

### Projeto não conectado

Entre no diretório correto e execute:

```bash
envcove init
```

## Atualização

```bash
npm install --global envcove@latest
```

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](./LICENSE).
