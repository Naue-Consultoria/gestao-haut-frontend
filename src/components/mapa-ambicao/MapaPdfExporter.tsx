import { useCallback, useEffect, useRef } from 'react';
import { MapaDados } from '../../types/mapa-ambicao';
import { calcCustoAnual, calcPatrimonioNecessario } from '../../utils/mapaCalc';
import { PropositorTab } from './tabs/PropositorTab';
import { EstiloDeVidaTab } from './tabs/EstiloDeVidaTab';
import { EstratificacaoTab } from './tabs/EstratificacaoTab';
import { RastreamentoTab } from './tabs/RastreamentoTab';
import { PlanoAcaoTab } from './tabs/PlanoAcaoTab';
import { DashboardTab } from './tabs/DashboardTab';

interface MapaPdfExporterProps {
  dados: MapaDados;
  brokerName: string;
  onDone: (ok: boolean) => void;
}

const TAB_TITLES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'proposito', label: 'Propósito e Visão' },
  { key: 'estilo', label: 'Estilo de Vida' },
  { key: 'patrimonio', label: 'Estratificação do Patrimônio' },
  { key: 'rastreamento', label: 'Rastreamento' },
  { key: 'plano', label: 'Plano de Ação' },
];

function sanitizeFilename(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}

/**
 * Invisible renderer that mounts all 6 tabs off-screen, then captures each with
 * html2canvas and emits a single A4 PDF. Parent controls lifecycle via `onDone`.
 */
export function MapaPdfExporter({ dados, brokerName, onDone }: MapaPdfExporterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const noopChange = useCallback(() => {
    // no-op — this tree is never interacted with
  }, []);

  const custoAnual = calcCustoAnual(dados.expenses || {});
  const patrimonioNecessario = custoAnual > 0 ? calcPatrimonioNecessario(custoAnual) : 0;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    const run = async () => {
      // Give React two frames + a small delay so charts (donut/bar SVG)
      // and font metrics stabilize before capture.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      await new Promise<void>((resolve) => setTimeout(resolve, 150));
      if (cancelled || !rootRef.current) return;

      try {
        // Lazy-import heavy deps so they don't inflate the main bundle for
        // pages that never export. ~600kB of code only loads on click.
        const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
          import('jspdf'),
          import('html2canvas'),
        ]);
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        const margin = 8; // mm
        const usableW = pdfW - margin * 2;

        const sections = rootRef.current.querySelectorAll<HTMLElement>('[data-pdf-section]');
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          const canvas = await html2canvas(sec, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false,
          });
          const imgData = canvas.toDataURL('image/png');
          const imgH = (canvas.height * usableW) / canvas.width;

          if (i > 0) pdf.addPage();

          // If a single section is taller than one page, slice it vertically.
          if (imgH <= pdfH - margin * 2) {
            pdf.addImage(imgData, 'PNG', margin, margin, usableW, imgH);
          } else {
            // Multi-page slice: draw the same image, offset vertically, clipping via y negative.
            const pageUsableH = pdfH - margin * 2;
            const totalPages = Math.ceil(imgH / pageUsableH);
            for (let p = 0; p < totalPages; p++) {
              if (p > 0) pdf.addPage();
              const yOffset = margin - p * pageUsableH;
              pdf.addImage(imgData, 'PNG', margin, yOffset, usableW, imgH);
            }
          }
        }

        const today = new Date().toISOString().slice(0, 10);
        const safeName = sanitizeFilename(brokerName) || 'corretor';
        pdf.save(`mapa-ambicao-${safeName}-${today}.pdf`);
        if (!cancelled) onDone(true);
      } catch (err) {
        console.error('Erro ao exportar PDF do Mapa de Ambição', err);
        if (!cancelled) onDone(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [brokerName, onDone]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '-10000px',
        top: 0,
        width: '1100px',
        background: '#ffffff',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <style>{`
        /* Force every form control inside the export tree to render with static,
           print-friendly styling. html2canvas does not emulate :focus, but
           inputs can still have placeholder / caret artifacts. */
        [data-pdf-root] input,
        [data-pdf-root] textarea,
        [data-pdf-root] select {
          background: #f9fafb !important;
          color: #111827 !important;
        }
      `}</style>
      <div data-pdf-root>
        <div style={{ padding: 32, fontFamily: 'Outfit, sans-serif' }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#111827' }}>Mapa de Ambição</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {brokerName} — Exportado em {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        {TAB_TITLES.map(({ key, label }) => (
          <div
            key={key}
            data-pdf-section
            style={{ padding: 32, borderTop: '1px solid #e5e7eb', background: '#ffffff' }}
          >
            <div style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 16 }}>{label}</div>
            {key === 'dashboard' && <DashboardTab dados={dados} onChange={noopChange} />}
            {key === 'proposito' && <PropositorTab dados={dados} onChange={noopChange} />}
            {key === 'estilo' && <EstiloDeVidaTab dados={dados} onChange={noopChange} />}
            {key === 'patrimonio' && <EstratificacaoTab dados={dados} onChange={noopChange} />}
            {key === 'rastreamento' && (
              <RastreamentoTab dados={dados} onChange={noopChange} patrimonioNecessario={patrimonioNecessario} />
            )}
            {key === 'plano' && (
              <PlanoAcaoTab dados={dados} onChange={noopChange} patrimonioNecessario={patrimonioNecessario} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
