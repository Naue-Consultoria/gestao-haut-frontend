import { MONTHS_SHORT } from '../../config/constants';

interface MonthTabsProps {
  activeMonth: number;
  onSelect: (month: number) => void;
}

export function MonthTabs({ activeMonth, onSelect }: MonthTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-sm mb-6 overflow-x-auto flex-nowrap">
      {MONTHS_SHORT.map((m, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`px-4 py-2.5 rounded-[6px] text-xs font-medium cursor-pointer transition-all duration-300 whitespace-nowrap font-main border-none ${
            i === activeMonth
              ? 'bg-white text-black shadow'
              : 'bg-transparent text-gray-500 hover:text-black'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
