const actionLabels: Record<string, string> = {
  "project.created": "Projeto criado",
  "environment.created": "Ambiente criado",
  "secret.created": "Variável criada",
  "secret.updated": "Variável atualizada",
  "secret.deleted": "Variável excluída",
  "secret.revealed": "Variável revelada",
  "secret.version_restored": "Versão da variável restaurada",
  "secrets.exported": "Variáveis exportadas",
  "secrets.cli_downloaded": "Variáveis baixadas pela CLI",
  "cli_token.created": "Token da CLI criado",
  "cli_token.revoked": "Token da CLI revogado",
};

export function getAuditActionLabel(action: string) {
  return actionLabels[action] ?? action.replaceAll(".", " ");
}
