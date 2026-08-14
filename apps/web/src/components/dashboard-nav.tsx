"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  BookOpen,
  FolderKanban,
  Gauge,
  KeyRound,
  LogOut,
  Menu,
  Settings,
  TerminalSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
const links = [
  ["/dashboard", "Overview", Gauge],
  ["/dashboard/projects", "Projects", FolderKanban],
  ["/dashboard/activity", "Activity", Activity],
  ["/dashboard/cli-tokens", "CLI Tokens", TerminalSquare],
  ["/dashboard/settings", "Settings", Settings],
  ["/docs", "Documentation", BookOpen],
] as const;
function Nav({ email }: { email?: string | null }) {
  const path = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-5 font-semibold">
        <KeyRound className="mr-2 size-4 text-primary" />
        EnvVault
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
              path === href || (href !== "/dashboard" && path.startsWith(href))
                ? "bg-accent text-foreground"
                : "",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-3">
        <p className="truncate px-3 py-2 text-xs text-muted-foreground">
          {email}
        </p>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut />
          Logout
        </Button>
      </div>
    </div>
  );
}
export function DashboardNav({ email }: { email?: string | null }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-background/95 md:block">
        <Nav email={email} />
      </aside>
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <KeyRound className="size-4 text-primary" />
          EnvVault
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Navegação</SheetDescription>
            </SheetHeader>
            <Nav email={email} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
