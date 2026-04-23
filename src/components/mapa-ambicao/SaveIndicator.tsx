export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  state: SaveState;
}

export function SaveIndicator({ state }: SaveIndicatorProps) {
  if (state === 'idle') return null;

  const config = {
    saving: { dot: 'bg-warning', label: 'Salvando...', textClass: 'text-gray-500' },
    saved: { dot: 'bg-positive', label: 'Salvo', textClass: 'text-gray-500' },
    error: { dot: 'bg-negative', label: 'Erro ao salvar', textClass: 'text-gray-500 text-negative' },
  }[state];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className={`text-xs ${config.textClass}`}>{config.label}</span>
    </div>
  );
}
