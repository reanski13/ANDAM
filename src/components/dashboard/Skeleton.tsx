interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`block rounded-lg bg-glass animate-pulse ${className ?? ""}`}
    />
  );
}
