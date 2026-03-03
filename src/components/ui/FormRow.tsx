interface FormRowProps {
  children: React.ReactNode;
}

export function FormRow({ children }: FormRowProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {children}
    </div>
  );
}
