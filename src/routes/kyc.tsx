import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, FileCheck2 } from "lucide-react";

export const Route = createFileRoute("/kyc")({
  component: KYCPage,
});

function KYCPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeRoute="kyc" />
      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Business Verification</h1>
          </div>
          <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-700">
            Verification provider required
          </Badge>
        </header>

        <div className="mx-auto max-w-3xl p-6 lg:p-8">
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-amber-700 ring-1 ring-amber-200">
              <FileCheck2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-amber-950">
              Business verification is not connected yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-amber-800">
              The previous document submission flow was demo-only. It has been disabled until a real
              KYC/KYB provider or secure document review backend is connected.
            </p>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-4 text-left text-sm text-amber-900">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <p>
                  Do not use this app to approve companies, release contacts, or make compliance
                  claims until verification is implemented server-side.
                </p>
              </div>
            </div>
            <Button
              className="mt-6 bg-blue-700 hover:bg-blue-600"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
