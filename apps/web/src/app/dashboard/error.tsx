"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="py-32 text-center">
      <p className="font-medium">Algo deu errado</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Não foi possível carregar este espaço de trabalho.
      </p>
      <Button className="mt-5" variant="outline" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
