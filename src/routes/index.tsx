import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { joinWaitlist } from "@/lib/api";
import { useI18n, Language } from "@/lib/i18n";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Package,
  Search,
  ShieldCheck,
  Truck,
  CreditCard,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const sampleOpportunities = [
  {
    title: "Premium Iraqi Dates",
    route: "Basra, Iraq → Turkey",
    volume: "300 tons",
    payment: "L/C or protected payment",
    match: "94% match",
  },
  {
    title: "HMS 1/2 Steel Scrap",
    route: "Bandar Abbas, Iran → Turkey",
    volume: "150 tons",
    payment: "D/P supported",
    match: "82% match",
  },
  {
    title: "Rock Phosphate 30% P2O5",
    route: "Iraq → GCC / Turkey",
    volume: "800 tons",
    payment: "Escrow option",
    match: "98% match",
  },
];

const steps = [
  {
    icon: Package,
    title: "Post what you sell or need",
    text: "Add a product as a seller or post a buying request as a buyer.",
  },
  {
    icon: Users,
    title: "Get matched with companies",
    text: "See serious buyer/supplier matches based on product, quantity, route, and payment terms.",
  },
  {
    icon: ShieldCheck,
    title: "Verify and agree safely",
    text: "Use company checks, protected payment, and structured order steps before shipping.",
  },
  {
    icon: Truck,
    title: "Track the deal to delivery",
    text: "Follow orders, payment status, and shipment progress in one place.",
  },
];

