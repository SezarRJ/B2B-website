import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, CheckCircle2, Clock, Building2 } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

export interface ContactRequest {
  id: string;
  matchId?: number;
  title: string;
  counterparty: string;
  message: string;
  status: "sent" | "replied" | "closed";
  createdAt: string;
}

function getContactRequests(): ContactRequest[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("tureep_contact_requests") || "[]");
  } catch {
    return [];
  }
}

function saveContactRequests(items: ContactRequest[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("tureep_contact_requests", JSON.stringify(items));
  }
}

function MessagesPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const [items, setItems] = useState<ContactRequest[]>([]);

  useEffect(() => {
    setItems(getContactRequests());
  }, []);

  function markClosed(id: string) {
    const next = items.map((item) =>
      item.id === id ? { ...item, status: "closed" as const } : item,
    );
    setItems(next);
    saveContactRequests(next);
  }

  return (
    <div
      className={`flex min-h-screen bg-background ${isRtl ? "text-right" : "text-left"}`}
      dir={dir}
    >
      <AppSidebar activeRoute="messages" />
      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-black text-foreground">
                {t("messages.title", "Messages")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("messages.subtitle", "Contact requests and company introductions")}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">
            {items.length} {t("messages.requests", "requests")}
          </span>
        </header>

        <div className="mx-auto max-w-5xl space-y-5 p-6 lg:p-8">
          {items.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <Mail className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-black text-foreground">
                {t("messages.empty.title", "No contact requests yet")}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {t(
                  "messages.empty.copy",
                  "When you request contact from a match, the introduction request will appear here.",
                )}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-[2rem] border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="min-w-0 space-y-2">
                    <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <Building2 className="h-4 w-4 text-primary" />
                      <h3 className="font-black text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.counterparty}</p>
                    <p className="rounded-2xl bg-secondary/50 p-4 text-sm leading-6 text-foreground">
                      {item.message}
                    </p>
                  </div>
                  <div className={isRtl ? "text-left" : "text-right"}>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
                        item.status === "closed"
                          ? "bg-surface-100 text-surface-600"
                          : "bg-success-50 text-success-700"
                      }`}
                    >
                      {item.status === "closed" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {item.status}
                    </span>
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    {item.status !== "closed" && (
                      <button
                        onClick={() => markClosed(item.id)}
                        className="mt-3 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary"
                      >
                        {t("messages.close", "Mark closed")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
