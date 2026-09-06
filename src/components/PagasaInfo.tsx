"use client";

import { AlertTriangle } from "lucide-react";

interface PagasaInfoProps {
  synopsis: string;
  forecast: Array<{
    place: string;
    condition: string;
    causedBy: string;
    impacts: string;
  }>;
}

export default function PagasaInfo({ synopsis, forecast }: PagasaInfoProps) {
  return (
    <div className="glass-card p-6 flex flex-col justify-between gap-4 animate-fade-in delay-400">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent-fill text-accent-strong flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
          </div>
          <div>
            <h3 className="font-title-lg text-title-lg text-on-sky font-semibold">PAGASA Regional Weather Advisory</h3>
            <span className="font-label-sm text-label-sm text-accent-strong font-medium">Visayas PRSD &bull; Cebu Station Sync</span>
          </div>
        </div>

        {synopsis && (
          <div className="bg-glass rounded-2xl p-4 mt-2">
            <div className="flex items-center gap-1.5 font-label-md text-label-md font-bold uppercase tracking-wider mb-1 text-on-sky-dim">
              <span className="material-symbols-outlined text-[16px]">info</span> Synoptic Synopsis
            </div>
            <p className="font-body-md text-body-md leading-relaxed text-on-sky">
              {synopsis}
            </p>
          </div>
        )}

        {forecast.length > 0 ? (
          <div className="flex flex-col gap-3 mt-4">
            {forecast.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-glass flex flex-col gap-0.5">
                <span className="font-title-sm text-title-sm text-on-sky font-semibold">{item.place}</span>
                <p className="font-body-md text-body-md text-on-sky-dim">
                  {item.condition}
                  {item.impacts && (
                    <span className="font-semibold text-warning inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {item.impacts}
                    </span>
                  )}
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