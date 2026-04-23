import { useRef, useEffect } from 'react';

interface CurrencyInputProps {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function formatCurrency(amount: number): string {
  if (!amount) return '';
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Convert a numeric value (e.g. "1500", "1500.50", "1.500,50") to number
function valueToNumber(val: string): number {
  if (!val || val === '0') return 0;
  let num: number;
  if (val.includes(',')) {
    // pt-BR format: "1.500,50" → strip dots, replace comma with dot
    num = parseFloat(val.replace(/\./g, '').replace(',', '.'));
  } else {
    // JS number format: "1500" or "1500.50"
    num = parseFloat(val);
  }
  return isNaN(num) ? 0 : num;
}

export function CurrencyInput({ value, onChange, placeholder = '0,00', className, disabled }: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const centsRef = useRef<number>(Math.round(valueToNumber(value) * 100));

  const syncFromCents = (cents: number) => {
    centsRef.current = cents;
    if (inputRef.current) {
      inputRef.current.value = formatCurrency(cents / 100);
    }
    onChange(cents === 0 ? '' : (cents / 100).toFixed(2));
  };

  // Sync external value changes (e.g. when loading data from API or computed values)
  useEffect(() => {
    const nextCents = Math.round(valueToNumber(value) * 100);
    centsRef.current = nextCents;
    if (inputRef.current) {
      inputRef.current.value = formatCurrency(nextCents / 100);
    }
  }, [value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    requestAnimationFrame(() => e.currentTarget.select());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const isAllSelected = input.selectionStart === 0 && input.selectionEnd === input.value.length;

    // Allow: tab, escape, enter, arrows, home/end
    const allowed = ['Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowed.includes(e.key)) return;

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey || e.metaKey) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const nextCents = isAllSelected ? 0 : Math.floor(centsRef.current / 10);
      syncFromCents(nextCents);
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      syncFromCents(0);
      return;
    }

    if (e.key === ',' || e.key === '.') {
      // Ignorado — entrada é estilo calculadora (sem modo decimal)
      e.preventDefault();
      return;
    }

    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const baseCents = isAllSelected ? 0 : centsRef.current;
      const nextCents = baseCents * 10 + Number(e.key);
      syncFromCents(nextCents);
      return;
    }

    e.preventDefault();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const parsedCents = Math.round(valueToNumber(pasted) * 100);
    syncFromCents(parsedCents);
  };

  const displayValue = formatCurrency(valueToNumber(value));

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={() => {}}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onPaste={handlePaste}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}
