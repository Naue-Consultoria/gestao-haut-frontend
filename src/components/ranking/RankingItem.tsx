import { fmt } from '../../utils/formatters';
import { getInitials } from '../../utils/helpers';

interface RankingItemProps {
  position: number;
  name: string;
  team: string;
  stats: { label: string; value: string }[];
}

export function RankingItem({ position, name, team, stats }: RankingItemProps) {
  const posColor = position === 1 ? 'text-black' : position === 2 ? 'text-gray-600' : position === 3 ? 'text-gray-500' : 'text-gray-300';
  const avatarClass = position === 1 ? 'bg-black text-white' : 'bg-gray-100 text-gray-600';

  return (
    <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className={`font-mono text-2xl font-bold w-12 text-center ${posColor}`}>
        {position}
      </div>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-base ${avatarClass}`}>
        {getInitials(name)}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-[15px]">{name}</div>
        <div className="text-xs text-gray-500">{team}</div>
      </div>
      <div className="flex gap-8 items-center">
        {stats.map((s, i) => (
          <div key={i} className="text-right">
            <div className="font-semibold text-base">{s.value}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
