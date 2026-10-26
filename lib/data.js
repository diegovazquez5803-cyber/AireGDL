// Rangos válidos por contaminante (se descartan valores fuera de rango).
export const RANGES = { PM10: 600, 'PM2.5': 500, O3: 500, NO2: 500, SO2: 500, CO: 100 };
export const UNITS = { PM10: 'µg/m³', 'PM2.5': 'µg/m³', O3: 'ppb', NO2: 'ppb', SO2: 'ppb', CO: 'ppm' };

export function normPol(s) {
  const k = String(s).toUpperCase().replace(/[\s_\-]/g, '');
  if (k === 'PM25') return 'PM2.5';
  if (k === 'OZONO') return 'O3';
  return k;
}

function parseDate(s) {
  const d = new Date(String(s).trim().replace(' ', 'T'));
  if (!isNaN(d)) return d.getTime();
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0)).getTime();
  return NaN;
}

// Lee un CSV en formato largo (fecha, estacion, contaminante, valor)
// o ancho (fecha, estacion, PM10, PM2.5, O3...).
export function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error('El archivo está vacío o no tiene filas de datos.');
  const d = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
  const split = (l) => l.split(d).map((c) => c.trim().replace(/^"|"$/g, ''));
  const head = split(lines[0]).map((h) => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  const find = (...ks) => head.findIndex((h) => ks.some((k) => h.includes(k)));
  const iT = find('fecha', 'date', 'time');
  const iS = find('estacion', 'station', 'sitio', 'site');
  const iP = find('contaminante', 'parametro', 'pollutant', 'param');
  const iV = find('valor', 'value', 'concentracion');
  if (iT < 0) throw new Error('No se encontró una columna de fecha (fecha, date o datetime).');
  const wide = head.map((h, i) => (i !== iT && i !== iS && normPol(h) in RANGES ? i : -1)).filter((i) => i >= 0);
  if (!(iP >= 0 && iV >= 0) && !wide.length)
    throw new Error('Formato no reconocido. Usa columnas fecha, estacion, contaminante, valor (o una columna por contaminante).');
  const num = (x) => parseFloat(String(x).replace(',', '.'));
  const rows = [];
  for (const line of lines.slice(1)) {
    const c = split(line);
    const t = parseDate(c[iT]);
    const station = iS >= 0 ? c[iS] || 'Sin nombre' : 'Estación única';
    if (iP >= 0 && iV >= 0) rows.push({ t, station, pol: normPol(c[iP]), v: num(c[iV]) });
    else for (const i of wide) rows.push({ t, station, pol: normPol(head[i]), v: num(c[i]) });
  }
  return rows;
}

// Limpieza: fechas inválidas, faltantes, duplicados y valores fuera de rango.
export function cleanRows(raw) {
  const rep = { total: raw.length, fechas: 0, faltantes: 0, duplicados: 0, fueraRango: 0 };
  const seen = new Set();
  const rows = [];
  for (const r of raw) {
    if (!Number.isFinite(r.t)) { rep.fechas++; continue; }
    if (!Number.isFinite(r.v)) { rep.faltantes++; continue; }
    const k = `${r.t}|${r.station}|${r.pol}`;
    if (seen.has(k)) { rep.duplicados++; continue; }
    seen.add(k);
    if (r.v < 0 || r.v > (RANGES[r.pol] ?? 1000)) { rep.fueraRango++; continue; }
    rows.push(r);
  }
  rep.validos = rows.length;
  return { rows, rep };
}

export function avgBy(rows, keyFn) {
  const m = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    const a = m.get(k) || { s: 0, n: 0 };
    a.s += r.v; a.n++; m.set(k, a);
  }
  return [...m].map(([key, a]) => ({ key, avg: +(a.s / a.n).toFixed(1), n: a.n })).sort((x, y) => (x.key > y.key ? 1 : -1));
}

