import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Handshake,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Shield,
  Truck,
  CreditCard,
  Sparkles,
  Menu,
  X,
  Globe,
  User as UserIcon,
} from "lucide-react";
import { getMe, getNotifications } from "@/lib/api";
import type { User as ApiUser } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { GlobalStoreProvider } from "@/stores/GlobalStoreProvider";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { UniversalInAppHelpDrawer } from "@/components/UniversalInAppHelpDrawer";
import { ClientErrorConsole } from "@/components/ClientErrorConsole";
import { useI18n } from "@/lib/i18n";
import "@/index.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "DealCompass AI+ — Global Trade Intelligence Platform" },
      {
        name: "description",
        content:
          "AI-powered global trade intelligence platform for discovering, scoring, saving, and monitoring real trade opportunities.",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <RootLayout />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const navItems = [
  { path: "/dashboard", labelKey: "nav.dashboard", fallback: "Dashboard", icon: LayoutDashboard },
  {
    path: "/opportunities",
    labelKey: "nav.opportunityWall",
    fallback: "Opportunity Wall",
    icon: Package,
  },
  { path: "/ai-agent", labelKey: "nav.aiAgent", fallback: "AI Agent", icon: Handshake },
  {
    path: "/analytics",
    labelKey: "nav.marketIntel",
    fallback: "Market Intelligence",
    icon: ClipboardList,
  },
  { path: "/notifications", labelKey: "nav.smartAlerts", fallback: "Smart Alerts", icon: Bell },
  { path: "/billing", labelKey: "nav.creditsBilling", fallback: "Credits", icon: CreditCard },
];

function RootLayout() {
  return (
    <GlobalStoreProvider>
      <AppChrome />
    </GlobalStoreProvider>
  );
}

function AppChrome() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [notifications, setNotifications] = useState(0);
  const location = useLocation();
  const { logout } = useAuth();
  const { t, dir, language } = useI18n();
  const isRtl = dir === "rtl";

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
    getNotifications()
      .then((items) => setNotifications(items.filter((item) => !item.read).length))
      .catch(() => setNotifications(0));
  }, []);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const chromeLessRoutes = ["/", "/login"];
  const legacySidebarRoutes = [
    "/ai-agent",
    "/billing",
    "/demands",
    "/kyc",
    "/ml-analytics",
    "/notifications",
    "/opportunities",
    "/pre-deals",
    "/profile",
    "/sanctions",
    "/shipments",
    "/supabase-portal",
    "/trade-finance",
    "/workflow",
  ];
  const isChromeLess = chromeLessRoutes.includes(location.pathname);
  const usesLegacySidebar = legacySidebarRoutes.some(
    (path) => location.pathname === path || location.pathname.startsWith(path + "/"),
  );

  const tierColors: Record<string, string> = {
    free: "bg-surface-700 text-surface-200",
    bronze: "bg-amber-900/40 text-amber-300",
    silver: "bg-slate-700 text-slate-200",
    gold: "bg-yellow-500/20 text-yellow-300",
    platinum: "bg-indigo-500/20 text-indigo-300",
    black: "bg-black text-white border border-white/20",
  };

  return (
    <div
      className={`min-h-screen bg-surface-50 flex flex-col ${isRtl ? "text-right" : "text-left"}`}
      dir={dir}
    >
      {!isChromeLess && !usesLegacySidebar && (
        <>
          {/* TERMINAL TOP BAR — dark ink control strip */}
          <header
            className="sticky top-0 z-40 text-white border-b border-white/10"
            style={{ backgroundColor: "#0B1220" }}
          >
            <div
              className={`h-14 flex items-center px-4 lg:px-6 gap-4 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              {/* Logo block */}
              <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className={isRtl ? "leading-tight text-right" : "leading-tight"}>
                  <div className="text-sm font-bold tracking-tight">DealCompass AI+</div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-surface-400 font-mono">
                    {t("nav.intelPortal", "Trade Intelligence")}
                  </div>
                </div>
              </Link>

              <div className="hidden lg:block h-6 w-px bg-white/10 mx-1" />

              {/* Horizontal nav */}
              <nav
                className={`hidden lg:flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                                group flex items-center gap-1.5 px-3 h-9 rounded-md text-[12.5px] font-medium
                                transition-colors whitespace-nowrap relative
                                ${
                                  active
                                    ? "bg-white/10 text-white"
                                    : "text-surface-300 hover:bg-white/5 hover:text-white"
                                }
                              `}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t(item.labelKey, item.fallback)}</span>
                      {item.path === "/notifications" && notifications > 0 && (
                        <span className="ml-1 rounded-sm bg-blue-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-700">
                          {notifications}
                        </span>
                      )}
                      {active && (
                        <span
                          className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full"
                          style={{ backgroundColor: "#0c9cf0" }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden ${isRtl ? "mr-auto" : "ml-auto"} p-2 rounded-md hover:bg-white/10`}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Right cluster — status + profile */}
              <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-white/5 border border-white/10">
                  <span
                    className="w-1.5 h-1.5 rounded-full status-pulse"
                    style={{ backgroundColor: "#22c55e" }}
                  />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-surface-200">
                    {t("topbar.live", "Live")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-white/5 border border-white/10">
                  <Globe className="w-3 h-3 text-surface-300" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-surface-200">
                    {language.toUpperCase()}
                  </span>
                </div>

                <button
                  className="relative p-1.5 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 text-surface-200" />
                  {notifications > 0 && (
                    <span
                      className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "#f59e0b" }}
                    />
                  )}
                </button>

                <div className="h-6 w-px bg-white/10 mx-1" />

                {user ? (
                  <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-white/5 cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <UserIcon className="w-3 h-3 text-primary-300" />
                    </div>
                    <div className={isRtl ? "leading-tight text-right" : "leading-tight"}>
                      <div className="text-[11px] font-medium text-white max-w-[120px] truncate">
                        {user.name}
                      </div>
                      <div
                        className={`text-[8.5px] uppercase font-mono tracking-wider px-1 rounded-sm inline-block ${tierColors[user.account_type] || tierColors.free}`}
                      >
                        {user.account_type}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/10" />
                )}

                <button
                  onClick={logout}
                  className="p-1.5 rounded-md hover:bg-red-500/20 text-surface-300 hover:text-red-300 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile nav drawer */}
            {mobileOpen && (
              <div className="lg:hidden border-t border-white/10 px-2 py-2 space-y-0.5">
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${active ? "bg-white/10 text-white" : "text-surface-300 hover:bg-white/5"}`}
                    >
                      <Icon className="w-4 h-4" />
                      {t(item.labelKey, item.fallback)}
                    </Link>
                  );
                })}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  {t("btn.logout", "Sign out")}
                </button>
              </div>
            )}
          </header>
        </>
      )}

      {/* Page content */}
      <main className="flex-1 min-w-0">
        <div
          className={
            isChromeLess || usesLegacySidebar
              ? "w-full"
              : "p-4 lg:p-8 max-w-[1600px] mx-auto w-full"
          }
        >
          <Outlet />
        </div>
        {!isChromeLess && (
          <>
            <CookieConsentBanner />
            <UniversalInAppHelpDrawer />
            <ClientErrorConsole />
          </>
        )}
      </main>
    </div>
  );
}
