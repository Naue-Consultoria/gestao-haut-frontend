import { ReportData } from '../services/reports.service';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function fmtBRL(v: number): string {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtCompact(v: number): string {
  if (v >= 1000000) return `R$ ${(v / 1000000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}K`;
  return fmtBRL(v);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const tagColor: Record<string, string> = {
  'RELACIONAMENTO': 'tag-emerald',
  'PATROCINADO': 'tag-amber',
  'CORRETOR_EXTERNO': 'tag-violet',
  'CORRETOR EXTERNO': 'tag-violet',
  'CORRETOR_INTERNO': 'tag-cyan',
  'CORRETOR INTERNO': 'tag-cyan',
  'PORTAL': 'tag-dark',
};

function originLabel(orig: string): string {
  return orig.replace(/_/g, ' ');
}

export function buildReportHtml(data: ReportData, month: number, year: number): string {
  const monthName = MONTHS[month];
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const meta = data.meta || { vgv_anual: 0, vgv_mensal: 0, captacoes: 0, capt_exclusivas: 0, negocios: 0, treinamento: 0, investimento: 0, positivacao: 0 };
  const t = data.totals;

  // KPI calculations
  const pctAnual = meta.vgv_anual > 0 ? (t.vgvAcumuladoAno / meta.vgv_anual * 100) : 0;
  const pctMensal = meta.vgv_mensal > 0 ? (t.vgvRealizado / meta.vgv_mensal * 100) : 0;
  const resultadoMensal = t.vgvRealizado - meta.vgv_mensal;
  const taxaExclusividade = t.captacoesCount > 0 ? (t.captExclusivas / t.captacoesCount * 100) : 0;

  // Accumulated arrays for chart
  const acumMeta: number[] = [];
  const acumReal: number[] = [];
  let sm = 0, sr = 0;
  for (let i = 0; i < 12; i++) {
    sm += data.monthlyMeta[i] || 0;
    sr += data.monthlyVgv[i] || 0;
    acumMeta.push(sm);
    acumReal.push(sr);
  }

  // Origens aggregation for doughnut
  const origensMap: Record<string, number> = {};
  data.negocios.forEach(n => {
    const key = originLabel(n.origem);
    origensMap[key] = (origensMap[key] || 0) + n.vgv;
  });

  // Treinamentos by local
  const locaisMap: Record<string, number> = {};
  data.treinamentos.forEach(t => {
    locaisMap[t.local] = (locaisMap[t.local] || 0) + t.horas;
  });

  // Investimentos by tipo
  const tiposMap: Record<string, number> = {};
  data.investimentos.forEach(i => {
    tiposMap[i.tipo] = (tiposMap[i.tipo] || 0) + i.valor;
  });

  const headerBar = (pageNum: string) => `
    <div class="page-header-bar">
      <div class="header-logo">HAUT</div>
      <div class="header-doc-title">RELATÓRIO DE PERFORMANCE ${year}</div>
      <div class="header-page-num">${pageNum}</div>
    </div>`;

  const footerBar = `
    <div class="page-footer-bar">
      <span>Documento confidencial — HAUT Imobiliária</span>
      <span>Gerado em ${dateStr} — Sistema Diário de Bordo</span>
    </div>`;

  // Build positivacoes table rows
  const positivacoesRows = data.positivacoes.map(p => `
    <tr><td class="bold">${escapeHtml(p.oportunidade)}</td><td><span class="tag tag-dark">${p.parceria}</span></td><td class="mono">${fmtBRL(p.vgv)}</td><td class="mono">${fmtBRL(p.comissao)}</td></tr>`).join('');
  const positivacoesTotalRow = `<tr class="total-row"><td>TOTAL</td><td></td><td class="mono">${fmtBRL(t.vgvRealizado)}</td><td class="mono">${fmtBRL(t.comissaoTotal)}</td></tr>`;

  // Build captacoes table rows
  const captacoesRows = data.captacoes.map(c => `
    <tr><td class="bold">${escapeHtml(c.oportunidade)}</td><td><span class="tag tag-dark">${c.exclusivo}</span></td><td><span class="tag ${tagColor[c.origem] || 'tag-dark'}">${originLabel(c.origem)}</span></td><td class="mono">${fmtBRL(c.vgv)}</td></tr>`).join('');
  const captacoesTotalVgv = data.captacoes.reduce((s, c) => s + c.vgv, 0);
  const captacoesTotalRow = `<tr class="total-row"><td>TOTAL</td><td></td><td>${t.captacoesCount} captações</td><td class="mono">${fmtBRL(captacoesTotalVgv)}</td></tr>`;

  // Build negocios table rows
  const negociosRows = data.negocios.map((n, i) => `
    <tr><td class="mono" style="color:var(--g400)">${String(i + 1).padStart(2, '0')}</td><td class="bold">${escapeHtml(n.oportunidade)}</td><td><span class="tag ${tagColor[n.origem] || 'tag-dark'}">${originLabel(n.origem)}</span></td><td class="mono" style="text-align:right">${fmtBRL(n.vgv)}</td></tr>`).join('');
  const negociosTotalRow = `<tr class="total-row"><td></td><td>TOTAL</td><td>${t.negociosCount} negócios</td><td class="mono" style="text-align:right">${fmtBRL(t.negociosVgvTotal)}</td></tr>`;

  // Build treinamentos table rows
  const treinamentosRows = data.treinamentos.map(tr => `
    <tr><td class="bold">${escapeHtml(tr.atividade)}</td><td>${escapeHtml(tr.local)}</td><td class="mono" style="text-align:right">${tr.horas}h</td></tr>`).join('');
  const treinamentosTotalRow = `<tr class="total-row"><td>TOTAL</td><td>${data.treinamentos.length} atividades</td><td class="mono" style="text-align:right">${t.treinamentoHoras}h</td></tr>`;

  // Build investimentos table rows
  const investimentosRows = data.investimentos.map(inv => `
    <tr><td><span class="tag tag-dark">${inv.tipo}</span></td><td>${escapeHtml(inv.produto)}</td><td class="mono" style="text-align:right">${fmtBRL(inv.valor)}</td><td class="mono" style="text-align:right">${inv.leads}</td></tr>`).join('');
  const investimentosTotalRow = `<tr class="total-row"><td>TOTAL</td><td></td><td class="mono" style="text-align:right">${fmtBRL(t.investimentoTotal)}</td><td class="mono" style="text-align:right">${t.investimentoLeads}</td></tr>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HAUT — Relatório de Performance | ${escapeHtml(data.broker.name)} | ${year}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 0; }
:root {
  --black: #09090b; --white: #ffffff;
  --g50: #fafafa; --g100: #f4f4f5; --g200: #e4e4e7; --g300: #d4d4d8;
  --g400: #a1a1aa; --g500: #71717a; --g600: #52525b; --g700: #3f3f46;
  --g800: #27272a; --g900: #18181b;
  --emerald: #10b981; --emerald-light: #6ee7b7; --emerald-dark: #059669; --emerald-50: #ecfdf5;
  --cyan: #06b6d4; --cyan-light: #67e8f9; --cyan-50: #ecfeff;
  --violet: #8b5cf6; --violet-light: #c4b5fd; --violet-50: #f5f3ff;
  --rose: #f43f5e; --rose-light: #fda4af; --rose-50: #fff1f2;
  --amber: #f59e0b; --amber-light: #fcd34d; --amber-50: #fffbeb;
  --blue: #3b82f6; --blue-light: #93c5fd;
  --indigo: #6366f1; --orange: #f97316; --pink: #ec4899; --lime: #84cc16; --teal: #14b8a6;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', -apple-system, sans-serif; background: #f0f0f3; color: var(--black); -webkit-font-smoothing: antialiased; line-height: 1.5; }
@media print {
  body { background: white; }
  .report-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; page-break-after: always; }
  .no-print { display: none !important; }
}
.report-wrapper { max-width: 900px; margin: 0 auto; padding: 32px 16px; }
.report-page { background: var(--white); border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08); margin-bottom: 32px; overflow: hidden; page-break-after: always; }
.page-header-bar { background: var(--black); padding: 14px 40px; display: flex; align-items: center; justify-content: space-between; position: relative; }
.page-header-bar::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--emerald), var(--cyan), var(--violet), var(--amber), var(--rose)); }
.header-logo { font-weight: 800; font-size: 16px; color: var(--white); letter-spacing: 6px; }
.header-doc-title { font-size: 11px; color: var(--g400); letter-spacing: 2px; font-weight: 500; }
.header-page-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--emerald); font-weight: 700; }
.page-content { padding: 40px; }
.profile-hero { display: flex; align-items: center; gap: 32px; margin-bottom: 32px; }
.profile-avatar { width: 110px; height: 110px; border-radius: 50%; background: var(--emerald); display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 800; color: white; flex-shrink: 0; border: 4px solid var(--white); box-shadow: 0 0 0 3px var(--emerald), 0 8px 24px rgba(16,185,129,0.2); }
.profile-info { flex: 1; }
.profile-tag { font-size: 10px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--g400); margin-bottom: 6px; }
.profile-name { font-size: 36px; font-weight: 800; letter-spacing: -1px; line-height: 1.1; background: linear-gradient(135deg, var(--black) 0%, var(--g700) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.profile-meta { font-size: 14px; color: var(--g500); margin-top: 6px; font-weight: 400; }
.profile-meta .dot { width: 4px; height: 4px; background: var(--g300); border-radius: 50%; display: inline-block; margin: 0 8px; }
.sep { height: 1px; background: var(--g200); margin: 24px 0; }
.sep-gradient { height: 2px; background: linear-gradient(90deg, var(--emerald), var(--cyan), var(--violet), var(--amber)); margin: 20px 0; border-radius: 1px; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
.kpi-card { background: var(--black); border-radius: 14px; padding: 20px 18px 18px; position: relative; overflow: hidden; }
.kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; border-radius: 14px 14px 0 0; }
.kpi-card.emerald::before { background: var(--emerald); }
.kpi-card.cyan::before { background: var(--cyan); }
.kpi-card.violet::before { background: var(--violet); }
.kpi-card.amber::before { background: var(--amber); }
.kpi-card::after { content: ''; position: absolute; top: 0; right: 0; width: 80px; height: 80px; border-radius: 50%; opacity: 0.06; }
.kpi-card.emerald::after { background: var(--emerald); }
.kpi-card.cyan::after { background: var(--cyan); }
.kpi-card.violet::after { background: var(--violet); }
.kpi-card.amber::after { background: var(--amber); }
.kpi-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--g500); margin-bottom: 8px; }
.kpi-value { font-size: 22px; font-weight: 800; color: var(--white); letter-spacing: -0.5px; line-height: 1.1; }
.kpi-sub { font-size: 11px; color: var(--g500); margin-top: 6px; font-weight: 500; }
.kpi-row-light { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
.kpi-light { padding: 18px; border-radius: 12px; border: 1px solid var(--g200); background: var(--white); }
.kpi-light .kpi-label { color: var(--g500); }
.kpi-light .kpi-value { color: var(--black); font-size: 24px; }
.kpi-light .kpi-value.emerald { color: var(--emerald); }
.kpi-light .kpi-value.rose { color: var(--rose); }
.kpi-light .kpi-value.violet { color: var(--violet); }
.kpi-light .kpi-value.cyan { color: var(--cyan); }
.gauges-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 28px 0; }
.gauge-card { text-align: center; padding: 24px 20px; border-radius: 14px; border: 1px solid var(--g100); background: var(--white); overflow: visible; }
.gauge-canvas-wrap { position: relative; width: 160px; height: 90px; margin: 0 auto 8px; }
.gauge-canvas-wrap canvas { width: 160px !important; height: 90px !important; }
.gauge-center-text { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); text-align: center; }
.gauge-pct { font-size: 26px; font-weight: 800; letter-spacing: -1px; line-height: 1; }
.gauge-label-text { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: var(--g400); text-transform: uppercase; margin-top: 4px; white-space: nowrap; }
.section-title { font-size: 11px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: var(--g400); margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
.section-title .accent-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
.page-subtitle { font-size: 13px; color: var(--g500); margin-bottom: 8px; }
.chart-wrap { position: relative; margin: 20px 0; padding: 24px; background: var(--white); border: 1px solid var(--g100); border-radius: 14px; }
.chart-wrap canvas { max-height: 280px; }
.data-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
.data-table thead th { background: var(--black); color: var(--white); font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 12px 14px; text-align: left; white-space: nowrap; }
.data-table thead th:first-child { border-radius: 8px 0 0 0; }
.data-table thead th:last-child { border-radius: 0 8px 0 0; }
.data-table tbody td { padding: 10px 14px; border-bottom: 1px solid var(--g100); color: var(--g700); font-size: 12px; }
.data-table tbody tr:nth-child(even) { background: var(--g50); }
.data-table .total-row td { background: var(--g100) !important; font-weight: 700; color: var(--black); border-top: 2px solid var(--g300); }
.data-table .bold { font-weight: 700; color: var(--black); }
.data-table .mono { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
.tag { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
.tag-emerald { background: var(--emerald-50); color: var(--emerald-dark); }
.tag-violet { background: var(--violet-50); color: var(--violet); }
.tag-cyan { background: var(--cyan-50); color: var(--cyan); }
.tag-amber { background: var(--amber-50); color: var(--amber); }
.tag-rose { background: var(--rose-50); color: var(--rose); }
.tag-dark { background: var(--g100); color: var(--g600); }
.comment-box { border-left: 4px solid var(--emerald); background: linear-gradient(135deg, var(--emerald-50) 0%, var(--white) 100%); border-radius: 0 14px 14px 0; padding: 28px 32px; margin: 20px 0; }
.comment-author { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--emerald-dark); margin-bottom: 12px; }
.comment-text { font-size: 14px; line-height: 1.8; color: var(--g700); font-style: italic; }
.signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--g200); }
.sig-block { text-align: center; }
.sig-line { border-bottom: 1px solid var(--g300); margin-bottom: 12px; padding-bottom: 48px; }
.sig-name { font-weight: 700; font-size: 14px; }
.sig-role { font-size: 12px; color: var(--g500); margin-top: 2px; }
.radar-container { display: flex; justify-content: center; margin: 16px 0; }
.radar-container canvas { max-width: 380px !important; max-height: 380px !important; }
.page-footer-bar { background: var(--g50); padding: 10px 40px; display: flex; justify-content: space-between; font-size: 9px; color: var(--g400); border-top: 1px solid var(--g100); }
.fab-group { position: fixed; bottom: 32px; right: 32px; display: flex; flex-direction: column; gap: 12px; z-index: 100; }
.fab-btn { width: 56px; height: 56px; border: none; border-radius: 50%; cursor: pointer; box-shadow: 0 4px 24px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
.fab-btn:hover { transform: scale(1.08); }
.fab-btn svg { width: 22px; height: 22px; }
.fab-btn.dark { background: var(--black); color: var(--white); }
.fab-btn.accent { background: var(--emerald); color: var(--white); }
@media (max-width: 680px) {
  .page-content { padding: 20px; }
  .kpi-row, .kpi-row-light { grid-template-columns: repeat(2, 1fr); }
  .gauges-row { grid-template-columns: 1fr; }
  .profile-hero { flex-direction: column; text-align: center; }
  .profile-name { font-size: 28px; }
  .signatures { grid-template-columns: 1fr; gap: 32px; }
}
</style>
</head>
<body>
<div class="report-wrapper">

<!-- PAGE 1 — COVER + KPIs + GAUGES + META CHART -->
<div class="report-page">
  ${headerBar('01')}
  <div class="page-content">
    <div class="profile-hero">
      <div class="profile-avatar">${escapeHtml(data.broker.name.charAt(0))}</div>
      <div class="profile-info">
        <div class="profile-tag">Relatório de Performance Individual</div>
        <div class="profile-name">${escapeHtml(data.broker.name.toUpperCase())}</div>
        <div class="profile-meta">
          <span>Equipe ${escapeHtml(data.broker.team)}</span>
          <span class="dot"></span>
          <span>Corretor(a)</span>
          <span class="dot"></span>
          <span>${monthName} ${year}</span>
        </div>
      </div>
    </div>

    <div class="sep-gradient"></div>

    <div class="kpi-row">
      <div class="kpi-card emerald">
        <div class="kpi-label">Meta Anual</div>
        <div class="kpi-value">${fmtCompact(meta.vgv_anual)}</div>
        <div class="kpi-sub">${pctAnual.toFixed(1)}% atingido</div>
      </div>
      <div class="kpi-card cyan">
        <div class="kpi-label">Realizado ${MONTHS_SHORT[month]}</div>
        <div class="kpi-value">${fmtCompact(t.vgvRealizado)}</div>
        <div class="kpi-sub">Meta mês: ${fmtCompact(meta.vgv_mensal)}</div>
      </div>
      <div class="kpi-card violet">
        <div class="kpi-label">Negócios Gerados</div>
        <div class="kpi-value">${fmtCompact(t.negociosVgvTotal)}</div>
        <div class="kpi-sub">${t.negociosCount} oportunidades</div>
      </div>
      <div class="kpi-card amber">
        <div class="kpi-label">Investimento</div>
        <div class="kpi-value">${fmtCompact(t.investimentoTotal)}</div>
        <div class="kpi-sub">${t.investimentoLeads} leads gerados</div>
      </div>
    </div>

    <div class="gauges-row">
      <div class="gauge-card">
        <div class="gauge-canvas-wrap">
          <canvas id="gauge1"></canvas>
          <div class="gauge-center-text">
            <div class="gauge-pct" style="color:var(--emerald)">${pctMensal.toFixed(1)}%</div>
          </div>
        </div>
        <div class="gauge-label-text">Resultado do Mês</div>
      </div>
      <div class="gauge-card">
        <div class="gauge-canvas-wrap">
          <canvas id="gauge2"></canvas>
          <div class="gauge-center-text">
            <div class="gauge-pct" style="color:var(--violet)">${pctAnual.toFixed(1)}%</div>
          </div>
        </div>
        <div class="gauge-label-text">Meta Anual</div>
      </div>
      <div class="gauge-card">
        <div class="gauge-canvas-wrap">
          <canvas id="gauge3"></canvas>
          <div class="gauge-center-text">
            <div class="gauge-pct" style="color:var(--cyan)">${t.taxaPositivacao.toFixed(1)}%</div>
          </div>
        </div>
        <div class="gauge-label-text">Taxa Positivação</div>
      </div>
    </div>

    <div class="section-title">
      <span class="accent-dot" style="background:var(--emerald)"></span>
      Meta × Realizado Mensal
    </div>
    <div class="chart-wrap">
      <canvas id="chartMetaReal" height="220"></canvas>
    </div>
  </div>
  ${footerBar}
</div>

<!-- PAGE 2 — EVOLUÇÃO + RADAR -->
<div class="report-page">
  ${headerBar('02')}
  <div class="page-content">
    <div class="section-title">
      <span class="accent-dot" style="background:var(--violet)"></span>
      Evolução Acumulada no Ano
    </div>
    <div class="chart-wrap">
      <canvas id="chartAcumulado" height="220"></canvas>
    </div>

    <div style="margin-top:32px">
      <div class="page-title">Radar de Performance</div>
      <div class="page-subtitle">Comparativo entre realizado e meta em cada dimensão — ${monthName} ${year}</div>
      <div class="sep-gradient"></div>
    </div>
    <div class="radar-container">
      <canvas id="chartRadar" width="380" height="380"></canvas>
    </div>
  </div>
  ${footerBar}
</div>

<!-- PAGE 3 — RESULTADO DO MÊS -->
<div class="report-page">
  ${headerBar('03')}
  <div class="page-content">
    <div class="page-title">Resultado de ${monthName} ${year}</div>
    <div class="sep-gradient"></div>

    <div class="kpi-row-light">
      <div class="kpi-light">
        <div class="kpi-label">Meta Mensal</div>
        <div class="kpi-value">${fmtCompact(meta.vgv_mensal)}</div>
      </div>
      <div class="kpi-light">
        <div class="kpi-label">Realizado</div>
        <div class="kpi-value emerald">${fmtCompact(t.vgvRealizado)}</div>
      </div>
      <div class="kpi-light">
        <div class="kpi-label">Resultado</div>
        <div class="kpi-value ${resultadoMensal >= 0 ? 'emerald' : 'rose'}">${resultadoMensal >= 0 ? '+' : ''}${fmtCompact(resultadoMensal)}</div>
      </div>
      <div class="kpi-light">
        <div class="kpi-label">Positivação</div>
        <div class="kpi-value violet">${t.taxaPositivacao.toFixed(2)}%</div>
      </div>
    </div>

    ${data.positivacoes.length > 0 ? `
    <div class="section-title">
      <span class="accent-dot" style="background:var(--emerald)"></span>
      Quadro de Positivação
    </div>
    <table class="data-table">
      <thead><tr><th>Oportunidade</th><th>Parceria</th><th>VGV Líquido</th><th>Comissão</th></tr></thead>
      <tbody>${positivacoesRows}${positivacoesTotalRow}</tbody>
    </table>` : ''}

    ${data.captacoes.length > 0 ? `
    <div class="section-title" style="margin-top:28px">
      <span class="accent-dot" style="background:var(--cyan)"></span>
      Quadro de Captação
    </div>
    <table class="data-table">
      <thead><tr><th>Oportunidade</th><th>Exclusivo</th><th>Origem</th><th>VGV Bruto</th></tr></thead>
      <tbody>${captacoesRows}${captacoesTotalRow}</tbody>
    </table>` : ''}

    <div class="section-title" style="margin-top:28px">
      <span class="accent-dot" style="background:var(--amber)"></span>
      Taxas de Efetividade
    </div>
    <table class="data-table">
      <thead><tr><th>Indicador</th><th style="text-align:right">Valor</th></tr></thead>
      <tbody>
        <tr><td>Negócios Levantados no Mês</td><td class="mono bold" style="text-align:right">${fmtBRL(t.negociosVgvTotal)}</td></tr>
        <tr><td>Venda Líquida Realizada</td><td class="mono bold" style="text-align:right">${fmtBRL(t.vgvRealizado)}</td></tr>
        <tr><td>Taxa de Positivação</td><td class="mono bold" style="text-align:right;color:var(--violet)">${t.taxaPositivacao.toFixed(2)}%</td></tr>
        <tr><td>Captações Realizadas</td><td class="mono bold" style="text-align:right">${t.captacoesCount}</td></tr>
        <tr><td>Captações Exclusivas</td><td class="mono bold" style="text-align:right">${t.captExclusivas}</td></tr>
        <tr><td>Taxa de Exclusividade</td><td class="mono bold" style="text-align:right;color:var(--rose)">${taxaExclusividade.toFixed(1)}%</td></tr>
        <tr><td>Horas em Treinamento</td><td class="mono bold" style="text-align:right;color:var(--cyan)">${t.treinamentoHoras}h</td></tr>
        <tr><td>Investimento Total</td><td class="mono bold" style="text-align:right;color:var(--amber)">${fmtBRL(t.investimentoTotal)}</td></tr>
      </tbody>
    </table>
  </div>
  ${footerBar}
</div>

<!-- PAGE 4 — NEGÓCIOS + ORIGENS -->
${data.negocios.length > 0 ? `
<div class="report-page">
  ${headerBar('04')}
  <div class="page-content">
    <div class="page-title">Negócios Levantados</div>
    <div class="page-subtitle">${t.negociosCount} oportunidades · VGV Total: ${fmtBRL(t.negociosVgvTotal)} · ${monthName} ${year}</div>
    <div class="sep-gradient"></div>

    <table class="data-table">
      <thead><tr><th>#</th><th>Oportunidade</th><th>Origem</th><th style="text-align:right">VGV Bruto</th></tr></thead>
      <tbody>${negociosRows}${negociosTotalRow}</tbody>
    </table>

    ${Object.keys(origensMap).length > 0 ? `
    <div class="section-title" style="margin-top:32px">
      <span class="accent-dot" style="background:var(--violet)"></span>
      Distribuição por Origem
    </div>
    <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:16px;align-items:center">
      <div style="display:flex;justify-content:center"><canvas id="chartDoughnut" width="240" height="240"></canvas></div>
      <div><canvas id="chartOrigensBars" height="200"></canvas></div>
    </div>` : ''}
  </div>
  ${footerBar}
</div>` : ''}

<!-- PAGE 5 — TREINAMENTOS + INVESTIMENTOS -->
${(data.treinamentos.length > 0 || data.investimentos.length > 0) ? `
<div class="report-page">
  ${headerBar(data.negocios.length > 0 ? '05' : '04')}
  <div class="page-content">
    <div class="page-title">Treinamentos e Investimentos</div>
    <div class="page-subtitle">${monthName} ${year}</div>
    <div class="sep-gradient"></div>

    ${data.treinamentos.length > 0 ? `
    ${Object.keys(locaisMap).length > 0 ? `
    <div class="section-title">
      <span class="accent-dot" style="background:var(--cyan)"></span>
      Horas por Local de Treinamento
    </div>
    <div class="chart-wrap"><canvas id="chartTreinamentos" height="180"></canvas></div>` : ''}

    <div class="section-title" style="margin-top:20px">
      <span class="accent-dot" style="background:var(--violet)"></span>
      Participações Registradas · ${t.treinamentoHoras}h total
    </div>
    <table class="data-table">
      <thead><tr><th>Atividade</th><th>Local</th><th style="text-align:right">Horas</th></tr></thead>
      <tbody>${treinamentosRows}${treinamentosTotalRow}</tbody>
    </table>` : ''}

    ${data.investimentos.length > 0 ? `
    <div class="section-title" style="margin-top:32px">
      <span class="accent-dot" style="background:var(--amber)"></span>
      Investimentos no Mês
    </div>
    ${Object.keys(tiposMap).length > 0 ? `<div class="chart-wrap"><canvas id="chartInvestimentos" height="180"></canvas></div>` : ''}

    <table class="data-table">
      <thead><tr><th>Tipo</th><th>Descrição</th><th style="text-align:right">Valor</th><th style="text-align:right">Leads</th></tr></thead>
      <tbody>${investimentosRows}${investimentosTotalRow}</tbody>
    </table>` : ''}
  </div>
  ${footerBar}
</div>` : ''}

<!-- PAGE 6 — COMENTÁRIO + ASSINATURAS -->
<div class="report-page">
  ${headerBar(
    data.negocios.length > 0 && (data.treinamentos.length > 0 || data.investimentos.length > 0)
      ? '06'
      : data.negocios.length > 0 || (data.treinamentos.length > 0 || data.investimentos.length > 0)
        ? '05'
        : '04'
  )}
  <div class="page-content">
    ${data.comentario ? `
    <div class="page-title">Comentário do Gestor</div>
    <div class="sep-gradient"></div>
    <div class="comment-box">
      <div class="comment-author">${monthName} ${year} — ${escapeHtml(data.comentario.gestorName)}</div>
      <div class="comment-text">${escapeHtml(data.comentario.texto)}</div>
    </div>` : `
    <div class="page-title">Encerramento</div>
    <div class="sep-gradient"></div>
    <div class="comment-box">
      <div class="comment-author">${monthName} ${year}</div>
      <div class="comment-text">Sem comentários do gestor para este mês.</div>
    </div>`}

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">${escapeHtml(data.broker.name)}</div>
        <div class="sig-role">Corretor(a) — Equipe ${escapeHtml(data.broker.team)}</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">${data.comentario ? escapeHtml(data.comentario.gestorName) : 'Gestor'}</div>
        <div class="sig-role">HAUT Imobiliária</div>
      </div>
    </div>
  </div>
  ${footerBar}
</div>

</div>

<!-- FAB Buttons (hidden when in iframe) -->
<div class="fab-group no-print" id="fabGroup" style="display:none">
  <button class="fab-btn accent" onclick="downloadPDF()" title="Baixar PDF">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  </button>
  <button class="fab-btn dark" onclick="window.print()" title="Imprimir">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
  </button>
</div>

<script>
const MONTHS = ${JSON.stringify(MONTHS_SHORT)};
const META_MENSAL = ${JSON.stringify(data.monthlyMeta.map(v => v / 1000000))};
const REAL_MENSAL = ${JSON.stringify(data.monthlyVgv.map(v => v / 1000000))};

const COLORS = {
  emerald: '#10b981', emeraldLight: '#6ee7b7', emerald20: 'rgba(16,185,129,0.15)',
  cyan: '#06b6d4', cyanLight: '#67e8f9', cyan20: 'rgba(6,182,212,0.15)',
  violet: '#8b5cf6', violetLight: '#c4b5fd', violet20: 'rgba(139,92,246,0.15)',
  amber: '#f59e0b', amberLight: '#fcd34d', amber20: 'rgba(245,158,11,0.15)',
  rose: '#f43f5e', roseLight: '#fda4af', rose20: 'rgba(244,63,94,0.15)',
  blue: '#3b82f6', blueLight: '#93c5fd',
  orange: '#f97316', pink: '#ec4899', teal: '#14b8a6',
  g200: '#e4e4e7', g300: '#d4d4d8', g400: '#a1a1aa',
};

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = '#71717a';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 12;
Chart.defaults.plugins.legend.labels.padding = 16;

// Gauges
function drawGauge(id, pct, color) {
  const el = document.getElementById(id);
  if (!el) return;
  const val = Math.min(pct, 100);
  new Chart(el, {
    type: 'doughnut',
    data: { datasets: [{ data: [val, Math.max(0, 100 - val)], backgroundColor: [color, '#f4f4f5'], borderWidth: 0, borderRadius: 6 }] },
    options: { responsive: false, circumference: 180, rotation: -90, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: { animateRotate: true, duration: 1500 } }
  });
}

drawGauge('gauge1', Math.min(${pctMensal}, 100), COLORS.emerald);
drawGauge('gauge2', ${pctAnual}, COLORS.violet);
drawGauge('gauge3', ${t.taxaPositivacao} * 10, COLORS.cyan);

// Meta vs Realizado Bar Chart
new Chart(document.getElementById('chartMetaReal'), {
  type: 'bar',
  data: {
    labels: MONTHS,
    datasets: [
      { label: 'Meta', data: META_MENSAL, backgroundColor: '#e4e4e7', borderRadius: 6, borderSkipped: false, barPercentage: 0.7, categoryPercentage: 0.65 },
      { label: 'Realizado', data: REAL_MENSAL, backgroundColor: REAL_MENSAL.map((r, i) => {
          if (r === 0) return '#d4d4d8';
          return r >= META_MENSAL[i] ? COLORS.emerald : r >= META_MENSAL[i]*0.7 ? COLORS.amber : COLORS.rose;
        }), borderRadius: 6, borderSkipped: false, barPercentage: 0.7, categoryPercentage: 0.65 }
    ]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', align: 'end' }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': R$ ' + ctx.raw.toFixed(2) + 'M' }, backgroundColor: '#09090b', padding: 12, cornerRadius: 8 } },
    scales: { y: { beginAtZero: true, grid: { color: '#f4f4f5' }, border: { display: false }, ticks: { callback: v => 'R$ ' + v.toFixed(0) + 'M', font: {size: 10} } }, x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: '600' } } } }
  }
});

// Accumulated Line Chart
(() => {
  const acumMeta = [], acumReal = [];
  let sm = 0, sr = 0;
  META_MENSAL.forEach((m, i) => { sm += m; sr += REAL_MENSAL[i]; acumMeta.push(sm); acumReal.push(sr); });

  new Chart(document.getElementById('chartAcumulado'), {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [
        { label: 'Meta Acumulada', data: acumMeta, borderColor: COLORS.violetLight, backgroundColor: COLORS.violet20, borderWidth: 2, borderDash: [6, 4], pointBackgroundColor: COLORS.violet, pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4, fill: true, tension: 0.3 },
        { label: 'Realizado Acumulado', data: acumReal, borderColor: COLORS.emerald, backgroundColor: COLORS.emerald20, borderWidth: 3, pointBackgroundColor: COLORS.emerald, pointBorderColor: '#fff', pointBorderWidth: 2.5, pointRadius: 5, fill: true, tension: 0.3 },
        { label: 'Meta Anual (${fmtCompact(meta.vgv_anual)})', data: Array(12).fill(${meta.vgv_anual / 1000000}), borderColor: COLORS.rose, borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, fill: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', align: 'end' }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': R$ ' + ctx.raw.toFixed(2) + 'M' }, backgroundColor: '#09090b', padding: 12, cornerRadius: 8 } },
      scales: { y: { beginAtZero: true, grid: { color: '#f4f4f5' }, border: { display: false }, ticks: { callback: v => v.toFixed(0) + 'M', font: {size: 10} } }, x: { grid: { display: false }, border: { display: false }, ticks: { font: {size: 10, weight:'600'} } } }
    }
  });
})();

// Radar Chart
(() => {
  const labels = ['VGV Realizado', 'Negócios', 'Captações', 'Treinamento', 'Investimento', 'Positivação'];
  const metas = [${meta.vgv_mensal || 1}, ${meta.negocios || 1}, ${meta.captacoes || 1}, ${meta.treinamento || 1}, ${meta.investimento || 1}, ${meta.positivacao || 1}];
  const reais = [${t.vgvRealizado}, ${t.negociosVgvTotal}, ${t.captacoesCount}, ${t.treinamentoHoras}, ${t.investimentoTotal}, ${t.taxaPositivacao}];
  const scores = reais.map((r, i) => Math.min((r / metas[i]) * 100, 150));

  new Chart(document.getElementById('chartRadar'), {
    type: 'radar',
    data: {
      labels,
      datasets: [
        { label: 'Meta (100%)', data: [100,100,100,100,100,100], borderColor: COLORS.g300, backgroundColor: 'rgba(212,212,216,0.1)', borderWidth: 2, borderDash: [5,5], pointRadius: 0 },
        { label: 'Realizado', data: scores, borderColor: COLORS.emerald, backgroundColor: COLORS.emerald20, borderWidth: 3, pointBackgroundColor: scores.map(s => s >= 100 ? COLORS.emerald : s >= 70 ? COLORS.amber : COLORS.rose), pointBorderColor: '#fff', pointBorderWidth: 2.5, pointRadius: 6, pointHoverRadius: 8 }
      ]
    },
    options: {
      responsive: false,
      plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw.toFixed(0) + '%' }, backgroundColor: '#09090b', padding: 12, cornerRadius: 8 } },
      scales: { r: { beginAtZero: true, max: 150, ticks: { stepSize: 25, font: {size: 8}, backdropColor: 'transparent', color: '#a1a1aa', callback: v => v + '%' }, grid: { color: '#e4e4e7' }, angleLines: { color: '#e4e4e7' }, pointLabels: { font: {size: 11, weight: '600'}, color: '#3f3f46' } } }
    }
  });
})();

// Doughnut + Origens Bars
${Object.keys(origensMap).length > 0 ? `
(() => {
  const origens = ${JSON.stringify(origensMap)};
  const labels = Object.keys(origens);
  const values = Object.values(origens).map(v => v / 1000000);
  const colors = [COLORS.violet, COLORS.emerald, COLORS.amber, COLORS.cyan, COLORS.rose];

  const doughnutEl = document.getElementById('chartDoughnut');
  if (doughnutEl) {
    new Chart(doughnutEl, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderWidth: 3, borderColor: '#ffffff', borderRadius: 4, hoverOffset: 8 }] },
      options: { responsive: false, cutout: '62%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.label + ': R$ ' + ctx.raw.toFixed(1) + 'M' }, backgroundColor: '#09090b', padding: 12, cornerRadius: 8 } } }
    });
  }

  const barsEl = document.getElementById('chartOrigensBars');
  if (barsEl) {
    new Chart(barsEl, {
      type: 'bar',
      data: { labels, datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderRadius: 6, borderSkipped: false, barPercentage: 0.6 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => 'R$ ' + ctx.raw.toFixed(1) + 'M' }, backgroundColor: '#09090b', padding: 12, cornerRadius: 8 } }, scales: { x: { grid: {color:'#f4f4f5'}, border:{display:false}, ticks:{callback:v=>'R$ '+v.toFixed(0)+'M',font:{size:9}} }, y: { grid: {display:false}, border:{display:false}, ticks:{font:{size:10,weight:'600'}} } } }
    });
  }
})();` : ''}

// Treinamentos Chart
${Object.keys(locaisMap).length > 0 ? `
(() => {
  const locais = ${JSON.stringify(locaisMap)};
  const labels = Object.keys(locais);
  const values = Object.values(locais);
  const colors = [COLORS.violet, COLORS.cyan, COLORS.emerald, COLORS.amber, COLORS.rose, COLORS.blue];

  const el = document.getElementById('chartTreinamentos');
  if (el) {
    new Chart(el, {
      type: 'bar',
      data: { labels, datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderRadius: 6, borderSkipped: false, barPercentage: 0.55 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw + 'h' }, backgroundColor: '#09090b', padding: 12, cornerRadius: 8 } }, scales: { x: { grid:{color:'#f4f4f5'}, border:{display:false}, ticks:{callback:v=>v+'h',font:{size:9}} }, y: { grid:{display:false}, border:{display:false}, ticks:{font:{size:10,weight:'600'}} } } }
    });
  }
})();` : ''}

// Investimentos Chart
${Object.keys(tiposMap).length > 0 ? `
(() => {
  const tipos = ${JSON.stringify(tiposMap)};
  const labels = Object.keys(tipos);
  const values = Object.values(tipos);
  const colors = [COLORS.cyan, COLORS.violet, COLORS.amber, COLORS.emerald, COLORS.rose, COLORS.blue, COLORS.orange];

  const el = document.getElementById('chartInvestimentos');
  if (el) {
    new Chart(el, {
      type: 'bar',
      data: { labels, datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderRadius: 6, borderSkipped: false, barPercentage: 0.55 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => 'R$ ' + ctx.raw.toLocaleString('pt-BR') }, backgroundColor: '#09090b', padding: 12, cornerRadius: 8 } }, scales: { x: { grid:{color:'#f4f4f5'}, border:{display:false}, ticks:{callback:v=>'R$ '+v,font:{size:9}} }, y: { grid:{display:false}, border:{display:false}, ticks:{font:{size:10,weight:'600'}} } } }
    });
  }
})();` : ''}

// Show FABs only when not in iframe
if (window === window.top) {
  document.getElementById('fabGroup').style.display = 'flex';
}

// Convert all Chart.js canvases to static images so html2pdf can capture them
function freezeCanvases() {
  document.querySelectorAll('canvas').forEach(function(canvas) {
    try {
      var img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.width = canvas.style.width || (canvas.width + 'px');
      img.style.height = canvas.style.height || (canvas.height + 'px');
      img.style.maxWidth = '100%';
      img.className = canvas.className;
      canvas.parentNode.replaceChild(img, canvas);
    } catch(e) {}
  });
}

// Download PDF
function downloadPDF() {
  var fab = document.querySelector('.fab-group');
  if (fab) fab.style.display = 'none';

  // Freeze canvases to images before capture
  freezeCanvases();

  var wrapper = document.querySelector('.report-wrapper');
  // Remove wrapper padding/margin temporarily for clean capture
  var origStyle = wrapper.style.cssText;
  wrapper.style.padding = '0';
  wrapper.style.maxWidth = 'none';

  // Remove margin-bottom and border-radius from pages for clean A4
  var pages = document.querySelectorAll('.report-page');
  pages.forEach(function(p) {
    p.style.marginBottom = '0';
    p.style.borderRadius = '0';
    p.style.boxShadow = 'none';
  });

  html2pdf().set({
    margin: 0,
    filename: '${data.broker.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}_${monthName}_${year}.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css'], avoid: ['tr', '.kpi-card', '.kpi-light', '.gauge-card'] }
  }).from(wrapper).save().then(function() {
    if (fab) fab.style.display = 'flex';
  });
}
<\/script>
</body>
</html>`;
}