export default function Index() {
  const { language, setLanguage, t, dir } = useI18n();
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
      setMessage(
        t(
          "landing.joined",
          "Thanks — we received your request. You can also create an account now.",
        ),
      );
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(
        t("Something went wrong. Please try again.", "Something went wrong. Please try again."),
      );
    }
  }

  const languageChips: Array<{ id: Language; label: string }> = [
    { id: "en", label: "English" },
    { id: "ar", label: "العربية" },
    { id: "ku", label: "کوردی" },
    { id: "fa", label: "فارسی" },
    { id: "tr", label: "Türkçe" },
  ];

  return (
    <div
      className={`min-h-screen bg-white text-slate-950 ${isRtl ? "text-right" : "text-left"}`}
      dir={dir}
    >
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 shadow-sm">
              <span className="font-serif text-lg font-black">T</span>
            </div>
            <div>
              <div className="text-base font-black tracking-tight">Tureep AI+</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                B2B Trade
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#opportunities" className="hover:text-slate-950">
              {t("landing.nav.samples", "Sample opportunities")}
            </a>
            <a href="#how" className="hover:text-slate-950">
              {t("landing.nav.how", "How it works")}
            </a>
            <a href="#safety" className="hover:text-slate-950">
              {t("landing.nav.safety", "Safety")}
            </a>
          </div>

          <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Link
              to="/login"
              className="hidden text-sm font-bold text-slate-600 hover:text-slate-950 sm:block"
            >
              {t("btn.signin", "Sign in")}
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white shadow-sm hover:bg-slate-800"
            >
              {t("landing.cta.primary", "Create free account")}
              <ArrowRight className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),transparent_55%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-800">
                <Globe className="h-4 w-4" />
                {t("landing.badge", "Iraq • Turkey • Iran • GCC • Global")}
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  {t(
                    "landing.hero.title",
                    "Find verified buyers and suppliers for cross-border trade",
                  )}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  {t(
                    "landing.hero.subtitle",
                    "Post what you sell or what you need. Tureep matches you with verified companies and helps manage payment, documents, and shipping.",
                  )}
                </p>
              </div>

              <div
                className={`flex flex-col gap-3 sm:flex-row ${isRtl ? "sm:flex-row-reverse" : ""}`}
              >
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-7 py-4 text-base font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
                >
                  {t("landing.cta.primary", "Create free account")}
                  <ArrowRight className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
                </Link>
                <a
                  href="#opportunities"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-black text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Search className="h-5 w-5" />
                  {t("landing.cta.secondary", "View sample opportunities")}
                </a>
              </div>

              <form
                onSubmit={handleSubmit}
                className="max-w-xl rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
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
                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-5 py-3 text-sm outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {status === "loading"
                      ? t("Applying...", "Applying...")
                      : t("landing.join", "Join waitlist")}
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

              <div className="flex flex-wrap gap-2 pt-2">
                {languageChips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setLanguage(chip.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      language === chip.id
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/60">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {t("landing.preview", "Live preview")}
                  </p>
                  <h2 className="text-xl font-black text-slate-950">
                    {t("landing.preview.title", "Example trade matches")}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  {t("topbar.live", "Live")}
                </span>
              </div>
              <div className="space-y-3">
                {sampleOpportunities.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-black text-slate-950">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{item.route}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                        {item.match}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-2xl bg-white p-3">
                        <p className="font-bold text-slate-400">Volume</p>
                        <p className="font-mono font-black text-slate-900">{item.volume}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <p className="font-bold text-slate-400">Payment</p>
                        <p className="font-bold text-slate-900">{item.payment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs font-semibold text-slate-400">
                {t(
                  "landing.samples.note",
                  "Examples only. Create an account to add your own products or requests.",
                )}
              </p>
            </div>
          </div>
        </section>

        <section
          id="opportunities"
          className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                {t("landing.samples.kicker", "Why register?")}
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                {t("landing.samples.heading", "See the kind of opportunities customers can create")}
              </h2>
              <p className="mt-3 text-slate-600">
                {t(
                  "landing.samples.copy",
                  "Before registering, customers should understand what value they get: serious trade matches, protected payment options, and a clearer route from request to order.",
                )}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {sampleOpportunities.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.route}</p>
                  <div className="mt-5 space-y-2 text-sm">
                    <p className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Quantity</span>
                      <span className="font-mono font-black">{item.volume}</span>
                    </p>
                    <p className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Payment</span>
                      <span className="font-bold">{item.payment}</span>
                    </p>
                    <p className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Match</span>
                      <span className="font-mono font-black text-emerald-700">{item.match}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">
                {t("landing.how.title", "How Tureep works")}
              </h2>
              <p className="mt-3 text-slate-600">
                {t(
                  "landing.how.copy",
                  "A simple guided path from product/request to match, order, payment, and shipment.",
                )}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {steps.map((step, idx) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <p className="mb-2 font-mono text-xs font-black text-amber-700">0{idx + 1}</p>
                  <h3 className="font-black text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="safety" className="bg-slate-950 px-5 py-16 text-white sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                {t("landing.safety.kicker", "Trust and safety")}
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                {t("landing.safety.title", "Trade with a clearer, safer process")}
              </h2>
              <p className="mt-4 max-w-xl text-slate-300">
                {t(
                  "landing.safety.copy",
                  "Tureep guides companies through verification, matching, order confirmation, protected payment options, and shipment tracking.",
                )}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [ShieldCheck, "Company verification"],
                [CreditCard, "Protected payment options"],
                [CheckCircle2, "Structured deal steps"],
                [Truck, "Shipment visibility"],
              ].map(([Icon, label]) => {
                const SafeIcon = Icon as typeof ShieldCheck;
                return (
                  <div
                    key={label as string}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <SafeIcon className="mb-4 h-6 w-6 text-amber-400" />
                    <p className="font-black">{label as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 text-center sm:px-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-amber-50 p-8 sm:p-12">
            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">
              {t("landing.final.title", "Start with a free account")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              {t(
                "landing.final.copy",
                "Add your first product or buying request and see what matches the platform can prepare for you.",
              )}
            </p>
            <Link
              to="/login"
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-base font-black text-white hover:bg-slate-800"
            >
              {t("landing.cta.primary", "Create free account")}
              <ArrowRight className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center text-sm text-slate-500 sm:flex-row">
          <p className="font-bold text-slate-950">Tureep AI+</p>
          <p>{t("foot.copy", "© 2026 Tureep Trade Systems. All rights reserved.")}</p>
        </div>
      </footer>
    </div>
  );
}
