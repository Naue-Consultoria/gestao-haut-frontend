export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  title?: string;
  size?: number;      // default 180
  thickness?: number; // default 40
}

export function DonutChart({ segments, title, size = 180, thickness = 40 }: DonutChartProps) {
  const positive = segments.filter(s => s.value > 0).sort((a, b) => b.value - a.value);
  const total = positive.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - thickness / 2 - 4;
  const circumference = 2 * Math.PI * r;

  const isEmpty = total <= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow min-h-[320px]">
      {title && (
        <h3 className="text-[15px] font-semibold tracking-tight mb-4 text-gray-900">{title}</h3>
      )}
      <svg
        className="mx-auto block"
        width={200}
        height={200}
        viewBox={`0 0 ${size} ${size}`}
      >
        {isEmpty ? (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#e5e5e5"
              strokeWidth={thickness}
            />
            <text x={cx} y={cy} textAnchor="middle" fontSize="11" fill="#737373">
              <tspan x={cx} dy="-0.4em">Preencha Estilo de Vida</tspan>
              <tspan x={cx} dy="1.2em">para visualizar</tspan>
            </text>
          </>
        ) : (
          (() => {
            let offset = 0;
            return positive.map((seg, idx) => {
              const dashArray = (seg.value / total) * circumference;
              const el = (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dashArray} ${circumference}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${cx} ${cy})`}
                />
              );
              offset += dashArray;
              return el;
            });
          })()
        )}
      </svg>
      {!isEmpty && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
          {positive.map((seg, idx) => {
            const pct = (seg.value / total) * 100;
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: seg.color }}
                />
                <span className="text-xs text-gray-600">{seg.label}</span>
                <span className="text-xs text-gray-400">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
