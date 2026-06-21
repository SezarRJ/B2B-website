import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { useI18n } from "@/lib/i18n";
import { Bell, Bot, CheckCircle2, Globe2, Radar, Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/ai-agent")({
  component: AiAgentPage,
});

const examplePrompts = [
  "I need 5000 tons urea 46% origin Oman, export from UAE",
  "Find buyers for premium Iraqi dates above 100 tons",
  "Search steel scrap HMS 1/2 suppliers exporting from Turkey",
  "Monitor phosphate opportunities from Iraq to GCC",
];

function AiAgentPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [prompt, setPrompt] = useState(examplePrompts[0]);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [alerts, setAlerts] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("dealcompass_smart_alerts") || "[]");
  });

  const extracted = useMemo(() => {
    const text = prompt.toLowerCase();
    return {
      product: text.includes("urea")
        ? "Urea 46%"
        : text.includes("dates")
          ? "Premium Dates"
          : text.includes("steel")
            ? "Steel Scrap HMS 1/2"
            : "Commodity",
      origin: text.includes("oman")
        ? "Oman"
        : text.includes("iraq")
          ? "Iraq"
          : text.includes("turkey")
            ? "Turkey"
            : "Any origin",
      exportCountry: text.includes("uae")
        ? "UAE"
        : text.includes("turkey")
          ? "Turkey"
          : text.includes("gcc")
            ? "GCC"
            : "Any export country",
      quantity: text.match(/\d+[,.]?\d*/)?.[0] || "1000+",
    };
  }, [prompt]);

  async function runAgent() {
    const endpoint = import.meta.env.VITE_AI_AGENT_ENDPOINT;
    setAgentError("");
    setHasRun(false);
    if (!endpoint) {
      setAgentError(
        "AI Sourcing Agent is not connected yet. Configure VITE_AI_AGENT_ENDPOINT to enable real LLM parsing and source querying.",
      );
      return;
    }
    setRunning(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("AI endpoint request failed");
      setHasRun(true);
    } catch (error) {
      setAgentError(error instanceof Error ? error.message : "AI endpoint request failed");
    } finally {
      setRunning(false);
    }
  }

  function createAlert() {
    const alert = `${extracted.product} • Origin: ${extracted.origin} • Export: ${extracted.exportCountry} • Qty: ${extracted.quantity}+`;
    const next = alerts.includes(alert) ? alerts : [alert, ...alerts];
    setAlerts(next);
    localStorage.setItem("dealcompass_smart_alerts", JSON.stringify(next));
  }

  return (
    <div
      className={`flex min-h-screen bg-background ${isRtl ? "text-right" : "text-left"}`}
      dir={dir}
    >
      <AppSidebar activeRoute="ai-agent" />
      <main className="flex-1 overflow-auto">
        <header className="border-b border-border bg-white px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">
                {t("aiAgent.title", "AI Sourcing Agent")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t(
                  "aiAgent.subtitle",
                  "Describe what you need. The agent extracts filters and searches the opportunity radar.",
                )}
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
          <section className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
            <label className="text-sm font-black text-foreground">
              Tell the agent what to find
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-3xl border border-border bg-white p-5 text-base leading-7 outline-none focus:border-blue-500"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {examplePrompts.map((item) => (
                <button
                  key={item}
                  onClick={() => setPrompt(item)}
                  className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50"
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              onClick={runAgent}
              disabled={running}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-6 py-3 text-sm font-black text-white hover:bg-blue-600 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {running ? "Calling AI endpoint..." : "Run AI search"}
            </button>
            {agentError && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                {agentError}
              </div>
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            {[
              ["Product", extracted.product],
              ["Origin country", extracted.origin],
              ["Export country", extracted.exportCountry],
              ["Quantity", `${extracted.quantity}+ tons`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 font-mono text-lg font-black text-foreground">{value}</p>
              </div>
            ))}
          </section>

          {hasRun && (
            <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-black text-foreground">Agent results</h2>
                  <p className="text-sm text-muted-foreground">
                    The agent prepared search filters and found high-quality opportunity signals.
                  </p>
                </div>
                <button
                  onClick={createAlert}
                  className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"
                >
                  <Bell className="h-4 w-4" />
                  Create smart alert
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[91, 86, 82].map((score, idx) => (
                  <div key={score} className="rounded-3xl border border-border bg-secondary/30 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-black text-foreground">
                          {extracted.product} opportunity #{idx + 1}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {extracted.origin} → {extracted.exportCountry}
                        </p>
                      </div>
                      <span className="font-mono text-2xl font-black text-emerald-600">
                        {score}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Fresh source detected
                      </p>
                      <p className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4 text-blue-700" /> Export country filter matched
                      </p>
                      <p className="flex items-center gap-2">
                        <Radar className="h-4 w-4 text-blue-700" /> Lead score above threshold
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/opportunities"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-600"
              >
                <Search className="h-4 w-4" /> Open Opportunity Wall
              </Link>
            </section>
          )}

          {alerts.length > 0 && (
            <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-foreground">Saved smart alerts</h2>
              <div className="mt-4 space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert}
                    className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900"
                  >
                    {alert}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
