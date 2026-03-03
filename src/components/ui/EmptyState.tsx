import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'Nenhum registro encontrado' }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 text-gray-400">
      <Inbox size={48} className="mx-auto mb-4 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
