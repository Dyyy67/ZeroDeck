import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, Layers, History, User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/generate", label: "Generate", icon: Sparkles },
  { to: "/vault", label: "Deck Vault", icon: Layers },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-border bg-card/40 px-4 py-6">
        <div className="mb-8 px-2">
          <div className="font-display text-2xl font-semibold tracking-tight">ZeroDeck</div>
          <div className="text-xs text-muted-foreground mt-1">Material-Free Activity Engine</div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="font-display text-lg font-semibold">ZeroDeck</div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">No-Material</div>
        </div>
      </header>

      <main className="md:pl-60 pb-24 md:pb-10">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-8 py-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <ul className="grid grid-cols-4">
          {NAV.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-3 text-[11px]",
                    active ? "text-accent" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "scale-110 transition-transform")} />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
