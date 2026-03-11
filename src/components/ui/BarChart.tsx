import { MONTHS_SHORT } from '../../config/constants';

interface BarChartData {
  label?: string;
  meta: number;
  realizado: number;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  highlightIndex?: number;
}

export function BarChart({ data, title, highlightIndex }: BarChartProps) {
  const maxVal = Math.max(1, ...data.flatMap(d => [d.meta, d.realizado]));
  const hasHighlight = highlightIndex !== undefined && highlightIndex >= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-[12px] p-6 mb-6">
      {title && <div className="text-[15px] font-semibold tracking-tight">{title}</div>}
      <div className="flex items-end gap-0.5 h-[180px] px-2 mt-4">
        {data.map((d, i) => {
          const mh = Math.max(4, (d.meta / maxVal) * 160);
          const rh = Math.max(4, (d.realizado / maxVal) * 160);
          const isHighlighted = !hasHighlight || i === highlightIndex;
          const opacity = isHighlighted ? 1 : 0.35;
          const scale = hasHighlight && i === highlightIndex ? 'scale-x-110' : '';
          return (
            <div key={i} className={`flex-1 flex flex-col items-center h-full justify-end transition-opacity duration-300 ${scale}`} style={{ opacity }}>
              <div className="flex gap-0.5 items-end h-full">
                <div className="bg-gray-200 rounded-t w-[18px] transition-all duration-1000" style={{ height: `${mh}px` }} />
                <div className="bg-accent rounded-t w-[18px] transition-all duration-1000" style={{ height: `${rh}px` }} />
              </div>
              <div className={`text-[10px] mt-2 text-center ${hasHighlight && i === highlightIndex ? 'text-black font-bold' : 'text-gray-500'}`}>
                {d.label || MONTHS_SHORT[i]}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-6 mt-4 justify-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-gray-200" /> Meta
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-accent" /> Realizado
        </div>
      </div>
    </div>
  );
}
