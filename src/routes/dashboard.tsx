import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type ElementType, type ReactNode } from "react";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Handshake,
  ClipboardCheck,
  Truck,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  getDashboard,
  getPreDeals,
  getOrders,
  getWorkflowActionLogs,
  recordWorkflowAction,
  deleteWorkflowAction,
  type PreDeal,
  type Order,
  type DashboardStats,
  type WorkflowActionLog,
} from "@/lib/api";
import { Link } from "@tanstack/react-router";
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

const quickActions = [
  {
    labelKey: "dash.action.product",
    fallback: "List New Product",
    path: "/products",
    icon: Package,
    color: "bg-primary-50 text-primary-600",
  },
  {
    labelKey: "dash.action.deals",
    fallback: "Find Deals",
    path: "/deals",
    icon: Sparkles,
    color: "bg-accent-50 text-accent-600",
  },
  {
    labelKey: "dash.action.shipment",
    fallback: "Track Shipment",
    path: "/logistics",
    icon: Truck,
    color: "bg-success-50 text-success-600",
  },
  {
    labelKey: "dash.action.analytics",
    fallback: "View Analytics",
    path: "/analytics",
    icon: BarChart3,
    color: "bg-indigo-50 text-indigo-600",
  },
];

const workflowSteps = [
  {
    id: 1,
    titleKey: "dash.workflow.1.title",
    title: "List or Browse",
    descKey: "dash.workflow.1.desc",
    desc: "Add products or explore demands",
    icon: Package,
    status: "active",
  },
  {
    id: 2,
    titleKey: "dash.workflow.2.title",
    title: "Smart Matching",
    descKey: "dash.workflow.2.desc",
    desc: "Get matched with best partners",
    icon: Sparkles,
    status: "active",
  },
  {
    id: 3,
    titleKey: "dash.workflow.3.title",
    title: "Review Deals",
    descKey: "dash.workflow.3.desc",
    desc: "Evaluate pre-deal proposals",
    icon: Handshake,
    status: "pending",
  },
  {
    id: 4,
    titleKey: "dash.workflow.4.title",
    title: "Confirm Order",
    descKey: "dash.workflow.4.desc",
    desc: "Lock in with escrow protection",
    icon: ClipboardCheck,
    status: "pending",
  },
  {
    id: 5,
    titleKey: "dash.workflow.5.title",
    title: "Ship & Track",
    descKey: "dash.workflow.5.desc",
    desc: "Monitor haulage in real time",
    icon: Truck,
    status: "pending",
  },
];

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
  change,
  changeType,
  icon: Icon,
  subtitle,
}: {
  title: ReactNode;
  value: ReactNode;
  change?: ReactNode;
  changeType: "up" | "down" | "neutral";
  icon: ElementType;
  subtitle?: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${changeType === "up" ? "bg-success-50" : changeType === "down" ? "bg-danger-50" : "bg-primary-50"}`}
        >
          <Icon
            className={`w-5 h-5 ${changeType === "up" ? "text-success-600" : changeType === "down" ? "text-danger-600" : "text-primary-600"}`}
          />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${changeType === "up" ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"}`}
          >
            {changeType === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-surface-800 font-mono tabular-nums">{value}</p>
      <p className="text-sm text-surface-500 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
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
  const score = parseFloat(deal.match_score);
  const scoreColor =
    score >= 90 ? "bg-success-500" : score >= 75 ? "bg-primary-500" : "bg-warning-500";
  const isAccepted = deal.status === "accepted";
  const isPending = deal.status === "pending";
  const title = deal.product?.name || t("dash.default.commodity", "Cross-Border Commodity");

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200 card-hover group">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div
            className={`w-12 h-12 rounded-xl ${scoreColor} bg-opacity-10 flex items-center justify-center`}
          >
            <span
              className={`text-sm font-bold ${score >= 90 ? "text-success-700" : score >= 75 ? "text-primary-700" : "text-warning-700"}`}
            >
              {deal.match_score}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-surface-800 text-sm">{title}</h4>
            <p
              className={`text-xs text-surface-400 flex items-center gap-1 mt-0.5 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <MapPin className="w-3 h-3" />
              <span dir="ltr">
                {deal.product?.origin} → {deal.buyer?.country}
              </span>
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isAccepted
              ? "bg-success-50 text-success-700"
              : isPending
                ? "bg-warning-50 text-warning-700"
                : "bg-surface-100 text-surface-500"
          }`}
        >
          {isAccepted
            ? t("status.accepted", "Accepted")
            : isPending
              ? t("status.pending", "Pending")
              : deal.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface-50 rounded-xl p-2.5">
          <p className="text-[10px] text-surface-400 uppercase tracking-wider">
            {t("dash.field.quantity", "Quantity")}
          </p>
          <p className="text-sm font-semibold text-surface-800">
            {deal.quantity} {deal.product?.unit}
          </p>
        </div>
        <div className="bg-surface-50 rounded-xl p-2.5">
          <p className="text-[10px] text-surface-400 uppercase tracking-wider">
            {t("dash.field.price", "Price")}
          </p>
          <p className="text-sm font-semibold text-surface-800">
            ${deal.suggested_price}/{deal.product?.unit}
          </p>
        </div>
        <div className="bg-surface-50 rounded-xl p-2.5">
          <p className="text-[10px] text-surface-400 uppercase tracking-wider">
            {t("dash.field.payment", "Payment")}
          </p>
          <p className="text-sm font-semibold text-surface-800">{deal.payment_terms}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className={`flex items-center gap-2 text-xs text-surface-500 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>
            {t("dash.expires", "Expires")} {new Date(deal.expires_at).toLocaleDateString()}
          </span>
        </div>
        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
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
            className="inline-flex items-center gap-1.5 rounded-full bg-success-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-success-700"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("workflow.act", "Acted on it")}
          </button>
          <Link
            to="/deals"
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            {t("btn.review", "Review")}{" "}
            <ChevronRight className={isRtl ? "w-3.5 h-3.5 rotate-180" : "w-3.5 h-3.5"} />
          </Link>
        </div>
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
  const statusConfig: Record<string, { bg: string; text: string; icon: ElementType }> = {
    confirmed: { bg: "bg-primary-50", text: "text-primary-700", icon: CheckCircle2 },
    completed: { bg: "bg-success-50", text: "text-success-700", icon: CheckCircle2 },
    in_transit: { bg: "bg-warning-50", text: "text-warning-700", icon: Truck },
    pending: { bg: "bg-surface-100", text: "text-surface-600", icon: Clock },
  };
  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const title = order.items[0]?.product?.name || t("dash.default.b2b", "B2B Commodity");

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200 card-hover">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
            <StatusIcon className={`w-5 h-5 ${config.text}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-800">{order.order_number}</p>
            <p className="text-xs text-surface-400">{title}</p>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}
        >
          {order.status.replace("_", " ").toUpperCase()}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <div className={`flex items-center gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
          <span className="text-surface-500">
            {order.items[0]?.quantity} {order.items[0]?.unit}
          </span>
          <span className="text-surface-300">|</span>
          <span className="font-semibold text-surface-800">
            ${Number(order.total_value).toFixed(2)}
          </span>
        </div>
        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
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
            className="inline-flex items-center gap-1.5 rounded-full bg-success-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-success-700"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("workflow.act", "Acted on it")}
          </button>
          <Link
            to="/orders"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            {t("btn.details", "Details")}{" "}
            <ChevronRight className={isRtl ? "w-3.5 h-3.5 rotate-180" : "w-3.5 h-3.5"} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deals, setDeals] = useState<PreDeal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [actedLogs, setActedLogs] = useState<WorkflowActionLog[]>([]);
  const [pendingAction, setPendingAction] = useState<AttentionAction | null>(null);
  const [actionSaving, setActionSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
          .map((log) => log.item_id),
      );
      const actedOrderIds = new Set(
        logs
          .filter((log) => log.item_type === "order" && log.new_status === "acted")
          .map((log) => log.item_id),
      );
      setStats(s);
      setActedLogs(logs.slice(0, 8));
      setDeals(d.filter((deal) => !actedDealIds.has(deal.id)).slice(0, 3));
      setOrders(o.filter((order) => !actedOrderIds.has(order.id)).slice(0, 3));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  function handleActOnItem(item: AttentionAction) {
    setPendingAction(item);
  }

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
      setActedLogs((prev) => [log, ...prev.filter((entry) => entry.id !== log.id)].slice(0, 8));
      setPendingAction(null);
    } catch (error) {
      console.error(error);
    } finally {
      setActionSaving(false);
    }
  }

  async function handleUndoAction(actionId: string) {
    await deleteWorkflowAction(actionId);
    await loadDashboardData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-surface-400">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          {t("dash.loading", "Loading your trade dashboard...")}
        </div>
      </div>
    );
  }

  const totalDealValue = deals.reduce(
    (sum, d) => sum + Number(d.suggested_price || 0) * Number(d.quantity || 0),
    0,
  );
  const lastSync = new Date().toLocaleTimeString("en-GB", { hour12: false });

  return (
    <div className={`space-y-6 animate-slide-in ${isRtl ? "text-right" : "text-left"}`} dir={dir}>
      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent className="border-surface-200 bg-white" dir={dir}>
          <DialogHeader className={isRtl ? "text-right" : "text-left"}>
            <DialogTitle>{t("workflow.confirm.title", "Move to acted-on log?")}</DialogTitle>
            <DialogDescription>
              {t(
                "workflow.confirm.desc",
                "This item will leave “needs my attention” and be recorded in the status log.",
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
              type="button"
              onClick={() => setPendingAction(null)}
              className="rounded-xl border border-surface-200 px-4 py-2 text-sm font-bold text-surface-700 hover:bg-surface-50"
            >
              {t("btn.cancel", "Cancel")}
            </button>
            <button
              type="button"
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

      {/* TERMINAL HEADER — dense, ticker-style */}
      <div
        className="rounded-2xl overflow-hidden border border-white/10 shadow-xl"
        style={{ backgroundColor: "#0B1220" }}
      >
        <div className="px-6 py-5 flex items-start justify-between gap-6 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm"
                style={{ backgroundColor: "#f59e0b", color: "#0B1220" }}
              >
                {t("dash.command", "Command Desk")}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse" />
                {t("dash.engine", "Engine Active")}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              {t("dash.attention", "What needs your attention")}
            </h1>
            <p className="text-sm text-surface-300 max-w-2xl">
              {t(
                "dash.attention.desc",
                "Live pre-deals, orders, and corridor signals across Iraq · Iran · Turkey.",
              )}
            </p>
          </div>
          <div className="font-mono text-right text-surface-300 text-[11px] leading-relaxed">
            <div>
              <span className="text-surface-500">{t("dash.session", "SESSION")}</span>{" "}
              <span className="text-white">{lastSync}</span>
            </div>
            <div>
              <span className="text-surface-500">{t("dash.lanes", "LANES")}</span>{" "}
              <span className="text-white">IQ · IR · TR · EU</span>
            </div>
          </div>
        </div>

        {/* TICKER STRIP */}
        <div
          className="border-t border-white/10 px-6 py-2.5 flex items-center gap-x-8 gap-y-1.5 flex-wrap font-mono text-[11px]"
          style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          <span className="flex items-center gap-2">
            <span className="text-surface-500 uppercase tracking-wider">
              {t("dash.ticker.deals", "Active Deals")}
            </span>
            <span className="text-white font-semibold tabular-nums">
              {String(stats?.active_pre_deals ?? 0).padStart(3, "0")}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-surface-500 uppercase tracking-wider">
              {t("dash.ticker.orders", "Orders")}
            </span>
            <span className="text-white font-semibold tabular-nums">
              {String(stats?.accepted_deals ?? 0).padStart(3, "0")}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-surface-500 uppercase tracking-wider">
              {t("dash.ticker.pipeline", "Pipeline")}
            </span>
            <span className="font-semibold tabular-nums" style={{ color: "#f59e0b" }}>
              ${totalDealValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-surface-500 uppercase tracking-wider">
              {t("dash.ticker.products", "Products")}
            </span>
            <span className="text-white font-semibold tabular-nums">
              {String(stats?.total_products ?? 0).padStart(3, "0")}
            </span>
          </span>
          <span className="flex items-center gap-2 ml-auto">
            <span className="text-surface-500 uppercase tracking-wider">
              {t("dash.ticker.sync", "Last Sync")}
            </span>
            <span className="text-emerald-400 tabular-nums">{lastSync}</span>
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-surface-200 card-hover group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-surface-700 group-hover:text-surface-900">
                {t(action.labelKey, action.fallback)}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("dash.stat.products", "Active Products")}
          value={stats?.total_products || 0}
          change="+2"
          changeType="up"
          icon={Package}
          subtitle={t("dash.stat.products.sub", "Listed for buyers")}
        />
        <StatCard
          title={t("dash.stat.preDeals", "Active Pre-Deals")}
          value={stats?.active_pre_deals || 0}
          change="+1"
          changeType="up"
          icon={Handshake}
          subtitle={t("dash.stat.preDeals.sub", "Awaiting your review")}
        />
        <StatCard
          title={t("dash.stat.orders", "Confirmed Orders")}
          value={stats?.accepted_deals || 0}
          change="0"
          changeType="neutral"
          icon={ClipboardCheck}
          subtitle={t("dash.stat.orders.sub", "In progress")}
        />
        <StatCard
          title={t("dash.stat.insights", "Market Insights")}
          value="3"
          change={t("dash.new", "New")}
          changeType="up"
          icon={BarChart3}
          subtitle={t("dash.stat.insights.sub", "Price predictions ready")}
        />
      </div>

      {/* Workflow Progress */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-surface-800">
              {t("dash.workflow.title", "Your Trade Workflow")}
            </h3>
            <p className="text-sm text-surface-500 mt-0.5">
              {t("dash.workflow.desc", "Follow these steps to complete a successful trade")}
            </p>
          </div>
          <Link
            to="/deals"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            {t("btn.continue", "Continue")}{" "}
            <ArrowRight className={isRtl ? "w-4 h-4 rotate-180" : "w-4 h-4"} />
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-2 lg:gap-4">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.status === "active";
            const isCompleted = idx < workflowSteps.findIndex((s) => s.status === "pending");
            return (
              <div key={step.id} className="relative text-center">
                {idx < workflowSteps.length - 1 && (
                  <div
                    className={`hidden lg:block absolute top-5 left-[60%] w-[80%] h-0.5 ${isCompleted || isActive ? "bg-primary-500" : "bg-surface-200"}`}
                  />
                )}
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 relative z-10
                  ${
                    isCompleted
                      ? "bg-primary-500 text-white"
                      : isActive
                        ? "bg-primary-100 text-primary-600 ring-2 ring-primary-500 ring-offset-2"
                        : "bg-surface-100 text-surface-400"
                  }
                `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <p
                  className={`text-xs font-semibold ${isActive || isCompleted ? "text-surface-800" : "text-surface-400"}`}
                >
                  {t(step.titleKey, step.title)}
                </p>
                <p className="text-[10px] text-surface-400 hidden lg:block mt-0.5">
                  {t(step.descKey, step.desc)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Deals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-100 p-4 rounded-2xl border border-surface-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-extrabold text-surface-800 font-sans">
                {t("dash.deals.panel", "Smart-Matched Pre-Deals")}
              </h3>
            </div>
            <Link
              to="/deals"
              className="text-xs font-black text-primary-600 hover:text-primary-700 flex items-center gap-1 font-mono uppercase tracking-wider bg-white px-3 py-1.5 rounded-full shadow-sm"
            >
              <span>{t("dash.viewHub", "View Hub Desk")}</span>{" "}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3 stagger-children">
            {deals.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-surface-200 text-center shadow-sm">
                <Sparkles
                  className="w-12 h-12 text-primary-400 mx-auto mb-3 animate-spin"
                  style={{ animationDuration: "10s" }}
                />
                <p className="text-surface-800 font-extrabold text-base">
                  {t("dash.empty.deals", "No smart deals generated")}
                </p>
                <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                  {t(
                    "dash.empty.deals.desc",
                    "Add verified inventory or purchasing inquiries to get matched automatically.",
                  )}
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-primary-600 text-white rounded-2xl text-xs font-bold hover:bg-primary-500 transition-all shadow-md"
                >
                  <Package className="w-4 h-4" />{" "}
                  {t("dash.action.product", "List Commodity Product")}
                </Link>
              </div>
            ) : (
              deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onAct={handleActOnItem} t={t} isRtl={isRtl} />
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-100 p-4 rounded-2xl border border-surface-200">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-accent-600" />
              <h3 className="text-base font-extrabold text-surface-800 font-sans">
                {t("dash.orders.panel", "Active Orders & Custody Payouts")}
              </h3>
            </div>
            <Link
              to="/orders"
              className="text-xs font-black text-accent-600 hover:text-accent-700 flex items-center gap-1 font-mono uppercase tracking-wider bg-white px-3 py-1.5 rounded-full shadow-sm"
            >
              <span>{t("dash.viewEscrow", "View Escrow Paper")}</span>{" "}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3 stagger-children">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-surface-200 text-center shadow-sm">
                <ClipboardCheck className="w-12 h-12 text-accent-400 mx-auto mb-3 animate-bounce" />
                <p className="text-surface-800 font-extrabold text-base">
                  {t("dash.empty.orders", "No active transaction manifests")}
                </p>
                <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                  {t(
                    "dash.empty.orders.desc",
                    "Accept a pre-deal from your deal stream to initialize neutral-custody payout handshakes.",
                  )}
                </p>
                <Link
                  to="/deals"
                  className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-accent-600 text-white rounded-2xl text-xs font-bold hover:bg-accent-500 transition-all shadow-md"
                >
                  <Handshake className="w-4 h-4" />{" "}
                  {t("dash.inspectDeals", "Inspect Safe Deals Hub")}
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAct={handleActOnItem}
                  t={t}
                  isRtl={isRtl}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Acted-on status log */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-surface-800">
              {t("workflow.log.title", "Acted-on status log")}
            </h3>
            <p className="text-sm text-surface-500">
              {t(
                "workflow.log.desc",
                "Items you confirmed are moved out of attention and recorded here.",
              )}
            </p>
          </div>
          <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-bold text-success-700">
            {actedLogs.length} {t("workflow.log.items", "logged")}
          </span>
        </div>

        {actedLogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50 p-6 text-sm text-surface-500">
            {t(
              "workflow.log.empty",
              "No actions logged yet. Click “Acted on it” on a deal or order to create the first status record.",
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {actedLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-center justify-between gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-3 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex items-center gap-3 min-w-0 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-success-100 text-success-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-surface-800">{log.title}</p>
                    <p className="truncate text-xs text-surface-500">{log.detail}</p>
                  </div>
                </div>
                <div className={isRtl ? "text-left" : "text-right"}>
                  <p className="text-xs font-bold text-success-700">
                    {t("workflow.status.acted", "Acted on it")}
                  </p>
                  <p className="text-[11px] font-mono text-surface-400">
                    {new Date(log.acted_at).toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleUndoAction(log.id)}
                    className="mt-1 text-[11px] font-bold text-primary-600 hover:text-primary-700"
                  >
                    {t("workflow.undo", "Undo")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compliance Status */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-800">
              {t("dash.compliance", "Compliance Status")}
            </h3>
            <p className="text-sm text-surface-500">
              {t("dash.compliance.desc", "Your account verification and sanctions screening")}
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-success-50 rounded-xl border border-success-200">
            <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success-800">
                {t("dash.compliance.identity", "Identity Verified")}
              </p>
              <p className="text-xs text-success-600">{t("dash.compliance.kyc", "KYC approved")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-success-50 rounded-xl border border-success-200">
            <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success-800">
                {t("dash.compliance.sanctions", "Sanctions Cleared")}
              </p>
              <p className="text-xs text-success-600">
                {t("dash.compliance.sdn", "Zero SDN hits")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl border border-primary-200">
            <ShieldCheck className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary-800">
                {t("dash.compliance.escrow", "Escrow Protected")}
              </p>
              <p className="text-xs text-primary-600">
                {t("dash.compliance.secured", "All transactions secured")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
