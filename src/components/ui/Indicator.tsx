interface IndicatorProps {
  value: string;
  dotColor: 'green' | 'red' | 'yellow';
}

export function Indicator({ value, dotColor }: IndicatorProps) {
  const colors = {
    green: 'bg-positive',
    red: 'bg-negative',
    yellow: 'bg-warning',
  };

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs">
      <span className={`w-1.5 h-1.5 rounded-full ${colors[dotColor]}`} />
      {value}
    </span>
  );
}
