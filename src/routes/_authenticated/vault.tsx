import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ACTIVITIES, CATEGORIES, categoryColor, type Category, type Activity } from "@/lib/activities";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vault")({
  component: VaultPage,
});

function VaultPage() {
  const [filter, setFilter] = useState<Category | "All">("All");
  const [open, setOpen] = useState<Activity | null>(null);
  const list = filter === "All" ? ACTIVITIES : ACTIVITIES.filter((a) => a.category === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Deck Vault</h1>
        <p className="text-muted-foreground text-sm mt-1">All 50 material-free activity templates.</p>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map((a) => (
          <button key={a.id} onClick={() => setOpen(a)} className="text-left">
            <Card className="p-4 hover:shadow-md transition cursor-pointer h-full">
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

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: `var(--color-${categoryColor(open.category)})` }} />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{open.category}</span>
                </div>
                <DialogTitle className="font-display text-2xl">{open.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">Core mechanic</div>
                  <p className="text-muted-foreground">{open.original_mechanic}</p>
                </div>
                <div>
                  <div className="font-semibold mb-2">Student steps</div>
                  <ol className="space-y-2">
                    {open.student_steps.map((s, i) => (
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
                <div>
                  <div className="font-semibold mb-1">Wrap-up protocol</div>
                  <p className="text-muted-foreground whitespace-pre-line">{open.wrap_up_protocol}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
