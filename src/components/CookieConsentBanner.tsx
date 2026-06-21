import React, { useState, useEffect } from "react";
import { CheckCircle2, Settings, Shield } from "lucide-react";

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consentState, setConsentState] = useState({
    necessary: true, // Always locked for CSRF and authentic sessions
    analytics: true,
    functional: true,
  });

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("tureep_gdpr_consent") : null;
    if (!saved) {
      saveConsent({ necessary: true, analytics: true, functional: true });
    }
  }, []);

  const saveConsent = (preferences: any) => {
    setConsentState(preferences);
    if (typeof window !== "undefined") {
      localStorage.setItem("tureep_gdpr_consent", JSON.stringify(preferences));
    }
    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, functional: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ necessary: true, analytics: false, functional: false });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[560px] select-none animate-slide-in font-sans sm:bottom-5 sm:right-5">
      <div className="rounded-xl border border-surface-700 bg-surface-900 p-4 text-surface-50 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-primary-500/30 bg-primary-500/15 text-primary-400">
              <Shield className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold tracking-tight text-white">Privacy preferences</h3>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-surface-400">
                We use essential storage for sessions and optional analytics to improve trade workflow signals.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-surface-700 bg-surface-800 px-3 text-xs font-semibold text-surface-300 transition-colors hover:bg-surface-700 hover:text-white"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>{showDetails ? "Hide" : "Customize"}</span>
            </button>
            <button
              onClick={handleRejectNonEssential}
              className="h-9 rounded-md border border-surface-700 bg-surface-800 px-3 text-xs font-semibold text-surface-300 transition-colors hover:bg-surface-700 hover:text-white"
            >
              Essential
            </button>
            <button
              onClick={handleAcceptAll}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary-600 px-3 text-xs font-bold text-white shadow-lg shadow-primary-600/20 transition-colors hover:bg-primary-500"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept
            </button>
          </div>
        </div>

        {/* Detailed structural options */}
        {showDetails && (
          <div className="mt-4 space-y-3 rounded-lg border border-surface-800 bg-surface-950/60 p-3 text-xs animate-slide-in">
            <div className="flex items-center justify-between gap-3 rounded-md border border-surface-800 bg-surface-900 p-3">
              <div>
                <span className="block font-bold text-success-400">Essential storage</span>
                <span className="block text-[10px] text-surface-400">Required for secure sessions and preferences.</span>
              </div>
              <span className="rounded bg-surface-800 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-surface-400">Always on</span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border border-surface-800 bg-surface-900 p-3">
              <div>
                <span className="block font-bold text-white">Trade analytics</span>
                <span className="block text-[10px] text-surface-400">Anonymized workflow and corridor performance metrics.</span>
              </div>
              <input
                type="checkbox"
                checked={consentState.analytics}
                onChange={(e) => setConsentState({ ...consentState, analytics: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded accent-primary-600"
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border border-surface-800 bg-surface-900 p-3">
              <div>
                <span className="block font-bold text-white">Functional preferences</span>
                <span className="block text-[10px] text-surface-400">Remembers language, layout, and terminal settings.</span>
              </div>
              <input
                type="checkbox"
                checked={consentState.functional}
                onChange={(e) => setConsentState({ ...consentState, functional: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded accent-primary-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
