# EnvVault CLI

CLI oficial do EnvVault para conectar projetos e carregar variáveis de ambiente pelo terminal.

Use a CLI para gerar arquivos `.env` ou executar processos com os secrets diretamente em memória.

## Requisitos

- Node.js 20 ou superior
- Uma conta no EnvVault
- Um token criado em **Tokens da CLI** no dashboard

## Instalação

```bash
npm install --global @galaxyhf/envvault
```

Confirme a instalação:

```bash
envvault --version
envvault --help
```

## Início rápido

### 1. Autentique o terminal

Crie um token no dashboard e execute:

```bash
envvault login
```

O token completo aparece somente uma vez no dashboard e não é exibido enquanto você o informa no terminal.

### 2. Conecte um projeto

Dentro do projeto que receberá as variáveis:

```bash
envvault init
```

Selecione o projeto, o ambiente e o arquivo de saída. A CLI criará um `.envvault.json` com essa configuração, sem armazenar secrets nele.

### 3. Baixe as variáveis

```bash
envvault pull
```

Também é possível escolher o ambiente ou arquivo:

```bash
envvault pull --env production
envvault pull --output .env
envvault pull --env staging --output .env.staging
```

Para sobrescrever um arquivo existente sem confirmação:

```bash
envvault pull --force
```

Mantenha arquivos `.env*` com valores sensíveis fora do Git.

### 4. Execute sem criar arquivo

```bash
envvault run npm run dev
envvault run node server.js
envvault run pnpm test
```

O processo recebe os valores por `process.env`, sem gerar um arquivo `.env`.

## Comandos

| Comando | Descrição |
| --- | --- |
| `envvault login` | Autentica o terminal |
| `envvault logout` | Remove as credenciais locais |
| `envvault whoami` | Mostra o usuário autenticado |
| `envvault projects` | Lista os projetos disponíveis |
| `envvault environments` | Lista os ambientes do projeto conectado |
| `envvault environments <slug>` | Lista os ambientes de outro projeto |
| `envvault init` | Conecta o diretório atual a um projeto |
| `envvault pull` | Gera o arquivo de variáveis configurado |
| `envvault run <comando>` | Executa um processo com secrets em memória |

Consulte as opções de um comando com `--help`:

```bash
envvault pull --help
envvault run --help
```

## Segurança

- A API valida o token e o proprietário do projeto antes de entregar secrets.
- Tokens da CLI são armazenados no servidor somente como hash.
- Tokens podem expirar ou ser revogados pelo dashboard.
- Arquivos gerados recebem permissões restritas quando possível.
- `envvault run` evita gravar secrets em um arquivo local.

As credenciais da CLI ficam em:

```text
Linux/macOS: ~/.envvault/config.json
Windows:     %USERPROFILE%\.envvault\config.json
```

Não compartilhe nem versione esse arquivo.

## Solução de problemas

### `envvault: command not found`

Reinstale o pacote e abra um novo terminal:

```bash
npm install --global @galaxyhf/envvault
```

### `Unauthorized`

O token pode estar incorreto, expirado ou revogado. Crie outro token e autentique novamente:

```bash
envvault logout
envvault login
```

### Projeto não conectado

Entre no diretório correto e execute:

```bash
envvault init
```

## Atualização

```bash
npm install --global @galaxyhf/envvault@latest
```

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](./LICENSE).
