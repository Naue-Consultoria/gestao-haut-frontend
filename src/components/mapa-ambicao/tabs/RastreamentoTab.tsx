import { Plus, Trash2 } from 'lucide-react';
import { DataSection } from '../../ui/DataSection';
import { MapaDados, TrackingRow, emptyTrackingRow } from '../../../types/mapa-ambicao';

interface RastreamentoTabProps {
  dados: MapaDados;
  onChange: (patch: Partial<MapaDados>) => void;
}

const cellInputClass = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm font-main outline-none transition-all focus:border-gray-400 focus:bg-white';
const textareaClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white resize-y min-h-[120px]';

export function RastreamentoTab({ dados, onChange }: RastreamentoTabProps) {
  // tracking is always ≥ 1 row (guaranteed by emptyMapaDados + deleteRow guard);
  // hydrated rows without an id receive one here for backwards compatibility.
  const tracking = dados.tracking.map((row) =>
    row.id ? row : { ...row, id: crypto.randomUUID() }
  );

  const updateRow = (index: number, patch: Partial<TrackingRow>) => {
    const next = tracking.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange({ tracking: next });
  };

  const addRow = () => {
    onChange({ tracking: [...tracking, emptyTrackingRow()] });
  };

  const deleteRow = (index: number) => {
    if (tracking.length <= 1) return;
    onChange({ tracking: tracking.filter((_, i) => i !== index) });
  };

  return (
    <>
      <DataSection title="Rastreamento Mensal">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-4 py-3 bg-gray-50 border-b border-gray-200 w-[160px]">Data</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-4 py-3 bg-gray-50 border-b border-gray-200 w-[200px]">Patrimônio Atual</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-4 py-3 bg-gray-50 border-b border-gray-200 w-[100px]">% da Meta</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-4 py-3 bg-gray-50 border-b border-gray-200">Notas / Progresso</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-4 py-3 bg-gray-50 border-b border-gray-200 w-[48px]"></th>
              </tr>
            </thead>
            <tbody>
              {tracking.map((row, idx) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-sm border-b border-gray-100">
                    <input
                      type="date"
                      value={row.data}
                      onChange={(e) => updateRow(idx, { data: e.target.value })}
                      className={cellInputClass}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm border-b border-gray-100">
                    <input
                      type="text"
                      value={row.patrimonio ? row.patrimonio.toString() : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
                        const num = parseFloat(raw);
                        updateRow(idx, { patrimonio: isNaN(num) ? 0 : num });
                      }}
                      placeholder="R$ 0,00"
                      className={cellInputClass}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">—</td>
                  <td className="px-4 py-3 text-sm border-b border-gray-100">
                    <input
                      type="text"
                      value={row.notas}
                      onChange={(e) => updateRow(idx, { notas: e.target.value })}
                      placeholder="Observações do período..."
                      className={cellInputClass}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm border-b border-gray-100">
                    {tracking.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteRow(idx)}
                        className="text-gray-400 hover:text-negative cursor-pointer"
                        aria-label="Remover linha"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 text-sm text-accent font-medium hover:underline cursor-pointer"
          >
            <Plus size={14} />
            Adicionar linha
          </button>
        </div>
      </DataSection>

      <div className="grid grid-cols-2 gap-6 mt-6 max-lg:grid-cols-1">
        <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow">
          <div className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500 mb-1">Reflexão</div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Maior aprendizado preenchendo o Mapa</h3>
          <textarea
            value={dados.refAprendizado}
            onChange={(e) => onChange({ refAprendizado: e.target.value })}
            rows={5}
            placeholder="O que você descobriu sobre si mesmo preenchendo este Mapa?"
            className={textareaClass}
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow">
          <div className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500 mb-1">Próximos Passos</div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Próximos passos concretos</h3>
          <textarea
            value={dados.refProximos}
            onChange={(e) => onChange({ refProximos: e.target.value })}
            rows={5}
            placeholder="Ações imediatas para começar a viver este Mapa."
            className={textareaClass}
          />
        </div>
      </div>
    </>
  );
}
