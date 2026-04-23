import { Construction } from 'lucide-react';

export function PlaceholderTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Construction size={20} className="text-gray-400" />
      </div>
      <div className="text-[15px] font-semibold text-gray-700 mb-2">Em construção</div>
      <div className="text-sm text-gray-400 max-w-[280px]">
        Esta aba será implementada na próxima fase.
      </div>
    </div>
  );
}
