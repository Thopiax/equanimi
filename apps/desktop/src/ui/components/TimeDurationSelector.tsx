import { observer } from "@legendapp/state/react";

interface TimeDurationSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}

export const TimeDurationSelector = observer(function TimeDurationSelector({
  value,
  onChange,
  disabled = false,
}: TimeDurationSelectorProps) {
  const durations = [
    { value: 5, label: "5 minutes" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 240, label: "4 hours" },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <label htmlFor="duration-select" className="text-xs text-enso-green/70 uppercase tracking-wider">
        Focus Duration
      </label>
      <select
        id="duration-select"
        className="w-60 px-4 py-2 bg-transparent border border-enso-cream/20 rounded-lg text-enso-cream text-center cursor-pointer appearance-none hover:border-enso-green/40 focus:outline-none focus:border-enso-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      >
        {durations.map((duration) => (
          <option key={duration.value} value={duration.value} className="bg-gray-900">
            {duration.label}
          </option>
        ))}
      </select>
    </div>
  );
});
