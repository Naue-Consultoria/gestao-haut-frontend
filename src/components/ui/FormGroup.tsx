interface FormGroupProps {
  label: string;
  children: React.ReactNode;
  dark?: boolean;
}

export function FormGroup({ label, children, dark }: FormGroupProps) {
  return (
    <div className="mb-5">
      <label className={`block text-[11px] font-medium tracking-widest uppercase mb-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </label>
      {children}
    </div>
  );
}
