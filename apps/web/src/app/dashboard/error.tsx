"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="py-32 text-center">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-2 text-sm text-muted-foreground">
        We could not load this workspace.
      </p>
      <Button className="mt-5" variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
