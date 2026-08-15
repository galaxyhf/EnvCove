#!/usr/bin/env node
import { input, confirm, select, password } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { spawn } from "node:child_process";
import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import ora from "ora";

type Config = {
  token: string;
  apiUrl: string;
  email?: string;
  name?: string;
  tokenName?: string;
};
type Project = {
  id: string;
  name: string;
  slug: string;
  environmentCount?: number;
};
type Environment = { id: string; name: string; slug: string };
type VaultConfig = { projectId: string; environment: string; output: string };

const DEFAULT_API_URL = "https://env-vault-web.vercel.app";
const configDir = join(homedir(), ".envvault");
const configPath = join(configDir, "config.json");
const vaultPath = resolve(".envvault.json");

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch {
    return null;
  }
}

async function saveConfig(config: Config) {
  await mkdir(configDir, { recursive: true, mode: 0o700 });
  await writeFile(configPath, JSON.stringify(config, null, 2), { mode: 0o600 });
  await chmod(configPath, 0o600);
}

async function authConfig(): Promise<Config> {
  const config = await readJson<Config>(configPath);
  if (!config?.token)
    throw new Error("You are not authenticated.\n\nRun:\n  envvault login");
  return config;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = await authConfig();
  const response = await fetch(`${config.apiUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.token}`,
      ...init.headers,
    },
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok)
    throw new Error(body.error ?? `Request failed (${response.status})`);
  return body as T;
}

function printError(error: unknown) {
  console.error(
    chalk.red("✗") +
      " " +
      (error instanceof Error ? error.message : "Unexpected error"),
  );
  process.exitCode = 1;
}

async function getVault(): Promise<VaultConfig> {
  const config = await readJson<VaultConfig>(vaultPath);
  if (!config)
    throw new Error(".envvault.json not found\n\nRun:\n  envvault init");
  return config;
}

async function loadSecrets(environmentOverride?: string) {
  const vault = await getVault();
  const env = environmentOverride ?? vault.environment;
  return api<{
    project: Project;
    environment: Environment;
    secrets: Record<string, string>;
  }>(
    `/api/cli/projects/${vault.projectId}/environments/${encodeURIComponent(env)}/secrets`,
  );
}

function envText(secrets: Record<string, string>) {
  return (
    Object.entries(secrets)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join("\n") + "\n"
  );
}

const program = new Command();
program
  .name("envvault")
  .description("Secure environment variables from your terminal")
  .version("0.1.0");

program
  .command("login")
  .description("Authenticate with a CLI token")
  .option(
    "--url <url>",
    "Override the default EnvVault URL",
    process.env.ENVVAULT_URL ?? DEFAULT_API_URL,
  )
  .action(async ({ url }) => {
    try {
      const token = await password({
        message: "Enter your EnvVault token:",
        mask: "*",
      });
      const spinner = ora("Authenticating").start();
      const response = await fetch(
        `${url.replace(/\/$/, "")}/api/cli/auth/verify`,
        { method: "POST", headers: { authorization: `Bearer ${token}` } },
      );
      const data = (await response.json()) as {
        user?: { name: string; email: string };
        token?: { name: string };
        error?: string;
      };
      if (!response.ok || !data.user)
        throw new Error(data.error ?? "Authentication failed");
      await saveConfig({
        token,
        apiUrl: url,
        email: data.user.email,
        name: data.user.name,
        tokenName: data.token?.name,
      });
      spinner.succeed("Authentication successful");
      console.log(`Logged in as ${chalk.bold(data.user.email)}`);
    } catch (error) {
      printError(error);
    }
  });

program
  .command("logout")
  .description("Remove local credentials")
  .action(async () => {
    await rm(configPath, { force: true });
    console.log(chalk.green("✓") + " Logged out");
  });

program
  .command("whoami")
  .description("Show the authenticated account")
  .action(async () => {
    try {
      const data = await api<{
        user: { name: string; email: string };
        token: { name: string };
      }>("/api/cli/auth/verify", { method: "POST" });
      console.log(
        `\n${data.user.name}\n${data.user.email}\n\nToken: ${data.token.name}\n`,
      );
    } catch (error) {
      printError(error);
    }
  });

