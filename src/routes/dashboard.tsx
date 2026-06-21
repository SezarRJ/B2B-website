import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  Database,
  Eye,
  Globe2,
  Radar,
  Save,
  Search,
  Star,
} from "lucide-react";
import {
  getDemands,
  getPreDeals,
  getProducts,
  type Demand,
  type PreDeal,
  type Product,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { ConnectionErrorCard } from "@/components/ConnectionErrorCard";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type Opportunity = {
  id: string;
  product: string;
  origin: string;
  exportCountry: string;
  quantity: string;
  price: string;
  score: number;
  leadScore: number;
  source: string;
};

function score(seed: string, base = 70) {
  return Math.min(98, base + (seed.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 25));
}

function build(products: Product[], demands: Demand[], deals: PreDeal[]): Opportunity[] {
  return [
    ...deals.map((d) => ({
      id: `match-${d.id}`,
      product: d.product?.name || "AI discovered commodity",
      origin: d.product?.origin || "Unknown",
      exportCountry: d.buyer?.country || "Global",
      quantity: `${d.quantity} ${d.product?.unit || "units"}`,
      price: `$${d.suggested_price}`,
      score: Math.round(Number(d.match_score || 80)),
      leadScore: score(d.buyer?.name || "buyer", 68),
      source: "AI radar match",
    })),
    ...products.map((p) => ({
      id: `product-${p.id}`,
      product: p.name,
      origin: p.origin,
      exportCountry: p.location?.includes("Turkey") ? "Turkey" : p.origin,
      quantity: `${p.quantity} ${p.unit}`,
      price: `$${p.price}`,
      score: score(p.name, 72),
      leadScore: score(p.location, 66),
      source: "Supplier signal",
    })),
    ...demands.map((d) => ({
      id: `demand-${d.id}`,
      product: d.product_name,
      origin: "Any verified origin",
      exportCountry: d.location,
      quantity: `${d.quantity} ${d.unit}`,
      price: `$${d.budget}`,
      score: score(d.product_name, 71),
      leadScore: score(d.location, 64),
      source: "Buyer request",
    })),
  ];
}

function DashboardPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("dealcompass_smart_alerts") || "[]");
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [products, demands, deals] = await Promise.all([
          getProducts(),
          getDemands(),
          getPreDeals(),
        ]);
        setOpportunities(build(products, demands, deals));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load trade intelligence data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const topOpportunities = useMemo(
    () => [...opportunities].sort((a, b) => b.score - a.score).slice(0, 4),
    [opportunities],
  );
  const avgScore = opportunities.length
    ? Math.round(opportunities.reduce((sum, item) => sum + item.score, 0) / opportunities.length)
    : 0;

  function quickAlert(label: string) {
    const next = alerts.includes(label) ? alerts : [label, ...alerts];
    setAlerts(next);
    localStorage.setItem("dealcompass_smart_alerts", JSON.stringify(next));
  }

  if (loading || error) {
    return (
      <div className={`space-y-6 ${isRtl ? "text-right" : "text-left"}`} dir={dir}>
        <ConnectionErrorCard
          title={loading ? "Loading trade radar" : "Trade radar unavailable"}
          message={loading ? "Connecting to the backend service..." : error}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRtl ? "text-right" : "text-left"}`} dir={dir}>
      <section className="rounded-[2rem] bg-blue-700 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-100">
              <Radar className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-wider">
                DealCompass AI+ 2026
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {t("dashboard.intel.title", "Global trade radar dashboard")}
            </h1>
            <p className="mt-3 max-w-2xl text-blue-100">
              {t(
                "dashboard.intel.copy",
                "Discover, score, save, and monitor global trade opportunities before your competitors find them.",
              )}
            </p>
          </div>
          <Link
            to="/ai-agent"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700"
          >
            <Bot className="h-4 w-4" /> Ask AI Sourcing Agent
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <Database className="mb-4 h-6 w-6 text-blue-700" />
          <p className="font-mono text-3xl font-black text-foreground">{opportunities.length}</p>
          <p className="text-sm font-semibold text-muted-foreground">Opportunity signals</p>
        </div>
        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <Star className="mb-4 h-6 w-6 text-emerald-600" />
          <p className="font-mono text-3xl font-black text-foreground">{avgScore}</p>
          <p className="text-sm font-semibold text-muted-foreground">Average score</p>
        </div>
        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <Bell className="mb-4 h-6 w-6 text-orange-500" />
          <p className="font-mono text-3xl font-black text-foreground">{alerts.length}</p>
          <p className="text-sm font-semibold text-muted-foreground">Smart alerts</p>
        </div>
        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <Eye className="mb-4 h-6 w-6 text-indigo-600" />
          <p className="font-mono text-3xl font-black text-foreground">25</p>
          <p className="text-sm font-semibold text-muted-foreground">Demo credits</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-foreground">Highest quality opportunities</h2>
              <p className="text-sm text-muted-foreground">
                Ranked by opportunity quality and lead probability.
              </p>
            </div>
            <Link to="/opportunities" className="text-sm font-black text-blue-700">
              Open wall
            </Link>
          </div>
          <div className="space-y-3">
            {topOpportunities.map((item) => (
              <div key={item.id} className="rounded-3xl border border-border bg-secondary/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-black text-foreground">{item.product}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.origin} → {item.exportCountry} • {item.source}
                    </p>
                  </div>
                  <span className="font-mono text-2xl font-black text-emerald-600">
                    {item.score}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-3 py-1 font-mono font-black">
                    {item.quantity}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 font-mono font-black">
                    {item.price}
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-mono font-black text-blue-700">
                    Lead {item.leadScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-foreground">Quick AI searches</h2>
            <div className="mt-4 space-y-2">
              {[
                "Urea 46% origin Oman export UAE",
                "Buyers for Iraqi dates +100 tons",
                "Steel scrap suppliers exporting Turkey",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => quickAlert(item)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-secondary/30 p-3 text-left text-sm font-bold hover:border-blue-200 hover:bg-blue-50"
                >
                  <Search className="h-4 w-4 text-blue-700" />
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-foreground">Radar workflow</h2>
            <div className="mt-4 space-y-3 text-sm">
              {[
                [Globe2, "Scan global trade sources"],
                [BarChart3, "Score opportunity and lead quality"],
                [Save, "Save shortlist or reveal contact"],
                [Bell, "Create alerts for similar signals"],
              ].map(([Icon, text]) => {
                const SafeIcon = Icon as typeof Globe2;
                return (
                  <div
                    key={text as string}
                    className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-3"
                  >
                    <SafeIcon className="h-4 w-4 text-blue-700" />
                    <span className="font-bold text-foreground">{text as string}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
