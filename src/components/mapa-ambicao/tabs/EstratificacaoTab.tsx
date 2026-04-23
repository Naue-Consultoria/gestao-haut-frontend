import { MapaDados } from '../../../types/mapa-ambicao';
import { CurrencyInput } from '../../ui/CurrencyInput';
import {
  ASSET_CATEGORIES,
  calcPatrimonioAtual,
  fmtBRL,
} from '../../../utils/mapaCalc';

interface EstratificacaoTabProps {
  dados: MapaDados;
  onChange: (patch: Partial<MapaDados>) => void;
}

const textareaClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white resize-y min-h-[80px]';

export function EstratificacaoTab({ dados, onChange }: EstratificacaoTabProps) {
  const assets = dados.assets || {};
  const patrimonioAtual = calcPatrimonioAtual(assets);

  const updateAsset = (id: string, value: number) => {
    onChange({ assets: { ...assets, [id]: value } });
  };

  return (
    <>
      {/* Asset table card */}
      <div className="bg-white border border-gray-200 rounded-[12px] shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500 mb-1">
            Patrimônio
          </div>
          <h3 className="text-[15px] font-semibold text-gray-900">Composição Patrimonial</h3>
        </div>

        <div className="grid grid-cols-[1fr_220px_100px] px-6 py-2 border-b border-gray-200 text-[10px] font-semibold tracking-widest uppercase text-gray-400">
          <span>Categoria de Ativo</span>
          <span>Valor Atual (R$)</span>
          <span className="text-right">% do Total</span>
        </div>

        {ASSET_CATEGORIES.map((asset) => {
          const value = assets[asset.id] ?? 0;
          const pctDisplay =
            patrimonioAtual > 0
              ? ((value / patrimonioAtual) * 100).toFixed(1) + '%'
              : '—';
          return (
            <div
              key={asset.id}
              className="grid grid-cols-[1fr_220px_100px] px-6 py-3 border-b border-gray-100 last:border-0 items-center"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: asset.color }}
                />
                <span className="text-sm text-gray-700">{asset.label}</span>
              </div>
              <CurrencyInput
                value={value ? String(value) : ''}
                onChange={(raw) => updateAsset(asset.id, Number(raw) || 0)}
                placeholder="0,00"
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-sm text-sm font-main outline-none focus:border-gray-400 focus:bg-white text-right transition-all"
              />
              <span className="text-sm text-gray-700 font-medium text-right">{pctDisplay}</span>
            </div>
          );
        })}

        {/* Total row */}
        <div className="grid grid-cols-[1fr_220px_100px] px-6 py-4 bg-gray-50 rounded-b-[12px] border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Patrimônio Total</span>
          <span className="text-[15px] font-semibold text-gray-900 text-right">
            {fmtBRL(patrimonioAtual)}
          </span>
          <span className="text-sm font-semibold text-gray-700 text-right">100%</span>
        </div>
      </div>

      {/* Observations card */}
      <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow mt-6">
        <div className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500 mb-1">
          Observações
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
          Notas e detalhes adicionais
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Registre informações relevantes sobre seus ativos.
        </p>
        <textarea
          value={dados.patObservacoes || ''}
          onChange={(e) => onChange({ patObservacoes: e.target.value })}
          rows={5}
          placeholder="Detalhes sobre a composição do patrimônio..."
          className={textareaClass}
        />
      </div>
    </>
  );
}
