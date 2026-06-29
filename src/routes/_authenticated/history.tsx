import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Search, Gamepad2, Anchor, Layers } from "lucide-react";
import { categoryColor } from "@/lib/activities";
import type { Game } from "@/lib/games";
import type { WrapUp } from "@/lib/wrapups";
import { toast } from "sonner";

interface Log {
  id: string;
  topic: string;
  card_id: string;
  card_title: string;
  card_category: string;
  student_steps: { title: string; duration: string }[];
  wrap_up_protocol: string;
  source: string;
  created_at: string;
  game: Game | null;
  wrap_up: WrapUp | null;
}

export const Route = createFileRoute("/_authenticated/history")({
  validateSearch: (s: Record<string, unknown>) => ({ open: typeof s.open === "string" ? s.open : undefined }),
  component: HistoryPage,
});

function HistoryPage() {
  const search = Route.useSearch();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | undefined>(search.open);
  const [tab, setTab] = useState<"activity" | "game" | "wrap">("activity");

  const { data, isLoading } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Log[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activity_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
      toast.success("Deleted");
    },
  });

  const filtered = (data ?? []).filter((l) =>
    !q.trim() || [l.topic, l.card_title, l.card_category, l.game?.title].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  const opened = (data ?? []).find((l) => l.id === openId);

  const tabs = [
    { id: "activity" as const, label: "Activity", icon: Layers },
    { id: "game" as const, label: "30-min Game", icon: Gamepad2 },
    { id: "wrap" as const, label: "Wrap-up", icon: Anchor },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">History</h1>
        <p className="text-muted-foreground text-sm mt-1">Every generation — activity, 30-minute game, and wrap-up — saved to your account.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search topic, card, game…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {data && data.length === 0 ? "No activities yet. Head to Generate." : "No matches."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((l) => (
            <Card key={l.id} className="p-4 flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: `var(--color-${categoryColor(l.card_category as never)})` }} />
              <button className="flex-1 min-w-0 text-left" onClick={() => { setOpenId(l.id); setTab("activity"); }}>
                <div className="font-display text-base font-semibold truncate">{l.card_title}</div>
                <div className="text-xs text-muted-foreground truncate">{l.topic}</div>
                {l.game && <div className="text-xs text-muted-foreground truncate mt-0.5">+ Game: {l.game.title}</div>}
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  {l.card_category} · {new Date(l.created_at).toLocaleDateString()} · {l.source}
                </div>
              </button>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(l.id)} aria-label="delete">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!opened} onOpenChange={(o) => !o && setOpenId(undefined)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {opened && (
            <>
              <DialogHeader>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{opened.card_category}</div>
                <DialogTitle className="font-display text-2xl">{opened.card_title}</DialogTitle>
                <p className="text-xs text-muted-foreground">Topic: {opened.topic}</p>
              </DialogHeader>

              <div className="flex gap-1 border-b border-border -mx-6 px-6 sticky top-0 bg-background z-10">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition ${active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 text-sm pt-2">
                {tab === "activity" && (
                  <div>
                    <div className="font-semibold mb-2">Student script</div>
                    <ol className="space-y-2">
                      {opened.student_steps.map((s, i) => (
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
                )}

                {tab === "game" && (
                  opened.game ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{opened.game.category} · {opened.game.total_duration}</div>
                        <div className="font-display text-lg font-semibold">{opened.game.title}</div>
                        <p className="text-muted-foreground text-xs mt-1">{opened.game.pitch}</p>
                      </div>
                      <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Group:</span> {opened.game.group_size}</div>
                      <div>
                        <div className="font-semibold mb-2">Instructions</div>
                        <ol className="space-y-2">
                          {opened.game.instructions.map((s, i) => (
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
                        <p className="text-muted-foreground text-xs">{opened.game.scoring_or_win}</p>
                      </div>
                      {opened.game.variations?.length > 0 && (
                        <div>
                          <div className="font-semibold mb-1">Variations</div>
                          <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                            {opened.game.variations.map((v, i) => <li key={i}>{v}</li>)}
                          </ul>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground italic">Source: {opened.game.source_note}</p>
                    </div>
                  ) : <p className="text-muted-foreground text-xs">No game saved with this entry.</p>
                )}

                {tab === "wrap" && (
                  opened.wrap_up ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{opened.wrap_up.category} · {opened.wrap_up.duration}</div>
                        <div className="font-display text-lg font-semibold">{opened.wrap_up.title}</div>
                        <p className="text-muted-foreground text-xs mt-1">{opened.wrap_up.description}</p>
                      </div>
                      <ol className="space-y-2">
                        {opened.wrap_up.steps.map((s, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="font-mono text-xs text-muted-foreground w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                            <div className="flex-1">{s}</div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold mb-1">Wrap-up protocol</div>
                      <p className="text-muted-foreground whitespace-pre-line">{opened.wrap_up_protocol}</p>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
