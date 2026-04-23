import { Plus, Trash2 } from 'lucide-react';
import { MapaDados, ActionRow, emptyActionRow } from '../../../types/mapa-ambicao';

interface PlanoAcaoTabProps {
  dados: MapaDados;
  onChange: (patch: Partial<MapaDados>) => void;
}

const textareaClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white resize-y min-h-[120px]';
const actionTextareaClass = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm font-main outline-none focus:border-gray-400 focus:bg-white resize-y';
const actionInputClass = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm font-main outline-none transition-all focus:border-gray-400 focus:bg-white';
const actionSelectClass = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm font-main outline-none focus:border-gray-400 cursor-pointer';
const metaInputClass = 'w-48 px-3 py-1.5 bg-white border border-gray-200 rounded-sm text-sm text-right font-main outline-none focus:border-gray-400 transition-all';

function TextCard({ num, heading, placeholder, rows, value, onChange }: {
  num: string; heading: string; placeholder: string; rows: number;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow mb-6">
      <div className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500 mb-1">{num}</div>
      <h3 className="text-[15px] font-semibold text-gray-900 mb-4">{heading}</h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={textareaClass}
      />
    </div>
  );
}

function ActionRowEditor({ row, canDelete, onRowChange, onDelete }: {
  row: ActionRow; canDelete: boolean;
  onRowChange: (patch: Partial<ActionRow>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_120px_130px_40px] gap-2 items-start py-2 border-b border-gray-100">
      <textarea
        value={row.descricao}
        onChange={(e) => onRowChange({ descricao: e.target.value })}
        rows={2}
        placeholder="Ação / iniciativa..."
        className={actionTextareaClass}
      />
      <input
        type="text"
        value={row.prazo}
        onChange={(e) => onRowChange({ prazo: e.target.value })}
        placeholder="Ex: Mar/2027"
        className={actionInputClass}
      />
      <select
        value={row.status}
        onChange={(e) => onRowChange({ status: e.target.value as ActionRow['status'] })}
        className={actionSelectClass}
      >
        <option value="">Selecionar</option>
        <option value="pendente">Pendente</option>
        <option value="andamento">Em andamento</option>
        <option value="concluido">Concluído</option>
      </select>
      <div className="flex items-center justify-center h-full pt-2">
        {canDelete && (
          <button type="button" onClick={onDelete} className="text-gray-400 hover:text-negative cursor-pointer" aria-label="Remover ação">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function currencyFmt(v: number): string {
  if (!v) return '';
  return v.toString();
}

function parseCurrency(raw: string): number {
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

interface PhaseConfig {
  phaseKey: 'short' | 'medium' | 'long';
  num: number;
  badge: string;
  years: string;
  subtitle: string;
  dotClass: string;
  badgeClass: string;
  metaField: 'pfMeta1' | 'pfMeta3' | null;
  actionsField: 'actionsShort' | 'actionsMedium' | 'actionsLong';
}

const PHASES: PhaseConfig[] = [
  {
    phaseKey: 'short', num: 1, badge: 'Curto Prazo', years: '1 Ano',
    subtitle: 'Metas e ações imediatas para os próximos 12 meses.',
    dotClass: 'bg-accent', badgeClass: 'bg-red-100 text-accent',
    metaField: 'pfMeta1', actionsField: 'actionsShort',
  },
  {
    phaseKey: 'medium', num: 3, badge: 'Médio Prazo', years: '3 Anos',
    subtitle: 'Consolidação do caminho e ajustes estruturais.',
    dotClass: 'bg-gray-700', badgeClass: 'bg-gray-100 text-gray-700',
    metaField: 'pfMeta3', actionsField: 'actionsMedium',
  },
  {
    phaseKey: 'long', num: 5, badge: 'Longo Prazo', years: '5 Anos',
    subtitle: 'Patrimônio Necessário — chegada na vida ideal.',
    dotClass: 'bg-gray-900', badgeClass: 'bg-gray-200 text-gray-900',
    metaField: null, actionsField: 'actionsLong',
  },
];

export function PlanoAcaoTab({ dados, onChange }: PlanoAcaoTabProps) {
  const updateAction = (actionsField: PhaseConfig['actionsField'], index: number, patch: Partial<ActionRow>) => {
    const current = dados[actionsField];
    const next = current.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange({ [actionsField]: next } as Partial<MapaDados>);
  };
  const addAction = (actionsField: PhaseConfig['actionsField']) => {
    const current = dados[actionsField];
    onChange({ [actionsField]: [...current, emptyActionRow()] } as Partial<MapaDados>);
  };
  const deleteAction = (actionsField: PhaseConfig['actionsField'], index: number) => {
    const current = dados[actionsField];
    if (current.length <= 1) return;
    onChange({ [actionsField]: current.filter((_, i) => i !== index) } as Partial<MapaDados>);
  };

  return (
    <>
      <TextCard
        num="Pergunta 1"
        heading="Sua Cadeira Atual"
        placeholder="Como está seu negócio hoje — forças, limites, o que já funciona."
        rows={5}
        value={dados.p3Negocio}
        onChange={(v) => onChange({ p3Negocio: v })}
      />

      {/* Patrimônio Necessário — read-only display */}
      <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow mb-6">
        <div className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500 mb-1">Pergunta 2</div>
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Patrimônio Necessário</h3>
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-sm px-6 py-4">
          <span className="text-sm text-gray-600">Patrimônio Necessário (calculado)</span>
          <span className="text-[15px] font-semibold text-gray-900">—</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Preenchido automaticamente a partir da aba Estilo de Vida.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 max-lg:grid-cols-1">
        <TextCard
          num="Pergunta 3"
          heading="Ações Concretas para Hoje"
          placeholder="Lista de ações específicas e mensuráveis..."
          rows={6}
          value={dados.p3Acoes}
          onChange={(v) => onChange({ p3Acoes: v })}
        />
        <TextCard
          num="Pergunta 4"
          heading="Depois da Meta"
          placeholder="O que muda quando você atinge a meta?"
          rows={6}
          value={dados.p3Depois}
          onChange={(v) => onChange({ p3Depois: v })}
        />
      </div>

      <TextCard
        num="Pergunta 5"
        heading="Limites e Prioridades"
        placeholder="O que você não abre mão; o que está disposto a adiar."
        rows={5}
        value={dados.p3Limites}
        onChange={(v) => onChange({ p3Limites: v })}
      />

      {/* Timeline */}
      <h3 className="text-[15px] font-semibold text-gray-900 mb-4 mt-4">Linha do Tempo — Metas Parciais e Ações</h3>

      {PHASES.map((phase) => {
        // hydrate rows that lack an id (backwards compatibility with persisted data pre-WR-02)
        const actions = dados[phase.actionsField].map((row) =>
          row.id ? row : { ...row, id: crypto.randomUUID() }
        );

        return (
          <div key={phase.phaseKey} className="bg-white border border-gray-200 rounded-[12px] p-6 shadow mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${phase.dotClass}`}>
                {phase.num}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${phase.badgeClass}`}>{phase.badge}</span>
                  <span className="text-sm font-semibold text-gray-700">{phase.years}</span>
                </div>
                <p className="text-xs text-gray-500">{phase.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 mb-4">
              <span className="text-sm text-gray-600">Meta de Patrimônio — Ano {phase.num}</span>
              {phase.metaField ? (
                <input
                  type="text"
                  value={currencyFmt(dados[phase.metaField])}
                  onChange={(e) => onChange({ [phase.metaField!]: parseCurrency(e.target.value) } as Partial<MapaDados>)}
                  placeholder="R$ 0,00"
                  className={metaInputClass}
                />
              ) : (
                <span className="text-[15px] font-semibold text-gray-900">—</span>
              )}
            </div>

            <div className="grid grid-cols-[1fr_120px_130px_40px] gap-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500 px-2 pb-2 border-b border-gray-200">
              <span>Ação / Iniciativa</span>
              <span>Prazo</span>
              <span>Status</span>
              <span></span>
            </div>

            {actions.map((row, idx) => (
              <ActionRowEditor
                key={row.id}
                row={row}
                canDelete={actions.length > 1}
                onRowChange={(patch) => updateAction(phase.actionsField, idx, patch)}
                onDelete={() => deleteAction(phase.actionsField, idx)}
              />
            ))}

            <button
              type="button"
              onClick={() => addAction(phase.actionsField)}
              className="mt-3 flex items-center gap-1.5 text-sm text-accent font-medium hover:underline cursor-pointer"
            >
              <Plus size={14} />
              Adicionar ação
            </button>
          </div>
        );
      })}
    </>
  );
}
