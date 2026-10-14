"use client";

import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/dashboard/Skeleton";
import type { PagasaResource, ResourceState } from "@/lib/dashboard/types";

interface PagasaInfoProps {
  resource: ResourceState<PagasaResource>;
  onRetry: () => void;
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

function PagasaHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-9 h-9 shrink-0 rounded-xl bg-accent-fill text-accent-strong flex items-center justify-center">
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">cloud_sync</span>
      </div>
      <div>
        <h3 className="font-title-lg text-title-lg text-on-sky font-semibold">PAGASA Regional Weather Advisory</h3>
        <span className="font-label-sm text-label-sm text-accent-strong font-medium">Visayas PRSD &bull; Cebu Station Sync</span>
      </div>
    </div>
  );
}

function PagasaSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="flex flex-col gap-3 mt-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function PagasaInfo({ resource, onRetry }: PagasaInfoProps) {
  const data = resource.status === "ready" ? resource.data : null;
  const forecast = data?.forecast ?? [];
  const synopsis = data?.synopsis ?? "";
  const hasFloodWarning =
    resource.status === "ready" &&
    forecast.some((item) => /flash flood|landslide/i.test(item.impacts || ""));

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

        <PagasaHeader />

        {resource.status === "loading" && <PagasaSkeleton />}

        {resource.status === "unavailable" && (
          <div role="status" className="bg-glass rounded-2xl p-4 flex flex-col items-start gap-3 mt-2">
            <div className="flex items-start gap-2.5">
              <span
                className="material-symbols-outlined text-[18px] shrink-0 text-on-sky-faint"
                aria-hidden="true"
              >
                cloud_off
              </span>
              <p className="font-body-md text-body-md text-on-sky-dim leading-snug">
                PAGASA advisory is temporarily unavailable. Try again shortly.
              </p>
            </div>
            <button type="button" onClick={onRetry} className="glass-btn">
              Retry
            </button>
          </div>
        )}

        {resource.status === "ready" && (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-label-sm text-label-sm text-on-sky-faint mb-2">
              {data?.issuedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]" aria-hidden="true">calendar_today</span>
                  <span className="font-semibold text-on-sky-dim">Issued: {formatIssued(data.issuedAt)}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]" aria-hidden="true">schedule</span>
                Fetched: {formatFetched(resource.fetchedAt)}
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
          </>
        )}
      </div>

      <div className="pt-2 border-t border-glass-border flex items-center justify-between text-label-sm font-label-sm text-on-sky-faint">
        <span>Official Source: DOST-PAGASA</span>
        <span className="text-accent-strong font-semibold">Visayas PRSD</span>
      </div>
    </div>
  );
}
