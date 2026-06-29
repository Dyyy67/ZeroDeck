import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ACTIVITIES, CATEGORIES, categoryColor, type Category, type Activity } from "@/lib/activities";
import { GAMES, type Game } from "@/lib/games";
import { WRAPUPS, type WrapUp } from "@/lib/wrapups";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vault")({
  component: VaultPage,
});

type Tab = "activities" | "games" | "wrapups";

function VaultPage() {
  const [tab, setTab] = useState<Tab>("activities");
  const [filter, setFilter] = useState<Category | "All">("All");
  const [openA, setOpenA] = useState<Activity | null>(null);
  const [openG, setOpenG] = useState<Game | null>(null);
  const [openW, setOpenW] = useState<WrapUp | null>(null);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "activities", label: "Activities", count: ACTIVITIES.length },
    { id: "games", label: "30-min Games", count: GAMES.length },
    { id: "wrapups", label: "Wrap-ups", count: WRAPUPS.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Deck Vault</h1>
        <p className="text-muted-foreground text-sm mt-1">Three managed libraries — all zero-material.</p>
      </div>

      <div className="grid grid-cols-3 rounded-lg border border-border p-1 bg-card">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setFilter("All"); }}
            className={cn(
              "rounded-md py-2 text-xs font-medium transition",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label} <span className="opacity-60">· {t.count}</span>
          </button>
        ))}
      </div>

      {tab !== "wrapups" && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition",
                filter === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {tab === "activities" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACTIVITIES.filter((a) => filter === "All" || a.category === filter).map((a) => (
            <button key={a.id} onClick={() => setOpenA(a)} className="text-left">
              <Card className="p-4 hover:shadow-md transition h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full" style={{ background: `var(--color-${categoryColor(a.category)})` }} />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{a.category}</span>
                </div>
                <div className="font-display text-lg font-semibold leading-tight">{a.title}</div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{a.original_mechanic}</p>
              </Card>
            </button>
          ))}
        </div>
      )}

      {tab === "games" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GAMES.filter((g) => filter === "All" || g.category === filter).map((g) => (
            <button key={g.id} onClick={() => setOpenG(g)} className="text-left">
              <Card className="p-4 hover:shadow-md transition h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full" style={{ background: `var(--color-${categoryColor(g.category)})` }} />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{g.category} · {g.total_duration}</span>
                </div>
                <div className="font-display text-lg font-semibold leading-tight">{g.title}</div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{g.pitch}</p>
              </Card>
            </button>
          ))}
        </div>
      )}

      {tab === "wrapups" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WRAPUPS.map((w) => (
            <button key={w.id} onClick={() => setOpenW(w)} className="text-left">
              <Card className="p-4 hover:shadow-md transition h-full">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{w.category} · {w.duration}</div>
                <div className="font-display text-lg font-semibold leading-tight">{w.title}</div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{w.description}</p>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Activity dialog */}
      <Dialog open={!!openA} onOpenChange={(o) => !o && setOpenA(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {openA && (
            <>
              <DialogHeader>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{openA.category}</div>
                <DialogTitle className="font-display text-2xl">{openA.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">Core mechanic</div>
                  <p className="text-muted-foreground">{openA.original_mechanic}</p>
                </div>
                <div>
                  <div className="font-semibold mb-2">Student steps</div>
                  <ol className="space-y-2">
                    {openA.student_steps.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="font-mono text-xs text-muted-foreground w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <div className="flex-1">
                          <div>{s.title}</div>
                          <div className="text-xs text-muted-foreground">{s.duration}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Game dialog */}
      <Dialog open={!!openG} onOpenChange={(o) => !o && setOpenG(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {openG && (
            <>
              <DialogHeader>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{openG.category} · {openG.total_duration}</div>
                <DialogTitle className="font-display text-2xl">{openG.title}</DialogTitle>
                <p className="text-xs text-muted-foreground">{openG.pitch}</p>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="text-xs"><span className="font-semibold">Group:</span> <span className="text-muted-foreground">{openG.group_size}</span></div>
                <div>
                  <div className="font-semibold mb-2">Instructions</div>
                  <ol className="space-y-2">
                    {openG.instructions.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="font-mono text-xs text-muted-foreground w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <div className="flex-1">
                          <div>{s.step}</div>
                          <div className="text-xs text-muted-foreground">{s.duration}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <div className="font-semibold mb-1">Scoring / win</div>
                  <p className="text-muted-foreground text-xs">{openG.scoring_or_win}</p>
                </div>
                {openG.variations?.length > 0 && (
                  <div>
                    <div className="font-semibold mb-1">Variations</div>
                    <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                      {openG.variations.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground italic">{openG.source_note}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Wrap-up dialog */}
      <Dialog open={!!openW} onOpenChange={(o) => !o && setOpenW(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {openW && (
            <>
              <DialogHeader>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{openW.category} · {openW.duration}</div>
                <DialogTitle className="font-display text-2xl">{openW.title}</DialogTitle>
                <p className="text-xs text-muted-foreground">{openW.description}</p>
              </DialogHeader>
              <ol className="space-y-2 text-sm pt-2">
                {openW.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-xs text-muted-foreground w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1">{s}</div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
