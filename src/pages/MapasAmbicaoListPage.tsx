import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { DataSection } from '../components/ui/DataSection';
import { Toast } from '../components/ui/Toast';
import { Tag } from '../components/ui/Tag';
import { useToast } from '../hooks/useToast';
import { mapaAmbicaoGestorService } from '../services/mapa-ambicao-gestor.service';
import { MapaAmbicaoSummary } from '../types/mapa-ambicao';

function fmtDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: MapaAmbicaoSummary['status'] }) {
  if (status === 'preenchido') return <Tag variant="success">Preenchido</Tag>;
  if (status === 'parcial') return <Tag variant="warning">Parcial</Tag>;
  return <Tag variant="light">Vazio</Tag>;
}

export default function MapasAmbicaoListPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [rows, setRows] = useState<MapaAmbicaoSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    mapaAmbicaoGestorService
      .list()
      .then(setRows)
      .catch((err) => {
        console.error('Erro ao carregar lista de Mapas de Ambição', err);
        showToast('Erro ao carregar a lista de Mapas.');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const sortedRows = useMemo(() => {
    const rank: Record<MapaAmbicaoSummary['status'], number> = { preenchido: 0, parcial: 1, vazio: 2 };
    return [...rows].sort((a, b) => {
      const r = rank[a.status] - rank[b.status];
      if (r !== 0) return r;
      return a.broker_name.localeCompare(b.broker_name, 'pt-BR');
    });
  }, [rows]);

  return (
    <div>
      <PageHeader
        title="Mapas dos Corretores"
        description="Acompanhe o preenchimento do Mapa de Ambição de cada corretor do time."
      />

      <DataSection title="Todos os corretores">
        {loading ? (
          <div className="px-6 py-8 text-sm text-gray-500">Carregando...</div>
        ) : sortedRows.length === 0 ? (
          <div className="px-6 py-8 text-sm text-gray-500">Nenhum corretor ativo encontrado.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200">Nome</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200 w-[160px]">Status</th>
                <th className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200 w-[220px]">Última edição</th>
                <th className="bg-gray-50 border-b border-gray-200 w-[48px]" aria-label="Abrir"></th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={row.broker_id}
                  onClick={() => navigate(`/mapas-ambicao/${row.broker_id}`, { state: { brokerName: row.broker_name, status: row.status, updatedAt: row.updated_at } })}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700 font-medium">{row.broker_name}</td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100"><StatusBadge status={row.status} /></td>
                  <td className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-500">{fmtDateTime(row.updated_at)}</td>
                  <td className="px-4 py-3.5 text-sm border-b border-gray-100 text-gray-400">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataSection>

      <Toast message={toast.message} isVisible={toast.visible} />
    </div>
  );
}
