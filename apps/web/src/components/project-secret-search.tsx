"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SecretListItem, SecretRow } from "@/components/secret-row";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export function ProjectSecretSearch({
  secrets,
  environmentId,
  children,
  emptyActions,
}: {
  secrets: SecretListItem[];
  environmentId: string;
  children: ReactNode;
  emptyActions?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query.trim());
  const filteredSecrets = useMemo(() => {
    if (!normalizedQuery) return secrets;

    return secrets.filter((secret) =>
      normalizeSearch(`${secret.key} ${secret.description}`).includes(
        normalizedQuery,
      ),
    );
  }, [normalizedQuery, secrets]);

  return (
    <>
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
            placeholder="Buscar chaves"
            aria-label="Buscar chaves"
            autoComplete="off"
          />
        </div>
        {children}
      </div>
      {filteredSecrets.length ? (
        filteredSecrets.map((secret) => (
          <SecretRow
            key={secret.id}
            secret={secret}
            environmentId={environmentId}
          />
        ))
      ) : query ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Nenhuma variável corresponde à busca.
        </p>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="font-medium">Nenhuma variável neste ambiente</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Importe um arquivo .env ou adicione a primeira variável manualmente.
          </p>
          {emptyActions ? (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {emptyActions}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
