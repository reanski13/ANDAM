"use client";

import { AlertTriangle } from "lucide-react";

interface PagasaInfoProps {
  synopsis: string;
  issuedAt: string | null;
  fetchedAt: string;
  forecast: Array<{
    place: string;
    condition: string;
    causedBy: string;
    impacts: string;
  }>;
}

function formatIssued(issuedAt: string): string {
  return issuedAt.replace(/\s+/g, " ").trim();
}

function formatFetched(fetchedAt: string): string {
  const date = new Date(fetchedAt);
  if (isNaN(date.getTime())) return fetchedAt;
  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PagasaInfo({
  synopsis,
  issuedAt,
  fetchedAt,
  forecast,
}: PagasaInfoProps) {
  const hasFloodWarning = forecast.some((item) =>
    /flash flood|landslide/i.test(item.impacts || "")
  );

  return (
    <div className="glass-card p-6 flex flex-col justify-between gap-4 animate-fade-in delay-400">
      <div>
        {hasFloodWarning && (
          <div className="flex items-start gap-2.5 rounded-xl bg-warning-fill/70 px-4 py-3 mb-4">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-warning" aria-hidden="true" />
            <p className="font-body-md text-body-md text-warning leading-snug" style={{ fontWeight: 700 }}>
              Possible flash floods or landslides due to moderate to at times heavy rains
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-accent-fill text-accent-strong flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">cloud_sync</span>
          </div>
          <div>
            <h3 className="font-title-lg text-title-lg text-on-sky font-semibold">PAGASA Regional Weather Advisory</h3>
            <span className="font-label-sm text-label-sm text-accent-strong font-medium">Visayas PRSD &bull; Cebu Station Sync</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-label-sm text-label-sm text-on-sky-faint mb-2">
          {issuedAt && (
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">calendar_today</span>
              <span className="font-semibold text-on-sky-dim">Issued: {formatIssued(issuedAt)}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]" aria-hidden="true">schedule</span>
            Fetched: {formatFetched(fetchedAt)}
          </span>
        </div>

        {synopsis && (
          <div className="bg-glass rounded-2xl p-4 mt-2">
            <div className="flex items-center gap-1.5 font-label-md text-label-md font-bold uppercase tracking-wider mb-1 text-warning">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">info</span> Weather Update
            </div>
            <p className="font-body-md text-body-md leading-relaxed text-on-sky">
              {synopsis}
            </p>
          </div>
        )}

        {forecast.length > 0 ? (
          <div className="flex flex-col gap-3 mt-4">
            {forecast.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-glass flex flex-col gap-1">
                <span className="font-title-sm text-title-sm text-on-sky font-semibold">{item.place}</span>
                <p className="font-body-md text-body-md text-on-sky-dim">
                  {item.condition}
                  {item.causedBy && <span className="text-on-sky-faint"> &bull; {item.causedBy}</span>}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-body-md text-body-md text-on-sky-faint italic mt-4">
            No specific advisory for Visayas region right now.
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-glass-border flex items-center justify-between text-label-sm font-label-sm text-on-sky-faint">
        <span>Official Source: DOST-PAGASA</span>
        <span className="text-accent-strong font-semibold">Visayas PRSD</span>
      </div>
    </div>
  );
}