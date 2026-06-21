import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import {
  getDemands,
  getPreDeals,
  getProducts,
  type Demand,
  type PreDeal,
  type Product,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Eye, Filter, Globe2, Lock, Radar, Save, Search, Star } from "lucide-react";

export const Route = createFileRoute("/opportunities")({
  component: OpportunitiesPage,
});

type OpportunityType = "sell" | "buy" | "tender" | "manufacturing" | "surplus";

type Opportunity = {
  id: string;
  type: OpportunityType;
  product: string;
  sector: string;
  quantity: string;
  price: string;
  originCountry: string;
  exportCountry: string;
  city: string;
  source: string;
  freshness: string;
  opportunityScore: number;
  leadScore: number;
  specs: string;
  company?: string;
  contact?: string;
};

function scoreFromSeed(seed: string, base = 72) {
  return Math.min(98, base + (seed.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 24));
}

function buildOpportunities(
  products: Product[],
  demands: Demand[],
  deals: PreDeal[],
): Opportunity[] {
  const productOps: Opportunity[] = products.map((p) => ({
    id: `product-${p.id}`,
    type: "sell",
    product: p.name,
    sector: p.category,
    quantity: `${p.quantity} ${p.unit}`,
    price: `$${p.price}/${p.unit}`,
    originCountry: p.origin,
    exportCountry: p.location?.includes("Turkey") ? "Turkey" : p.origin,
    city: p.location,
    source: "Factory / exporter listing",
    freshness: "Updated recently",
    opportunityScore: scoreFromSeed(p.name, 74),
    leadScore: scoreFromSeed(p.location, 68),
    specs: p.description || "Verified commodity supply opportunity.",
    company: "Hidden supplier",
    contact: "Reveal with credits",
  }));

  const demandOps: Opportunity[] = demands.map((d) => ({
    id: `demand-${d.id}`,
    type: "buy",
    product: d.product_name,
    sector: d.category,
    quantity: `${d.quantity} ${d.unit}`,
    price: `$${d.budget}/${d.unit}`,
    originCountry: "Any verified origin",
    exportCountry: d.location,
    city: d.location,
    source: "Buyer request",
    freshness: "Active request",
    opportunityScore: scoreFromSeed(d.product_name, 70),
    leadScore: scoreFromSeed(d.location, 66),
    specs: `Urgency level ${d.urgency}. Buyer is looking for qualified suppliers.`,
    company: "Hidden buyer",
    contact: "Reveal with credits",
  }));

  const dealOps: Opportunity[] = deals.map((d) => ({
    id: `match-${d.id}`,
    type: "surplus",
    product: d.product?.name || "Cross-border commodity",
    sector: d.product?.category || "commodity",
    quantity: `${d.quantity} ${d.product?.unit || "units"}`,
    price: `$${d.suggested_price}/${d.product?.unit || "unit"}`,
    originCountry: d.product?.origin || "Unknown",
    exportCountry: d.buyer?.country || "Global",
    city: d.product?.location || "Trade corridor",
    source: "AI discovered match",
    freshness: "Matched by platform",
    opportunityScore: Math.round(Number(d.match_score || 80)),
    leadScore: scoreFromSeed(d.buyer?.name || "buyer", 70),
    specs: `${d.payment_terms} payment terms • freight estimate $${d.shipping_cost}`,
    company: "Hidden counterparty",
    contact: "Reveal with credits",
  }));

  return [...dealOps, ...productOps, ...demandOps];
}

function OpportunitiesPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | OpportunityType>("all");
  const [minScore, setMinScore] = useState(70);
  const [saved, setSaved] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("dealcompass_saved_opportunities") || "[]");
  });
  const [revealed, setRevealed] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("dealcompass_revealed_contacts") || "[]");
  });

  useEffect(() => {
    Promise.all([getProducts(), getDemands(), getPreDeals()]).then(([products, demands, deals]) => {
      setOpportunities(buildOpportunities(products, demands, deals));
    });
  }, []);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return opportunities.filter((item) => {
      const matchesQuery =
        !needle ||
        [item.product, item.sector, item.originCountry, item.exportCountry, item.city]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      const matchesType = type === "all" || item.type === type;
      return matchesQuery && matchesType && item.opportunityScore >= minScore;
    });
  }, [opportunities, query, type, minScore]);

  function toggleSave(id: string) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [id, ...saved];
    setSaved(next);
    localStorage.setItem("dealcompass_saved_opportunities", JSON.stringify(next));
  }

  function revealContact(id: string) {
    const next = revealed.includes(id) ? revealed : [id, ...revealed];
    setRevealed(next);
    localStorage.setItem("dealcompass_revealed_contacts", JSON.stringify(next));
  }

  return (
    <div
      className={`flex min-h-screen bg-background ${isRtl ? "text-right" : "text-left"}`}
      dir={dir}
    >
      <AppSidebar activeRoute="opportunities" />
      <main className="flex-1 overflow-auto">
        <header className="border-b border-border bg-white px-6 py-5 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Radar className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-wider">DealCompass AI+</span>
              </div>
              <h1 className="mt-1 text-2xl font-black text-foreground">
                {t("opportunities.title", "Global Opportunity Wall")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "opportunities.subtitle",
                  "AI-discovered selling offers, buying requests, tenders, and supply signals.",
                )}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-secondary/50 p-2 text-center text-xs font-bold">
              <div className="rounded-xl bg-white p-3">
                <p className="font-mono text-lg font-black text-primary">{opportunities.length}</p>
                <p className="text-muted-foreground">Signals</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="font-mono text-lg font-black text-emerald-600">{saved.length}</p>
                <p className="text-muted-foreground">Saved</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="font-mono text-lg font-black text-blue-700">{revealed.length}</p>
                <p className="text-muted-foreground">Revealed</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
          <div className="rounded-[2rem] border border-border bg-white p-5 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search product, origin, export country, city..."
                  className="w-full rounded-2xl border border-border bg-secondary/30 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary"
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "all" | OpportunityType)}
                className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold"
              >
                <option value="all">All opportunity types</option>
                <option value="sell">Selling offers</option>
                <option value="buy">Buying requests</option>
                <option value="tender">Tenders</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="surplus">AI matches / surplus</option>
              </select>
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold">
                <Filter className="h-4 w-4 text-primary" />
                Score +
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-16 rounded-lg border border-border px-2 py-1 font-mono"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((item) => {
              const isSaved = saved.includes(item.id);
              const isRevealed = revealed.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="rounded-[2rem] border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase text-blue-700">
                        {item.type.replace("_", " ")}
                      </span>
                      <h2 className="mt-3 text-lg font-black text-foreground">{item.product}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{item.specs}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-2xl font-black text-emerald-600">
                        {item.opportunityScore}
                      </p>
                      <p className="text-[11px] font-bold text-muted-foreground">
                        Opportunity Score
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div className="rounded-2xl bg-secondary/50 p-3">
                      <p className="font-bold text-muted-foreground">Origin</p>
                      <p className="font-black text-foreground">{item.originCountry}</p>
                    </div>
                    <div className="rounded-2xl bg-secondary/50 p-3">
                      <p className="font-bold text-muted-foreground">Export</p>
                      <p className="font-black text-foreground">{item.exportCountry}</p>
                    </div>
                    <div className="rounded-2xl bg-secondary/50 p-3">
                      <p className="font-bold text-muted-foreground">Quantity</p>
                      <p className="font-mono font-black text-foreground">{item.quantity}</p>
                    </div>
                    <div className="rounded-2xl bg-secondary/50 p-3">
                      <p className="font-bold text-muted-foreground">Price</p>
                      <p className="font-mono font-black text-foreground">{item.price}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Globe2 className="h-4 w-4 text-primary" />
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.freshness}</span>
                    <span>•</span>
                    <span className="font-mono font-black text-blue-700">
                      Lead Score {item.leadScore}/100
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <button
                      onClick={() => toggleSave(item.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black ${
                        isSaved ? "bg-emerald-50 text-emerald-700" : "bg-secondary text-foreground"
                      }`}
                    >
                      <Save className="h-4 w-4" />
                      {isSaved ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={() => revealContact(item.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-black text-white hover:bg-blue-600"
                    >
                      {isRevealed ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      {isRevealed
                        ? item.company || "Contact revealed"
                        : "Reveal contact • 5 credits"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-border bg-white p-12 text-center">
              <Star className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-black text-foreground">No matching opportunities</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try lowering the score filter or changing the product/country search.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
