import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Search } from "lucide-react";
import { categoryColor } from "@/lib/activities";
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
    !q.trim() || [l.topic, l.card_title, l.card_category].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  const opened = (data ?? []).find((l) => l.id === openId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">History</h1>
        <p className="text-muted-foreground text-sm mt-1">Every activity you've generated, saved to your account.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search topic, card, category…" value={q} onChange={(e) => setQ(e.target.value)} />
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
              <button className="flex-1 min-w-0 text-left" onClick={() => setOpenId(l.id)}>
                <div className="font-display text-base font-semibold truncate">{l.card_title}</div>
                <div className="text-xs text-muted-foreground truncate">{l.topic}</div>
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
        <DialogContent className="max-w-lg">
          {opened && (
            <>
              <DialogHeader>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{opened.card_category}</div>
                <DialogTitle className="font-display text-2xl">{opened.card_title}</DialogTitle>
                <p className="text-xs text-muted-foreground">Topic: {opened.topic}</p>
              </DialogHeader>
              <div className="space-y-4 text-sm">
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
                <div>
                  <div className="font-semibold mb-1">5-minute wrap-up</div>
                  <p className="text-muted-foreground whitespace-pre-line">{opened.wrap_up_protocol}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
