import { useEffect, useState } from "react";
import { ShieldAlert, Lock } from "lucide-react";
import { getMe, type User } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

interface InternalRouteGateProps {
  children: React.ReactNode;
}

function canAccessInternalRoute(user: User | null) {
  if (!user) return false;
  const email = user.email?.toLowerCase() || "";
  return email.includes("admin") || user.account_type === "black";
}

export function InternalRouteGate({ children }: InternalRouteGateProps) {
  const { t, dir } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8" dir={dir}>
        <div className="flex items-center gap-3 rounded-2xl border border-surface-200 bg-white px-5 py-4 text-sm font-semibold text-surface-500 shadow-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          {t("internal.loading", "Checking access...")}
        </div>
      </div>
    );
  }

  if (!canAccessInternalRoute(user)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8" dir={dir}>
        <div className="max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black text-amber-950">
            {t("internal.denied.title", "Internal page restricted")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            {t(
              "internal.denied.desc",
              "This page contains internal architecture, security, or operational documentation. It is available only to admin or Black-tier accounts.",
            )}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
            <Lock className="h-3.5 w-3.5" />
            {t("internal.denied.badge", "Admin / Black tier required")}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
