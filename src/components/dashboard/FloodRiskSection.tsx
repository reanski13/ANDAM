"use client";

import FloodRiskCard from "@/components/FloodRiskCard";
import type { ReactNode } from "react";
import ResourceUnavailable from "@/components/dashboard/ResourceUnavailable";
import { Skeleton } from "@/components/dashboard/Skeleton";
import type { ResourceState, RiskResource } from "@/lib/dashboard/types";

interface FloodRiskSectionProps {
  resource: ResourceState<RiskResource>;
  onRetry: () => void;
  contextSlot?: ReactNode;
}

function FloodRiskSkeleton({ contextSlot }: Pick<FloodRiskSectionProps, "contextSlot">) {
  return (
    <div className="glass-card h-full p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-4" aria-hidden="true">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-end gap-3 pt-1">
          <Skeleton className="h-12 w-28" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-6 w-32 rounded-full ml-1" />
        </div>
        <Skeleton className="h-3.5 w-full rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
      <div className="pt-3 border-t border-glass-border flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      {contextSlot}
    </div>
  );
}

export default function FloodRiskSection({ resource, onRetry, contextSlot }: FloodRiskSectionProps) {
  if (resource.status === "loading") {
    return <FloodRiskSkeleton contextSlot={contextSlot} />;
  }

  if (resource.status === "unavailable") {
    return (
      <div className="glass-card h-full p-6 flex flex-col gap-4">
        <ResourceUnavailable icon="sensors_off" message={resource.message} onRetry={onRetry} />
        {contextSlot}
      </div>
    );
  }

  const { level, riskScore, reasons } = resource.data;

  return (
    <FloodRiskCard
      level={level}
      riskScore={riskScore}
      reasons={reasons}
      lastUpdated={resource.fetchedAt}
      contextSlot={contextSlot}
    />
  );
}
