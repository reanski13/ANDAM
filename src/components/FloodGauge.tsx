"use client";

interface FloodGaugeProps {
  score: number;
  level: string;
}

export default function FloodGauge({ score, level }: FloodGaugeProps) {
  const getColor = (s: number) => {
    if (s >= 60) return "bg-red-500";
    if (s >= 40) return "bg-orange-500";
    if (s >= 20) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTextColor = (s: number) => {
    if (s >= 60) return "text-red-600 dark:text-red-400";
    if (s >= 40) return "text-orange-600 dark:text-orange-400";
    if (s >= 20) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Flood Risk Gauge
      </h3>

      <div className="relative h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-3">
        <div
          className={`absolute inset-y-0 left-0 ${getColor(score)} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
        <span>Safe</span>
        <span>Watch</span>
        <span>Warning</span>
        <span>Danger</span>
      </div>

      <div className="text-center mt-4">
        <div className={`text-3xl font-bold ${getTextColor(score)}`}>
          {score}
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          {level}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
        <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
          <div className="font-semibold text-green-700 dark:text-green-400">0-19</div>
          <div className="text-zinc-500">Safe</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <div className="font-semibold text-yellow-700 dark:text-yellow-400">20-39</div>
          <div className="text-zinc-500">Watch</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
          <div className="font-semibold text-orange-700 dark:text-orange-400">40-59</div>
          <div className="text-zinc-500">Warning</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
          <div className="font-semibold text-red-700 dark:text-red-400">60+</div>
          <div className="text-zinc-500">Danger</div>
        </div>
      </div>
    </div>
  );
}
