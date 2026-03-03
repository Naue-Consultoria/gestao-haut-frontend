interface TagProps {
  variant?: 'dark' | 'light' | 'success' | 'warning';
  children: React.ReactNode;
}

export function Tag({ variant = 'light', children }: TagProps) {
  const variants = {
    dark: 'bg-gray-900 text-white',
    light: 'bg-gray-100 text-gray-600',
    success: 'bg-[#dcfce7] text-[#166534]',
    warning: 'bg-[#fef3c7] text-[#92400e]',
  };

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
