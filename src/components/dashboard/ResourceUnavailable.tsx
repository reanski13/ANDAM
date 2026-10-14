interface ResourceUnavailableProps {
  message: string;
  icon?: string;
  onRetry?: () => void;
}

export default function ResourceUnavailable({
  message,
  icon = "cloud_off",
  onRetry,
}: ResourceUnavailableProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center"
    >
      <span className="material-symbols-outlined text-[26px] text-on-sky-faint" aria-hidden="true">
        {icon}
      </span>
      <p className="font-body-md text-body-md text-on-sky-dim max-w-xs">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="glass-btn mt-1">
          Retry
        </button>
      )}
    </div>
  );
}
