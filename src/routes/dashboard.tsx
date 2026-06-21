import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ElementType, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Handshake,
  Package,
  ShieldCheck,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";
import {
  deleteWorkflowAction,
  getDashboard,
  getOrders,
  getPreDeals,
  getWorkflowActionLogs,
  recordWorkflowAction,
  type DashboardStats,
  type Order,
  type PreDeal,
  type WorkflowActionLog,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type UserIntent = "sell" | "buy" | "both";

type AttentionAction = {
  itemType: "deal" | "order";
  id: number;
  title: string;
  detail: string;
  previousStatus: string;
};

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: ReactNode;
  value: ReactNode;
  icon: ElementType;
  tone: string;
}) {
  return (
    <div className="rounded-3xl border border-surface-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-50">
        <Icon className={`h-5 w-5 ${tone}`} />
      </div>
      <p className="font-mono tabular-nums text-3xl font-black text-surface-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-surface-500">{title}</p>
    </div>
  );
}

function DealCard({
  deal,
  onAct,
  t,
  isRtl,
}: {
  deal: PreDeal;
  onAct: (item: AttentionAction) => void;
  t: (key: string, fallback?: string) => string;
  isRtl: boolean;
}) {
  const title = deal.product?.name || t("dash.default.commodity", "Cross-Border Commodity");
  return (
    <div className="rounded-3xl border border-surface-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-surface-900">{title}</h3>
          <p className="mt-1 text-sm text-surface-500" dir="ltr">
            {deal.product?.origin || "Origin"} → {deal.buyer?.country || "Buyer"}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono tabular-nums text-xs font-black text-emerald-700">
          {deal.match_score}%
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-2xl bg-surface-50 p-3">
          <p className="font-bold text-surface-400">{t("dash.field.quantity", "Quantity")}</p>
          <p className="font-mono tabular-nums font-black text-surface-900">
            {deal.quantity} {deal.product?.unit}
          </p>
        </div>
        <div className="rounded-2xl bg-surface-50 p-3">
          <p className="font-bold text-surface-400">{t("dash.field.price", "Price")}</p>
          <p className="font-mono tabular-nums font-black text-surface-900">
            ${deal.suggested_price}
          </p>
        </div>
        <div className="rounded-2xl bg-surface-50 p-3">
          <p className="font-bold text-surface-400">{t("dash.field.payment", "Payment")}</p>
          <p className="font-bold text-surface-900">{deal.payment_terms}</p>
        </div>
      </div>
      <div
        className={`mt-4 flex flex-wrap items-center justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <Link
          to="/pre-deals"
          className="text-sm font-black text-primary-600 hover:text-primary-700"
        >
          {t("dash.reviewMatch", "Review match")}
        </Link>
        <button
          type="button"
          onClick={() =>
            onAct({
              itemType: "deal",
              id: deal.id,
              title,
              detail: `${deal.quantity} ${deal.product?.unit || ""} · ${deal.match_score}%`,
              previousStatus: deal.status,
            })
          }
          className="inline-flex items-center gap-2 rounded-full bg-success-600 px-4 py-2 text-xs font-black text-white hover:bg-success-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          {t("workflow.act", "Acted on it")}
        </button>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onAct,
  t,
  isRtl,
}: {
  order: Order;
  onAct: (item: AttentionAction) => void;
  t: (key: string, fallback?: string) => string;
  isRtl: boolean;
}) {
  const title = order.items[0]?.product?.name || t("dash.default.b2b", "B2B Commodity");
  return (
    <div className="rounded-3xl border border-surface-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-mono tabular-nums font-black text-surface-900">
            {order.order_number}
          </h3>
          <p className="mt-1 text-sm text-surface-500">{title}</p>
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black uppercase text-primary-700">
          {order.status.replace("_", " ")}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-surface-50 p-3 text-sm">
        <span className="text-surface-500">
          {order.items[0]?.quantity} {order.items[0]?.unit}
        </span>
        <span className="font-mono tabular-nums font-black text-surface-900">
          ${Number(order.total_value).toLocaleString()}
        </span>
      </div>
      <div
        className={`mt-4 flex flex-wrap items-center justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <Link to="/orders" className="text-sm font-black text-primary-600 hover:text-primary-700">
          {t("btn.details", "Details")}
        </Link>
        <button
          type="button"
          onClick={() =>
            onAct({
              itemType: "order",
              id: order.id,
              title: order.order_number,
              detail: title,
              previousStatus: order.status,
            })
          }
          className="inline-flex items-center gap-2 rounded-full bg-success-600 px-4 py-2 text-xs font-black text-white hover:bg-success-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          {t("workflow.act", "Acted on it")}
        </button>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [intent, setIntent] = useState<UserIntent | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("tureep_customer_intent") as UserIntent | null) || null;
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deals, setDeals] = useState<PreDeal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [actedLogs, setActedLogs] = useState<WorkflowActionLog[]>([]);
  const [pendingAction, setPendingAction] = useState<AttentionAction | null>(null);
  const [actionSaving, setActionSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  function saveIntent(next: UserIntent) {
    setIntent(next);
    localStorage.setItem("tureep_customer_intent", next);
  }

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [s, d, o, logs] = await Promise.all([
        getDashboard(),
        getPreDeals(),
        getOrders(),
        getWorkflowActionLogs(),
      ]);
      const actedDealIds = new Set(
        logs
          .filter((log) => log.item_type === "deal" && log.new_status === "acted")
          .map((log) => String(log.item_id)),
      );
      const actedOrderIds = new Set(
        logs
          .filter((log) => log.item_type === "order" && log.new_status === "acted")
          .map((log) => String(log.item_id)),
      );
      setStats(s);
      setActedLogs(logs.slice(0, 5));
      setDeals(d.filter((deal) => !actedDealIds.has(String(deal.id))).slice(0, 3));
      setOrders(o.filter((order) => !actedOrderIds.has(String(order.id))).slice(0, 3));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function confirmPendingAction() {
    if (!pendingAction) return;
    setActionSaving(true);
    try {
      const log = await recordWorkflowAction({
        id: `${pendingAction.itemType}-${pendingAction.id}-${Date.now()}`,
        item_type: pendingAction.itemType,
        item_id: pendingAction.id,
        title: pendingAction.title,
        detail: pendingAction.detail,
        previous_status: pendingAction.previousStatus,
        new_status: "acted",
        acted_at: new Date().toISOString(),
      });
      if (pendingAction.itemType === "deal") {
        setDeals((prev) => prev.filter((deal) => deal.id !== pendingAction.id));
      } else {
        setOrders((prev) => prev.filter((order) => order.id !== pendingAction.id));
      }
      setActedLogs((prev) => [log, ...prev.filter((entry) => entry.id !== log.id)].slice(0, 5));
      setPendingAction(null);
    } finally {
      setActionSaving(false);
    }
  }

  async function handleUndoAction(actionId: string) {
    await deleteWorkflowAction(actionId);
    await loadDashboardData();
  }

  const nextActions = [
    {
      title: t("dash.next.addProduct", "Add a product to sell"),
      text: t("dash.next.addProduct.desc", "List what your company can supply."),
      path: "/products",
      icon: Package,
      show: intent !== "buy",
    },
    {
      title: t("dash.next.addRequest", "Post a buying request"),
      text: t("dash.next.addRequest.desc", "Tell suppliers what you need."),
      path: "/demands",
      icon: ClipboardList,
      show: intent !== "sell",
    },
    {
      title: t("dash.next.matches", "Review new matches"),
      text: t("dash.next.matches.desc", "See possible buyers and suppliers."),
      path: "/pre-deals",
      icon: Handshake,
      show: true,
    },
    {
      title: t("dash.next.verify", "Verify your company"),
      text: t("dash.next.verify.desc", "Build trust before closing deals."),
      path: "/kyc",
      icon: ShieldCheck,
      show: true,
    },
  ].filter((item) => item.show);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-surface-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <span className="mx-3 font-semibold">
          {t("dash.loading", "Loading your trade dashboard...")}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRtl ? "text-right" : "text-left"}`} dir={dir}>
      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent className="border-surface-200 bg-white" dir={dir}>
          <DialogHeader className={isRtl ? "text-right" : "text-left"}>
            <DialogTitle>{t("workflow.confirm.title", "Move to acted-on log?")}</DialogTitle>
            <DialogDescription>
              {t(
                "workflow.confirm.desc",
                "This item will leave your attention list and be recorded in the status log.",
              )}
            </DialogDescription>
          </DialogHeader>
          {pendingAction && (
            <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
              <p className="font-bold text-surface-800">{pendingAction.title}</p>
              <p className="mt-1 text-sm text-surface-500">{pendingAction.detail}</p>
            </div>
          )}
          <DialogFooter className={isRtl ? "sm:flex-row-reverse sm:space-x-reverse" : ""}>
            <button
              onClick={() => setPendingAction(null)}
              className="rounded-xl border border-surface-200 px-4 py-2 text-sm font-bold text-surface-700 hover:bg-surface-50"
            >
              {t("btn.cancel", "Cancel")}
            </button>
            <button
              onClick={confirmPendingAction}
              disabled={actionSaving}
              className="rounded-xl bg-success-600 px-4 py-2 text-sm font-bold text-white hover:bg-success-700 disabled:opacity-50"
            >
              {actionSaving
                ? t("workflow.saving", "Saving...")
                : t("workflow.confirm.action", "Confirm action")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!intent && (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-surface-950">
                {t("dash.onboarding.title", "What do you want to do first?")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-surface-600">
                {t(
                  "dash.onboarding.copy",
                  "We will simplify your dashboard based on whether you want to sell, buy, or do both.",
                )}
              </p>
            </div>
            <button
              onClick={() => saveIntent("both")}
              className="rounded-full p-2 text-surface-400 hover:bg-white hover:text-surface-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["sell", t("dash.intent.sell", "Sell products"), Package],
              ["buy", t("dash.intent.buy", "Buy products"), ClipboardList],
              ["both", t("dash.intent.both", "Both"), Handshake],
            ].map(([id, label, Icon]) => {
              const SafeIcon = Icon as ElementType;
              return (
                <button
                  key={id as string}
                  onClick={() => saveIntent(id as UserIntent)}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left font-black text-surface-800 shadow-sm hover:ring-2 hover:ring-amber-300"
                >
                  <SafeIcon className="h-5 w-5 text-amber-600" />
                  {label as string}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
        <p className="text-xs font-black uppercase tracking-wider text-amber-400">
          {t("dash.home.kicker", "Customer home")}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          {t("dash.home.title", "Your next trade steps")}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          {t(
            "dash.home.copy",
            "Add products or buying requests, review matches, verify your company, and follow orders from payment to shipment.",
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dash.stat.products", "Active Products")}
          value={stats?.total_products || 0}
          icon={Package}
          tone="text-primary-600"
        />
        <StatCard
          title={t("dash.stat.preDeals", "Active Matches")}
          value={stats?.active_pre_deals || 0}
          icon={Handshake}
          tone="text-amber-600"
        />
        <StatCard
          title={t("dash.stat.orders", "Orders")}
          value={stats?.accepted_deals || 0}
          icon={ShoppingCart}
          tone="text-success-600"
        />
        <StatCard
          title={t("dash.stat.insights", "Market Insights")}
          value="3"
          icon={BarChart3}
          tone="text-indigo-600"
        />
      </div>

      <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-surface-900">
              {t("dash.next.title", "Recommended next actions")}
            </h2>
            <p className="mt-1 text-sm text-surface-500">
              {t("dash.next.copy", "Start with the task that best matches your goal.")}
            </p>
          </div>
          {intent && (
            <button
              onClick={() => setIntent(null)}
              className="text-xs font-bold text-primary-600 hover:text-primary-700"
            >
              {t("dash.intent.change", "Change goal")}
            </button>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {nextActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group rounded-3xl border border-surface-200 bg-surface-50 p-5 transition hover:border-primary-300 hover:bg-white"
            >
              <action.icon className="mb-4 h-6 w-6 text-primary-600" />
              <h3 className="font-black text-surface-900">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-surface-500">{action.text}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary-600">
                {t("btn.continue", "Continue")}
                <ArrowRight className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-surface-900">
              {t("dash.matches.title", "Matches needing review")}
            </h2>
            <Link to="/pre-deals" className="text-sm font-black text-primary-600">
              {t("btn.viewall", "View all")}
            </Link>
          </div>
          {deals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-surface-200 bg-white p-8 text-center text-sm text-surface-500">
              {t("dash.empty.deals", "No smart deals generated")}
            </div>
          ) : (
            deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onAct={setPendingAction} t={t} isRtl={isRtl} />
            ))
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-surface-900">
              {t("dash.orders.title", "Active orders")}
            </h2>
            <Link to="/orders" className="text-sm font-black text-primary-600">
              {t("btn.viewall", "View all")}
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-surface-200 bg-white p-8 text-center text-sm text-surface-500">
              {t("dash.empty.orders", "No active transaction manifests")}
            </div>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAct={setPendingAction}
                t={t}
                isRtl={isRtl}
              />
            ))
          )}
        </section>
      </div>

      <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-surface-900">
              {t("workflow.log.title", "Acted-on status log")}
            </h2>
            <p className="mt-1 text-sm text-surface-500">
              {t(
                "workflow.log.desc",
                "Items you confirmed are moved out of attention and recorded here.",
              )}
            </p>
          </div>
        </div>
        {actedLogs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-surface-200 bg-surface-50 p-6 text-sm text-surface-500">
            {t("workflow.log.empty", "No actions logged yet.")}
          </div>
        ) : (
          <div className="space-y-2">
            {actedLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-surface-200 bg-surface-50 p-4"
              >
                <div>
                  <p className="font-black text-surface-900">{log.title}</p>
                  <p className="text-sm text-surface-500">{log.detail}</p>
                </div>
                <div className={isRtl ? "text-left" : "text-right"}>
                  <p className="text-xs font-black text-success-700">
                    {t("workflow.status.acted", "Acted on it")}
                  </p>
                  <p className="font-mono tabular-nums text-[11px] text-surface-400">
                    {new Date(log.acted_at).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleUndoAction(log.id)}
                    className="mt-1 text-xs font-black text-primary-600"
                  >
                    {t("workflow.undo", "Undo")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
