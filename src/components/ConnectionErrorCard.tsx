import { AlertTriangle } from "lucide-react";

interface ConnectionErrorCardProps {
  title?: string;
  message?: string | null;
}

export function ConnectionErrorCard({
  title = "Backend not connected",
  message,
}: ConnectionErrorCardProps) {
  return (
    <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-700 ring-1 ring-amber-200">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-black text-amber-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-amber-800">
        {message ||
          "This page needs a configured backend service to load real data. No mock data is being shown."}
      </p>
    </div>
  );
}
