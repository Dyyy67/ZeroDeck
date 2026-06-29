import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Camera, Shuffle, Sparkles, X, Loader2 } from "lucide-react";
import { generateActivity } from "@/lib/generate";
import { loadApiKey } from "@/lib/settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { categoryColor } from "@/lib/activities";

export const Route = createFileRoute("/_authenticated/generate")({
  component: GeneratePage,
});

function GeneratePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [topic, setTopic] = useState("");
  const [drawRandom, setDrawRandom] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const { key, provider } = loadApiKey();
      const result = await generateActivity({
        topic,
        imageDataUrl,
        drawRandom,
        apiKey: key,
        apiProvider: provider,
      });
      await new Promise((r) => setTimeout(r, 1200));
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) throw new Error("Not signed in");
      const payload = {
        user_id: user.id,
        topic: result.topic || "(no topic)",
        card_id: result.card.id,
        card_title: result.card.title,
        card_category: result.card.category,
        student_steps: result.student_steps,
        wrap_up_protocol: result.wrap_up_protocol,
        source: result.source,
        game: result.game,
        wrap_up: result.wrapUp,
      };
      const { data, error } = await supabase
        .from("activity_logs")
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
      toast.success("Activity, game & wrap-up ready.");
      navigate({ to: "/history", search: { open: id } as never });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  if (mutation.isPending) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl md:text-4xl font-semibold">Scouting Deck, Game & Wrap-up…</h1>
        <p className="text-muted-foreground text-sm">Pairing your topic with a card, a 30-minute game, and a closing ritual.</p>
        <div className="grid gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
              <div className="h-3 w-1/3 bg-muted rounded" />
              <div className="h-2 w-2/3 bg-muted rounded mt-3" />
            </div>
          ))}
        </div>
        <div className="flex justify-center pt-4">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Generate</h1>
        <p className="text-muted-foreground text-sm mt-1">Returns three things: an activity card, a 30-minute non-material game, and a separate closing ritual.</p>
      </div>

      <Card className="p-5 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic, lesson focus, or paste of text</Label>
          <Textarea
            id="topic"
            placeholder="e.g. linear equations, the water cycle, Romeo's Act II monologue…"
            rows={4}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className={cn("inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm cursor-pointer hover:bg-muted")}>
            <Camera className="h-4 w-4" />
            {imageDataUrl ? "Replace image" : "Camera / Upload"}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
          </label>
          {imageDataUrl && (
            <div className="relative">
              <img src={imageDataUrl} alt="upload" className="h-14 w-14 rounded-lg object-cover border border-border" />
              <button
                type="button"
                onClick={() => setImageDataUrl(null)}
                className="absolute -top-2 -right-2 rounded-full bg-foreground text-background p-0.5"
                aria-label="remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <Shuffle className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="random" className="text-sm">Draw Random</Label>
            <Switch id="random" checked={drawRandom} onCheckedChange={setDrawRandom} />
          </div>
        </div>

        <Button
          size="lg"
          disabled={!topic.trim() && !drawRandom}
          onClick={() => mutation.mutate()}
          className="w-full h-12 text-base"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Activity + Game + Wrap-up
        </Button>

        <div className="text-xs text-muted-foreground border-t border-border pt-3">
          {loadApiKey().key ? (
            <span>Using your saved <span className="font-medium capitalize">{loadApiKey().provider}</span> key for live adaptation.</span>
          ) : (
            <span>No API key saved — using the offline local engine. Add a key in <span className="font-medium">Profile</span> for richer rewrites.</span>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {(["Echo & Flow","Matrix & Grid","Circuit & Spark","Anchor & Lock"] as const).map((c) => (
          <div key={c} className={cn("rounded-xl border border-border p-4 bg-card")}>
            <div className={cn("h-2 w-10 rounded-full mb-3")} style={{ background: `var(--color-${categoryColor(c)})` }} />
            <div className="font-display font-semibold text-sm">{c}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
