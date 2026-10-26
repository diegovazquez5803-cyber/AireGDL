"use client";
import { useMemo, useState } from "react";

const STATIONS = { Atemajac: 1.0, Centro: 1.15, Miravalle: 1.3, Oblatos: 1.1, Tlaquepaque: 1.2, Vallarte: 0.9 };
const POLL = {
  PM10: { unit: "µg/m³", base: 55, amp: 18, peak: 9, limit: 70 },
  "PM2.5": { unit: "µg/m³", base: 28, amp: 10, peak: 9, limit: 41 },
  O3: { unit: "ppb", base: 45, amp: 30, peak: 15, limit: 65 },
};
const WINDOWS = [24, 48, 72];
const HIST = 72;

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

// Datos simulados (deterministas) + regresión armónica: y = a + b·sen(2πh/24) + c·cos(2πh/24)
function simulate(station, pol) {
  const cfg = POLL[pol], k = STATIONS[station], r = rng(hash(station + pol));
  const hist = Array.from({ length: HIST }, (_, i) =>
    Math.max(2, (cfg.base + cfg.amp * Math.cos((2 * Math.PI * ((i % 24) - cfg.peak)) / 24)) * k + (r() - 0.5) * cfg.amp * 0.8)
  );
  const a = hist.reduce((s, v) => s + v, 0) / HIST;
  const b = (2 / HIST) * hist.reduce((s, v, i) => s + v * Math.sin((2 * Math.PI * i) / 24), 0);
  const c = (2 / HIST) * hist.reduce((s, v, i) => s + v * Math.cos((2 * Math.PI * i) / 24), 0);
  const f = (i) => a + b * Math.sin((2 * Math.PI * i) / 24) + c * Math.cos((2 * Math.PI * i) / 24);
  const ssRes = hist.reduce((s, v, i) => s + (v - f(i)) ** 2, 0);
  const ssTot = hist.reduce((s, v) => s + (v - a) ** 2, 0);
  const pred = Array.from({ length: 24 }, (_, i) => f(HIST + i));
  return { cfg, hist, pred, sd: Math.sqrt(ssRes / HIST), r2: 1 - ssRes / ssTot };
}

const W = 820, H = 300, P = { l: 46, r: 14, t: 14, b: 30 };

export default function Dashboard() {
  const [station, setStation] = useState("Atemajac");
  const [pol, setPol] = useState("PM2.5");
  const [win, setWin] = useState(48);
  const d = useMemo(() => simulate(station, pol), [station, pol]);
  const { cfg, pred, sd } = d;
  const hs = d.hist.slice(HIST - win);
  const T = win + 24;
  const ymax = Math.max(...hs, ...pred.map((v) => v + sd), cfg.limit) * 1.1;
  const x = (i) => P.l + (i / (T - 1)) * (W - P.l - P.r);
  const y = (v) => H - P.b - (v / ymax) * (H - P.t - P.b);
  const path = (arr, off) => arr.map((v, i) => `${i ? "L" : "M"}${x(i + off).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const band = [
    ...pred.map((v, i) => `${x(win + i).toFixed(1)},${y(v + sd).toFixed(1)}`),
    ...pred.map((v, i) => `${x(win + 23 - i).toFixed(1)},${y(pred[23 - i] - sd).toFixed(1)}`),
  ].join(" ");
  const mean = hs.reduce((s, v) => s + v, 0) / win;
  const peak = Math.max(...pred);
  const peakH = pred.indexOf(peak) + 1;
  const over = pred.filter((v) => v > cfg.limit).length;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * ymax);
  const stats = [
    ["Promedio", `${mean.toFixed(1)} ${cfg.unit}`, `últimas ${win} h`],
    ["Máximo", `${Math.max(...hs).toFixed(1)} ${cfg.unit}`, `últimas ${win} h`],
    ["Pico previsto", `${peak.toFixed(1)} ${cfg.unit}`, `en +${peakH} h`],
    ["Sobre el umbral", `${over} de 24 h`, `umbral ${cfg.limit} ${cfg.unit}`],
    ["Ajuste del modelo", `R² ${d.r2.toFixed(2)}`, "regresión armónica"],
  ];

  return (
    <div className="dash">
      <div className="controls">
        <label>Estación
          <select value={station} onChange={(e) => setStation(e.target.value)}>
            {Object.keys(STATIONS).map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <div role="group" aria-label="Contaminante" className="seg">
          {Object.keys(POLL).map((p) => (
            <button key={p} aria-pressed={pol === p} onClick={() => setPol(p)}>{p}</button>
          ))}
        </div>
        <div role="group" aria-label="Rango de historial" className="seg">
          {WINDOWS.map((w) => (
            <button key={w} aria-pressed={win === w} onClick={() => setWin(w)}>{w} h</button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${pol} en ${station}: historial de ${win} horas y predicción de 24 horas`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={P.l - 8} y={y(t) + 4} textAnchor="end" className="tick">{Math.round(t)}</text>
          </g>
        ))}
        <rect x={x(win - 1)} y={P.t} width={W - P.r - x(win - 1)} height={H - P.t - P.b} className="future" />
        <line x1={P.l} x2={W - P.r} y1={y(cfg.limit)} y2={y(cfg.limit)} className="limit" />
        <text x={W - P.r} y={y(cfg.limit) - 6} textAnchor="end" className="tick warn">umbral de referencia</text>
        <polygon points={band} className="band" />
        <path d={path(hs, 0)} className="hist" />
        <path d={path([hs[win - 1], ...pred], win - 1)} className="pred" />
        <text x={P.l} y={H - 8} className="tick">−{win} h</text>
        <text x={x(win - 1)} y={H - 8} textAnchor="middle" className="tick">ahora</text>
        <text x={W - P.r} y={H - 8} textAnchor="end" className="tick">+24 h</text>
      </svg>

      <ul className="legend">
        <li><i className="k hist" />Historial ({pol}, {cfg.unit})</li>
        <li><i className="k pred" />Predicción a 24 h</li>
        <li><i className="k band" />Margen ±1 desviación</li>
      </ul>

      <div className="stats">
        {stats.map(([a, b, c]) => (
          <div key={a}><span>{a}</span><strong>{b}</strong><small>{c}</small></div>
        ))}
      </div>
      <p className="note">
        Datos simulados para mostrar el funcionamiento. En AireGDL real, esta gráfica se alimenta de los CSV
        limpios de las estaciones de monitoreo.
      </p>
    </div>
  );
}
