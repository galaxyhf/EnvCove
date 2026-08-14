"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const exportFormats = [
  [".env", ".env — formato padrão"],
  [".env.local", ".env.local — ambiente local"],
  [".env.development", ".env.development — desenvolvimento"],
  [
    ".env.development.local",
    ".env.development.local — desenvolvimento local",
  ],
  [".env.staging", ".env.staging — homologação"],
  [".env.production", ".env.production — produção"],
  [".env.production.local", ".env.production.local — produção local"],
  ["custom", "Nome personalizado"],
] as const;

export function EnvironmentExportDialog({
  environmentId,
}: {
  environmentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState(".env");
  const [customFilename, setCustomFilename] = useState(".env.");
  const [error, setError] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setError("");
  }

  function exportFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const filename =
      format === "custom" ? customFilename.trim() : format;
    if (!/^\.env(?:\.[a-zA-Z0-9_-]+)*$/.test(filename)) {
      setError(
        "Use um nome iniciado por .env, sem espaços ou caracteres especiais.",
      );
      return;
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = `/api/environments/${environmentId}/export?filename=${encodeURIComponent(filename)}`;
    downloadLink.click();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar variáveis</DialogTitle>
          <DialogDescription>
            Escolha o nome do arquivo. O download conterá os valores
            descriptografados deste ambiente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={exportFile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-format">Formato do arquivo</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="export-format" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {exportFormats.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {format === "custom" ? (
            <div className="space-y-2">
              <Label htmlFor="custom-export-filename">Nome do arquivo</Label>
              <Input
                id="custom-export-filename"
                value={customFilename}
                onChange={(event) => setCustomFilename(event.target.value)}
                placeholder=".env.meu-ambiente"
                aria-invalid={Boolean(error)}
                autoFocus
              />
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter className="mt-5">
            <Button type="submit">
              <Download />
              Baixar {format === "custom" ? customFilename || ".env" : format}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
