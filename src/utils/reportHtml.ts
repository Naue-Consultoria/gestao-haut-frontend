import { ReportData } from '../services/reports.service';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function fmtBRL(v: number): string {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  const metaAteMes = data.monthlyMeta.slice(0, month + 1).reduce((acc, v) => acc + (v || 0), 0);
  const realizadoMesesPrevios = data.monthlyVgv.slice(0, month).reduce((acc, v) => acc + (v || 0), 0);
  const metaAcumulada = Math.max(0, metaAteMes - realizadoMesesPrevios);
  const pctMensal = metaAcumulada > 0 ? (t.vgvRealizado / metaAcumulada * 100) : 0;
  const resultadoMensal = t.vgvRealizado - metaAcumulada;
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

  const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABssAAAKMCAYAAACtjIaNAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFxEAABcRAcom8z8AADZuSURBVHhe7d3deRRJmjbgiErOpbUAxgI0FqC2oLUWoLFgNRY0bcEyFoywYBkLRlgwYMGCBR+cExnfQadm6Wh+JFW8Vflz39fVJ29xFReNMquIJ5+IlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4itwN+U2u9SCmdtfMHuM45v2+HwMPVWk9rrZc559P2tXt6n3O+bocAazSO41WH+2ZKv92HP+acr3POH9vXANak1vokpXTZzh/gJud80w6Bh+u4buP6BACEZV8zfeH6n3b+QJ9SSk8sJkE/nz9/fjsMw9N2/kC/5pxftEOAtai1PimlvO5430wppVRK+TAMw0XO+W37GsAaTEHZ25TSSfvaA/1kQR76qLWep5T+2c738CcPOrMm0zUCbMNb2UMfwrKvqLW+SCn90s734B9F0FGttbazPbzJOfsSCaxWrfU6pfS8nXfiHgqsVsBivIe0oBPrNvBtnR8wBmaulPJuGIZzgdn+du0AAIB1qLWeppQu2nlHz2qtPbY/AgAA9lRrPROUwbZM17x/l3cgLAMAWK+rjtuHfctVOwAAAI6iyxnFAFskLAMAWKGpVXaIIOv5dK4PAAAAwCIJywAA1ukQrbJbzuABAAAAFktYBgCwMgdsld3SLgMAAAAWS1gGALA+h2yV3dIuAwAAABZJWAYAsCJHaJXd0i4DAAAAFklYBgCwLsdold3SLgMAAAAWR1gGALAux2iV3dIuAwAAABZHWAYAsBK11ssjtspSSimN43jMsA4AAADg3oRlAAArUUo5+jaIu93ucjo3DQAAAGARhGUAACtQa70chuFxOz+CkyNvBQkAAABwL8IyAIAVmEOr7AtX2mUAAADAUgjLAAAWbkatslvaZQAAAMBiCMsAABZuZq2yW9plAAAAwCIIywAAFmyGrbJb2mUAAADAIgjLAAAWbKatslvaZQAAAMDsCcsAABaq1nox01bZrZNa62U7BAAA+ss536SUPrVzYNU+pZTet0PuL7cDUqq1vkgp/dLO9/DT9GEFdFBrre1sD29yzuftEGAJaq03KaVn7XxOSikfHj169KSdA8xdrfU8pfTPdr6HX3POc24Dw2JYt4Fvq7U+SSl5YG0lSilR2+6/SSm5763D65zz23YIXdRaX9S+LMRDR+0FtidfDIBFqrWetze0GfOPdWBxAu6zgjLoxLoNsCW11pv2prWPUsrr9vcAbMMIALBUi1l0nfm5agAAAHPW9UHv3W533c4AYRkAwOJMTz/PevvFLw3D8Fi7DAAAYBY+tgNAWAYAsESLa2pplwEAAABzJSwDAFiQpbXKbmmXAQAAAHMlLAMAWJbFNrS0ywAAAIA5EpYBACxErfVsia2yW9plAAAAwBwJywAAluOqHSxNKWXxfwYAAABgXYRlAAALUGt9klJ63s47ezOO499SSp/aF3oZhuHpdO4aAAAAwCwIywAAliH0vK9xHP+Rcz4fhuEqpXTRvt5Z6J8FAAAA4D6EZQAAM3eIVtlut/v39og555uU0pvf/4qunmmXAQAAAHMhLAMAmL/oJtarnPP7Zhb9e0a/PwAAAMCdCMsAAGbsEK2yrwVX2mUAAADAVgjLAADm7Q9BVmdfa5Xdiv69o98fAAAA4IeEZQAAM3WsVtkt7TIAAABgC4RlAAAzNY7jVTvr7HutslvfDNN6OMCfEQAAAOC7hGUAADNUaz3d7XaX7byzHwZh0e2y3W7389SgAwAAADgKYRkAwDxdpZRO2mFHd2mV3fphqLan6PcHAAAA+CZhGQDAzNRaT6ewLNKdA6rodllK6bl2GQAAAHAswjIAgPmZU6vs1p3DtQeKfn8AAACArxKWAQDMyNxaZbdyzjellA/tvCPtMgAAAOAohGUAAPMS3Sp784BWWUoppWEY7h2y3VP0+wMAAAD8gbAMAGAm5toqu5VzvtYuAwAAANZGWAYAMB+HaJXdtMP70C4DAAAA1kZYBgAwE6WUy3bW2d5B1IHaZaftEAAAACCKsAwAYAZqrZfDMDxu5x3t3Sq7dYB2WfRWlAAAAAD/JiwDAJiBUkp0ANXt/Q/QLrvSLgMAAAAORVgGAHBkS2qV3Qpul51olwEAAACHIiwDADiyJbXKbmmXAQAAAGshLAMAOKIltspuaZcBAAAAayAsAwA4oiW2ym5plwEAAABrICwDADiSJbfKbmmXAQAAAEsnLAMAOJJSSnQQFBlkpaRdBgAAAKyAsAwA4AhqrefDMDxt5x2Ft8puHaBddtEOAQAAAHoRlgEAHEdkwJQO8P7/Ft0uO8C5bgAAAMCGCcsAAA6s1nqeUnrWzjs6WKvsVmS7bBiGx7XWy3YOAAAA0IOwDADg8MKCpUn0+/+BdhkAAACwVMIyAIADWmOr7JZ2GQAAALBEwjIAgMMKC5Qm0e//TTnn65TSp3bei3YZAAAAEEFYBgBwIGtulX3hZTvoRbsMAAAAiCAsAwA4nOhmVPT738VL7TIAAABgSYRlAAAHUGt9EtkqK6W8m0GrLOWcPx6gXXbRzgEAAAAeSlgGAHAYoY2oYRjCAqoHCG2XpZSu2gEAAADAQwnLAACCTa2y5+28l1LKh5zzdTs/luh2WUrp2XT+GwAAAMDehGUAAPGiW2Wh7/9A0e2yOf6ZAQAAgAUSlgEABNpaq+yWdhkAAACwFMIyAIBYoQ2ombbKbmmXAQAAALMnLAMACLLVVtkt7TIAAABgCYRlAABxQptPM2+V3dIuAwAAAGZNWAYAEGDrrbJb2mUAAADA3AnLAABiXLaDnhbSKrsV3S4L/X8NAAAArJuwDACgs1rraUrpqp33spRW2a0DtMueT00+AAAAgHsTlgEA9HeVUjpph70srFV2K7pdtsT/JwAAAMAMCMsAADrSKvs67TIAAABgroRlAAB9aZV9m3YZAAAAMDvCMgCATrTKvk+7DAAAAJgjYRkAQD9aZT8WGZYl7TIAAADgvoRlAAAdaJXdzdQue9XOO9IuAwAAAO5FWAYA0MeFVtmdhf5ZxnEMCy0BAACA9RGWAQB0UEoJC4DW0iq7lXN+H9ku2+12l1PTDwAAAOCHhGUAAHuqtV4Ow/C4nfeyslbZrcg/00nklpgAAADAugjLAAD2pFV2f9HtspTSlXYZAAAAcBfCMgCAPUS3yna73ct2tiJhIaN2GQAAAHBXwjIAgD1EtspSSp/W2Cq7pV0GAAAAzIGwDADggaJbZSmllznnj+1wZSLDRu0yAAAA4IeEZQAADxTdKksprXkLxpS0ywAAAIAZEJYBADyAVllXkaGjdhkAAADwXcIyAICHuWwHHW2iVXYrul1WSon8uwIAAAAWTlgGAHBPtdbzlNKzdt7Rllplt8LaZcMwPK61CswAAACArxKWAQDcX1iws7VW2a0DtMsi/84AAACABROWAQDcg1ZZqLBAS7sMAAAA+BZhGQDA/YQFOlttld3SLgMAAACOQVgGAHBHWmUHERZoaZcBAAAAXyMsAwC4u7AgZ+utslvaZQAAAMChCcsAAO5Aq+ygwgIt7TIAAACgJSwDALibyIBFq+wLU7vsTTvvpZRy1c4AAACA7RKWAQD8QK31SUrpeTvvSKvsjyLbZU+npiAAAACAsAwA4A7Cghutsq/LOd9EtsuC/04BAACABRGWAQB8h1bZUUUGWs+0ywAAAIAkLAMA+KHIwEar7Du0ywAAAIBDEJYBAHyDVtksRAZa2mUAAACAsAwA4DsigxqtsjvQLgMAAACiCcsAAL5Cq2xWIgMt7TIAAADYOGEZAMDXRQY0KaV03Q74Ou0yAAAAIJKwDACgUWs9TSldtPOOXuWc37dDvisy0Ho2NQkBAACADRKWAQD80VVK6aQddhQZ/KySdhkAAAAQRVgGAPCFqVV21c470ip7uMhA67l2GQAAAGyTsAwA4Pe0ymZKuwwAAACIICwDAJholS1CZKClXQYAAAAbJCwDAPg/WmUzp10GAAAA9CYsAwDQKluayEBLuwwAAAA2RlgGAPAbrbKF0C4DAAAAehKWAQD8RqtsWSIDLe0yAAAA2BBhGQCwebXWS62yZck535RSPrTzji7bAQAAALBOwjIAYPNKKZFhllZZkGEYIv/erqZz7AAAAICVE5YBAJtWa70chuFxO+8oMtDZtJzzdWC77CR4a04AAABgJoRlAMCmaZUtm3YZAAAAsC9hGQCwWVply6ddBgAAAOxLWAYAbJZW2TpolwEAAAD7EJYBAJukVbYe2mUAAADAPoRlAMAmaZWti3YZAAAA8FDCMgBgc2qt51pl63KAdtlFOwQAAADWQVgGAGxRZJilVXYkke2y4CYiAAAAcETCMgBgU2qt5ymlZ+28I6HKkUS2y4ZheFxrvWznAAAAwPIJywCArYkMs95olR2XdhkAAABwX8IyAGAztMrWT7sMAAAAuC9hGQCwJZFh1puc80075PC0ywAAAID7EJYBAJugVbYd2mUAAADAfQjLAICtiAyztMpmRrsMAAAAuCthGQCwerXWM62ybdEuAwAAAO5KWAYAbMFVO+hIq2ymIttlKSVhGQAAAKyEsAwAWLVa65OU0vN23lFkIMMecs7XKaVP7byTZ9M5eAAAAMDCCcsAgLWLDLO0yubvZTvoKPJnCwAAADgQYRkAsFpaZUxhmXYZAAAA8E3CMgBgzSLDLK2yBcg5f9QuAwAAAL5HWAYArJJWGV/QLgMAAAC+SVgGAKxVZJilVbYg2mUAAADA9wjLAIDV0SrjK7TLAAAAgK8SlgEAqzOO41U760irbIEO0C67bAcAAADAMgjLAIBVqbWe7na7yOBCq2y5Ittlz6dGIwAAALAwwjIAYG2uUkon7bATrbIFO0C7TJAKAAAACyQsAwBWo9Z6OoVlUYQhy6ddBgAAAPyOsAwAWBOtMr5LuwwAAABoCcsAgFXQKuMetMsAAACAfxOWAQBrEdYqK6W80ypbD+0yAAAA4EvCMgBg8aJbZcMwRAYrHId2GQAAAJCSsAwAWINa62Vgq+xDzvm6nbNs2mUAAADALWEZALB44zhGtsqEHusV2S67mBqPAAAAwMwJywCARau1Xg7D8Lid96BVtm7B7bKTyK1BAQAAgH6EZQDAopVSwppfWmWbEBWWpZTSlXYZAAAAzJ+wDABYLK0y9jW1y1618060ywAAAGABhGUAwGJpldFJ5N+1dhkAAADMnLAMAFgkrTJ6yTm/1y4DAACA7RKWAQCLpFVGZ5F/59plAAAAMGPCMgBgcbTK6E27DAAAALZLWAYALE4pJSx40CrbtLC/+1LKZTsDAAAA5kFYBgAsSq31fBiGp+28B62ybYtslw3D8LjWKjADAACAGRKWAQBLE9b+0Soj8ucr8pw9AAAA4OGEZQDAYtRaz1NKz9p5D1plJO0yAAAA2CRhGQCwJGHNHK0yvhD2s6BdBgAAAPMjLAMAFkGrjEPRLgMAAIBtEZYBAEsR1sjRKuMrwn4mtMsAAABgXoRlAMDsaZVxaNplAAAAsB3CMgBgCcKaOFplfEfYz4Z2GQAAAMyHsAwAmLVa6xOtMo7hAO2y83YOAAAAHJ6wDACYu7AGzm63e9nOoBH28xf83gAAAMAdCcsAgNmaWmXP23knn7TK+JHIdllK6Zl2GQAAAByfsAwAmLPI5s3LnPPHdghfEflzGPneAAAAwB0IywCAWYpulaWUbMHInUztsjftvBPtMgAAADgyYRkAMFeRjRutMu4r8ucx8r0BAACAHxCWAQCzo1XG3OScb7TLAAAAYJ2EZQDAHEU2bbTKeKjIn8vI9wYAAAC+Q1gGAMxKrfVUq4w5OkC77KwdAgAAAPGEZQDA3Fy1g460ythXZAMs8mcfAAAA+AZhGQAwG1OrLCow0Cpjb8HtsufTeX0AAADAAQnLAIA5uUopnbTDTrTK6CWyXRb53gAAAMBXCMsAgFnQKmMptMsAAABgXYRlAMBcaJWxJJENsMj3BgAAABrCMgDg6LTKWBrtMgAAAFgPYRkAMAdaZSxRZAMs8r0BAACALwjLAICj0ipjqbTLAAAAYB2EZQDAsV1olbFgkQ2wy3YAAAAA9CcsAwCOqpQSFTZolREuuF12NTUvAQAAgEDCMgDgaGqtl8MwPG7nnWiVcShRge9J4BalAAAAwERYBgAcjVYZa6BdBgAAAMsmLAMAjkKrjJWJCn61ywAAACCYsAwAOIrAVllKKV23A4iUc74ppXxo551olwEAAEAgYRkAcHDBrbJXOef37RCiDcMQFQBrlwEAAEAgYRkAcHDBrbLI94Zvyjlfa5cBAADA8gjLAICDqrVeaJWxVpHtslrrZTsEAAAA9icsAwAOLXI7uaigAu4ksl02jmPktQMAAACbJSwDAA6m1nqeUnrWzjvRKmMWotplwzA81i4DAACA/oRlAMAhhYQIk8j3hjuLbJcFn/cHAAAAmyQsAwAOQquMLdEuAwAAgOUQlgEAhxISHkwi3xvuTbsMAAAAlkNYBgCE0ypji7TLAAAAYBmEZQDAIYSEBpPI94YH0y4DAACAZRCWAQChtMrYMu0yAAAAmD9hGQAQLXJBPySIgF4i22XB1xYAAABshrAMAAhTa32SUnrezjvRKmMRotplKaVnU3MTAAAA2IOwDACIFBUSpOD3hm6C22WuAwAAANiTsAwACKFVBv9HuwwAAADmS1gGAESJCgdS8HtDd9plAAAAMF/CMgCgO60y+CPtMgAAAJgnYRkAECEqFEjB7w1hcs7XKaVP7bwT1wUAAAA8kLAMAOhKqwy+62U76ES7DAAAAB5IWAYA9BbZcIl8bziEl1HtsnEcr9oZAAAA8GPCMgCgm1rraUrpop138karjKXLOX+Mapftdrufp2YnAAAAcA/CMgCgp6uU0kk77ESrjLUIa5e5TgAAAOD+hGUAQBdTqyxqG7g3OeebdghLFNkuSyk91y4DAACA+xGWAQC9aJXB3WmXAQAAwEwIywCAvWmVwf1olwEAAMB8CMsAgB60yuD+tMsAAABgBoRlAMBetMrgYbTLAAAAYB6EZQDAvrTK4OG0ywAAAODIhGUAwF5KKZftrBOtMlYvuF12MTU/AQAAgO8QlgEAD1ZrvRyG4XE770Qrhq2IapedBG6RCgAAAKshLAMAHqyUEhVoaZWxGcHtsivtMgAAAPg+YRkA8CBaZdCVdhkAAAAcibAMAHgQrTLoR7sMAAAAjkdYBgDcm1YZhNAuAwAAgCMQlgEA96ZVBv1plwEAAMBxCMsAgHvRKoNQUWGZdhkAAAB8g7AMALgXrTKIM7XLXrXzToRlAAAA8BXCMgDgzmqt51plEC7qWjiptV62QwAAANg6YRkAcB9Ri/haZTDJOb+PapcFNkMBAABgsYRlAMCd1FrPU0rP2nknFvDh90KuiWEYHmuXAQAAwO8JywCAuwpZvC+lvNMqg9/TLgMAAIDDEZYBAD8U2SobhuFlOwNSigqotcsAAADg94RlAMBdhCzal1I+5Jyv2zmgXQYAAACHIiwDAL4ruFVmwR6+L+Qa0S4DAACA/yMsAwB+JGSxXqsMfky7DAAAAOIJywCAb6q1nmmVwdGFXCtTu+y8nQMAAMDWCMsAgO+5agc9aJXB3UW2y6KCOAAAAFgSYRkA8FW11icppeftvAetMri3qGvmmXYZAAAAWycsAwC+JWRxXqsM7k+7DAAAAOIIywCAP9Aqg1mKuna0ywAAANg0YRkA8DUhi/JaZfBw2mUAAAAQQ1gGAPyOVhnMWtQ1pF0GAADAZgnLAIBWyGK8VhnsT7sMAAAA+hOWAQD/plUGixB1LT2rtZ61QwAAAFg7YRkA8KXLdtCDVhn0M7XL3rTzTq7aAQAAAKydsAwASOm3Vtlp1EK5Vhl0F3VNPZ8apgAAALAZwjIA4NZVSumkHe5Lqwz6yznfBLbLooI4AAAAmCVhGQCgVQbLFHVtaZcBAACwKcIyACBplcHyaJfBsozjeNbOgIdxPQEAvQnLAGDjtMpg0aKuMe0y6Gy32522M+BhAq6nt+0AANgWYRkAoFUGC6VdBqE+tgNgnXLOrncA2DhhGQBsWGSrbLfbvWxnQIioUEu7jE3LOWuaAADARgjLAGDDaq2XEa2ylNInrTI4jMh22TiOIWE6bNSzdgA8WLfrqZTyoZ0BANsjLAOADQtcCH9pOxs4qJB22W63u5waqACwSsMwvG9nAMD2CMsAYKNqrZfDMDxu5x18SinZghEOKLBddhK1VSssQSnlXTvbh/AZ9uc6AgAiCMsAYKNKKSFNFK0yOJqoa/rKwiRbNQxD78+zs3YA3Fvv6+imHQAA2yMsA4AN0iqD9dEug/7GcewdlgmeAQBghoRlALBBWmWwWlHXtnYZm7Tb7d62sz31bsTAFp23gz1plgEAwjIA2BqtMlgv7TKYt3Echc6wJ9cRABBBWAYAG6NVBqsXdY1rl7FFXRsnu91Oswz21Ps6mh40AQA2TlgGABuiVQbrF9kuq7VetkPgXrou8sNGdbuOSikf2hkAsE3CMgDYkFJK1DZqWmUwLyHtsnEco+4hMEsBjZMTDU14uOn6OWnnDzUMw/t2BgBsk7AMADai1no+DMPTdt6BVhnMTM75JuJp+WEYHmuXsTUB11K3VgxsUO/rp3cgDgAslLAMALYjpGmiVQbzNAxDyDUfeO4hzFLv5kmttfdiP2xGwPXT9foGAJZLWAYAG1BrPU8pPWvnHWiVwUzlnK8DGjHaZWzOOI5v29k+cs69F/thMwKun67XNwCwXMIyANiGqCaIVhnMmHYZ7G+323VdTC+lnLcz4G5KKV3Dspxz1+sbAFguYRkArJxWGWyXdhl00XWbtun6OW3nwPfVWk87n7/7ph0AANslLAOA9YtqgGiVwQJol8F+cs437awD7TK4v66tst5brAIAyyYsA4AV0yoDtMtgf6WUd+1sH+M4Csvg/rpeN723WAUAlk1YBgArNo7jVTvrRKsMFiSwXRZ1j4FZGYah66L69DALcD+9r5uI1igAsFDCMgBYqVrrk91u93M770CrDBYmsF321KI/G9F1UX26dpxbBvfTbbeEUsqHnHPX8wgBgGUTlgHAeoU0SbTKYJmi2mWB9xqYk67NsomgGe6o1nrRzvYxDEPXABwAWD5hGQCsUK31SUrpeTvv5LodAPMX1S5LKT3TLmPtcs5vp2Z1T10X/2HNAs75E5YBAL8jLAOAdYpqeryyZQ0sl3YZPNw4jl0X10spvRf/YbV6N8uEZQBAS1gGACsT3CqzIA4Lpl0GD5dz7rq4PgzD41rrWTsHfq/W+mQYhsft/KGcVwYAfI2wDADWJyrQ0iqDFdAug4fpHZal39pql+0M+L3erbKc8+t2BgAgLAOAFdEqA35EuwweJuf8tve10zsEgDXqHSrvdrvuwTcAsHzCMgBYl6hAS6sMViSqXTaO41U7gzUZhqHrIrutGOH7pi0Yn7bzPXzSLAMAvkZYBgArUWs91SoD7iKqXbbb7X6eGq6wVl3DshTQmoE16d2+HMex+zUMAKyDsAwA1iOq0aFVBisU1S4TrrNy3RspvcMAWJPeYfJut+t+DQMA6yAsA4AVmFplUWGZhW9YoZzzdUrpUzvv4Ll2GWuVc/44juM/2vk+pq0YnfcHjVrrWectGFNE4A0ArIOwDADW4SqldNIOO9Aqg3V72Q46EbKzWjnniG3curZnYA16t8rGcfxHzvljOwcASMKygzltB8DDeFId/kirDNjDS+0yuJ+cc0Qz5fn0eQ5Mdrtd17DMFowAwPcIyw6glPLCYgHsr9Z6Oo5j1BPwsGRaZcCDTE/YR322CttZpZzz+1LKu3a+r1pr12AAlmy6Hnp+v/00bT8MAPBVuR2QUq31RUrpl3YOrNKbnLMzIlis6Sn0950XE279SVgG6+c+Avc3juNVzvm/2/k+SikfHj165CFL+O2z6Sal9Kyd7+FVzlkgDSxSwFr1T0HbSsOiaZYBwLJplQF70S6D+4toqAzD8LjWetHOYWtqrWedg7KUUup+zQIA6yIsA4Blc1YZ0EPk2WXOYWJ1cs4fx3H8RzvvIOpzHZak63VQSvmgQQEA/IiwDAAWKuAsh1taZbAxwe2yroueMBe73e51O+vg2dSqgU2aznt/3s73sdvtoj7fAIAVEZYBwEKVUqLaX1HvC8xbVLvsSruMNZq2Ygy5ZtoBbEj3c8Uitk0FANZHWAYAC1RrvRyG4XE770CrDDYqsF12YvGftRrHMWIR/vnUroFNmR6s6P158Wr6fAMA+C5hGQAskFYZEES7DO4hcHs3n8ds0VXAFuMRgTYAsELCMgBYGK0yIIp2GdzP9Ln5pp13oF3GpkS0ykop73LON+0cAOBrhGUAsDBaZUAw7TK4n6jmStT7whx1b5UNwxDx8AcAsFLCMgBYkMBW2RutMiBpl8G95ZyvSykf2nkHz2qt5+0Q1mZqUXb9fCilfMg5C5wBgDsTlgHAgmiVAQcS1i5rB7AGzi6DvbwIaJUJygCAexGWAcBC1FovAltlznMA/i2yXVZrvWyHsHRTgyUiYH7mmmHNplbZ83a+p09Bn2EAwIoJywBgOaIaGZ5aB74mpF0W2JCFowkMmFMp5YXz/lixiAbYy+maBAC4M2EZACzAdGbJs3begVYZ8FVRi//DMDzWlGGlIhb909Qqj3pgBo6m1noR8P1WqwwAeBBhGQAsQ1QTI+p9gXUIWXDULmONcs7vU0qv2nknv9Raz9ohLFWt9bSUEvEZo1UGADyIsAwAZk6rDDiWacGx++K/dhkrFhYEl1JCmmtwJFcBZ/FqlQEADyYsA4D5i1p4i3pfYF1C7hXaZaxRZLtsGIan4zjajpHFm1qSv7TzDrTKAIAHE5YBwIxplQHHFrX4r13Gir2YGi7d5Zxf1FqftHNYkoiWZCnlg1YZALAPYRkAzFtU8yLqfYF1CrlnaJexRlPAHLVof1JKed0OYSlqrS+GYXjazvc1DMMLrTIAYB/CMgCYKa0yYC6C22UX7RxW4GVUu2wYhqe1VkEzixO1/WIp5V3OuXtbDQBg82qtL2pHnz9/fltrPW1/H+D+aq3X7TW2J4EBsxXw837rvP29AH6k1vqkvZl04rOYVRrH8ar9Ye/srP09Ya5qrafT2kgE322BVeu9Vu2+CV+nWXYAwzBc2Q4AuvEULZswnUfyvJ13oFUGPEhUuyyl9Mw/2Fmj3W73cjpHKUQp5bWHMlmKcRxDtl8cx/EfvtsCAD0Iy4BFmRbqYAuiguGo9wW2IeoeEvW+cFTDMFy2s16GYXg8jqOt55i9WuvFbrf7r3bewafdbnfVDgEAHkJYBgAzo1UGzJV2GdzP9Ln7pp33stvtfnZ+GXM2fa+NCnVfepgSAOhFWAYA8xO16BX1vsC2RN1Lot4Xji2sXTb5pdZ60Q7h2Gqtp6WU1ymlk/a1fZVSPuScfW4AAN0IywBgRrTKgLnTLoP7ma6ZX9t5Z9e11rN2CEf2MuKcshS8xSkAsE3CMgCYl6gnZKPeF9imqHtK1PvCUeWcX5RSPrTzjk5KKde11tP2BTiGcRyvgh4AS+M4/s1DYABAb8IyAJgJrTJgKbTL4P6imzDDMDwtpfi85+hqrRc55/9u5z2UUj7sdjsPVgAA3QnLAGAmpidwI1hQACJE3VtCAwU4lpzzzTiOf2vnPQ3D8LTWet3O4VCm7UDDfgaHYbjMOX9s5wAA+xKWAcAM1FpPd7td9wXiUso7rTIgQmC77PnUtIXV2e120dsxpukaCgsr4Fume/dNSumkfa0H2y8CAJGEZQAwD1cRCwvDMLxsZwAdRbXLot4Xjirn/DF6O8bJ81qr64iDqbWellJeR3yfTbZfBAAOQFgGAEdWaz2dwrKuSikfcs6eLAfCaJfB/U3NmF/beYBfaq2HCObYuCkouxmG4Wn7Wi/DMFzYfhEAiCQsA4Dji2qVefoWOISoe03U+8LR5ZxflFLetfMAfxeYEekQQVlK6dec89t2CADQk7AMAI5IqwxYuqld9qadd6BdxqpN2zF+aucBBGaEOFBQ9ibn7OEJACCcsAwAjkurDFiDqHtO1PvC0U1Nme4PzHyDwIyuDhSUfUopXbRDAIAIwjIAOBKtMmAtpjOYtMvgnqbP64hz/75GYEYXBwrKUkrJOWUAwMEIywDgeLTKgDUJufeM49j9oQKYmasDnV+WBGbs61BBWa31r9ODGAAAByEsA4AjKaV0X6zSKgOOJapdttvtLqcmLqxSzvnjMAwXBzq/LE2BWUi4zbodKihLKb3a7XYv2yEAQCRhGQAcQa31chiGx+18X1plwJFF3INOIrashTnJOb8/8NlMv9RaPVzDndVazw4RlE0tS/d8AODghGUAcASllO4LylplwLFFtctSSlfaZaxdzvmm1vrXdh7oucCMu6i1nqWUwoOylNKnYRicUwYAHIWwDAAOTKsMWLmIe5F2GZswbT33qp0Hev758+e3wmi+ZTrj7ibinN2vOJ9algAABycsA4AD0yoD1ky7DPaTc74Muoa+ahiGp6WUm6k9BP82nW339wMFZX/JOb9thwAAhyIsA4AD0ioDNiLinqRdxpZcTGc3HcS0vd5NrfW8fY3tqbWellJep5R+aV+LUGv9q4e+AIBjE5YBwAFplQFboF0G+8k5fxyG4byU8qF9LdBJSumf4zgKpTes1npWSrnZ7XY/t68FeTVtPwoAcFTCMgA4EK0yYGMi7k3aZWzGFJhdpJQ+ta9Fyjn/dynltWB6e27PJ5uahofwatp2FADg6IRlAHAgWmXAlkS1y0opFlbZjOkMp/NDB2a73e7nUspb55htwxfbLh7qfLKUUnojKAMA5kRYBgAHUGs91yoDNqj7PWoYhsdT+wE24ViB2fS95V+2ZVy3Wut5KeXtAbddTNN5fBftHADgmIRlAHAY3ReMtcqAuQtsl3W/p8KcHSswS9O2jLXWm1rrk/Y1lq3W+iKl9M+IB7q+pZTybhiG85zzx/Y1AIBjEpYBQLBa63lK6Vk735dWGbAQ3e9V2mVs0TEDs+l7zFsts3WotZ5//vz5fUrpl/a1SIIyAGDOhGUAEK/7QrFWGbAU2mXQz5EDsxMts2WbziZ7eeg2WRKUAQALICwDgEBRrbLdbveynQHMWPdgS7uMrTpyYJam7zX/O23hx0JM98v3u93uv9rXognKAIAlEJYBQKyIhaRPWmXAkuScb0opH9r5vrTL2KoZBGYppfTL58+f39daL9oXmI9a61mt9Sal9PeU0kn7erRxHP8hKAMAlkBYBgBBolplKaWXFhyApYk4Z1G7jC2bQ2A2beX3P9PWjGft6xxPrfVJrfU6pfSvoO+jd/FqGIYL31sBgCUQlgFAnO4Lw9OCmC0YgcXJOV8Htcuu2hlsxRSYPSmlvGtfO7BnKaV/1VqvnWd2XLXW02mLzLcppeft6wf0KufsYQYAYDGEZQAQYFooiniKV6sMWKygdtnTqckLm5Rz/jgMw3lK6U372hE8n84zE5od2Bch2fuU0i/H2HLxC38RlAEASyMsA4AY3ReEtcqApYtqlwXdc2Excs4fc87nKaVX7WtHIjQ7kJmFZJ+moMzZugDA4gjLAKCzaVEoYtsbrTJg8SLaZSmlZ9plkFLO+bLW+td2fkRfhmau0Y6+OJPs/80gJEtTUHYuKAMAlkpYBgD9RSwEa5UBq6BdBrF2u93LlNJ/Tt8d5uJ5Sumfnz9/fltrtT3fHmqtF7XWm5TS/wY9nHVv05l5T6Yz9AAAFklYBgAdaZUB/Jh2GcTKOb9OKZ1PIcZsDMPwNKX091rrx1LKy1rrWftr+KOpRfbi8+fP71NK/xN0Lu5DvRqG4dz3VABg6YRlANBXxAKwVhmwKtplEC/n/HYYhjmdY/alk91u918ppX99/vz57TiOV842+73pLLLLL1pkvwzD8Lj9dcdUa/1rzvlSUAYArIGwDAA60SoDuDvtMoiXc/6Yc75MKf1lZtsy/tswDE9zzv+dUvrfrQdntwFZKeX1dBbZ32fWIkvpt20XP6SU/jxt+QkAsArCMgDoJ2LhV6sMWCXtMjicnPP1HLdlbLXB2bRV46oD8Frr2RQQ3twGZLvd7uf2183FOI7/GIbhzPlkAMDaCMsAoAOtMoD7C2yXbbKVAt9zuy3jOI5/a1+bo2EYnk5bNf5zOuPs9RQqLfqcs+n8scta6/V0Btm/poBwdg2yxqda61+HYbjw3RQAWCNhGQD0cdkOOtAqA1ZNuwwOK+f8cRiGq5TST0HXXpST3W738xQq/av+5mZqnl3ONUCbgrHzWuuLUsrrWuvH6fyxv6eUns/tDLJvmRqJ57ZdBADWLLcDUqq1vkgp/dLO9/BTzvmmHQIPU2ut7WwPb3LOq97ahXi11tOU0vuU0kn72p5+zTlb8AVWrdZ6OS0c9/annPP7dgj8ptZ6Oo7ji6m9tQqllHc55/e73e7t9N3sfUrpffS94IutIs/HcTzd7XZnKaWzgO+Gx+D7KMCRWauGwxCWfYUbEMybsIy5CfjcSFOr7IltboAt+Pz58/uAhsWrnHNE6xdWpdZ6Xkq5DrgG5+ZTSunLc7Ye8m/0J9N/qZRyOgzD0/YXrEUp5d0wDJfOJgM4voA1B2vVwN3UWl9M2zr0YiEeOmovsD35csBeaq2ntdaP7Q9WB57gBTZj2kYtgrPL4A6m7zO9/x3McvkeCjAjAZ/R1qrhK5xZBgD7uQrYYsdZZcCmOLsMjivn/HHaau/PKaU37etsxptpC1v3TgBgc4RlAPBA01llV+28g5e2XwS2ZhiGiMXZ59plcHc557fTFuV/CQqwmaHp7/o/c87n0ee7AQDMlbAMAB5Oqwygk5zz9XQP7C0ihINVyzlfD8NwllL6Nei6ZB4+pZR+HYbhLOf8un0RAGBLhGUA8ABaZQAhIh4WeD7ds4F7+GJrxicppVft6yzeq5TSWc75he+eAADCMgB4kFrrZUCrLKWUrtsBwIa8DGqxRDzcAJswhWaXKaU/Cc1W4U1K6c8550tbLgIA/B9hGQA8wDiOEQuvryxaAFs2tRsi2mVX2mWwn5zze6HZor1JKf00nUv2tn0RAGDrhGUAcE+11sthGB638w6cqwMQ0y470S6DPoRmi/NlSHbTvggAwG+EZQBwT6WUiFBLqwxAuwwWownNfg0IudnPq2m7RSEZAMAdCMsA4B60ygAOQrsMFmIKzV6klJ6klP5SSnnX/hoO5tM4jn9LKf1pOpPMdosAAHckLAOAe9AqA4inXQbLk3P+mHO+fvTo0VlK6SdbNB7OFFD+JaX0ZBiGK98rAQDuT1gGAHekVQZwUNplsFA555tpi8b/0DYL8+l2q8VHjx6d5ZyvpwcNAAB4AGEZANyRVhnA4WiXwfI1bbM/pZR+LaV8aH8ddzeO4z9uW2S2WgQA6EdYBgB3oFUGcBRR7bKLdgjEuj3b7NGjR09SSn+egjONszv4IiD7j2EYLrTIAAD6E5YBwN1ctoMOtMoAviOqXRbUFAbuKOf8dgrOzlJKf6q1/nUKhPjNJwEZAMBhCcsA4AdqrecppWftvAOLtQA/1r1dNgzD41prxEMQwD3lnN/vdruXUyCUU0o/pZR+TSm9aX/tmk0tu19TSj/lnE8FZAAAhyUsA4AfGMfxqp11oFUGcAeB7bKIezuwp5zzTc75Rc75/MvwbGpadQ3Oj+zNbTiWUvqPR48enU1/7pv2FwIAEE9YBgA/sNvtTttZB1plAHfXvV2WUoq4twOd3YZnU9PqNKX0py8DtAWce/bpi2DsLymlP+ffnN+GY9pjAADHl9sBKdVaL1JK/9POH+hTSumJL7/Qz+fPn98Ow/C0nT/QrzlnoQXfNW3V9fd2/kCfUkqXOefX7QsAfFut9byUcj0Mw+P2tQf6S875uh0Cy1RrfZJSelJrPcs5n47jeLbb7U5LKU863je+5XbLyPfTf29TSh+1xADoYfqMe5tSOmlfu69SyrthGM6tVcMfCcu+YTqf5ryd30et9WPO+bVttqCvWutprfVyerJ0H+8tknFXtwsw7fwB3vpSCvBw0/f0fb33HR225xvf5354T5n+bf+2GftOB8DB1FpPU0pn7fy+PMgBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABASiml/w9SSQZkuz4qBwAAAABJRU5ErkJggg==';

  const headerBar = (pageNum: string) => `
    <div class="page-header-bar">
      <div class="header-logo"><img src="${logoBase64}" alt="HAUT" class="header-logo-img"></div>
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
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
  body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .report-wrapper { padding: 0 !important; max-width: none !important; }
  .report-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; page-break-after: always; page-break-inside: avoid; }
  .report-page:last-child { page-break-after: auto; }
  .no-print { display: none !important; }
  .page-header-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .kpi-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .data-table thead th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page-footer-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
.report-wrapper { max-width: 900px; margin: 0 auto; padding: 32px 16px; }
.report-page { background: var(--white); border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08); margin-bottom: 32px; overflow: hidden; }
.page-header-bar { background: var(--black); padding: 14px 40px; display: flex; align-items: center; justify-content: space-between; position: relative; }
.page-header-bar::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--emerald), var(--cyan), var(--violet), var(--amber), var(--rose)); }
.header-logo { display: flex; align-items: center; }
.header-logo-img { height: 22px; width: auto; }
.header-doc-title { font-size: 11px; color: var(--g400); letter-spacing: 2px; font-weight: 500; }
.header-page-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--emerald); font-weight: 700; }
.page-content { padding: 28px 36px; }
.profile-hero { display: flex; align-items: center; gap: 24px; margin-bottom: 20px; }
.profile-avatar { width: 90px; height: 90px; border-radius: 50%; background: var(--emerald); display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 800; color: white; flex-shrink: 0; border: 4px solid var(--white); box-shadow: 0 0 0 3px var(--emerald), 0 8px 24px rgba(16,185,129,0.2); overflow: hidden; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
.profile-info { flex: 1; }
.profile-tag { font-size: 10px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--g400); margin-bottom: 6px; }
.profile-name { font-size: 30px; font-weight: 800; letter-spacing: -1px; line-height: 1.1; color: var(--black); }
.profile-meta { font-size: 14px; color: var(--g500); margin-top: 6px; font-weight: 400; }
.profile-meta .dot { width: 4px; height: 4px; background: var(--g300); border-radius: 50%; display: inline-block; margin: 0 8px; }
.sep { height: 1px; background: var(--g200); margin: 24px 0; }
.sep-gradient { height: 2px; background: linear-gradient(90deg, var(--emerald), var(--cyan), var(--violet), var(--amber)); margin: 12px 0; border-radius: 1px; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
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
.kpi-row-light { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.kpi-light { padding: 14px; border-radius: 12px; border: 1px solid var(--g200); background: var(--white); }
.kpi-light .kpi-label { color: var(--g500); }
.kpi-light .kpi-value { color: var(--black); font-size: 24px; }
.kpi-light .kpi-value.emerald { color: var(--emerald); }
.kpi-light .kpi-value.rose { color: var(--rose); }
.kpi-light .kpi-value.violet { color: var(--violet); }
.kpi-light .kpi-value.cyan { color: var(--cyan); }
.gauges-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 20px 0; }
.gauge-card { text-align: center; padding: 16px 16px 12px; border-radius: 12px; border: 1px solid var(--g100); background: var(--white); }
.gauge-canvas-wrap { position: relative; width: 140px; height: 80px; margin: 0 auto; overflow: hidden; }
.gauge-center-text { text-align: center; margin-top: 4px; }
.gauge-pct { font-size: 22px; font-weight: 800; letter-spacing: -1px; line-height: 1; }
.gauge-label-text { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: var(--g400); text-transform: uppercase; margin-top: 6px; white-space: nowrap; }
.section-title { font-size: 11px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: var(--g400); margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
.section-title .accent-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.page-title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
.page-subtitle { font-size: 13px; color: var(--g500); margin-bottom: 8px; }
.chart-wrap { position: relative; margin: 12px 0; padding: 16px; background: var(--white); border: 1px solid var(--g100); border-radius: 12px; }
.chart-wrap canvas { max-height: 240px; }
.data-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
.data-table thead th { background: var(--black); color: var(--white); font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 10px 12px; text-align: left; white-space: nowrap; }
.data-table thead th:first-child { border-radius: 8px 0 0 0; }
.data-table thead th:last-child { border-radius: 0 8px 0 0; }
.data-table tbody td { padding: 8px 12px; border-bottom: 1px solid var(--g100); color: var(--g700); font-size: 12px; }
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
.comment-box { border-left: 4px solid var(--emerald); background: linear-gradient(135deg, var(--emerald-50) 0%, var(--white) 100%); border-radius: 0 14px 14px 0; padding: 20px 24px; margin: 14px 0; }
.comment-author { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--emerald-dark); margin-bottom: 12px; }
.comment-text { font-size: 14px; line-height: 1.8; color: var(--g700); font-style: italic; }
.signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--g200); }
.sig-block { text-align: center; }
.sig-line { border-bottom: 1px solid var(--g300); margin-bottom: 12px; padding-bottom: 48px; }
.sig-name { font-weight: 700; font-size: 14px; }
.sig-role { font-size: 12px; color: var(--g500); margin-top: 2px; }
.radar-container { display: flex; justify-content: center; margin: 8px 0; }
.radar-container canvas { max-width: 340px !important; max-height: 340px !important; }
.action-item { display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--g100); align-items: flex-start; }
.action-item:last-child { border-bottom: none; }
.action-num { width: 32px; height: 32px; background: var(--black); color: var(--white); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.action-content { flex: 1; }
.action-text { font-size: 13px; color: var(--g700); line-height: 1.5; }
.action-footer { display: flex; gap: 12px; margin-top: 6px; align-items: center; }
.action-deadline { font-size: 11px; font-weight: 600; color: var(--g500); font-family: 'JetBrains Mono', monospace; }
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
      ${data.isParceria && data.memberAvatars && data.memberAvatars.length > 1 ? `
      <div style="display:flex;gap:0;">
        ${data.memberAvatars.map((m, i) => `<div class="profile-avatar" style="margin-left:${i > 0 ? '-20px' : '0'};z-index:${10 - i};border:4px solid var(--white);">${m.avatar_url ? `<img src="${escapeHtml(m.avatar_url)}" alt="${escapeHtml(m.name)}">` : escapeHtml(m.name.charAt(0))}</div>`).join('')}
      </div>` : `
      <div class="profile-avatar">${data.broker.avatar_url ? `<img src="${escapeHtml(data.broker.avatar_url)}" alt="${escapeHtml(data.broker.name)}">` : escapeHtml(data.broker.name.charAt(0))}</div>`}
      <div class="profile-info">
        <div class="profile-tag">${data.isParceria ? 'Relatório de Performance — Parceria' : 'Relatório de Performance Individual'}</div>
        <div class="profile-name">${escapeHtml(data.broker.name.toUpperCase())}</div>
        <div class="profile-meta">
          <span>Equipe ${escapeHtml(data.broker.team)}</span>
          <span class="dot"></span>
          <span>${data.isParceria ? 'Corretores(as)' : 'Corretor(a)'}</span>
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
        <div class="kpi-sub">Meta acum.: ${fmtCompact(metaAcumulada)}</div>
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
        <div class="gauge-canvas-wrap"><canvas id="gauge1" width="140" height="80"></canvas></div>
        <div class="gauge-center-text"><div class="gauge-pct" style="color:var(--emerald)">${pctMensal.toFixed(1)}%</div></div>
        <div class="gauge-label-text">Resultado do Mês</div>
      </div>
      <div class="gauge-card">
        <div class="gauge-canvas-wrap"><canvas id="gauge2" width="140" height="80"></canvas></div>
        <div class="gauge-center-text"><div class="gauge-pct" style="color:var(--violet)">${pctAnual.toFixed(1)}%</div></div>
        <div class="gauge-label-text">Meta Anual</div>
      </div>
      <div class="gauge-card">
        <div class="gauge-canvas-wrap"><canvas id="gauge3" width="140" height="80"></canvas></div>
        <div class="gauge-center-text"><div class="gauge-pct" style="color:var(--cyan)">${t.taxaPositivacao.toFixed(1)}%</div></div>
        <div class="gauge-label-text">Taxa Positivação</div>
      </div>
    </div>

    <div class="section-title">
      <span class="accent-dot" style="background:var(--emerald)"></span>
      Meta × Realizado Mensal
    </div>
    <div class="chart-wrap">
      <canvas id="chartMetaReal" height="190"></canvas>
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
      <canvas id="chartAcumulado" height="190"></canvas>
    </div>

    <div style="margin-top:32px">
      <div class="page-title">Radar de Performance</div>
      <div class="page-subtitle">Comparativo entre realizado e meta em cada dimensão — ${monthName} ${year}</div>
      <div class="sep-gradient"></div>
    </div>
    <div class="radar-container">
      <canvas id="chartRadar" width="340" height="340"></canvas>
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
        <div class="kpi-value">${fmtCompact(metaAcumulada)}</div>
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

    ${data.planosAcao && data.planosAcao.length > 0 ? `
    <div class="page-title" style="margin-top:40px">Plano de Ação</div>
    <div class="page-subtitle">Próximas atividades e metas para os próximos meses</div>
    <div class="sep-gradient"></div>
    <div>
      ${data.planosAcao.map((p, i) => {
        const statusLabel = p.status === 'CONCLUIDO' ? 'Concluído' : p.status === 'EM_ANDAMENTO' ? 'Em andamento' : 'Planejado';
        const statusClass = p.status === 'CONCLUIDO' ? 'tag-cyan' : p.status === 'EM_ANDAMENTO' ? 'tag-emerald' : 'tag-violet';
        return `<div class="action-item">
          <div class="action-num">${String(i + 1).padStart(2, '0')}</div>
          <div class="action-content">
            <div class="action-text">${escapeHtml(p.texto)}</div>
            <div class="action-footer">
              <span class="action-deadline">${escapeHtml(p.prazo)}</span>
              <span class="tag ${statusClass}">${statusLabel}</span>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}

  </div>
  ${footerBar}
</div>

</div>

<!-- FAB Buttons (hidden when in iframe) -->
<div class="fab-group no-print" id="fabGroup" style="display:none">
  <button class="fab-btn accent" onclick="downloadPDF()" title="Baixar PDF">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  </button>
  <button class="fab-btn dark" onclick="printReport()" title="Imprimir">
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
    options: { responsive: false, circumference: 180, rotation: -90, cutout: '72%', plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: false }
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

// Convert all Chart.js canvases to static images for PDF capture
function freezeCanvases() {
  document.querySelectorAll('canvas').forEach(function(canvas) {
    try {
      var img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.width = canvas.width + 'px';
      img.style.height = canvas.height + 'px';
      img.style.maxWidth = '100%';
      canvas.parentNode.replaceChild(img, canvas);
    } catch(e) {}
  });
}

// Download PDF — renders each page individually with html2canvas + jsPDF
function downloadPDF() {
  var fab = document.querySelector('.fab-group');
  if (fab) fab.style.display = 'none';

  freezeCanvases();

  var wrapper = document.querySelector('.report-wrapper');
  var origWrapperStyle = wrapper.style.cssText;
  var origBodyBg = document.body.style.background;
  document.body.style.background = 'white';
  wrapper.style.padding = '0';
  wrapper.style.maxWidth = 'none';
  wrapper.style.width = '900px';
  wrapper.style.background = 'white';

  var pages = Array.from(document.querySelectorAll('.report-page'));
  var origPageStyles = pages.map(function(p) { return p.style.cssText; });
  pages.forEach(function(p) {
    p.style.marginBottom = '0';
    p.style.borderRadius = '0';
    p.style.boxShadow = 'none';
  });

  // Render each page to canvas sequentially, then build PDF
  var canvases = [];
  var chain = Promise.resolve();
  pages.forEach(function(page) {
    chain = chain.then(function() {
      return html2canvas(page, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 900,
        windowWidth: 900,
        backgroundColor: '#ffffff'
      });
    }).then(function(canvas) {
      canvases.push(canvas);
    });
  });

  chain.then(function() {
    var jsPDF = jspdf.jsPDF;
    var pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    var pdfW = 210;
    var pdfH = 297;

    canvases.forEach(function(canvas, i) {
      if (i > 0) pdf.addPage();
      var imgData = canvas.toDataURL('image/jpeg', 0.95);
      var imgH = (canvas.height * pdfW) / canvas.width;
      // Fit to single page — scale down if slightly over A4
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, Math.min(imgH, pdfH));
    });

    var filename = '${data.broker.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}_${monthName}_${year}.pdf';
    pdf.save(filename);

    document.body.style.background = origBodyBg;
    wrapper.style.cssText = origWrapperStyle;
    pages.forEach(function(p, i) { p.style.cssText = origPageStyles[i]; });
    if (fab) fab.style.display = 'flex';
  }).catch(function(err) {
    console.error('PDF generation error:', err);
    alert('Erro ao gerar PDF: ' + err.message);
    document.body.style.background = origBodyBg;
    wrapper.style.cssText = origWrapperStyle;
    pages.forEach(function(p, i) { p.style.cssText = origPageStyles[i]; });
    if (fab) fab.style.display = 'flex';
  });
}

// Print report — freeze canvases first so charts render in print
function printReport() {
  freezeCanvases();
  window.print();
}
<\/script>
</body>
</html>`;
}
