interface DataSectionProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function DataSection({ title, badge, children, action }: DataSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-[12px] mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="text-[15px] font-semibold tracking-tight">{title}</div>
        <div className="flex items-center gap-3">
          {badge && (
            <span className="font-mono text-[11px] px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">{badge}</span>
          )}
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}