const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const monthKey = (t) => dayKey(t).slice(0, 7);
export const fmtHour = (t) => { const d = new Date(t); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:00`; };

// Pendiente (unidades por día) de una serie diaria, por mínimos cuadrados.
export function slope(daily) {
  const n = daily.length;
  if (n < 3) return null;
  const xm = (n - 1) / 2, ym = daily.reduce((s, d) => s + d.avg, 0) / n;
  let num = 0, den = 0;
  daily.forEach((d, i) => { num += (i - xm) * (d.avg - ym); den += (i - xm) ** 2; });
  return num / den;
}

function solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      b[r] -= f * b[i];
    }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
    x[i] = s / A[i][i];
  }
  return x;
}

// Regresión lineal múltiple: tendencia + ciclo diario (seno/coseno de 24 h y 12 h).
// Se entrena con los últimos 14 días y predice las 24 horas siguientes.
export function forecast24(rows) {
  const H = 3600000;
  const hourly = avgBy(rows, (r) => Math.floor(r.t / H)).map((h) => ({ h: h.key, v: h.avg }));
  if (hourly.length < 48) return null;
  const last = hourly[hourly.length - 1].h;
  const train = hourly.filter((p) => p.h > last - 336);
  const feat = (h) => {
    const w = (2 * Math.PI * new Date(h * H).getHours()) / 24;
    return [1, (h - last) / 168, Math.sin(w), Math.cos(w), Math.sin(2 * w), Math.cos(2 * w)];
  };
  const k = 6;
  const A = Array.from({ length: k }, () => Array(k).fill(0)), b = Array(k).fill(0);
  for (const p of train) {
    const f = feat(p.h);
    for (let i = 0; i < k; i++) { b[i] += f[i] * p.v; for (let j = 0; j < k; j++) A[i][j] += f[i] * f[j]; }
  }
  for (let i = 1; i < k; i++) A[i][i] += 1e-3;
  const beta = solve(A, b);
  const pred = (h) => Math.max(0, feat(h).reduce((s, x, i) => s + x * beta[i], 0));
  const mean = train.reduce((s, p) => s + p.v, 0) / train.length;
  let sse = 0, sst = 0, sae = 0;
  for (const p of train) { const e = p.v - pred(p.h); sse += e * e; sae += Math.abs(e); sst += (p.v - mean) ** 2; }
  return {
    history: hourly.slice(-72).map((p) => ({ t: p.h * H, obs: p.v })),
    future: Array.from({ length: 24 }, (_, i) => ({ t: (last + i + 1) * H, pred: +pred(last + i + 1).toFixed(1) })),
    r2: sst ? 1 - sse / sst : 0,
    mae: sae / train.length,
  };
}

// Datos sintéticos de demostración (con errores intencionales para mostrar la limpieza).
export const DEMO_STATIONS = ['Atemajac', 'Centro', 'Las Águilas', 'Miravalle', 'Oblatos', 'Santa Fe'];

export function demoData() {
  let s = 42;
  const rnd = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const end = new Date(); end.setHours(0, 0, 0, 0);
  const rows = [];
  DEMO_STATIONS.forEach((station, si) => {
    const bias = 0.8 + si * 0.08;
    for (let h = 60 * 24; h > 0; h--) {
      const t = end.getTime() - h * 3600000, d = new Date(t), hr = d.getHours();
      const rush = Math.exp(-((hr - 8) ** 2) / 6) + 0.8 * Math.exp(-((hr - 20) ** 2) / 8);
      const dry = 1 + 0.25 * Math.sin((2 * Math.PI * (d.getMonth() - 1)) / 12);
      const pm10 = (38 + 28 * rush) * bias * dry + rnd() * 14;
      const vals = { PM10: pm10, 'PM2.5': pm10 * 0.45 + rnd() * 4, O3: (18 + 55 * Math.exp(-((hr - 15) ** 2) / 14)) * dry + rnd() * 8 };
      for (const pol in vals) {
        const x = rnd();
        let v = +vals[pol].toFixed(1);
        if (x < 0.01) v = NaN; else if (x < 0.012) v = -9999; else if (x < 0.014) v = 9999;
        rows.push({ t, station, pol, v });
        if (rnd() < 0.003) rows.push({ t, station, pol, v });
      }
    }
  });
  return rows;
}

export function toCSV(rows) {
  const lines = rows.map((r) => `${dayKey(r.t)} ${pad(new Date(r.t).getHours())}:00,${r.station},${r.pol},${Number.isNaN(r.v) ? '' : r.v}`);
  return ['fecha,estacion,contaminante,valor', ...lines].join('\n');
}
