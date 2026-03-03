interface ProgressBarProps {
  percentage: number;
  label?: string;
  maxLabel?: string;
}

export function ProgressBar({ percentage, label, maxLabel }: ProgressBarProps) {
  const capped = Math.min(100, percentage);
  const isOver = percentage >= 100;

  return (
    <div className="mt-2">
      <div className="h-1.5 bg-gray-100 rounded-[3px] overflow-hidden">
        <div
          className={`h-full rounded-[3px] transition-all duration-1000 ${isOver ? 'bg-positive' : 'bg-black'}`}
          style={{ width: `${capped}%` }}
        />
      </div>
      {(label || maxLabel) && (
        <div className="flex justify-between mt-1 text-[11px] text-gray-500">
          <span>{label}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
