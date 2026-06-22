import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim();

export type AccountType = "free" | "bronze" | "silver" | "gold" | "platinum" | "black";

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  country: string;
  account_type: AccountType;
  is_verified: boolean;
  kyc_status?: string;
  sanctions_screened?: boolean;
  reputation_score: number;
  created_at: string;
  last_login?: string;
}

export interface Product {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  category: string;
  price: string;
  quantity: number;
  unit: string;
  origin: string;
  location: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Demand {
  id: number;
  user_id: number;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  budget: string;
  location: string;
  urgency: number;
  is_active: boolean;
  created_at: string;
}

export interface PreDeal {
  id: number;
  product_id: number;
  seller_id: number;
  buyer_id: number;
  suggested_price: string;
  quantity: number;
  shipping_cost: string;
  payment_terms: string;
  status: string;
  priority_level: number;
  is_exclusive: boolean;
  match_score: string;
  created_at: string;
  expires_at: string;
  product?: Product;
  seller?: User;
  buyer?: User;
}

export interface DashboardStats {
  total_products: number;
  total_demands: number;
  active_pre_deals: number;
  accepted_deals: number;
  active_orders?: number;
}

export interface Payment {
  id: number;
  order_id: number;
  method: string;
  amount: string;
  currency: string;
  status: string;
  processor?: string;
  processor_transaction_id?: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit: string;
  unit_price: string;
  total_price: string;
  currency: string;
  fulfillment_status: string;
  product?: Product;
}

export interface Order {
  id: number;
  order_number: string;
  pre_deal_id?: number;
  buyer_id: number;
  seller_id: number;
  status: string;
  payment_status: string;
  payment_method: string;
  total_value: string;
  platform_fee: string;
  currency: string;
  incoterm: string;
  origin_country: string;
  destination_country: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  buyer?: User;
  seller?: User;
  items: OrderItem[];
  payments: Payment[];
}

export interface KYCRecord {
  id: number;
  user_id: number;
  status: string;
  document_type: string;
  document_url: string;
  document_hash: string;
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface SanctionsScreening {
  id: number;
  user_id: number;
  entity_name: string;
  entity_type: string;
  screened_against: string;
  match_found: boolean;
  match_details?: string;
  screened_at: string;
  review_status: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "in_app" | "email" | "push" | "sms";
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  created_at: string;
}

export interface WorkflowActionLog {
  id: string;
  user_id?: string | number;
  item_type: "deal" | "order";
  item_id: string | number;
  title: string;
  detail: string;
  previous_status?: string;
  new_status: "acted";
  acted_at: string;
  source: "server" | "local";
}

export interface Subscription {
  id: number;
  user_id: number;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  tier: AccountType;
  status: string;
  current_period_end: string;
  created_at: string;
}

export interface LetterOfCredit {
  id: number;
  lc_number: string;
  order_id: number;
  applicant_id: number;
  beneficiary_id: number;
  issuing_bank: string;
  advising_bank: string;
  amount: string;
  currency: string;
  expiry_date: string;
  status: string;
  discrepancy_notes?: string;
  documents_presented_at?: string;
  settled_at?: string;
  created_at: string;
}

export interface DocumentaryCollection {
  id: number;
  dp_number: string;
  order_id: number;
  exporter_id: number;
  importer_id: number;
  remitting_bank: string;
  collecting_bank: string;
  amount: string;
  currency: string;
  status: string;
  documents_released_at?: string;
  created_at: string;
}

export interface ShipmentEvent {
  id: number;
  shipment_id: number;
  timestamp: string;
  location: string;
  description: string;
}

export interface Shipment {
  id: number;
  order_id: number;
  tracking_number: string;
  carrier: string;
  origin_corridor: string;
  destination_corridor: string;
  status: string;
  estimated_delivery?: string;
  created_at: string;
  events: ShipmentEvent[];
}

export interface PricePrediction {
  commodity_name: string;
  current_price: string;
  forecast_30d: string;
  confidence_interval_low: string;
  confidence_interval_high: string;
  trend: "bullish" | "bearish";
}

export interface DemandAnalytics {
  corridor: string;
  total_demand_tonnage: number;
  total_supply_tonnage: number;
  imbalance_ratio: string;
  recommended_action: string;
}

function isSignedOut(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("dealcompass_signed_out") === "true";
}

function getToken(): string | null {
  if (typeof window === "undefined" || isSignedOut()) return null;
  return localStorage.getItem("dealcompass_token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.removeItem("dealcompass_signed_out");
    localStorage.setItem("dealcompass_token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("dealcompass_token");
    localStorage.setItem("dealcompass_signed_out", "true");
  }
}

function normalizeWorkflowAction(entry: any): WorkflowActionLog {
  return {
    id: String(entry.id),
    user_id: entry.user_id,
    item_type: entry.item_type || entry.itemType,
    item_id: entry.item_id ?? String(entry.id || "").split("-")[1] ?? "0",
    title: entry.title,
    detail: entry.detail || "",
    previous_status: entry.previous_status,
    new_status: entry.new_status || "acted",
    acted_at: entry.acted_at || entry.actedAt || new Date().toISOString(),
    source: entry.source || "server",
  };
}

async function getSupabaseUserId(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user?.id || null;
  } catch {
    return null;
  }
}

async function readWorkflowActionsFromSupabase(): Promise<WorkflowActionLog[] | null> {
  const userId = await getSupabaseUserId();
  if (!userId) return null;
  try {
    const { data, error } = await (supabase as any)
      .from("workflow_actions")
      .select(
        "id,user_id,item_type,item_id,title,detail,previous_status,new_status,acted_at,source",
      )
      .order("acted_at", { ascending: false });
    if (error) return null;
    return (data || []).map(normalizeWorkflowAction);
  } catch {
    return null;
  }
}

async function writeWorkflowActionToSupabase(
  data: Omit<WorkflowActionLog, "source">,
): Promise<WorkflowActionLog | null> {
  const userId = await getSupabaseUserId();
  if (!userId) return null;
  try {
    const row = {
      id: data.id,
      user_id: userId,
      item_type: data.item_type,
      item_id: String(data.item_id),
      title: data.title,
      detail: data.detail,
      previous_status: data.previous_status,
      new_status: data.new_status,
      acted_at: data.acted_at,
      source: "server",
    };
    const { data: inserted, error } = await (supabase as any)
      .from("workflow_actions")
      .upsert(row)
      .select(
        "id,user_id,item_type,item_id,title,detail,previous_status,new_status,acted_at,source",
      )
      .single();
    if (error) return null;
    return normalizeWorkflowAction(inserted);
  } catch {
    return null;
  }
}

async function deleteWorkflowActionFromSupabase(actionId: string): Promise<boolean> {
  const userId = await getSupabaseUserId();
  if (!userId) return false;
  try {
    const { error } = await (supabase as any).from("workflow_actions").delete().eq("id", actionId);
    return !error;
  } catch {
    return false;
  }
}

function mapSupabaseError(error: unknown, fallback: string) {
  if (!error) return new Error(fallback);
  if (typeof error === "object" && "message" in error) {
    return new Error(String((error as { message: unknown }).message));
  }
  return new Error(fallback);
}

async function getAuthUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw mapSupabaseError(error, "User is not signed in.");
  }
  return data.user;
}

