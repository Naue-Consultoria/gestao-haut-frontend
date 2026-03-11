import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { reportsService, ReportData } from '../services/reports.service';
import { buildReportHtml } from '../utils/reportHtml';
import { MONTHS } from '../config/constants';

export default function RelatorioPreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const id = searchParams.get('id') || searchParams.get('brokerId') || '';
  const type = searchParams.get('type') || 'broker';
  const month = Number(searchParams.get('month') || 0);
  const year = Number(searchParams.get('year') || 2026);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<ReportData | null>(null);
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!id) { setError('ID não encontrado'); setLoading(false); return; }

    const fetchReport = type === 'parceria'
      ? reportsService.getParceriaReport(id, month, year)
      : reportsService.getBrokerReport(id, month, year);

    fetchReport
      .then(d => {
        setData(d);
        setHtml(buildReportHtml(d, month, year));
      })
      .catch(() => setError('Erro ao carregar relatório'))
      .finally(() => setLoading(false));
  }, [id, type, month, year]);

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  const handleDownload = () => {
    const win = iframeRef.current?.contentWindow;
    if (win && typeof (win as any).downloadPDF === 'function') {
      (win as any).downloadPDF();
    }
  };

  const title = data ? `${data.broker.name} — ${MONTHS[month]} ${year}` : 'Carregando...';

  return (
    <div className="fixed inset-0 z-[200] bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="bg-black text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/relatorios')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <div className="w-px h-5 bg-white/20" />
          <div className="text-sm font-medium">{title}</div>
        </div>
        {!loading && !error && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-sm border-none cursor-pointer transition-colors"
              style={{ background: '#10b981' }}
            >
              <Download size={14} />
              Baixar PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-sm border-none cursor-pointer transition-colors"
            >
              <Printer size={14} />
              Imprimir
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">Gerando relatório...</div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>
      ) : (
        <iframe
          ref={iframeRef}
          srcDoc={html}
          className="flex-1 w-full border-none"
          title="Relatório de Performance"
        />
      )}
    </div>
  );
}
