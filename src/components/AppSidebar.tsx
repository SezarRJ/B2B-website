import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { logoutWithSupabase } from "@/lib/supabase";
import { getMe, type User } from "@/lib/api";
import { useI18n, Language } from "@/lib/i18n";
import {
  BarChart3,
  Bell,
  Bot,
  CreditCard,
  Database,
  FileText,
  Globe,
  Layers,
  LogOut,
  Radar,
  Search,
  UploadCloud,
} from "lucide-react";

interface AppSidebarProps {
  activeRoute: string;
}

export function AppSidebar({ activeRoute }: AppSidebarProps) {
  const navigate = useNavigate();
  const { language, setLanguage, t, dir } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const isRtl = dir === "rtl";

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await logoutWithSupabase();
    window.location.replace("/login");
  }

  const isInternalUser =
    user?.account_type === "black" || user?.email?.toLowerCase().includes("admin");

  const customerItems = [
    { id: "dashboard", label: t("nav.dashboard", "Dashboard"), path: "/dashboard", icon: Radar },
    {
      id: "opportunities",
      label: t("nav.opportunityWall", "Opportunity Wall"),
      path: "/opportunities",
      icon: Globe,
    },
    { id: "ai-agent", label: t("nav.aiAgent", "AI Sourcing Agent"), path: "/ai-agent", icon: Bot },
    {
      id: "analytics",
      label: t("nav.marketIntel", "Market Intelligence"),
      path: "/analytics",
      icon: BarChart3,
    },
    {
      id: "notifications",
      label: t("nav.smartAlerts", "Smart Alerts"),
      path: "/notifications",
      icon: Bell,
    },
    {
      id: "products",
      label: t("nav.myPostedOffers", "My Posted Offers"),
      path: "/products",
      icon: UploadCloud,
    },
    { id: "demands", label: t("nav.myRequests", "My Requests"), path: "/demands", icon: Search },
    {
      id: "messages",
      label: t("nav.revealedContacts", "Revealed Contacts"),
      path: "/messages",
      icon: FileText,
    },
    {
      id: "billing",
      label: t("nav.creditsBilling", "Credits & Billing"),
      path: "/billing",
      icon: CreditCard,
    },
  ];

  const internalItems = [
    {
      id: "supabase-portal",
      label: t("nav.supabase", "Data & RLS"),
      path: "/supabase-portal",
      icon: Database,
    },
    {
      id: "workflow",
      label: t("nav.workflow", "Scoring Workflow"),
      path: "/workflow",
      icon: Layers,
    },
  ];

  const items = isInternalUser ? [...customerItems, ...internalItems] : customerItems;
  const normalizedActive = activeRoute.toLowerCase();

  return (
    <aside
      className={`hidden w-64 flex-col bg-white lg:flex flex-shrink-0 select-none shadow-lg ${
        isRtl ? "border-l border-border" : "border-r border-border"
      }`}
      dir={dir}
    >
      <div
        className={`flex h-16 items-center gap-3 border-b border-border px-6 bg-blue-700 text-white cursor-pointer ${isRtl ? "flex-row-reverse" : ""}`}
        onClick={() => navigate({ to: "/" })}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-700 shadow-md">
          <Radar className="h-5 w-5" />
        </div>
        <div className={isRtl ? "text-right" : ""}>
          <span className="text-base font-extrabold tracking-tight text-white block leading-tight">
            DealCompass AI+
          </span>
          <span className="text-[10px] text-blue-100 font-mono tabular-nums block">
            {t("nav.intelPortal", "Trade Intelligence")}
          </span>
        </div>
      </div>

      <div className="p-3 border-b border-border bg-secondary/40">
        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
          <Globe className="h-4 w-4 text-primary flex-shrink-0" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full bg-transparent text-xs font-bold text-foreground cursor-pointer focus:outline-none font-mono tabular-nums uppercase"
          >
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="ku">☀️ کوردی</option>
            <option value="fa">🇮🇷 فارسی</option>
            <option value="tr">🇹🇷 Türkçe</option>
          </select>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto select-none">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = normalizedActive === item.id || normalizedActive.includes("/" + item.id);

          return (
            <button
              key={item.id}
              onClick={() => navigate({ to: item.path })}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${isRtl ? "flex-row-reverse" : ""} ${
                isActive
                  ? `bg-blue-700 text-white font-extrabold shadow-md ${isRtl ? "-translate-x-1" : "translate-x-1"}`
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span
                  className={`${isRtl ? "mr-auto" : "ml-auto"} w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0`}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-1 bg-secondary/20">
        <button
          onClick={logout}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-danger-600 hover:bg-danger hover:text-white transition-all cursor-pointer ${isRtl ? "flex-row-reverse" : ""}`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>{t("btn.logout", "Sign out")}</span>
        </button>
      </div>
    </aside>
  );
}