program
  .command("projects")
  .description("List projects")
  .action(async () => {
    try {
      const { projects } = await api<{ projects: Project[] }>(
        "/api/cli/projects",
      );
      console.log(chalk.dim("PROJECT".padEnd(28) + "ENVIRONMENTS"));
      for (const project of projects)
        console.log(
          project.name.padEnd(28) + String(project.environmentCount ?? 0),
        );
    } catch (error) {
      printError(error);
    }
  });

program
  .command("environments")
  .argument("[project]", "Project slug")
  .description("List project environments")
  .action(async (slug?: string) => {
    try {
      let projectId: string;
      if (slug) {
        const { projects } = await api<{ projects: Project[] }>(
          "/api/cli/projects",
        );
        const project = projects.find((item) => item.slug === slug);
        if (!project) throw new Error(`Project '${slug}' not found`);
        projectId = project.id;
      } else projectId = (await getVault()).projectId;
      const { environments } = await api<{ environments: Environment[] }>(
        `/api/cli/projects/${projectId}/environments`,
      );
      for (const environment of environments) console.log(environment.name);
    } catch (error) {
      printError(error);
    }
  });

program
  .command("init")
  .description("Connect the current directory to EnvVault")
  .action(async () => {
    try {
      const { projects } = await api<{ projects: Project[] }>(
        "/api/cli/projects",
      );
      if (!projects.length)
        throw new Error(
          "No projects found. Create one in the dashboard first.",
        );
      const projectId = await select({
        message: "Select project:",
        choices: projects.map((p) => ({ name: p.name, value: p.id })),
      });
      const { environments } = await api<{ environments: Environment[] }>(
        `/api/cli/projects/${projectId}/environments`,
      );
      if (!environments.length)
        throw new Error("This project has no environments.");
      const environment = await select({
        message: "Select environment:",
        choices: environments.map((e) => ({ name: e.name, value: e.slug })),
      });
      const output = await input({
        message: "Output file:",
        default: ".env.local",
      });
      await writeFile(
        vaultPath,
        JSON.stringify({ projectId, environment, output }, null, 2) + "\n",
      );
      const gitignorePath = resolve(".gitignore");
      const existing = await readFile(gitignorePath, "utf8").catch(() => "");
      const rules = [".env", ".env.local", ".env.*"].filter(
        (rule) => !existing.split(/\r?\n/).includes(rule),
      );
      if (rules.length)
        await writeFile(
          gitignorePath,
          `${existing}${existing && !existing.endsWith("\n") ? "\n" : ""}${rules.join("\n")}\n`,
        );
      console.log(chalk.green("✓") + " .envvault.json created");
    } catch (error) {
      printError(error);
    }
  });

program
  .command("pull")
  .description("Write secrets to an environment file")
  .option("--env <environment>")
  .option("--output <path>")
  .option("--force")
  .action(async (options) => {
    try {
      const vault = await getVault();
      const output = resolve(options.output ?? vault.output);
      if (!options.force) {
        const exists = await readFile(output)
          .then(() => true)
          .catch(() => false);
        if (
          exists &&
          !(await confirm({
            message: `${output} already exists. Overwrite?`,
            default: false,
          }))
        )
          return;
      }
      const spinner = ora("Loading secrets").start();
      const data = await loadSecrets(options.env);
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, envText(data.secrets), { mode: 0o600 });
      spinner.succeed(`${Object.keys(data.secrets).length} secrets loaded`);
      console.log(
        `${chalk.green("✓")} Project: ${data.project.name}\n${chalk.green("✓")} Environment: ${data.environment.name}\n${chalk.green("✓")} ${output} created`,
      );
    } catch (error) {
      printError(error);
    }
  });

program
  .command("run")
  .description("Run a command with secrets in process.env")
  .allowUnknownOption()
  .argument("<command>")
  .argument("[args...]")
  .option("--env <environment>")
  .action(async (command: string, args: string[], options) => {
    try {
      const spinner = ora("Loading secrets").start();
      const data = await loadSecrets(options.env);
      spinner.succeed(`${Object.keys(data.secrets).length} secrets loaded`);
      console.log(`Running: ${chalk.bold([command, ...args].join(" "))}\n`);
      const child = spawn(command, args, {
        stdio: "inherit",
        env: { ...process.env, ...data.secrets },
        shell: process.platform === "win32",
      });
      child.on("exit", (code) => {
        process.exitCode = code ?? 1;
      });
    } catch (error) {
      printError(error);
    }
  });

program.showHelpAfterError();
program.addHelpText("beforeAll", chalk.bold("\nEnvVault CLI\n"));
await program.parseAsync();