function db() {
  return supabase as any;
}

// Optional custom backend interceptor for features not yet mapped directly to Supabase.
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      "Backend API is not configured. Set VITE_API_BASE_URL or disable this feature in the UI.",
    );
  }

  const token = getToken();
  const isForm =
    options.body instanceof URLSearchParams ||
    (options.headers as any)?.["Content-Type"] === "application/x-www-form-urlencoded";
  const headers: Record<string, string> = {
    "Content-Type": isForm ? "application/x-www-form-urlencoded" : "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const message = await res.text().catch(() => "");
      throw new Error(
        `API request failed (${res.status}) for ${path}${message ? `: ${message}` : ""}`,
      );
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  } catch (err) {
    throw err instanceof Error ? err : new Error(`API request failed for ${path}`);
  }
}

// ---------------------------------------------------------
// 🛠️ WRAPPER CLIENT EXPORTS
// ---------------------------------------------------------
export async function login(email: string, password?: string): Promise<{ access_token: string }> {
  return api<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username: email,
      password: password || "DealCompass*Auth#2026!xKey",
    }),
  });
}

export async function register(data: any): Promise<User> {
  return api<User>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<User> {
  const authUser = await getAuthUser();
  const { data, error } = await db()
    .from("users")
    .select("*")
    .or(`id.eq.${authUser.id},email.eq.${authUser.email}`)
    .maybeSingle();
  if (error) throw mapSupabaseError(error, "Could not load user profile.");
  if (!data) throw new Error("User profile is not configured in Supabase users table.");
  return data as User;
}

export async function getDashboard(): Promise<DashboardStats> {
  const [products, demands, preDeals, orders] = await Promise.all([
    getProducts(),
    getDemands(),
    getPreDeals().catch(() => []),
    getOrders().catch(() => []),
  ]);
  return {
    total_products: products.length,
    total_demands: demands.length,
    active_pre_deals: preDeals.length,
    accepted_deals: preDeals.filter((deal) => deal.status === "accepted").length,
    active_orders: orders.length,
  };
}

export async function getWorkflowActionLogs(): Promise<WorkflowActionLog[]> {
  const persisted = await readWorkflowActionsFromSupabase();
  if (persisted) return persisted;
  return api<WorkflowActionLog[]>("/api/workflow/actions");
}

export async function recordWorkflowAction(
  data: Omit<WorkflowActionLog, "source">,
): Promise<WorkflowActionLog> {
  const persisted = await writeWorkflowActionToSupabase(data);
  if (persisted) return persisted;
  return api<WorkflowActionLog>("/api/workflow/actions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteWorkflowAction(
  actionId: string,
): Promise<{ status: string; id: string }> {
  const deleted = await deleteWorkflowActionFromSupabase(actionId);
  if (deleted) return { status: "deleted", id: actionId };
  return api<{ status: string; id: string }>(
    `/api/workflow/actions/${encodeURIComponent(actionId)}`,
    {
      method: "DELETE",
    },
  );
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await db()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw mapSupabaseError(error, "Could not load products from Supabase.");
  return (data || []) as Product[];
}

export async function createProduct(
  data: Omit<Product, "id" | "user_id" | "created_at" | "updated_at" | "is_available">,
): Promise<Product> {
  const authUser = await getAuthUser();
  const { data: inserted, error } = await db()
    .from("products")
    .insert({ ...data, user_id: authUser.id })
    .select("*")
    .single();
  if (error) throw mapSupabaseError(error, "Could not create product in Supabase.");
  return inserted as Product;
}

export async function getDemands(): Promise<Demand[]> {
  const { data, error } = await db()
    .from("demands")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw mapSupabaseError(error, "Could not load buying requests from Supabase.");
  return (data || []) as Demand[];
}

export async function createDemand(
  data: Omit<Demand, "id" | "user_id" | "created_at" | "is_active">,
): Promise<Demand> {
  const authUser = await getAuthUser();
  const { data: inserted, error } = await db()
    .from("demands")
    .insert({ ...data, user_id: authUser.id })
    .select("*")
    .single();
  if (error) throw mapSupabaseError(error, "Could not create buying request in Supabase.");
  return inserted as Demand;
}

export async function getPreDeals(): Promise<PreDeal[]> {
  const { data, error } = await db()
    .from("pre_deals")
    .select(
      "*, product:products(*), seller:users!pre_deals_seller_id_fkey(*), buyer:users!pre_deals_buyer_id_fkey(*)",
    )
    .order("created_at", { ascending: false });
  if (error) {
    const simple = await db()
      .from("pre_deals")
      .select("*")
      .order("created_at", { ascending: false });
    if (simple.error) throw mapSupabaseError(simple.error, "Could not load matches from Supabase.");
    return (simple.data || []) as PreDeal[];
  }
  return (data || []) as PreDeal[];
}

export async function actOnPreDeal(
  dealId: number,
  action: "accept" | "reject",
): Promise<{ status: string; pre_deal_id: number }> {
  const nextStatus = action === "accept" ? "accepted" : "rejected";
  const { error } = await db().from("pre_deals").update({ status: nextStatus }).eq("id", dealId);
  if (error) throw mapSupabaseError(error, "Could not update match status in Supabase.");
  return { status: nextStatus, pre_deal_id: dealId };
}

export async function generatePreDeals(): Promise<{
  created_pre_deal_ids: number[];
  count: number;
}> {
  return api<{ created_pre_deal_ids: number[]; count: number }>("/api/deals/generate-pre-deals", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function joinWaitlist(
  email: string,
): Promise<{ id: number; email: string; source: string; created_at: string }> {
  const { data, error } = await db()
    .from("waitlist")
    .upsert({ email, source: "landing_page" }, { onConflict: "email" })
    .select("*")
    .single();
  if (error) throw mapSupabaseError(error, "Could not join waitlist in Supabase.");
  return data as { id: number; email: string; source: string; created_at: string };
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await db()
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), payments(*)")
    .order("created_at", { ascending: false });
  if (error) throw mapSupabaseError(error, "Could not load orders from Supabase.");
  return (data || []) as Order[];
}

export async function getOrder(orderId: number): Promise<Order> {
  const { data, error } = await db()
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), payments(*)")
    .eq("id", orderId)
    .single();
  if (error) throw mapSupabaseError(error, "Could not load order from Supabase.");
  return data as Order;
}

export async function createOrderFromPreDeal(preDealId: number): Promise<Order> {
  const { data: deal, error: dealError } = await db()
    .from("pre_deals")
    .select("*, product:products(*)")
    .eq("id", preDealId)
    .single();
  if (dealError || !deal)
    throw mapSupabaseError(dealError, "Could not load match for order creation.");

  const totalValue = Number(deal.suggested_price || 0) * Number(deal.quantity || 0);
  const orderPayload = {
    order_number: `DC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
    pre_deal_id: deal.id,
    buyer_id: deal.buyer_id,
    seller_id: deal.seller_id,
    status: "confirmed",
    payment_status: "pending",
    payment_method: deal.payment_terms || "Protected Payment",
    total_value: totalValue,
    platform_fee: totalValue * 0.003,
    currency: "USD",
    incoterm: "FOB",
    origin_country: deal.product?.origin || "Unknown",
    destination_country: "Unknown",
  };
  const { data: order, error } = await db()
    .from("orders")
    .insert(orderPayload)
    .select("*")
    .single();
  if (error) throw mapSupabaseError(error, "Could not create order in Supabase.");

  if (deal.product_id) {
    await db()
      .from("order_items")
      .insert({
        order_id: order.id,
        product_id: deal.product_id,
        quantity: deal.quantity,
        unit: deal.product?.unit || "unit",
        unit_price: deal.suggested_price,
        total_price: totalValue,
        currency: "USD",
        fulfillment_status: "pending",
      });
  }

  return getOrder(order.id);
}

export async function createPayment(
  orderId: number,
  method: string,
  amount: string,
  currency: string,
): Promise<Payment> {
  const order = await getOrder(orderId);
  const { data, error } = await db()
    .from("payments")
    .insert({
      order_id: orderId,
      payer_id: order.buyer_id,
      payee_id: order.seller_id,
      method,
      amount,
      currency,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw mapSupabaseError(error, "Could not create payment in Supabase.");
  return data as Payment;
}

export async function actOnPayment(
  orderId: number,
  paymentId: number,
  action: "pay" | "release" | "refund",
): Promise<{ status: string; payment_id: number }> {
  const status = action === "pay" ? "held" : action === "release" ? "released" : "refunded";
  const { error } = await db()
    .from("payments")
    .update({ status })
    .eq("id", paymentId)
    .eq("order_id", orderId);
  if (error) throw mapSupabaseError(error, "Could not update payment status in Supabase.");
  return { status, payment_id: paymentId };
}

export async function submitKYC(
  documentType: string,
  documentUrl: string,
  documentHash: string,
): Promise<KYCRecord> {
  return api<KYCRecord>("/api/kyc/submit", {
    method: "POST",
    body: JSON.stringify({
      document_type: documentType,
      document_url: documentUrl,
      document_hash: documentHash,
    }),
  });
}

export async function getKYCStatus(): Promise<KYCRecord> {
  return api<KYCRecord>("/api/kyc/status");
}

export async function screenSanctions(
  entityName: string,
  entityType: string = "user",
): Promise<SanctionsScreening> {
  return api<SanctionsScreening>("/api/compliance/sanctions/screen", {
    method: "POST",
    body: JSON.stringify({ entity_name: entityName, entity_type: entityType }),
  });
}

export async function listPendingKYC(): Promise<KYCRecord[]> {
  return api<KYCRecord[]>("/api/kyc/pending");
}

export async function reviewKYC(
  kycId: number,
  status: "approved" | "rejected",
  rejectionReason?: string,
): Promise<KYCRecord> {
  return api<KYCRecord>(`/api/kyc/${kycId}/review`, {
    method: "POST",
    body: JSON.stringify({ status, rejection_reason: rejectionReason }),
  });
}

export async function getMyScreenings(): Promise<SanctionsScreening[]> {
  return api<SanctionsScreening[]>("/api/compliance/sanctions/my-screenings");
}

// Notifications API
export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await db()
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw mapSupabaseError(error, "Could not load notifications from Supabase.");
  return (data || []) as Notification[];
}

export async function markNotificationRead(id: number): Promise<Notification> {
  const { data, error } = await db()
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw mapSupabaseError(error, "Could not mark notification as read.");
  return data as Notification;
}

export async function markAllNotificationsRead(): Promise<{ status: string }> {
  const authUser = await getAuthUser();
  const { error } = await db()
    .from("notifications")
    .update({ read: true })
    .eq("user_id", authUser.id);
  if (error) throw mapSupabaseError(error, "Could not mark notifications as read.");
  return { status: "ok" };
}

export async function triggerMockNotification(
  title: string,
  message: string,
  type: string = "push",
  priority: string = "high",
): Promise<Notification> {
  return api<Notification>(
    `/api/notifications/trigger-mock?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}&type=${type}&priority=${priority}`,
    { method: "POST" },
  );
}

// Subscriptions API
export async function getMySubscription(): Promise<Subscription | null> {
  const authUser = await getAuthUser();
  const { data, error } = await db()
    .from("subscriptions")
    .select("*")
    .eq("user_id", authUser.id)
    .maybeSingle();
  if (error) throw mapSupabaseError(error, "Could not load subscription from Supabase.");
  return data as Subscription | null;
}

export async function createCheckoutSession(tier: string): Promise<Subscription> {
  throw new Error(
    `Billing checkout is not connected. Configure Stripe/Supabase billing before upgrading to ${tier}.`,
  );
}

export async function cancelSubscription(): Promise<{ status: string }> {
  throw new Error(
    "Billing cancellation is not connected. Configure Stripe/Supabase billing first.",
  );
}

// Trade Finance API
export async function createLC(data: {
  order_id: number;
  issuing_bank: string;
  advising_bank: string;
  amount: string;
  currency: string;
  expiry_days: number;
}): Promise<LetterOfCredit> {
  const order = await getOrder(data.order_id);
  const { data: inserted, error } = await db()
    .from("letters_of_credit")
    .insert({
      lc_number: `LC-${Date.now()}`,
      order_id: data.order_id,
      applicant_id: order.buyer_id,
      beneficiary_id: order.seller_id,
      issuing_bank: data.issuing_bank,
      advising_bank: data.advising_bank,
      amount: data.amount,
      currency: data.currency,
      expiry_date: new Date(Date.now() + data.expiry_days * 86400000).toISOString(),
      status: "draft",
    })
    .select("*")
    .single();
  if (error) throw mapSupabaseError(error, "Could not create L/C in Supabase.");
  return inserted as LetterOfCredit;
}

export async function getLCs(): Promise<LetterOfCredit[]> {
  const { data, error } = await db()
    .from("letters_of_credit")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw mapSupabaseError(error, "Could not load letters of credit from Supabase.");
  return (data || []) as LetterOfCredit[];
}

export async function actOnLC(
  lcId: number,
  action: string,
  notes?: string,
): Promise<LetterOfCredit> {
  const { data, error } = await db()
    .from("letters_of_credit")
    .update({ status: action, discrepancy_notes: notes })
    .eq("id", lcId)
    .select("*")
    .single();
  if (error) throw mapSupabaseError(error, "Could not update L/C in Supabase.");
  return data as LetterOfCredit;
}

export async function createDP(data: {
  order_id: number;
  remitting_bank: string;
  collecting_bank: string;
  amount: string;
  currency: string;
}): Promise<DocumentaryCollection> {
  const order = await getOrder(data.order_id);
  const { data: inserted, error } = await db()
    .from("documentary_collections")
    .insert({
      dp_number: `DP-${Date.now()}`,
      order_id: data.order_id,
      exporter_id: order.seller_id,
      importer_id: order.buyer_id,
      remitting_bank: data.remitting_bank,
      collecting_bank: data.collecting_bank,
      amount: data.amount,
      currency: data.currency,
      status: "draft",
    })
    .select("*")
    .single();
  if (error) throw mapSupabaseError(error, "Could not create D/P in Supabase.");
  return inserted as DocumentaryCollection;
}

export async function getDPs(): Promise<DocumentaryCollection[]> {
  const { data, error } = await db()
    .from("documentary_collections")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw mapSupabaseError(error, "Could not load documentary collections from Supabase.");
  return (data || []) as DocumentaryCollection[];
}

export async function actOnDP(dpId: number, action: string): Promise<DocumentaryCollection> {
  const { data, error } = await db()
    .from("documentary_collections")
    .update({ status: action })
    .eq("id", dpId)
    .select("*")
    .single();
  if (error) throw mapSupabaseError(error, "Could not update D/P in Supabase.");
  return data as DocumentaryCollection;
}

// Logistics API
export async function createShipment(data: {
  order_id: number;
  carrier: string;
  origin_corridor: string;
  destination_corridor: string;
}): Promise<Shipment> {
  const { data: inserted, error } = await db()
    .from("shipments")
    .insert({
      ...data,
      tracking_number: `DC-TRK-${Date.now().toString().slice(-8)}`,
      status: "label_created",
    })
    .select("*, events:shipment_events(*)")
    .single();
  if (error) throw mapSupabaseError(error, "Could not create shipment in Supabase.");
  return inserted as Shipment;
}

export async function getShipments(): Promise<Shipment[]> {
  const { data, error } = await db()
    .from("shipments")
    .select("*, events:shipment_events(*)")
    .order("created_at", { ascending: false });
  if (error) throw mapSupabaseError(error, "Could not load shipments from Supabase.");
  return (data || []) as Shipment[];
}

export async function addTrackingEvent(
  shipmentId: number,
  location: string,
  description: string,
  nextStatus: string,
): Promise<Shipment> {
  const { error: eventError } = await db().from("shipment_events").insert({
    shipment_id: shipmentId,
    location,
    description,
  });
  if (eventError) throw mapSupabaseError(eventError, "Could not add tracking event in Supabase.");
  const { data, error } = await db()
    .from("shipments")
    .update({ status: nextStatus })
    .eq("id", shipmentId)
    .select("*, events:shipment_events(*)")
    .single();
  if (error) throw mapSupabaseError(error, "Could not update shipment status in Supabase.");
  return data as Shipment;
}

// ML Analytics API
export async function getFeatureWeights(): Promise<{
  model_version: string;
  accuracy_r2: string;
  weights: any[];
}> {
  return api<{ model_version: string; accuracy_r2: string; weights: any[] }>(
    "/api/ml-analytics/feature-weights",
  );
}

export async function getPricePredictions(): Promise<PricePrediction[]> {
  return api<PricePrediction[]>("/api/ml-analytics/price-predictions");
}

export async function getDemandImbalances(): Promise<DemandAnalytics[]> {
  return api<DemandAnalytics[]>("/api/ml-analytics/demand-imbalance");
}

export async function simulateMLMatching(
  crudeOil: number,
  freightRisk: number,
  urgency: number,
): Promise<any> {
  return api<any>(
    `/api/ml-analytics/simulate?crude_oil_price=${crudeOil}&freight_risk_index=${freightRisk}&urgency_multiplier=${urgency}`,
    { method: "POST" },
  );
}
