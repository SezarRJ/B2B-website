import React, { useState } from "react";
import { HelpCircle, Search, FileText, X, ChevronRight } from "lucide-react";

export const UniversalInAppHelpDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const helpTopics = [
    {
      title: "1. Common Matching Delays & Local Storage Triage",
      category: "Troubleshooting Desk",
      desc: "If your browser preview returns 'Failed to fetch', click any of the 1-click Quick Login bypass pills on the `/login` screen to instantly re-hydrate offline test sessions.",
      docUrl: "/USER_TROUBLESHOOTING_GUIDE.md",
    },
    {
      title: "2. Absolute Pydantic SHA-256 Hashes & KYC Compliance",
      category: "Compliance Protocols",
      desc: "Upload official trade proofs below `/kyc`. Ensure your cryptographic digest contains exactly 64 hexadecimal characters to satisfy automated OFAC and Dow Jones API matching rules.",
      docUrl: "/ENTERPRISE_COMPLIANCE_AND_LEGAL_MANDATE_2026.md",
    },
    {
      title: "3. Trade Finance SWIFT MT700 L/C Instruments",
      category: "Banking Instruments",
      desc: "We generate real-world standardized SWIFT L/C and URC 522 D/P messaging models. Ensure your commercial document presentations match ICC UCP 600 Clean Presentation rulings.",
      docUrl: "/API_DOCUMENTATION_AND_OPENAPI_SPEC.md",
    },
    {
      title: "4. Autonomous Database Saturation & Pooler Triage",
      category: "DevOps & SRE Alarms",
      desc: "If live queries experience QueuePool saturation (min 5, max 20), verify your `DATABASE_URL` maps directly to Supabase Transaction Pooler strings (`*.pooler.supabase.com:6543`).",
      docUrl: "/RUNBOOK_FOR_COMMON_INCIDENTS.md",
    },
    {
      title: "5. Highly Definitive Operational Specifications",
      category: "Master B2B Specs",
      desc: "Authored definitive executive Gap Analyses, Architecture Decision Records (ADRs), and 7-stage state machine Walkthroughs available in full markdown formatting.",
      docUrl: "/APPLICATION_WORKFLOW_COMPLETE_GUIDE.md",
    },
  ];

  const filteredTopics =
    searchQuery.trim() === ""
      ? helpTopics
      : helpTopics.filter(
          (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.desc.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  return (
    <div className="fixed bottom-5 left-5 z-40 font-sans select-none pointer-events-auto">
      {/* Floating In-App Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          aria-label="Launch institutional interactive Self-Help & Documentation desk"
          onClick={() => setIsOpen(true)}
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-surface-700 bg-surface-900 text-white shadow-2xl transition-colors hover:border-primary-500 hover:bg-surface-800"
        >
          <HelpCircle className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
        </button>
      )}

      {/* Floating Searchable Self-Help Drawer Component */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 flex max-h-[85vh] w-[90vw] flex-col justify-between overflow-hidden rounded-xl border border-surface-700 bg-surface-900 text-surface-50 shadow-2xl animate-slide-in sm:w-[420px]">
          {/* Top Banner */}
          <div className="flex items-center justify-between border-b border-surface-800 bg-surface-950/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-lg">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white">Help desk</h2>
                <p className="font-mono text-[10px] text-surface-400">Documentation & FAQ</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close self-help help desk"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer rounded-md p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Search Bar */}
          <div className="border-b border-surface-800 bg-surface-950/40 p-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQ, incident runbooks, Pydantic constraints..."
                className="w-full rounded-md border border-surface-700 bg-surface-800 py-2.5 pl-10 pr-4 font-mono text-xs text-white transition-all placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Searchable Topics Ledger */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 select-text">
            {filteredTopics.length === 0 ? (
              <div className="py-12 text-center text-surface-400 font-mono text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-surface-600" />
                <p>Zero matching documentation topics found.</p>
                <span className="text-[10px]">
                  Try searching for 'Stripe', 'KYC', or 'PgBouncer'.
                </span>
              </div>
            ) : (
              filteredTopics.map((topic, idx) => (
                <div
                  key={idx}
                  className="group space-y-2 rounded-lg border border-surface-700/80 bg-surface-800/80 p-4 transition-colors hover:border-primary-500/60 select-text"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary-400 font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-primary-950/80 border border-primary-800">
                      {topic.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xs leading-tight font-sans select-text">
                    {topic.title}
                  </h3>
                  <p className="text-surface-300 text-xs leading-relaxed font-sans select-text">
                    {topic.desc}
                  </p>

                  <div className="pt-2 flex items-center justify-end border-t border-surface-700/50">
                    <a
                      href={topic.docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-mono"
                    >
                      <span>Read Full Triage Manual</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Support Footer */}
          <div className="flex items-center justify-between border-t border-surface-800 bg-surface-950 p-4 font-mono text-[11px] text-surface-400">
            <span>
              SRE On-Call Pool: <strong className="text-success-400">100% Operational</strong>
            </span>
            <a
              href="/API_DOCUMENTATION_AND_OPENAPI_SPEC.md"
              target="_blank"
              rel="noreferrer"
              className="text-white underline font-semibold"
            >
              OpenAPI Path Spec
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
