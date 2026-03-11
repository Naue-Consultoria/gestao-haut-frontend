import { useRef, useEffect } from 'react';

interface CurrencyInputProps {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function formatCurrency(cents: number): string {
  if (cents === 0) return '';
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  const reaisStr = reais.toLocaleString('pt-BR');
  return `${reaisStr},${String(centavos).padStart(2, '0')}`;
}

// Convert a numeric value (e.g. "1500", "1500.50", "1.500,50") to cents
function valueToCents(val: string): number {
  if (!val || val === '0') return 0;
  let num: number;
  if (val.includes(',')) {
    // pt-BR format: "1.500,50" → strip dots, replace comma with dot
    num = parseFloat(val.replace(/\./g, '').replace(',', '.'));
  } else {
    // JS number format: "1500" or "1500.50"
    num = parseFloat(val);
  }
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function CurrencyInput({ value, onChange, placeholder = '0,00', className, disabled }: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const centsRef = useRef(valueToCents(value));

  // Sync external value changes (e.g. when loading data from API or computed values)
  useEffect(() => {
    const newCents = valueToCents(value);
    centsRef.current = newCents;
    if (inputRef.current) {
      inputRef.current.value = formatCurrency(newCents);
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const digits = input.value.replace(/\D/g, '');
    const cents = Number(digits) || 0;
    centsRef.current = cents;

    const formatted = formatCurrency(cents);
    input.value = formatted;

    // Report back as a decimal number string (e.g. "1500.50")
    const numericValue = cents === 0 ? '' : (cents / 100).toString();
    onChange(numericValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrows
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowed.includes(e.key)) return;
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey || e.metaKey) return;
    // Block non-digit keys
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const displayValue = formatCurrency(valueToCents(value));

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      defaultValue={displayValue}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}
