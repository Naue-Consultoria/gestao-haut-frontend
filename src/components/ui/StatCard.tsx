interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  children?: React.ReactNode;
}

export function StatCard({ label, value, change, changeType, children }: StatCardProps) {
  const changeColors = {
    positive: 'text-positive',
    negative: 'text-negative',
    neutral: 'text-gray-500',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-[12px] p-6 transition-all duration-300 hover:border-gray-300 hover:shadow">
      <div className="text-[11px] font-medium tracking-widest uppercase text-gray-500 mb-2">{label}</div>
      <div className="text-[28px] font-semibold tracking-tight leading-tight">{value}</div>
      {change && (
        <div className={`text-xs mt-1.5 font-mono ${changeColors[changeType || 'neutral']}`}>{change}</div>
      )}
      {children}
    </div>
  );
}
