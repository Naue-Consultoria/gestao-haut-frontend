interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="text-[28px] font-semibold tracking-tight">{title}</div>
        {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
      </div>
      {action}
    </div>
  );
}
