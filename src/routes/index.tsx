import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { joinWaitlist } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Database,
  Eye,
  Globe,
  Radar,
  Search,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const sampleSignals = [
  {
    product: "Urea 46%",
    origin: "Oman",
    exportCountry: "UAE",
    quantity: "5,000 MT",
    score: 91,
    type: "Buying signal",
  },
  {
    product: "Premium Iraqi Dates",
    origin: "Iraq",
    exportCountry: "Turkey",
    quantity: "300 tons",
    score: 88,
    type: "Buyer demand",
  },
  {
    product: "HMS 1/2 Steel Scrap",
    origin: "Global",
    exportCountry: "Turkey",
    quantity: "150 tons",
    score: 84,
    type: "Supplier signal",
  },
];

export default function Index() {
  const { t, dir } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const isRtl = dir === "rtl";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      await joinWaitlist(email);
      setStatus("success");
      setMessage("Thanks — your request has been received.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className={`min-h-screen bg-white text-slate-950 ${isRtl ? "text-right" : "text-left"}`}
      dir={dir}
    >
      <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight">DealCompass AI+</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">
                Trade Intelligence
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#radar" className="hover:text-blue-700">
              Trade Radar
            </a>
            <a href="#agent" className="hover:text-blue-700">
              AI Agent
            </a>
            <a href="#revenue" className="hover:text-blue-700">
              Credits
            </a>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-black text-white shadow-sm hover:bg-blue-600"
          >
            Start searching
            <ArrowRight className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
          </Link>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),transparent_55%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-800">
                <Globe className="h-4 w-4" />
                Global Trade Intelligence Platform
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Global trade opportunities, discovered by AI.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  DealCompass AI+ scans global trade sources, analyzes opportunities, scores leads,
                  and helps you reach the right buyer or supplier faster.
                </p>
              </div>

              <div
                className={`flex flex-col gap-3 sm:flex-row ${isRtl ? "sm:flex-row-reverse" : ""}`}
              >
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-7 py-4 text-base font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-600"
                >
                  Start searching opportunities
                  <ArrowRight className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
                </Link>
                <a
                  href="#radar"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-7 py-4 text-base font-black text-blue-700 shadow-sm hover:bg-blue-50"
                >
                  <Eye className="h-5 w-5" /> View live opportunity wall
                </a>
              </div>

              <form
                onSubmit={handleSubmit}
                className="max-w-xl rounded-3xl border border-blue-100 bg-white p-3 shadow-sm"
              >
                <div
                  className={`flex flex-col gap-3 sm:flex-row ${isRtl ? "sm:flex-row-reverse" : ""}`}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("hero.input", "Business email address")}
                    disabled={status === "loading"}
                    dir="ltr"
                    className="min-w-0 flex-1 rounded-2xl border border-blue-100 px-5 py-3 text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    {status === "loading" ? "Sending..." : "Request early access"}
                  </button>
                </div>
                {message && (
                  <p
                    className={`mt-3 px-2 text-sm font-bold ${status === "error" ? "text-red-600" : "text-emerald-700"}`}
                  >
                    {message}
                  </p>
                )}
              </form>
            </div>

            <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-100/70">
              <div className="mb-4 flex items-center justify-between border-b border-blue-50 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-500">
                    Live preview
                  </p>
                  <h2 className="text-xl font-black text-slate-950">Opportunity Radar</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  Live
                </span>
              </div>
              <div className="space-y-3">
                {sampleSignals.map((item) => (
                  <div
                    key={item.product}
                    className="rounded-3xl border border-blue-100 bg-blue-50/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-black text-slate-950">{item.product}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Origin: {item.origin} • Export: {item.exportCountry}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 font-mono text-xs font-black text-blue-700">
                        {item.score}/100
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-2xl bg-white p-3">
                        <p className="font-bold text-slate-400">Quantity</p>
                        <p className="font-mono font-black text-slate-900">{item.quantity}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <p className="font-bold text-slate-400">Type</p>
                        <p className="font-bold text-slate-900">{item.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="radar" className="border-y border-blue-100 bg-white px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                Trade Radar Engine
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                We do not wait for opportunities. We go and discover them.
              </h2>
              <p className="mt-3 text-slate-600">
                The radar collects selling offers, buying requests, tenders, manufacturing requests,
                and surplus production signals from global trade sources.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                [
                  Database,
                  "Collect",
                  "Scan chambers, tenders, directories, marketplaces, and open data.",
                ],
                [
                  Search,
                  "Normalize",
                  "Clean duplicates, extract quantity, price, origin, export country, and specs.",
                ],
                [
                  BarChart3,
                  "Score",
                  "Rank opportunities by freshness, source trust, completeness, and lead quality.",
                ],
                [Bell, "Alert", "Notify users when matching signals appear."],
              ].map(([Icon, title, text]) => {
                const SafeIcon = Icon as typeof Database;
                return (
                  <div
                    key={title as string}
                    className="rounded-3xl border border-blue-100 bg-blue-50/40 p-6"
                  >
                    <SafeIcon className="mb-5 h-7 w-7 text-blue-700" />
                    <h3 className="font-black text-slate-950">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="agent" className="bg-blue-700 px-5 py-16 text-white sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-blue-100">
                AI Sourcing Agent
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                A virtual sourcing employee working 24/7.
              </h2>
              <p className="mt-4 max-w-xl text-blue-100">
                Type what you need in natural language. The agent extracts filters, searches the
                radar, removes weak results, and builds a shortlist.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6">
              <Bot className="mb-4 h-8 w-8 text-white" />
              <p className="text-sm text-blue-100">Example prompt</p>
              <p className="mt-2 text-xl font-black">
                “I need 5000 tons urea 46% origin Oman, export from UAE.”
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700"
              >
                Try the AI Agent
              </Link>
            </div>
          </div>
        </section>

        <section id="revenue" className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-blue-700" />
            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">
              Reveal real contacts with Credits.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Users can browse opportunity details for free. Company name, decision maker, phone,
              email, website, and source are unlocked with credits.
            </p>
            <Link
              to="/login"
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-8 py-4 text-base font-black text-white hover:bg-blue-600"
            >
              Open DealCompass AI+
              <ArrowRight className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-100 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center text-sm text-slate-500 sm:flex-row">
          <p className="font-bold text-slate-950">DealCompass AI+</p>
          <p>© 2026 DealCompass AI+. Global Trade Intelligence Platform.</p>
        </div>
      </footer>
    </div>
  );
}
