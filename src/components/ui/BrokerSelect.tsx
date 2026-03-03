import { User } from '../../types';

interface BrokerSelectProps {
  brokers: User[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function BrokerSelect({ brokers, selectedId, onChange }: BrokerSelectProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <select
        value={selectedId}
        onChange={e => onChange(e.target.value)}
        className="px-4 py-2.5 bg-white border border-gray-200 rounded-sm font-main text-sm outline-none cursor-pointer min-w-[200px]"
      >
        {brokers.map(b => (
          <option key={b.id} value={b.id}>{b.name} — {b.team}</option>
        ))}
      </select>
    </div>
  );
}
