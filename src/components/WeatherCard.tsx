"use client";

interface WeatherCardProps {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall1h: number;
  condition: string;
  description: string;
  pressure: number;
}

export default function WeatherCard({
  temperature,
  humidity,
  windSpeed,
  rainfall1h,
  condition,
  description,
  pressure,
}: WeatherCardProps) {
  const stats = [
    {
      label: "Temperature",
      value: `${temperature.toFixed(1)}°C`,
      icon: "🌡️",
    },
    {
      label: "Humidity",
      value: `${humidity}%`,
      icon: "💧",
    },
    {
      label: "Wind Speed",
      value: `${windSpeed.toFixed(1)} km/h`,
      icon: "💨",
    },
    {
      label: "Rainfall (1h)",
      value: `${rainfall1h.toFixed(1)} mm`,
      icon: "🌧️",
    },
    {
      label: "Pressure",
      value: `${pressure.toFixed(0)} hPa`,
      icon: "🔵",
    },
    {
      label: "Condition",
      value: condition,
      icon: "☁️",
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl">
          ☁️
        </div>
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Current Weather
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-3"
          >
            <div className="text-lg">{stat.icon}</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {stat.value}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
