import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS_SHORT, CURRENT_YEAR } from '../../config/constants';

interface MonthTabsProps {
  activeMonth: number;
  onSelect: (month: number) => void;
  activeYear?: number;
  onYearChange?: (year: number) => void;
  showYearlyTab?: boolean;
}

export function MonthTabs({ activeMonth, onSelect, activeYear = CURRENT_YEAR, onYearChange, showYearlyTab }: MonthTabsProps) {
  return (
    <div className="mb-6">
      {onYearChange && (
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => onYearChange(activeYear - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-gray-200 bg-white text-gray-500 hover:text-black hover:border-gray-400 cursor-pointer transition-all duration-300"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-sm font-semibold tracking-wider text-gray-700 min-w-[48px] text-center">
            {activeYear}
          </span>
          <button
            onClick={() => onYearChange(activeYear + 1)}
            disabled={activeYear >= CURRENT_YEAR}
            className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-gray-200 bg-white text-gray-500 hover:text-black hover:border-gray-400 cursor-pointer transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:border-gray-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-sm overflow-x-auto flex-nowrap">
        {MONTHS_SHORT.map((m, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`px-4 py-2.5 rounded-[6px] text-xs font-medium cursor-pointer transition-all duration-300 whitespace-nowrap font-main ${
              i === activeMonth
                ? 'bg-white text-black shadow border-b-2 border-accent'
                : 'bg-transparent text-gray-500 hover:text-black border-b-2 border-transparent'
            }`}
          >
            {m}
          </button>
        ))}
        {showYearlyTab && (
          <button
            onClick={() => onSelect(-1)}
            className={`px-4 py-2.5 rounded-[6px] text-xs font-semibold cursor-pointer transition-all duration-300 whitespace-nowrap font-main ${
              activeMonth === -1
                ? 'bg-white text-black shadow border-b-2 border-accent'
                : 'bg-transparent text-gray-500 hover:text-black border-b-2 border-transparent'
            }`}
          >
            Ano
          </button>
        )}
      </div>
    </div>
  );
}
