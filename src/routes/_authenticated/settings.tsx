import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { saveApiKey, loadApiKey } from "@/lib/settings";
import { toast } from "sonner";
import { LogOut, KeyRound, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [key, setKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const loaded = loadApiKey();
    setHasKey(!!loaded.key);
    if (loaded.provider) setProvider(loaded.provider);
  }, []);

  function save() {
    saveApiKey(key.trim(), provider);
    setHasKey(!!key.trim());
    setKey("");
    toast.success(key.trim() ? "API key saved locally." : "API key cleared.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Account, API keys, and sign out.</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground grid place-items-center font-display text-lg">
            {email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Signed in as</div>
            <div className="font-medium truncate">{email ?? "—"}</div>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-5" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> Log out
        </Button>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          <h2 className="font-display text-lg font-semibold">External LLM API Key</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Optional. Stored locally in your browser only (obfuscated). When present, ZeroDeck routes your topic through your chosen provider for richer adaptation.
        </p>

        <div className="space-y-2">
          <Label>Provider</Label>
          <div className="flex gap-2">
            {(["openai", "gemini"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition ${provider === p ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
              >{p}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apikey">API Key</Label>
          <Input
            id="apikey"
            type="password"
            placeholder={hasKey ? "•••••••••• (saved)" : "sk-… or AIza…"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={save} className="flex-1">Save</Button>
          {hasKey && (
            <Button variant="outline" onClick={() => { saveApiKey("", provider); setHasKey(false); toast.success("Cleared."); }}>
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground border-t border-border pt-3">
          <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Keys never leave your device. Requests go directly from your browser to OpenAI or Google.</span>
        </div>
      </Card>
    </div>
  );
}
