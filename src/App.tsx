import { useState, useEffect, useRef, memo } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";
import {
  Flame, Dumbbell, Zap, Activity, AlertTriangle, Mic, Hand, BarChart3,
  Trash2, Award, Trophy, Check, Clipboard, Pin, CheckCircle2, MessageCircle,
  RefreshCw, Target, FlaskConical, Lightbulb, Calendar, Moon,
  Footprints, Wind, Droplet, Snowflake, Apple, HeartPulse,
} from "lucide-react";

const Icon = ({ C, size = 16, color, style, className }: { C: any; size?: number; color?: string; style?: React.CSSProperties; className?: string }) => (
  <C size={size} strokeWidth={1.75} color={color} className={className} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
);

const FONT = '"Space Grotesk", "Manrope", -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif';

// Carbon + Lime palette — softened lime accent on carbon-dark surfaces
const GRAD = {
  orange: 'linear-gradient(135deg, #A3E635 0%, #84CC16 100%)',
  orangeGlow: 'linear-gradient(135deg, #BEF264 0%, #84CC16 50%, #65A30D 100%)',
  purple: 'linear-gradient(135deg, #6B6B6B 0%, #3A3A3A 100%)',
  pink: 'linear-gradient(135deg, #737373 0%, #404040 100%)',
  blue: 'linear-gradient(135deg, #5E5E5E 0%, #2A2A2A 100%)',
  green: 'linear-gradient(135deg, #A3E635 0%, #84CC16 100%)',
  amber: 'linear-gradient(135deg, #B0B0B0 0%, #6B6B6B 100%)',
  red: 'linear-gradient(135deg, #525252 0%, #1F1F1F 100%)',
  teal: 'linear-gradient(135deg, #8A8A8A 0%, #525252 100%)',
  lime: 'linear-gradient(135deg, #A3E635 0%, #84CC16 100%)',
  darkHero: 'linear-gradient(135deg, #161616 0%, #050505 50%, #1F1F1F 100%)',
  lightHero: 'linear-gradient(135deg, #1A1A1A 0%, #0E0E0E 100%)',
};

const ACC = '#84CC16';
const ACC_BRIGHT = '#A3E635';
const GRAD_LIGHT = 'linear-gradient(135deg, #BEF264 0%, #84CC16 100%)';

// Inject global hover/active styles for buttons
if (typeof document !== 'undefined' && !document.getElementById('hyrox-button-styles')) {
  const style = document.createElement('style');
  style.id = 'hyrox-button-styles';
  style.textContent = `
    button {
      transition: transform 0.15s cubic-bezier(0.4,0,0.2,1), box-shadow 0.15s cubic-bezier(0.4,0,0.2,1), filter 0.15s !important;
      transform-origin: center;
    }
    button:not(:disabled):hover {
      transform: scale(1.03);
      filter: brightness(1.05);
    }
    button:not(:disabled):active {
      transform: scale(0.96);
      filter: brightness(0.95);
      transition-duration: 0.08s !important;
    }
    button:disabled {
      cursor: not-allowed !important;
      opacity: 0.7;
    }
    input, textarea, select {
      transition: border-color 0.15s, box-shadow 0.15s !important;
    }
    input:focus, textarea:focus, select:focus {
      outline: none !important;
      border-color: ${ACC} !important;
      box-shadow: 0 0 0 3px ${ACC}20 !important;
    }
    /* Hide native number-input spinners — cleaner look */
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
      appearance: textfield;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    /* Subtle boomerang-style icon animations: go and return symmetrically */
    @keyframes hyrox-wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-14deg); }
      75% { transform: rotate(14deg); }
    }
    @keyframes hyrox-flicker {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.12); }
    }
    @keyframes hyrox-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    @keyframes hyrox-spin-soft {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(20deg); }
    }
    .anim-wave { animation: hyrox-wave 1.6s ease-in-out 1; transform-origin: 70% 70%; display: inline-block; }
    .anim-flicker { animation: hyrox-flicker 1.8s ease-in-out infinite; display: inline-block; }
    .anim-bounce { animation: hyrox-bounce 1.6s ease-in-out infinite; display: inline-block; }
    .anim-spin-soft { animation: hyrox-spin-soft 3s ease-in-out infinite; display: inline-block; }
    /* Full-card flip — single rotateX swap */
    @keyframes hyrox-card-flip {
      0%   { transform: rotateX(0deg) scale(1);      opacity: 1; }
      45%  { transform: rotateX(90deg) scale(0.92);  opacity: 0.3; }
      55%  { transform: rotateX(-90deg) scale(0.92); opacity: 0.3; }
      100% { transform: rotateX(0deg) scale(1);      opacity: 1; }
    }
    .card-flip {
      will-change: transform, opacity;
      backface-visibility: hidden;
      animation: hyrox-card-flip 0.45s cubic-bezier(0.4, 0.1, 0.2, 1);
      transform-origin: 50% 50%;
    }
    @media (prefers-reduced-motion: reduce) {
      .anim-wave, .anim-flicker, .anim-bounce, .anim-spin-soft { animation: none; }
    }
    /* Typography polish — antialiasing + balanced weights */
    html, body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    body { background: #0E0E0E; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    /* Hide scrollbar on the tab bar while keeping it scrollable on narrow widths */
    .hyrox-tabs::-webkit-scrollbar { display: none; height: 0; width: 0; }
    .hyrox-tabs { scrollbar-width: none; -ms-overflow-style: none; }
  `;
  document.head.appendChild(style);
}

const STATIONS = [
  { id: 'skierg', name: 'SkiErg', desc: '1000m', abbr: 'SKI', color: '#A3E635', bright: '#BEF264', grad: GRAD.blue, hasWeight: false, target: 1000, unit: 'm' },
  { id: 'sledPush', name: 'Sled Push', desc: '50m', abbr: 'SP', color: '#FAFAFA', bright: '#FFFFFF', grad: GRAD.purple, hasWeight: true, target: 50, unit: 'm' },
  { id: 'sledPull', name: 'Sled Pull', desc: '50m', abbr: 'SL', color: '#E5E5E5', bright: '#FAFAFA', grad: GRAD.pink, hasWeight: true, target: 50, unit: 'm' },
  { id: 'burpee', name: 'Burpee BJ', desc: '80m', abbr: 'BBJ', color: '#D4D4D4', bright: '#FAFAFA', grad: GRAD.amber, hasWeight: false, target: 80, unit: 'm' },
  { id: 'rowing', name: 'Rowing', desc: '1000m', abbr: 'ROW', color: '#A3E635', bright: '#BEF264', grad: GRAD.green, hasWeight: false, target: 1000, unit: 'm' },
  { id: 'farmers', name: 'Farmers Carry', desc: '200m', abbr: 'FC', color: '#A3A3A3', bright: '#D4D4D4', grad: GRAD.red, hasWeight: true, target: 200, unit: 'm' },
  { id: 'lunges', name: 'Sandbag Lunges', desc: '100m', abbr: 'SBL', color: '#FAFAFA', bright: '#FFFFFF', grad: GRAD.teal, hasWeight: true, target: 100, unit: 'm' },
  { id: 'wallballs', name: 'Wall Balls', desc: '100 reps', abbr: 'WB', color: '#BEF264', bright: '#A3E635', grad: GRAD.lime, hasWeight: true, target: 100, unit: 'reps' },
];

const PRESET_EVENTS = [
  { city: 'Mumbai', country: 'India', date: '2026-09-19' },
  { city: 'Delhi', country: 'India', date: '2026-11-15' },
  { city: 'Bangalore', country: 'India', date: '2026-12-13' },
  { city: 'Dubai', country: 'UAE', date: '2026-11-22' },
  { city: 'Singapore', country: 'Singapore', date: '2027-01-24' },
  { city: 'London', country: 'UK', date: '2027-02-14' },
];

const EQUIV = [
  { id: 'thrusters', name: 'DB Thrusters', station: 'wallballs', match: 95,
    fields: [{ k: 'sets', l: 'Sets', d: 5 }, { k: 'reps', l: 'Reps', d: 15 }, { k: 'weight', l: 'kg/DB', d: 15 }],
    calc: v => Math.round(v.sets * v.reps * 1.33 * Math.max(0.6, v.weight / 15)) },
  { id: 'squats', name: 'Squats', station: 'wallballs', match: 70,
    fields: [{ k: 'sets', l: 'Sets', d: 3 }, { k: 'reps', l: 'Reps', d: 8 }, { k: 'weight', l: 'kg', d: 60 }],
    calc: v => Math.round(v.sets * v.reps * 0.7 * Math.max(0.5, v.weight / 60)) },
  { id: 'bench', name: 'Bench Press', station: 'sledPush', match: 60,
    fields: [{ k: 'sets', l: 'Sets', d: 3 }, { k: 'reps', l: 'Reps', d: 8 }, { k: 'weight', l: 'kg', d: 60 }],
    calc: v => Math.round(v.sets * v.reps * 1.6 * Math.max(0.5, v.weight / 60)) },
  { id: 'deadlifts', name: 'Deadlifts', station: 'sledPull', match: 75,
    fields: [{ k: 'sets', l: 'Sets', d: 3 }, { k: 'reps', l: 'Reps', d: 5 }, { k: 'weight', l: 'kg', d: 100 }],
    calc: v => Math.round(v.sets * v.reps * 2.5 * Math.max(0.5, v.weight / 100)) },
  { id: 'rows', name: 'Bent Rows', station: 'skierg', match: 65,
    fields: [{ k: 'sets', l: 'Sets', d: 3 }, { k: 'reps', l: 'Reps', d: 12 }, { k: 'weight', l: 'kg', d: 40 }],
    calc: v => Math.round(v.sets * v.reps * 22 * Math.max(0.5, v.weight / 40)) },
  { id: 'farmers', name: "Farmer's Carry", station: 'farmers', match: 100,
    fields: [{ k: 'sets', l: 'Sets', d: 4 }, { k: 'distance', l: 'm/set', d: 40 }, { k: 'weight', l: 'kg', d: 24 }],
    calc: v => Math.round(v.sets * v.distance * Math.max(0.6, v.weight / 24)) },
  { id: 'lunges', name: 'Walking Lunges', station: 'lunges', match: 90,
    fields: [{ k: 'sets', l: 'Sets', d: 3 }, { k: 'reps', l: 'Reps', d: 20 }, { k: 'weight', l: 'kg', d: 20 }],
    calc: v => Math.round(v.sets * v.reps * 1.5 * Math.max(0.6, v.weight / 20)) },
  { id: 'burpees', name: 'Burpees', station: 'burpee', match: 80,
    fields: [{ k: 'reps', l: 'Total reps', d: 40 }],
    calc: v => Math.round(v.reps * 1.8) },
  { id: 'intervals', name: '1km Intervals', station: 'run', match: 100,
    fields: [{ k: 'reps', l: 'No. of 1km', d: 8 }, { k: 'speed', l: 'Speed km/hr', d: 11, type: 'speed' }],
    calc: v => v.reps * 1000 },
  { id: 'longrun', name: 'Long Run (Z2)', station: 'run', match: 85,
    fields: [{ k: 'distance', l: 'km', d: 6 }, { k: 'speed', l: 'Speed km/hr', d: 8.5, type: 'speed' }],
    calc: v => Math.round(v.distance * 1000 * 0.85) },
  { id: 'cycle', name: 'Cycling', station: 'rowing', match: 50,
    fields: [{ k: 'distance', l: 'km', d: 5 }, { k: 'level', l: 'Lvl', d: 18 }],
    calc: v => Math.round(v.distance * 170 * (v.level / 18)) },
  // Direct Hyrox station logging (1:1 self-match, 100%)
  { id: 'wallballs_direct', name: 'Wall Balls', station: 'wallballs', match: 100,
    fields: [{ k: 'sets', l: 'Sets', d: 4 }, { k: 'reps', l: 'Reps/set', d: 25 }, { k: 'weight', l: 'kg', d: 9 }],
    calc: v => Math.round(v.sets * v.reps * Math.max(0.6, v.weight / 9)) },
  { id: 'skierg_direct', name: 'SkiErg', station: 'skierg', match: 100,
    fields: [{ k: 'sets', l: 'Sets', d: 3 }, { k: 'distance', l: 'm/set', d: 500 }],
    calc: v => v.sets * v.distance },
  { id: 'rowing_direct', name: 'Rowing', station: 'rowing', match: 100,
    fields: [{ k: 'sets', l: 'Sets', d: 3 }, { k: 'distance', l: 'm/set', d: 500 }],
    calc: v => v.sets * v.distance },
  { id: 'sledpush_direct', name: 'Sled Push', station: 'sledPush', match: 100,
    fields: [{ k: 'sets', l: 'Sets', d: 4 }, { k: 'distance', l: 'm/set', d: 40 }, { k: 'weight', l: 'kg load', d: 0 }],
    calc: v => Math.round(v.sets * v.distance * Math.max(0.6, 0.6 + v.weight / 150)) },
  { id: 'sledpull_direct', name: 'Sled Pull', station: 'sledPull', match: 100,
    fields: [{ k: 'sets', l: 'Sets', d: 4 }, { k: 'distance', l: 'm/set', d: 40 }, { k: 'weight', l: 'kg load', d: 0 }],
    calc: v => Math.round(v.sets * v.distance * Math.max(0.6, 0.6 + v.weight / 100)) },
  { id: 'sandbaglunges_direct', name: 'Sandbag Lunges', station: 'lunges', match: 100,
    fields: [{ k: 'sets', l: 'Sets', d: 3 }, { k: 'distance', l: 'm/set', d: 30 }, { k: 'weight', l: 'kg', d: 15 }],
    calc: v => Math.round(v.sets * v.distance * Math.max(0.6, v.weight / 30)) },
  { id: 'burpeeBJ_direct', name: 'Burpee BJ', station: 'burpee', match: 100,
    fields: [{ k: 'sets', l: 'Sets', d: 4 }, { k: 'reps', l: 'Reps/set', d: 12 }],
    calc: v => v.sets * v.reps },
];

const STATION_META = STATIONS.reduce((m, s) => { m[s.id] = { ...s, color: ACC, grad: ACC }; return m; }, {});
const RUN_META = { name: 'Race Running', desc: '8km total', abbr: 'RUN', color: ACC, grad: ACC, target: 8000, unit: 'm' };
const getStationMeta = (id) => id === 'run' ? RUN_META : STATION_META[id];

const STATION_TIME_RANGES = {
  skierg: [360, 240], sledPush: [80, 40], sledPull: [80, 40],
  burpee: [360, 220], rowing: [360, 250], farmers: [280, 180],
  lunges: [320, 200], wallballs: [480, 320],
};

function translatedToStationTime(translated) {
  const meta = getStationMeta(translated.station);
  if (translated.station === 'run' || !STATION_TIME_RANGES[translated.station]) return null;
  const effective = translated.val * (translated.match / 100);
  const ratio = Math.min(1, effective / meta.target);
  const [slow, fast] = STATION_TIME_RANGES[translated.station];
  return Math.round(slow - (slow - fast) * ratio);
}

function extractStationSessions(workouts, stationId) {
  const sessions = [];
  workouts.forEach(w => {
    if (w.stations?.[stationId]?.time) {
      sessions.push({ time: w.stations[stationId].time, date: w.date, weight: w.stations[stationId].weight, source: 'direct', isTest: w.isTest });
    } else if (w.translated?.length) {
      const relevant = w.translated.filter(t => t.station === stationId);
      if (relevant.length) {
        const best = relevant.reduce((a, b) => {
          const aT = translatedToStationTime(a), bT = translatedToStationTime(b);
          if (aT === null) return b;
          if (bT === null) return a;
          return aT < bT ? a : b;
        });
        const t = translatedToStationTime(best);
        if (t !== null) sessions.push({ time: t, date: w.date, source: 'translated', isTest: w.isTest });
      }
    }
  });
  return sessions.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function computePBs(workouts) {
  const pbs = {};
  STATIONS.forEach(s => {
    const sessions = extractStationSessions(workouts, s.id);
    if (sessions.length) {
      const best = sessions.reduce((a, b) => a.time < b.time ? a : b);
      pbs[s.id] = { time: best.time, date: best.date };
    }
  });
  return pbs;
}

function computeStationScore(stationId, workouts, pb) {
  if (!pb) return null;
  const sessions = extractStationSessions(workouts, stationId).slice().reverse();
  if (!sessions.length) return null;
  const latest = sessions[0].time;
  const score = Math.min(10, (pb.time / latest) * 10);
  let trend = 'stable';
  if (sessions.length >= 2) {
    const prev = sessions[1].time;
    if (latest < prev - 1) trend = 'up';
    else if (latest > prev + 1) trend = 'down';
  }
  return { score: Math.round(score * 10) / 10, trend, latest, isPB: latest === pb.time, sessions: sessions.length };
}

function cumulativeScore(workouts, pbs) {
  let total = 0;
  STATIONS.forEach(s => {
    const sc = computeStationScore(s.id, workouts, pbs[s.id]);
    total += sc?.score || 0;
  });
  return Math.round(total * 10) / 10;
}

// === Race Day projection + Weakest Station ===

function getBestRunPace(workouts) {
  let best: number | null = null;
  workouts.forEach(w => {
    if (w.runs?.pace && w.runs.pace > 0) {
      if (best === null || w.runs.pace < best) best = w.runs.pace;
    }
  });
  return best; // seconds per km, or null
}

const PACING_STRATEGIES = [
  { id: 'pb', label: 'At PB', sub: 'Match every PB exactly' },
  { id: 'goal', label: 'Stretch', sub: '~5% under PB across the board' },
  { id: 'negative', label: 'Negative', sub: 'Hold back early, push the back half' },
  { id: 'safe', label: 'Safe', sub: '+10% buffer — finish strong, no blowup' },
];

function applyStrategy(base, strategy, idx, isRun) {
  let mult = 1;
  if (strategy === 'goal') mult = isRun ? 0.97 : 0.95;
  else if (strategy === 'safe') mult = isRun ? 1.05 : 1.10;
  else if (strategy === 'negative') mult = idx < 4 ? 1.05 : 0.95;
  return Math.round(base * mult);
}

function projectRace(workouts, pbs, strategy) {
  const pace = getBestRunPace(workouts);
  const runFallback = 360; // 6:00/km default
  const stations = STATIONS.map((s, i) => {
    const range = STATION_TIME_RANGES[s.id] || [300, 200];
    const pb = pbs[s.id];
    const base = pb?.time ?? range[0];
    return { ...s, time: applyStrategy(base, strategy, i, false), isFallback: !pb, pbTime: pb?.time ?? null };
  });
  const runs = Array.from({ length: 8 }, (_, i) => ({
    idx: i + 1,
    time: applyStrategy(pace ?? runFallback, strategy, i, true),
    isFallback: pace === null,
  }));
  const stationsTotal = stations.reduce((a, x) => a + x.time, 0);
  const runsTotal = runs.reduce((a, x) => a + x.time, 0);
  const total = stationsTotal + runsTotal;
  return { stations, runs, total, stationsTotal, runsTotal, hasPace: pace !== null, pace };
}

function rankStationsByWeakness(pbs) {
  return STATIONS.map(s => {
    const pb = pbs[s.id];
    const range = STATION_TIME_RANGES[s.id] || [360, 240];
    const [slow, fast] = range;
    if (!pb) return { station: s, pb: null, fast, slow, norm: 1.2, hasData: false };
    const norm = Math.max(0, Math.min(1, (pb.time - fast) / (slow - fast)));
    return { station: s, pb, fast, slow, norm, hasData: true };
  }).sort((a, b) => b.norm - a.norm);
}

function getDrillsForStation(stationId) {
  return EQUIV.filter(e => e.station === stationId);
}

function fmtHMS(s) {
  if (s == null || isNaN(s)) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.round(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

// === Strava / GPX / TCX import ===

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function guessSport(name: string, typeRaw: string) {
  const blob = (name + ' ' + typeRaw).toLowerCase();
  if (blob.includes('row')) return 'Row';
  if (blob.includes('ski') || blob.includes('erg')) return 'Ski';
  if (blob.includes('ride') || blob.includes('bike') || blob.includes('cycl')) return 'Ride';
  if (blob.includes('walk') || blob.includes('hike')) return 'Walk';
  if (blob.includes('run') || blob.includes('jog') || typeRaw === '9') return 'Run';
  return 'Run';
}

function parseGPX(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid GPX (parse error)');
  const trk = doc.querySelector('trk');
  if (!trk) throw new Error('No <trk> element in GPX');
  const name = trk.querySelector('name')?.textContent?.trim() || 'Strava activity';
  const typeRaw = trk.querySelector('type')?.textContent?.trim() || '';
  const sport = guessSport(name, typeRaw);

  const trkpts = Array.from(trk.querySelectorAll('trkpt'));
  if (trkpts.length < 2) throw new Error('Not enough track points to compute distance');

  let distM = 0;
  let prev: { lat: number; lon: number } | null = null;
  for (const p of trkpts) {
    const lat = parseFloat(p.getAttribute('lat') || 'NaN');
    const lon = parseFloat(p.getAttribute('lon') || 'NaN');
    if (isNaN(lat) || isNaN(lon)) continue;
    if (prev) distM += haversine(prev, { lat, lon });
    prev = { lat, lon };
  }

  const firstTime = trkpts[0].querySelector('time')?.textContent;
  const lastTime = trkpts[trkpts.length - 1].querySelector('time')?.textContent;
  if (!firstTime || !lastTime) throw new Error('Missing timestamps');
  const elapsedS = (new Date(lastTime).getTime() - new Date(firstTime).getTime()) / 1000;

  return {
    sport, name,
    dateISO: firstTime.slice(0, 10),
    distM: Math.round(distM),
    movingTimeS: Math.max(1, Math.round(elapsedS)),
  };
}

function parseTCX(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid TCX (parse error)');
  const activity = doc.querySelector('Activity');
  if (!activity) throw new Error('No <Activity> element in TCX');
  const sportAttr = activity.getAttribute('Sport') || '';
  const sport = guessSport('', sportAttr);

  const laps = Array.from(activity.querySelectorAll('Lap'));
  if (!laps.length) throw new Error('No laps found in TCX');
  let distM = 0, movingTimeS = 0;
  for (const lap of laps) {
    distM += parseFloat(lap.querySelector('DistanceMeters')?.textContent || '0');
    movingTimeS += parseFloat(lap.querySelector('TotalTimeSeconds')?.textContent || '0');
  }
  const startTime = laps[0]?.getAttribute('StartTime') || activity.querySelector('Id')?.textContent || '';

  return {
    sport, name: 'Strava activity',
    dateISO: startTime.slice(0, 10),
    distM: Math.round(distM),
    movingTimeS: Math.max(1, Math.round(movingTimeS)),
  };
}

function parseActivityFile(text: string, filename: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.tcx') || text.includes('TrainingCenterDatabase')) return parseTCX(text);
  if (lower.endsWith('.gpx') || text.includes('<gpx')) return parseGPX(text);
  throw new Error('Unsupported file. Use a Strava GPX or TCX export.');
}

function activityToWorkout(act: any) {
  const distKm = act.distM / 1000;
  const paceSecPerKm = act.movingTimeS / Math.max(0.01, distKm);
  const stations: any = {};
  let runs: any = null;

  if (act.sport === 'Row' && act.distM >= 800 && act.distM <= 1200) {
    stations.rowing = { time: act.movingTimeS, weight: null };
  } else if (act.sport === 'Ski' && act.distM >= 800 && act.distM <= 1200) {
    stations.skierg = { time: act.movingTimeS, weight: null };
  } else {
    // Default: capture as runs (also covers Run / Walk / Hike / Ride for pace tracking)
    runs = { count: Math.max(1, Math.round(distKm)), pace: Math.round(paceSecPerKm) };
  }

  return {
    id: Date.now(),
    date: act.dateISO,
    sessionType: 'direct',
    stations,
    runs,
    translated: [],
    notes: `Imported from Strava: ${act.name}`,
    voiceMemo: null,
    isTest: false,
  };
}

// === Routine parser + Plan generator (deterministic) ===

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Split a single line into multiple sessions, recognising common separators
// (`,` `;` ` and ` `→` ` -> ` ` + ` ` / ` ` | ` ` & ` ` then `) while preserving
// content inside parens/brackets so things like "(1km Run @ 11km/hr + 1 min)"
// stay as one piece.
function splitSessionsLine(rest: string): string[] {
  const ph: string[] = [];
  const protectedText = rest.replace(/\([^()]*\)|\[[^\[\]]*\]/g, m => {
    ph.push(m);
    return `\x00${ph.length - 1}\x00`;
  });
  const parts = protectedText.split(/[,;]\s*|\s+and\s+|\s*→\s*|\s+->\s+|\s+\+\s+|\s+\/\s+|\s+\|\s+|\s+&\s+|\s+then\s+/i);
  return parts
    .map(p => p.replace(/\x00(\d+)\x00/g, (_, idx) => ph[parseInt(idx)]).trim())
    .filter(Boolean);
}

function parseRoutineText(raw: string) {
  if (!raw || !raw.trim()) return null;
  const dayMap: Record<string, string> = {
    mon: 'Mon', monday: 'Mon',
    tue: 'Tue', tues: 'Tue', tuesday: 'Tue',
    wed: 'Wed', wednesday: 'Wed',
    thu: 'Thu', thur: 'Thu', thurs: 'Thu', thursday: 'Thu',
    fri: 'Fri', friday: 'Fri',
    sat: 'Sat', saturday: 'Sat',
    sun: 'Sun', sunday: 'Sun',
  };
  const dayRegex = /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|tue|wed|thurs|thur|thu|fri|sat|sun)\b\s*[:\-—–.]?\s*(.*)$/i;

  const lines = raw.split(/\r?\n+/).map(l => l.trim()).filter(Boolean);
  const byDay: Record<string, string[]> = {};
  let current: string | null = null;

  for (const line of lines) {
    const m = line.match(dayRegex);
    if (m) {
      const dayKey = m[1].toLowerCase();
      const dayCanon = dayMap[dayKey] || dayKey;
      current = dayCanon;
      if (!byDay[current]) byDay[current] = [];
      const rest = m[2]?.trim();
      if (rest) {
        byDay[current].push(...splitSessionsLine(rest));
      }
    } else if (current) {
      const cleaned = line.replace(/^[\-•*›>·]\s*/, '').trim();
      if (cleaned) byDay[current].push(...splitSessionsLine(cleaned));
    }
  }

  const days = DAY_ORDER.filter(d => byDay[d]?.length).map(d => ({ day: d, sessions: byDay[d] }));
  return days.length ? { days } : null;
}

const EQUIPMENT_TIERS: Array<{ id: string; label: string; sub: string }> = [
  { id: 'hyrox',   label: 'Hyrox gym',  sub: 'All Hyrox stations on hand' },
  { id: 'gym',     label: 'Full gym',   sub: 'Barbell, DBs, cardio machines' },
  { id: 'home',    label: 'Home gym',   sub: 'Limited DBs / kettlebells / bands' },
  { id: 'minimal', label: 'Minimal',    sub: 'Bodyweight + running shoes' },
];

type DaySplit = Array<{ day: string; sessions: string[] }>;

// One Hyrox-centric prescription set per level. Equipment access only changes
// the per-card swap hint (see SUBSTITUTIONS), not the prescription itself.
const DEFAULT_DAY_SPLITS: Record<string, DaySplit> = {
  beginner: [
    { day: 'Mon', sessions: ['Wall Balls 3×15 (6kg)', 'SkiErg 3×500m @ steady', 'Easy 2km run @ Z2'] },
    { day: 'Wed', sessions: ['Sandbag Lunges 3×20m (10kg)', 'Burpee BJ 3×10', 'Run 3×400m @ moderate, 60s rest'] },
    { day: 'Fri', sessions: ['Sled Push 3×30m (BW)', 'Rowing 3×500m @ steady', 'Easy 3km Z2 run'] },
  ],
  intermediate: [
    { day: 'Mon', sessions: ['Wall Balls 4×20 (9kg)', 'Sled Push 4×40m (BW)', 'Sandbag Lunges 3×30m (15kg)', 'Easy 3km Z2 run'] },
    { day: 'Tue', sessions: ['Run 4×1km @ race pace, 90s rest', 'SkiErg 2×500m cooldown'] },
    { day: 'Thu', sessions: ['Burpee BJ 4×12', "Farmer's Carry 4×40m (24kg)", 'Sled Pull 3×30m (BW)', 'Rowing 3×500m'] },
    { day: 'Fri', sessions: ['Wall Balls 4×25 (9kg)', 'SkiErg 3×750m', 'Sandbag Lunges 3×40m (15kg)'] },
    { day: 'Sat', sessions: ['Long run 6km @ Z2'] },
  ],
  advanced: [
    { day: 'Mon', sessions: ['Wall Balls 5×25 (9kg)', 'Sled Push 5×50m (60kg load)', 'Sled Pull 4×50m (60kg load)', 'Sandbag Lunges 4×50m (20kg)'] },
    { day: 'Tue', sessions: ['Run 6×1km @ race pace, 90s rest', 'SkiErg 2×1000m cooldown'] },
    { day: 'Wed', sessions: ['Easy 4km run @ Z1-Z2', 'Rowing 3×500m @ steady'] },
    { day: 'Thu', sessions: ['Burpee BJ 4×15', "Farmer's Carry 4×50m (32kg)", 'Rowing 4×1000m', 'Sandbag Lunges 3×50m (20kg)'] },
    { day: 'Fri', sessions: ['Tempo run 6km @ Z3-Z4', 'Wall Balls 4×25 (9kg)', 'Burpee BJ 4×15'] },
    { day: 'Sat', sessions: ['Long run 8km @ Z2'] },
  ],
};

// Equipment-access swap hints. Shown under the prescription on the Log card so
// users without specialty Hyrox gear know what to substitute. Hyrox tier = no hint.
const SUBSTITUTIONS: Record<string, Record<string, string>> = {
  'wall ball':      { gym: 'DB thrusters (15kg/DB)',   home: 'DB thrusters (15kg/DB)',   minimal: 'Backpack squat-press (loaded)' },
  'sled push':      { gym: 'Heavy DB step-ups',        home: 'DB step-ups',              minimal: 'Hill sprints / heavy backpack push on tile' },
  'sled pull':      { gym: 'Heavy DB rows',            home: 'Heavy DB rows',            minimal: 'Resistance-band rows (heavy band)' },
  'sandbag lunge':  { gym: 'DB walking lunges',        home: 'DB walking lunges',        minimal: 'Backpack walking lunges' },
  "farmer's carry": { gym: 'Heavy DB suitcase carry',  home: 'KB / DB carry',            minimal: 'Heavy backpack or water-jug carry' },
  'burpee bj':      { gym: 'Burpees over a bench',     home: 'Burpees over a bench',     minimal: 'Burpees over any sturdy step (~50cm)' },
  'skierg':         { gym: 'Cable straight-arm pulldown 4×15 + bike sprints', home: 'KB swings 4×20', minimal: 'Hill sprints 4×60s' },
  'rowing':         { gym: 'Bike intervals (same time/distance)', home: 'Cycle 8min / KB swing intervals', minimal: 'Run intervals (same time)' },
};

function getSubstitution(prescription: string, equipment: string): string | null {
  if (!equipment || equipment === 'hyrox') return null;
  const lower = prescription.toLowerCase();
  for (const key of Object.keys(SUBSTITUTIONS)) {
    if (lower.includes(key)) return SUBSTITUTIONS[key][equipment] || null;
  }
  return null;
}

function adaptExtrasForEquipment(extras: string[], equipment: string): string[] {
  if (equipment === 'hyrox' || equipment === 'gym') return extras;
  if (equipment === 'minimal') {
    return extras.map(s => s
      .replace(/sled push[^,•·]*/gi, 'Hill sprints 6×100m')
      .replace(/sled pull[^,•·]*/gi, 'Band rows 4×15')
      .replace(/farmer'?s carry[^,•·]*/gi, 'Heavy backpack carry 4×40m')
      .replace(/wall balls?[^,•·]*/gi, 'Squat-to-press w/ weighted bag 4×20')
      .replace(/skierg[^,•·]*/gi, 'Hill sprints 4×60s')
      .replace(/rowing?[^,•·]*/gi, 'Run intervals (no rower)')
      .replace(/sandbag lunges?[^,•·]*/gi, 'Walking lunges 4×40m')
      .replace(/burpee bjs?[^,•·]*/gi, 'Burpees over a bench 3×15')
    );
  }
  if (equipment === 'home') {
    return extras.map(s => s
      .replace(/sled push[^,•·]*/gi, 'DB step-ups 4×12')
      .replace(/sled pull[^,•·]*/gi, 'Heavy DB rows 4×12')
      .replace(/wall balls?[^,•·]*/gi, 'DB thrusters 4×15')
      .replace(/skierg[^,•·]*/gi, 'KB swings 4×20')
      .replace(/rowing?[^,•·]*/gi, 'Cycle or HR cardio 8min')
      .replace(/sandbag lunges?[^,•·]*/gi, 'DB walking lunges 4×40m')
    );
  }
  return extras;
}

const PLAN_PHASES: Record<string, { id: string; label: string; color: string; grad: string }> = {
  BASE:      { id: 'BASE',      label: 'Base',       color: '#A3E635', grad: GRAD.green },
  BUILD:     { id: 'BUILD',     label: 'Build',      color: '#BEF264', grad: GRAD.lime },
  PEAK:      { id: 'PEAK',      label: 'Peak',       color: ACC,       grad: GRAD.orange },
  TAPER:     { id: 'TAPER',     label: 'Taper',      color: '#FBBF24', grad: GRAD.amber },
  RACE_WEEK: { id: 'RACE_WEEK', label: 'Race week',  color: '#EF4444', grad: GRAD.red },
};

function phaseForDaysFromEnd(d: number) {
  if (d <= 7) return 'RACE_WEEK';
  if (d <= 14) return 'TAPER';
  if (d <= 28) return 'PEAK';
  if (d <= 56) return 'BUILD';
  return 'BASE';
}

const PHASE_PROGRESSION: Record<string, Array<{ focus: string; extras: string[] }>> = {
  BASE: [
    { focus: 'Aerobic foundation', extras: ['+ 4-5km Z2 run', '+ Light stations: SkiErg 3×500m, Row 3×500m'] },
    { focus: 'Build aerobic base', extras: ['+ 5-6km Z2 run', '+ Burpee BJ 3×20m', '+ Wall Balls 3×20'] },
    { focus: 'Station familiarity', extras: ['+ Run + SkiErg combo 4×(500m run + 500m ski)', '+ Empty sled 3×50m'] },
    { focus: 'Light combos', extras: ['+ Sandbag lunges 3×30m', "+ Farmer's carry 3×40m"] },
    { focus: 'Aerobic threshold', extras: ['+ 5km tempo', '+ All stations light, 1 round'] },
    { focus: 'Deload', extras: ['Cut volume 30%', '+ Easy 3km', '+ Stations at 50%'] },
  ],
  BUILD: [
    { focus: 'Strength + station load', extras: ['+ Sled push loaded 4×50m', "+ Farmer's carry heavy 3×40m", '+ 4×1km @ race pace'] },
    { focus: 'Push intensity', extras: ['+ Sled push + pull superset', '+ Sandbag lunges 4×50m', '+ Wall balls 4×25'] },
    { focus: 'Running economy', extras: ['+ 6×1km intervals', '+ SkiErg 3×1000m', '+ Rowing 3×1000m'] },
    { focus: 'Half Hyrox simulation', extras: ['+ 4km + 4 stations time trial', '+ Heavy sled day'] },
  ],
  PEAK: [
    { focus: 'Race-pace intensity', extras: ['+ 8×1km @ race pace', '+ All 8 stations time trials'] },
    { focus: 'Deload + sharpen', extras: ['Cut volume 30%', '+ Light stations 50%', '+ Mobility focus'] },
    { focus: 'Race simulation', extras: ['+ Full Hyrox sim', '+ Transition practice', '+ Weak station focus'] },
    { focus: 'Pace + speed', extras: ['+ 5×1km race pace', '+ Station combos', '+ SkiErg + Row'] },
  ],
  TAPER: [
    { focus: 'Cut volume ~35%', extras: ['Sessions at 65% volume', '+ 1 race-pace touch', 'Drop heavy strength'] },
    { focus: 'Final taper', extras: ['Sessions at 50% volume', '+ 2 easy 1km efforts', 'Sleep priority'] },
  ],
  RACE_WEEK: [
    { focus: 'Race week — rest first', extras: ['Mon: Easy 1km + mobility', 'Wed: 5min station touch + 1km easy', 'Thu/Fri: Full rest', 'Race day 🏁'] },
  ],
};

function generatePlan(profile: any, today: Date = new Date()) {
  const eventDate = new Date(profile.eventDate);
  const dayMs = 86400000;
  if (eventDate.getTime() <= today.getTime()) return { weeks: [], totalWeeks: 0, eventDate };

  const daysToEvent = Math.ceil((eventDate.getTime() - today.getTime()) / dayMs);
  const totalWeeks = Math.min(22, Math.max(1, Math.ceil(daysToEvent / 7)));
  const planStart = new Date(eventDate);
  planStart.setDate(planStart.getDate() - totalWeeks * 7);

  const equipment = profile.equipment || 'gym';
  const level = profile.level || 'intermediate';
  const useExisting = profile.routineMode === 'existing' && profile.routine?.parsed?.days?.length;
  const rawDays = useExisting
    ? profile.routine.parsed.days
    : (DEFAULT_DAY_SPLITS[level] || DEFAULT_DAY_SPLITS.intermediate);
  // Default splits are now Hyrox-station-named for every tier — equipment access
  // surfaces as a per-card swap hint instead of a rewritten prescription. The
  // adaptExtrasForEquipment rewriter still runs on user-pasted routines as a courtesy.
  const baseDays = useExisting
    ? rawDays.map((d: any) => ({ ...d, sessions: adaptExtrasForEquipment(d.sessions, equipment) }))
    : rawDays;
  const usingDefault = !useExisting;

  const weeks: any[] = [];
  let lastPhase: string | null = null;
  let weekIdxInPhase = 0;

  for (let i = 0; i < totalWeeks; i++) {
    const start = new Date(planStart);
    start.setDate(start.getDate() + i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const daysFromEnd = Math.max(0, Math.floor((eventDate.getTime() - end.getTime()) / dayMs));
    const phaseId = phaseForDaysFromEnd(daysFromEnd);
    const phase = PLAN_PHASES[phaseId];

    if (lastPhase !== phaseId) { weekIdxInPhase = 0; lastPhase = phaseId; }
    const list = PHASE_PROGRESSION[phaseId] || [];
    const phaseInfo = list[Math.min(weekIdxInPhase, list.length - 1)] || { focus: 'Training week', extras: [] };
    weekIdxInPhase++;

    weeks.push({
      n: i + 1, start, end, phase,
      days: baseDays,
      hyroxFocus: phaseInfo.focus,
      extraSessions: phaseInfo.extras,
      isCurrent: today >= start && today <= end,
      isPast: end.getTime() < today.getTime(),
    });
  }
  return { weeks, totalWeeks, eventDate, usingDefault, equipment, level };
}

// Parse a prescription line like "Goblet squat 3×8 (light)" or "Run 4×1km @ race pace, 90s rest"
// into structured fields for prefilling the log form.
function parseExercisePrescription(text: string) {
  let s = text.trim();
  let weight: number | null = null;
  const wMatch = s.match(/\((\d+(?:\.\d+)?)\s*kg\)|(\d+(?:\.\d+)?)\s*kg\b/i);
  if (wMatch) {
    weight = parseFloat(wMatch[1] || wMatch[2]);
    s = s.replace(wMatch[0], '').trim();
  }
  let sets: number | null = null;
  let reps: number | null = null;
  let unit: string | null = null;
  let setDistance: number | null = null;
  const srMatch = s.match(/(\d+)\s*[×x]\s*(\d+(?:\.\d+)?)\s*(s|m|km)?\b/i);
  if (srMatch) {
    sets = parseInt(srMatch[1]);
    reps = parseFloat(srMatch[2]);
    unit = srMatch[3]?.toLowerCase() || null;
    if (unit === 'm') setDistance = reps;
    else if (unit === 'km') setDistance = reps * 1000;
    s = s.replace(srMatch[0], '').trim();
  }
  let distance: number | null = null;
  let distUnit: string | null = null;
  if (!srMatch) {
    const dMatch = s.match(/(\d+(?:\.\d+)?)\s*(km|m)\b/i);
    if (dMatch) {
      distance = parseFloat(dMatch[1]);
      distUnit = dMatch[2].toLowerCase();
      s = s.replace(dMatch[0], '').trim();
    }
  }
  const name = s.replace(/^[\s,()@]+|[\s,()@]+$/g, '').replace(/\s+/g, ' ').trim();
  return { name, sets, reps, weight, distance, distUnit, unit, setDistance, raw: text };
}

// Map a prescription to the closest EQUIV entry by keyword. Returns null if no match.
function findEquivMatch(prescription: { name: string; raw: string }) {
  const lower = (prescription.name + ' ' + prescription.raw).toLowerCase();
  // Direct Hyrox station prescriptions take precedence (100% match)
  if (lower.includes('wall ball')) return EQUIV.find(e => e.id === 'wallballs_direct');
  if (lower.includes('sled push')) return EQUIV.find(e => e.id === 'sledpush_direct');
  if (lower.includes('sled pull')) return EQUIV.find(e => e.id === 'sledpull_direct');
  if (lower.includes('sandbag lunge')) return EQUIV.find(e => e.id === 'sandbaglunges_direct');
  if (lower.includes('burpee bj') || lower.includes('burpee broad jump')) return EQUIV.find(e => e.id === 'burpeeBJ_direct');
  if (lower.includes('skierg') || lower.includes('ski erg')) return EQUIV.find(e => e.id === 'skierg_direct');
  if (lower.includes('rowing')) return EQUIV.find(e => e.id === 'rowing_direct');
  // Translated lifts
  if (lower.includes('thruster')) return EQUIV.find(e => e.id === 'thrusters');
  // Run intervals: 1km or interval/intervals + a rep cue or race-pace tag
  if ((lower.includes('1km') || lower.includes('interval')) && (lower.includes('×') || lower.includes('x ') || lower.includes('race pace'))) return EQUIV.find(e => e.id === 'intervals');
  // Any other run prescription (e.g. "4km Run", "Long run 6km", "Run @ Z2") → long run
  if (/\brun(?:ning|s)?\b/.test(lower)) return EQUIV.find(e => e.id === 'longrun');
  if (lower.includes('farmer')) return EQUIV.find(e => e.id === 'farmers');
  if (lower.includes('lunge')) return EQUIV.find(e => e.id === 'lunges');
  if (lower.includes('burpee')) return EQUIV.find(e => e.id === 'burpees');
  if (lower.includes('row')) return EQUIV.find(e => e.id === 'rows');
  if (lower.includes('bench')) return EQUIV.find(e => e.id === 'bench');
  if (lower.includes('deadlift')) return EQUIV.find(e => e.id === 'deadlifts');
  if (lower.includes('squat')) return EQUIV.find(e => e.id === 'squats');
  if (lower.includes('cycl') || lower.includes('bike')) return EQUIV.find(e => e.id === 'cycle');
  return null;
}

function getTodayPrescription(profile: any) {
  if (!profile) return null;
  try {
    const week = getCurrentWeekPlan(profile, new Date());
    if (!week) return null;
    const todayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    const dayPlan = (week.days || []).find((d: any) => d.day === todayName);
    if (!dayPlan || !dayPlan.sessions?.length) return null;
    return { day: dayPlan.day, sessions: dayPlan.sessions, weekN: week.n, phaseLabel: week.phase?.label };
  } catch { return null; }
}

function getCurrentWeekPlan(profile: any, today: Date = new Date()) {
  const plan = generatePlan(profile, today);
  if (!plan.weeks.length) return null;
  return plan.weeks.find((w: any) => w.isCurrent) || plan.weeks[0];
}

// === Smart Taper logic ===
// Reads days-to-event + recent training volume to recommend a phase
// (BASE / BUILD / PEAK / TAPER / RACE-WEEK), volume multiplier, and an
// adjustment flag if recent volume is over- or under-cooked for the phase.

function computeTaperStatus(workouts, profile) {
  const eventDate = new Date(profile.eventDate);
  const today = new Date();
  const daysToEvent = Math.max(0, Math.floor((eventDate.getTime() - today.getTime()) / 86400000));

  const dayMs = 86400000;
  const since = (n) => workouts.filter(w => (today.getTime() - new Date(w.date).getTime()) / dayMs <= n).length;
  const days7 = since(7), days14 = since(14), days21 = since(21);
  const avgPerWeek = days21 / 3;

  let phase = 'BASE';
  let phaseLabel = 'Base building';
  let volumeMultiplier = 1.0;
  let intensity = 'moderate';
  let advice = '';
  let urgency: 'normal' | 'warn' | 'critical' = 'normal';

  if (daysToEvent <= 0) {
    phase = 'RACE'; phaseLabel = 'Race day or past'; volumeMultiplier = 0;
    advice = 'Recover. Note PBs and reflect.'; intensity = 'rest'; urgency = 'critical';
  } else if (daysToEvent <= 3) {
    phase = 'RACE-WEEK'; phaseLabel = 'Final 72 hours'; volumeMultiplier = 0.25;
    advice = 'Rest, mobility, sleep. One easy 1km shake-out only. Trust the work.'; intensity = 'minimal'; urgency = 'critical';
  } else if (daysToEvent <= 7) {
    phase = 'RACE-WEEK'; phaseLabel = 'Race week'; volumeMultiplier = 0.4;
    advice = 'Light shake-outs. No new stations, no PRs. Sleep & nutrition first.'; intensity = 'minimal'; urgency = 'critical';
  } else if (daysToEvent <= 14) {
    phase = 'TAPER'; phaseLabel = 'Taper begun'; volumeMultiplier = 0.65;
    advice = 'Cut volume ~35%. Keep race-pace touch, drop heavy strength.'; intensity = 'sharp'; urgency = 'warn';
  } else if (daysToEvent <= 28) {
    phase = 'PEAK'; phaseLabel = 'Peak block'; volumeMultiplier = 1.0;
    advice = 'Hold race-pace work. Time-trial weak stations once. Maintain volume.'; intensity = 'race-pace'; urgency = 'normal';
  } else if (daysToEvent <= 56) {
    phase = 'BUILD'; phaseLabel = 'Hyrox-specific build'; volumeMultiplier = 1.1;
    advice = 'Combine stations with runs. Increase loaded carries. Push intensity.'; intensity = 'high'; urgency = 'normal';
  } else {
    phase = 'BASE'; phaseLabel = 'Base building'; volumeMultiplier = 1.0;
    advice = 'Aerobic foundation + station familiarity. Volume over intensity.'; intensity = 'moderate'; urgency = 'normal';
  }

  // Volume vs phase mismatch flag
  let volumeFlag: { type: 'high' | 'low' | 'taper-warn'; text: string } | null = null;
  if (daysToEvent > 14 && avgPerWeek > 5.5) {
    volumeFlag = { type: 'high', text: `Volume high (${avgPerWeek.toFixed(1)}/wk avg). Schedule a deload week.` };
  } else if (daysToEvent > 14 && days21 > 0 && avgPerWeek < 1.5) {
    volumeFlag = { type: 'low', text: `Volume low (${avgPerWeek.toFixed(1)}/wk avg). Add 1 easy session.` };
  } else if (daysToEvent > 14 && days7 === 0 && days21 > 0) {
    volumeFlag = { type: 'low', text: 'No sessions this week — get one in tomorrow.' };
  } else if (daysToEvent <= 14 && daysToEvent > 7 && days7 > 4) {
    volumeFlag = { type: 'taper-warn', text: `${days7} sessions in last 7d — too much for taper. Cut back.` };
  } else if (daysToEvent <= 7 && days7 > 2) {
    volumeFlag = { type: 'taper-warn', text: `${days7} sessions in race week — drop to 1-2 max.` };
  }

  return {
    phase, phaseLabel, volumeMultiplier, intensity, advice, urgency,
    daysToEvent, days7, days14, days21, avgPerWeek,
    volumeFlag,
  };
}

function fmtTime(s) {
  if (!s && s !== 0) return '-';
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function parseMMSS(str) {
  if (!str) return null;
  if (String(str).includes(':')) {
    const [m, s] = String(str).split(':').map(Number);
    return isNaN(m) || isNaN(s) ? null : m * 60 + s;
  }
  const n = parseInt(str);
  return isNaN(n) ? null : n;
}

function genUserId() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }

// Single theme — Carbon + Lime (dark-first)
const CARBON_THEME = {
  bg: '#0E0E0E', bgSolid: '#0E0E0E',
  surface: '#1A1A1A', surfaceAlt: '#222222', card: '#1A1A1A',
  border: '#2A2A2A', borderInput: '#3A3A3A',
  text: '#FAFAFA', textSec: '#A3A3A3', textMute: '#D4D4D4',
  headerBg: '#000000',
  tabBg: '#0E0E0E',
  inputBg: '#1A1A1A',
  cardShadow: '0 1px 2px rgba(0,0,0,0.4)',
  cardShadowHover: '0 4px 12px rgba(0,0,0,0.5)',
  heroShadow: '0 8px 24px rgba(0,0,0,0.6)',
  glassBlur: 'blur(12px) saturate(120%)',
};
const THEMES = { light: CARBON_THEME, dark: CARBON_THEME };

let currentTheme = 'light';
const themeSubscribers = new Set<(m: any) => void>();
function setThemeMode(mode: any) {
  currentTheme = mode;
  try { window.storage?.set('hyrox_theme', mode); } catch (e) {}
  themeSubscribers.forEach(fn => fn(mode));
}
function useTheme() {
  const [mode, setMode] = useState(currentTheme);
  useEffect(() => {
    const fn = (m: any) => setMode(m);
    themeSubscribers.add(fn);
    return () => { themeSubscribers.delete(fn); };
  }, []);
  return { t: THEMES[mode], mode, setMode: setThemeMode };
}

function Pill({ color, grad, children, size = 'md' }: any) {
  const sizes = { sm: { fs: 10, p: '3px 9px' }, md: { fs: 12, p: '5px 11px' }, lg: { fs: 13, p: '7px 14px' } };
  const s = sizes[size];
  return <span style={{ background: grad || color + '18', color: grad ? '#fff' : color, fontSize: s.fs, fontWeight: 700, padding: s.p, borderRadius: 999, letterSpacing: 0.3, whiteSpace: 'nowrap', display: 'inline-block' }}>{children}</span>;
}

function StatCard({ label, value, sub, icon, grad }) {
  const { t } = useTheme();
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`, borderRadius: 18,
      padding: '18px 20px', boxShadow: t.cardShadow, position: 'relative', overflow: 'hidden',
    }}>
      {grad && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: grad }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: t.text, lineHeight: 1, letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: t.textSec, marginTop: 6, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, action, accent }: any) {
  const { t } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22, marginTop: 8, paddingLeft: 2 }}>
      <div style={{ fontSize: 21, fontWeight: 700, color: t.text, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 12 }}>
        {accent && <span style={{ width: 4, height: 18, borderRadius: 2, background: accent, display: 'inline-block', transform: 'translateY(2px)' }} />}
        {children}
      </div>
      {action}
    </div>
  );
}

function Seg({ value, options, onChange }) {
  const { t } = useTheme();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 4, background: t.surfaceAlt, padding: 4, borderRadius: 12 }}>
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          padding: '11px 6px', fontSize: 14, fontWeight: 600, borderRadius: 8, cursor: 'pointer', border: 'none', fontFamily: FONT,
          background: value === o.v ? t.card : 'transparent',
          color: value === o.v ? ACC : t.textSec,
          boxShadow: value === o.v ? t.cardShadow : 'none',
          transition: 'all 0.2s',
        }}>{o.l}</button>
      ))}
    </div>
  );
}

function FormSection({ title, children }) {
  const { t } = useTheme();
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: ACC, marginBottom: 14, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 16, height: 2, background: GRAD.orange, borderRadius: 1 }} /> {title}
      </div>
      {children}
    </div>
  );
}

const DEFAULT_PROFILE = {
  userId: '', name: '', age: '', sex: 'male', bodyweight: '',
  occupation: '', shift: 'day', workHours: 9, meals: 3,
  level: 'intermediate', athleteType: 'hybrid',
  equipment: 'gym',
  routineMode: 'fresh' as 'fresh' | 'existing',
  eventCity: 'Mumbai', eventDate: '2026-09-19', friends: [],
  routine: null as null | { raw: string; parsed: { days: Array<{ day: string; sessions: string[] }> } | null; updatedAt: string },
};

const ProfileForm = memo(function ProfileForm({ initial, onSave, isOnboarding }: any) {
  const { t } = useTheme();
  const initialData = { ...DEFAULT_PROFILE, userId: initial?.userId || genUserId(), ...initial };
  const [sex, setSex] = useState(initialData.sex);
  const [shift, setShift] = useState(initialData.shift);
  const [level, setLevel] = useState(initialData.level);
  const [athleteType, setAthleteType] = useState(initialData.athleteType);
  const [eventCity, setEventCity] = useState(initialData.eventCity);
  const [eventDate, setEventDate] = useState(initialData.eventDate);
  const [equipment, setEquipment] = useState(initialData.equipment || 'gym');
  const [routineMode, setRoutineMode] = useState<'fresh' | 'existing'>(
    initialData.routineMode || (initialData.routine?.raw ? 'existing' : 'fresh')
  );
  const [routineText, setRoutineText] = useState(initialData.routine?.raw || '');
  const [error, setError] = useState('');

  const nameRef = useRef(null), ageRef = useRef(null), bwRef = useRef(null);
  const occRef = useRef(null), hrsRef = useRef(null), mealsRef = useRef(null);

  const routinePreview = parseRoutineText(routineText);

  const inp = { width: '100%', padding: '14px 16px', fontSize: 16, borderRadius: 12, border: `1.5px solid ${t.borderInput}`, background: t.inputBg, color: t.text, boxSizing: 'border-box' as const, fontFamily: FONT, transition: 'all 0.15s' };
  const lbl = { fontSize: 13, color: t.textSec, marginBottom: 8, display: 'block', fontWeight: 600, letterSpacing: 0.2 };

  const handleSubmit = () => {
    const name = nameRef.current?.value.trim();
    const age = ageRef.current?.value.trim();
    const bodyweight = bwRef.current?.value.trim();
    const occupation = occRef.current?.value.trim();
    const workHours = parseInt(hrsRef.current?.value) || 9;
    const meals = parseInt(mealsRef.current?.value) || 3;
    if (!name || !age || !bodyweight || !eventDate) { setError('Please fill name, age, bodyweight and event date.'); return; }
    const routine = routineMode === 'existing' && routineText.trim()
      ? { raw: routineText, parsed: parseRoutineText(routineText), updatedAt: new Date().toISOString() }
      : null;
    onSave({ ...initialData, name, age, bodyweight, occupation, workHours, meals, sex, shift, level, athleteType, equipment, routineMode, eventCity, eventDate, routine });
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setEventCity(city);
    const pre = PRESET_EVENTS.find(x => x.city === city);
    if (pre) setEventDate(pre.date);
  };

  return (
    <div>
      {isOnboarding && (
        <div style={{
          background: GRAD.darkHero, color: '#fff', borderRadius: 22, padding: '28px 26px', marginBottom: 28,
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(232,69,27,0.2)',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: GRAD.orangeGlow, borderRadius: '50%', filter: 'blur(60px)', opacity: 0.4 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 2.5, color: ACC_BRIGHT, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Welcome to Hyrox</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, letterSpacing: -0.8, display: 'flex', alignItems: 'center', gap: 10 }}>Let's build your plan <Icon C={Flame} size={22} /></div>
            <div style={{ fontSize: 15, color: '#c7c7d0', lineHeight: 1.5 }}>Tell us about yourself so we can tailor training, recovery, and race day prep.</div>
          </div>
        </div>
      )}

      <FormSection title="Basics">
        <div style={{ marginBottom: 16 }}><label style={lbl}>NAME</label><input ref={nameRef} type="text" defaultValue={initialData.name} placeholder="Your name" style={inp} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div><label style={lbl}>AGE</label><input ref={ageRef} type="number" defaultValue={initialData.age} placeholder="28" style={inp} /></div>
          <div><label style={lbl}>BODYWEIGHT (KG)</label><input ref={bwRef} type="number" defaultValue={initialData.bodyweight} placeholder="70" style={inp} /></div>
        </div>
        <div><label style={lbl}>SEX</label>
          <Seg value={sex} onChange={setSex} options={[{ v: 'male', l: 'Male' }, { v: 'female', l: 'Female' }, { v: 'other', l: 'Other' }]} />
        </div>
      </FormSection>

      <FormSection title="Lifestyle">
        <div style={{ marginBottom: 16 }}><label style={lbl}>OCCUPATION</label><input ref={occRef} type="text" defaultValue={initialData.occupation} placeholder="e.g. Software Engineer" style={inp} /></div>
        <div style={{ marginBottom: 16 }}><label style={lbl}>WORK SHIFT</label>
          <Seg value={shift} onChange={setShift} options={[{ v: 'day', l: 'Day' }, { v: 'night', l: 'Night' }, { v: 'flexible', l: 'Flexible' }]} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={lbl}>WORK HOURS</label><input ref={hrsRef} type="number" defaultValue={initialData.workHours} style={inp} /></div>
          <div><label style={lbl}>MEALS/DAY</label><input ref={mealsRef} type="number" min="1" max="8" defaultValue={initialData.meals} style={inp} /></div>
        </div>
      </FormSection>

      <FormSection title="Training">
        <div style={{ marginBottom: 16 }}><label style={lbl}>EXPERIENCE</label>
          <Seg value={level} onChange={setLevel} options={[{ v: 'beginner', l: 'Beginner' }, { v: 'intermediate', l: 'Intermediate' }, { v: 'advanced', l: 'Advanced' }]} />
        </div>
        <div><label style={lbl}>ATHLETE TYPE</label>
          <Seg value={athleteType} onChange={setAthleteType} options={[
            { v: 'strength', l: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Dumbbell} size={14} /> Strength</span> },
            { v: 'hybrid', l: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Zap} size={14} /> Hybrid</span> },
            { v: 'endurance', l: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Activity} size={14} /> Endurance</span> },
          ]} />
        </div>
      </FormSection>

      <FormSection title="Equipment Access">
        <div style={{ marginBottom: 12, fontSize: 13, color: t.textSec, lineHeight: 1.5 }}>
          What gear do you have available? We'll adapt drills you don't have to bodyweight or DB equivalents.
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {EQUIPMENT_TIERS.map(eq => {
            const active = equipment === eq.id;
            return (
              <button key={eq.id} type="button" onClick={() => setEquipment(eq.id)} style={{
                textAlign: 'left' as const, padding: '12px 14px', cursor: 'pointer', fontFamily: FONT,
                background: active ? `linear-gradient(135deg, ${ACC}18 0%, ${ACC}08 100%)` : t.surfaceAlt,
                border: `1.5px solid ${active ? ACC : t.border}`, borderRadius: 12,
                color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: active ? ACC : t.text, marginBottom: 2 }}>{eq.label}</div>
                  <div style={{ fontSize: 12, color: t.textSec }}>{eq.sub}</div>
                </div>
                {active && <Icon C={CheckCircle2} size={16} color={ACC} />}
              </button>
            );
          })}
        </div>
      </FormSection>

      <FormSection title="Current Routine">
        <div style={{ marginBottom: 12, fontSize: 13, color: t.textSec, lineHeight: 1.5 }}>
          Do you train regularly already?
        </div>
        <Seg value={routineMode} onChange={setRoutineMode} options={[
          { v: 'existing', l: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={CheckCircle2} size={13} /> Yes, I train</span> },
          { v: 'fresh', l: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Flame} size={13} /> Starting fresh</span> },
        ]} />

        {routineMode === 'existing' && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 10, fontSize: 12, color: t.textSec, lineHeight: 1.5 }}>
              Paste your weekly routine — use day prefixes like <span style={{ fontFamily: 'JetBrains Mono, monospace', color: t.textMute }}>Mon: Squats 3×8, 5km run</span>.
            </div>
            <textarea
              value={routineText}
              onChange={e => setRoutineText(e.target.value)}
              rows={6}
              placeholder={`Mon: Squats 3×8, Bench 3×8, 4km run\nWed: Deadlifts 3×5, Rows 3×12\nFri: DB thrusters 5×15, 8×1km\nSat: 6km Z2`}
              style={{ ...inp, resize: 'vertical' as const, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace', fontSize: 13, lineHeight: 1.55 }}
            />
            {routinePreview && (
              <div style={{ marginTop: 10, background: t.surfaceAlt, borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${ACC}` }}>
                <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon C={CheckCircle2} size={11} color={ACC} /> Parsed {routinePreview.days.length} day{routinePreview.days.length === 1 ? '' : 's'}
                </div>
                <div style={{ fontSize: 12, color: t.text, lineHeight: 1.5 }}>
                  {routinePreview.days.map(d => <div key={d.day}><span style={{ color: ACC, fontWeight: 700 }}>{d.day}</span> · {d.sessions.length} session{d.sessions.length === 1 ? '' : 's'}</div>)}
                </div>
              </div>
            )}
            {!routinePreview && routineText.trim() && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon C={AlertTriangle} size={12} color="#FBBF24" /> No day prefixes detected — start each line with Mon/Tue/Wed etc.
              </div>
            )}
          </div>
        )}

        {routineMode === 'fresh' && (
          <div style={{ marginTop: 16, background: t.surfaceAlt, borderRadius: 12, padding: '14px 16px', borderLeft: `3px solid ${ACC}`, fontSize: 13, color: t.text, lineHeight: 1.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Icon C={Flame} size={14} color={ACC} />
              <span style={{ fontWeight: 700 }}>We'll build it for you</span>
            </div>
            <span style={{ color: t.textSec }}>
              Plan generated from scratch using your <span style={{ color: ACC, fontWeight: 600 }}>{level}</span> level and <span style={{ color: ACC, fontWeight: 600 }}>{EQUIPMENT_TIERS.find(eq => eq.id === equipment)?.label.toLowerCase() || equipment}</span> equipment access. Switch to "Yes, I train" if you'd rather we work around an existing routine.
            </span>
          </div>
        )}
      </FormSection>

      <FormSection title="Target Event">
        <div style={{ marginBottom: 16 }}><label style={lbl}>HYROX CITY</label>
          <select value={eventCity} onChange={handleCityChange} style={inp}>
            {PRESET_EVENTS.map(ev => <option key={ev.city} value={ev.city}>Hyrox {ev.city} · {ev.country}</option>)}
            <option value="Custom">Custom / Other</option>
          </select>
        </div>
        <div><label style={lbl}>RACE DATE</label><input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={inp} /></div>
      </FormSection>

      {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 14, fontWeight: 500 }}>{error}</div>}

      <button onClick={handleSubmit} style={{
        width: '100%', padding: '18px', fontSize: 16, fontWeight: 700,
        background: GRAD.orange, color: '#fff', border: 'none', borderRadius: 14,
        cursor: 'pointer', letterSpacing: 0.3, marginTop: 8, fontFamily: FONT,
        boxShadow: '0 8px 24px rgba(232,69,27,0.35)',
      }}>{isOnboarding ? 'START TRAINING  →' : 'SAVE PROFILE'}</button>
    </div>
  );
});

function ProfileView({ profile, onSave, onClearData }) {
  const { t } = useTheme();
  const [editing, setEditing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  if (editing) return <ProfileForm initial={profile} onSave={(p) => { onSave(p); setEditing(false); }} />;

  const ageCategory = profile.age < 30 ? 'Open' : profile.age < 40 ? '30-39' : profile.age < 50 ? '40-49' : '50+';
  const eventDays = Math.max(0, Math.floor((new Date(profile.eventDate).getTime() - new Date().getTime()) / 86400000));
  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${t.border}`, fontSize: 15 }}>
      <span style={{ color: t.textSec }}>{label}</span>
      <span style={{ fontWeight: 600, color: t.text }}>{value || '—'}</span>
    </div>
  );
  const typeIcon = { strength: Dumbbell, hybrid: Zap, endurance: Activity }[profile.athleteType] || null;

  return (
    <div>
      <div style={{
        background: GRAD.darkHero, color: '#fff', borderRadius: 22, padding: '26px 26px', marginBottom: 20,
        position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: GRAD.orangeGlow, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: ACC_BRIGHT, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Athlete</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: -0.8 }}>{profile.name}</div>
              <div style={{ fontSize: 14, color: '#c7c7d0' }}>{profile.age}y · {profile.bodyweight}kg · {ageCategory}</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 14px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 32, lineHeight: 1, color: '#fff' }}>{typeIcon && <Icon C={typeIcon} size={28} color="#fff" />}</div>
              <div style={{ fontSize: 10, color: '#c7c7d0', textTransform: 'uppercase', marginTop: 4, letterSpacing: 1, fontWeight: 600 }}>{profile.athleteType}</div>
            </div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>Hyrox {profile.eventCity}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{new Date(profile.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: ACC_BRIGHT, letterSpacing: -1, lineHeight: 1 }}>{eventDays}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>days to go</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: t.card, borderRadius: 18, padding: '6px 20px 16px', marginBottom: 14, boxShadow: t.cardShadow, border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: t.textSec, padding: '16px 0 8px', textTransform: 'uppercase' }}>Athlete ID</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'SF Mono, Monaco, monospace', letterSpacing: 3, color: t.text }}>{profile.userId}</span>
          <button onClick={() => { navigator.clipboard?.writeText(profile.userId); }} style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, background: GRAD.orange, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 4px 12px rgba(232,69,27,0.25)' }}>COPY</button>
        </div>
        <div style={{ fontSize: 12, color: t.textSec, marginTop: 4 }}>Share this ID with friends to let them add you.</div>
      </div>

      <div style={{ background: t.card, borderRadius: 18, padding: '6px 20px', marginBottom: 14, boxShadow: t.cardShadow, border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: t.textSec, padding: '16px 0 8px', textTransform: 'uppercase' }}>Lifestyle</div>
        {row('Occupation', profile.occupation)}
        {row('Shift', profile.shift?.charAt(0).toUpperCase() + profile.shift?.slice(1))}
        {row('Work hours/day', `${profile.workHours} hrs`)}
        {row('Meals/day', profile.meals)}
      </div>

      <div style={{ background: t.card, borderRadius: 18, padding: '6px 20px', marginBottom: 14, boxShadow: t.cardShadow, border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: t.textSec, padding: '16px 0 8px', textTransform: 'uppercase' }}>Training</div>
        {row('Experience', profile.level?.charAt(0).toUpperCase() + profile.level?.slice(1))}
        {row('Athlete type', profile.athleteType?.charAt(0).toUpperCase() + profile.athleteType?.slice(1))}
      </div>

      {profile.shift === 'night' && (
        <div style={{ background: GRAD.amber, color: '#fff', borderRadius: 14, padding: '16px 18px', marginBottom: 14, boxShadow: '0 8px 20px rgba(217,119,6,0.25)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Icon C={AlertTriangle} size={14} /> Night shift</div>
          <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.95 }}>Prioritize sleep (7-9hrs), front-load calories, and consider a second recovery day.</div>
        </div>
      )}

      <button onClick={() => setEditing(true)} style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 700, background: t.card, color: ACC, border: `2px solid ${ACC}`, borderRadius: 14, cursor: 'pointer', fontFamily: FONT, marginBottom: 10 }}>EDIT PROFILE</button>
      {onClearData && !confirmClear && (
        <button onClick={() => setConfirmClear(true)} style={{ width: '100%', padding: '13px', fontSize: 13, fontWeight: 500, background: 'transparent', color: '#DC2626', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: FONT }}>Clear all data & reset</button>
      )}
      {onClearData && confirmClear && (
        <div style={{ background: '#FEE2E2', border: '1.5px solid #DC2626', borderRadius: 14, padding: 18, marginTop: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#991B1B', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Icon C={AlertTriangle} size={15} color="#991B1B" /> Are you sure?</div>
          <div style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.5, marginBottom: 14 }}>This will wipe all workouts, your profile, athlete ID, and friends list.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmClear(false)} style={{ flex: 1, padding: '12px', fontSize: 13, fontWeight: 700, background: '#fff', color: '#000', border: '1px solid #D1D1D6', borderRadius: 10, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
            <button onClick={onClearData} style={{ flex: 1, padding: '12px', fontSize: 13, fontWeight: 700, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: FONT }}>Yes, wipe</button>
          </div>
        </div>
      )}
    </div>
  );
}

function VoiceMemoRecorder({ transcript, setTranscript }) {
  const { t } = useTheme();
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);
  const recogRef = useRef(null);
  const finalRef = useRef('');

  useEffect(() => {
    const SR = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) setSupported(false);
  }, []);

  const start = async () => {
    setError(null);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError('Not supported.'); setSupported(false); return; }
    try {
      if (navigator.mediaDevices?.getUserMedia) await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) { setError('Mic permission denied.'); return; }
    finalRef.current = transcript ? transcript + ' ' : '';
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tt = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalRef.current += tt + ' ';
        else interim += tt;
      }
      setTranscript((finalRef.current + interim).trim());
    };
    r.onerror = (e) => { setError(`Error: ${e.error || 'unknown'}`); setRecording(false); };
    r.onend = () => { if (recogRef.current === r) setRecording(false); };
    recogRef.current = r;
    try { r.start(); setRecording(true); } catch (e) { setError('Could not start.'); }
  };
  const stop = () => { if (recogRef.current) { try { recogRef.current.stop(); } catch (e) {} recogRef.current = null; } setRecording(false); };

  return (
    <div style={{ background: t.card, border: `1.5px solid ${recording ? ACC : t.border}`, borderRadius: 16, padding: 18, marginTop: 16, boxShadow: t.cardShadow, position: 'relative', overflow: 'hidden' }}>
      {recording && <div style={{ position: 'absolute', inset: 0, background: GRAD.orange, opacity: 0.05 }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, position: 'relative' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: ACC, display: 'flex', alignItems: 'center', gap: 6 }}><Icon C={Mic} size={15} color={ACC} /> Voice Memo</div>
          <div style={{ fontSize: 12, color: t.textSec, marginTop: 2 }}>How did the session feel?</div>
        </div>
        {supported ? (
          <button onClick={recording ? stop : start} style={{
            background: recording ? '#DC2626' : GRAD.orange, color: '#fff', border: 'none', borderRadius: 999,
            padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
            boxShadow: recording ? '0 4px 12px rgba(220,38,38,0.35)' : '0 4px 12px rgba(232,69,27,0.35)',
          }}>{recording ? '■ STOP' : '● RECORD'}</button>
        ) : <span style={{ fontSize: 11, color: t.textSec, fontStyle: 'italic' }}>Type below</span>}
      </div>
      {recording && <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 8, fontWeight: 600, position: 'relative' }}>● Listening...</div>}
      <textarea value={transcript || ''} onChange={e => setTranscript(e.target.value)}
        placeholder="Type or speak your reflection..."
        rows={3}
        style={{ width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: 12, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, boxSizing: 'border-box' as const, resize: 'vertical', fontFamily: FONT, lineHeight: 1.5, position: 'relative' }} />
      {error && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 8, padding: '8px 10px', background: '#FEE2E2', borderRadius: 8, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><Icon C={AlertTriangle} size={12} color="#DC2626" /> {error}</div>}
    </div>
  );
}

function computeCoverage(workout) {
  const coverage = {};
  if (workout.stations) {
    Object.entries(workout.stations).forEach(([id, data]: [string, any]) => {
      if (data.time) coverage[id] = { pct: 100, source: 'direct' };
    });
  }
  if (workout.translated?.length) {
    workout.translated.forEach(tx => {
      const meta = getStationMeta(tx.station);
      const effective = tx.val * (tx.match / 100);
      const pct = Math.min(100, Math.round(effective / meta.target * 100));
      const ex = coverage[tx.station];
      if (!ex || ex.pct < pct) coverage[tx.station] = { pct, source: 'translated' };
    });
  }
  if (workout.runs?.count) {
    const meters = workout.runs.count * 1000;
    const pct = Math.min(100, Math.round(meters / 8000 * 100));
    const ex = coverage['run'];
    if (!ex || ex.pct < pct) coverage['run'] = { pct, source: 'direct' };
  }
  const all = [...STATIONS.map(s => s.id), 'run'];
  const overallPct = Math.round(all.reduce((a, id) => a + (coverage[id]?.pct || 0), 0) / all.length);
  return { coverage, overallPct, stationCount: Object.keys(coverage).length };
}

function WorkoutSummary({ workout, compact }) {
  const { t } = useTheme();
  const { coverage, overallPct, stationCount } = computeCoverage(workout);
  const total = STATIONS.length + 1;

  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: '20px 22px', boxShadow: t.cardShadow, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: GRAD.orangeGlow }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.5, color: t.textSec, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Summary</div>
          <div style={{ fontSize: 14, color: t.textMute, fontWeight: 500 }}>{stationCount}/{total} elements covered</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: ACC, lineHeight: 1, letterSpacing: -1, background: GRAD.orange, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{overallPct}%</div>
          <div style={{ fontSize: 10, color: t.textSec, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>Race coverage</div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {[...STATIONS, { id: 'run', abbr: 'RUN', color: ACC, grad: GRAD.orange }].map(s => {
          const c = coverage[s.id];
          const pct = c?.pct || 0;
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ minWidth: 44 }}><Pill grad={s.grad} size="sm">{s.abbr}</Pill></div>
              <div style={{ flex: 1, height: 8, background: t.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: s.grad, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)', borderRadius: 4 }} />
              </div>
              <div style={{ minWidth: 48, textAlign: 'right', fontSize: 13, fontWeight: 700, color: pct > 0 ? s.color : t.borderInput }}>{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard({ workouts, pbs, setTab, profile, deleteWorkout }) {
  const { t } = useTheme();
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo).length;
  const lastWorkout = workouts.length ? workouts[workouts.length - 1] : null;
  const totalElements = workouts.reduce((a: number, w: any) => a + Object.values(w.stations || {}).filter((s: any) => s.time).length + (w.translated?.length || 0), 0);
  const cumulative = cumulativeScore(workouts, pbs);
  const firstName = profile.name?.split(' ')[0] || 'athlete';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const scorePct = cumulative / 80 * 100;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, color: t.text, marginBottom: 6, fontWeight: 700, letterSpacing: '-0.01em' }}>{greeting},</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: -0.8, display: 'flex', alignItems: 'center', gap: 10 }}>{firstName} <Icon C={Hand} size={26} color={t.text} className="anim-wave" /></div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <Pill grad={GRAD.orange} size="md">{profile.athleteType?.toUpperCase()}</Pill>
          <Pill color={t.textSec} size="md">{profile.level?.toUpperCase()}</Pill>
        </div>
      </div>

      {/* HERO SCORE CARD */}
      <div style={{
        background: GRAD.darkHero, color: '#fff', borderRadius: 24, padding: '28px 28px', marginBottom: 28,
        position: 'relative', overflow: 'hidden', boxShadow: t.heroShadow,
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, background: GRAD.orangeGlow, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, background: 'linear-gradient(135deg, #404040 0%, #1a1a1a 100%)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2.5, color: ACC_BRIGHT, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>Hyrox Score</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 64, fontWeight: 900, background: GRAD_LIGHT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -2.5, lineHeight: 0.9 }}>{cumulative.toFixed(1)}</span>
                <span style={{ fontSize: 22, color: '#9ca3af', fontWeight: 500 }}>/ 80</span>
              </div>
              <div style={{ fontSize: 13, color: '#c7c7d0', marginTop: 12, fontWeight: 500 }}>Cumulative · 8 stations</div>
            </div>
            <button onClick={() => setTab('friends')} style={{
              background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 999, padding: '11px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
            }}>COMPARE →</button>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${scorePct}%`, height: '100%', background: GRAD.orangeGlow, borderRadius: 4, boxShadow: '0 0 12px rgba(255,107,53,0.6)' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 36 }}>
        <StatCard label="Sessions" value={workouts.length} sub="all time" icon={<Icon C={BarChart3} size={20} color="#fff" />} grad={GRAD.blue} />
        <StatCard label="This week" value={thisWeek} sub="sessions" icon={<Icon C={Flame} size={20} color="#fff" className="anim-flicker" />} grad={GRAD.orange} />
        <StatCard label="Elements" value={totalElements} sub="logged" icon={<Icon C={Zap} size={20} color="#fff" />} grad={GRAD.purple} />
      </div>

      {lastWorkout && (
        <div style={{ marginBottom: 28 }}>
          <SectionTitle accent={ACC}>
            Last Workout
            {lastWorkout.isTest && <span style={{ marginLeft: 10, fontSize: 11, background: GRAD.amber, color: '#fff', padding: '4px 10px', borderRadius: 999, fontWeight: 700, letterSpacing: 0.5 }}>TEST</span>}
          </SectionTitle>
          <div style={{ position: 'relative' }}>
            {lastWorkout.isTest && <div style={{ position: 'absolute', inset: 0, borderRadius: 18, border: '2px solid #F59E0B', pointerEvents: 'none', zIndex: 1 }} />}
            <WorkoutSummary workout={lastWorkout} compact />
          </div>
          {lastWorkout.isTest && deleteWorkout && (
            <button onClick={() => deleteWorkout(lastWorkout.id)} style={{
              marginTop: 10, width: '100%', padding: '11px', fontSize: 13, fontWeight: 600,
              background: 'transparent', color: '#D97706', border: '1.5px dashed #F59E0B', borderRadius: 10,
              cursor: 'pointer', fontFamily: FONT,
            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Trash2} size={14} /> Delete this test workout</span></button>
          )}
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <SectionTitle accent={ACC}>Station Scores</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 16 }}>
          {STATIONS.map(s => {
            const pb = pbs[s.id];
            const sc = computeStationScore(s.id, workouts, pb);
            const scoreColor = sc ? (sc.score >= 9 ? ACC : sc.score >= 7 ? '#525252' : '#a3a3a3') : t.borderInput;
            return (
              <div key={s.id} style={{
                background: t.card, border: `1px solid ${t.border}`, borderRadius: 18,
                padding: '16px 18px', boxShadow: t.cardShadow, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.grad }} />
                <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, background: s.grad, borderRadius: '50%', filter: 'blur(40px)', opacity: 0.15 }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, marginBottom: 3, background: s.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.abbr}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{s.name}</div>
                    </div>
                    {sc?.isPB && <span style={{ fontSize: 9, background: GRAD.green, color: '#fff', padding: '4px 8px', borderRadius: 999, fontWeight: 800, letterSpacing: 0.5, boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>NEW PB</span>}
                    {sc?.trend === 'up' && !sc?.isPB && <span style={{ fontSize: 22, color: '#10B981', fontWeight: 700 }}>↑</span>}
                    {sc?.trend === 'down' && <span style={{ fontSize: 22, color: '#EF4444', fontWeight: 700 }}>↓</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 14 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, color: scoreColor, lineHeight: 1, letterSpacing: -1.5 }}>{sc ? sc.score.toFixed(1) : '—'}</span>
                    <span style={{ fontSize: 14, color: t.textSec, fontWeight: 600 }}>/10</span>
                  </div>
                  <div style={{ marginTop: 12, height: 7, background: t.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${sc ? sc.score * 10 : 0}%`, height: '100%', background: s.grad, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)', borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: t.textSec, marginTop: 10, fontWeight: 500 }}>{sc ? `PB ${fmtTime(pb.time)} · Last ${fmtTime(sc.latest)}` : 'No data yet'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={() => setTab('log')} style={{
        background: GRAD.orange, color: '#fff', border: 'none', borderRadius: 18,
        padding: '20px', fontSize: 17, fontWeight: 800, cursor: 'pointer', width: '100%',
        fontFamily: FONT, letterSpacing: 0.3, boxShadow: '0 12px 32px rgba(232,69,27,0.35)',
      }}>+ LOG WORKOUT</button>
    </div>
  );
}

function Friends({ profile, saveProfile, workouts, pbs }) {
  const { t } = useTheme();
  const [friends, setFriends] = useState([]);
  const [addId, setAddId] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  const myCumulative = cumulativeScore(workouts, pbs);
  const myStationScores = STATIONS.reduce((a, s) => {
    a[s.id] = computeStationScore(s.id, workouts, pbs[s.id])?.score || 0;
    return a;
  }, {});

  const loadFriends = async () => {
    const list = [];
    for (const fid of (profile.friends || [])) {
      try {
        const r = await (window.storage.get as any)(`athlete:${fid}`, true);
        if (r) list.push({ ...JSON.parse(r.value), userId: fid });
      } catch (e) {}
    }
    setFriends(list);
  };
  useEffect(() => { loadFriends(); }, [profile.friends?.join(',')]);

  const addFriend = async () => {
    const id = addId.trim().toUpperCase();
    setError('');
    if (!id) return;
    if (id === profile.userId) { setError("That's your own ID!"); return; }
    if (profile.friends?.includes(id)) { setError('Already added'); return; }
    setAdding(true);
    try {
      const r = await (window.storage.get as any)(`athlete:${id}`, true);
      if (!r) { setError('No athlete found'); setAdding(false); return; }
      await saveProfile({ ...profile, friends: [...(profile.friends || []), id] });
      setAddId('');
    } catch (e) { setError('Could not add'); }
    setAdding(false);
  };

  const removeFriend = async (id) => {
    await saveProfile({ ...profile, friends: (profile.friends || []).filter(f => f !== id) });
  };

  const copyMyId = async () => {
    try { await navigator.clipboard.writeText(profile.userId); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) {}
  };

  const typeIcon = { strength: Dumbbell, hybrid: Zap, endurance: Activity };
  const leaderboard = [
    { userId: profile.userId, name: profile.name, athleteType: profile.athleteType, eventCity: profile.eventCity, cumulativeScore: myCumulative, stationScores: myStationScores, totalSessions: workouts.length, isMe: true },
    ...friends
  ].sort((a, b) => (b.cumulativeScore || 0) - (a.cumulativeScore || 0));
  const myRank = leaderboard.findIndex(x => x.isMe) + 1;
  const medals = [Trophy, Award, Award];

  return (
    <div>
      <div style={{
        background: GRAD.darkHero, color: '#fff', borderRadius: 24, padding: '26px 28px', marginBottom: 22,
        position: 'relative', overflow: 'hidden', boxShadow: t.heroShadow,
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, background: GRAD.orangeGlow, borderRadius: '50%', filter: 'blur(70px)', opacity: 0.4 }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2.5, color: ACC_BRIGHT, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Your Rank</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: -2, lineHeight: 0.9 }}>#{myRank}</span>
              <span style={{ fontSize: 18, color: '#9ca3af', fontWeight: 500 }}>of {leaderboard.length}</span>
            </div>
            <div style={{ fontSize: 14, color: '#c7c7d0', marginTop: 10 }}>{myCumulative.toFixed(1)}/80 · cumulative</div>
          </div>
          <div style={{ fontSize: 64, color: '#fff' }}><Icon C={myRank === 1 ? Trophy : Award} size={56} color="#fff" /></div>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <SectionTitle accent={ACC}>Leaderboard</SectionTitle>
        <div style={{ display: 'grid', gap: 10 }}>
          {leaderboard.map((a, i) => {
            const rank = i + 1;
            const isMe = a.isMe;
            const TypeIcon = typeIcon[a.athleteType] || Activity;
            return (
              <div key={a.userId} style={{
                background: isMe ? `linear-gradient(135deg, ${ACC}15 0%, ${ACC}05 100%)` : t.card,
                border: `1.5px solid ${isMe ? ACC : t.border}`,
                borderRadius: 16, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: isMe ? '0 8px 24px rgba(232,69,27,0.12)' : t.cardShadow,
              }}>
                <div style={{ minWidth: 40, textAlign: 'center' }}>
                  {rank <= 3 ? <Icon C={medals[rank - 1]} size={26} color={t.text} /> : <span style={{ fontSize: 20, fontWeight: 800, color: t.textSec }}>#{rank}</span>}
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 24,
                  background: isMe ? GRAD.orange : t.surfaceAlt,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  boxShadow: isMe ? '0 4px 12px rgba(232,69,27,0.3)' : 'none',
                }}><Icon C={TypeIcon} size={22} color={isMe ? '#fff' : t.text} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {a.name}
                    {isMe && <span style={{ fontSize: 10, background: GRAD.orange, color: '#fff', padding: '3px 8px', borderRadius: 999, fontWeight: 800 }}>YOU</span>}
                  </div>
                  <div style={{ fontSize: 13, color: t.textSec, marginTop: 2 }}>Hyrox {a.eventCity} · {a.totalSessions || 0} sessions</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, background: GRAD.orange, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, letterSpacing: -0.5 }}>{(a.cumulativeScore || 0).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: t.textSec, marginTop: 3, fontWeight: 500 }}>/ 80</div>
                </div>
                {!isMe && <button onClick={() => removeFriend(a.userId)} style={{ background: 'none', border: 'none', color: t.borderInput, cursor: 'pointer', fontSize: 22, padding: 4, fontFamily: FONT }}>×</button>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <SectionTitle accent={ACC}>Add a Friend</SectionTitle>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: 18, boxShadow: t.cardShadow }}>
          <div style={{ fontSize: 13, color: t.textSec, marginBottom: 12 }}>Enter your friend's 6-character Athlete ID:</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" maxLength={6} value={addId} onChange={e => { setAddId(e.target.value.toUpperCase()); setError(''); }} placeholder="A3F9XB"
              style={{ flex: 1, padding: '16px', fontSize: 20, fontWeight: 700, borderRadius: 12, border: `1.5px solid ${t.borderInput}`, background: t.inputBg, color: t.text, boxSizing: 'border-box' as const, fontFamily: 'SF Mono, Monaco, monospace', letterSpacing: 4, textAlign: 'center', textTransform: 'uppercase' }} />
            <button onClick={addFriend} disabled={adding || !addId} style={{
              padding: '16px 24px', fontSize: 14, fontWeight: 700,
              background: adding || !addId ? t.borderInput : GRAD.orange, color: '#fff', border: 'none', borderRadius: 12,
              cursor: adding || !addId ? 'not-allowed' : 'pointer', fontFamily: FONT,
              boxShadow: adding || !addId ? 'none' : '0 4px 12px rgba(232,69,27,0.3)',
            }}>{adding ? '...' : 'ADD'}</button>
          </div>
          {error && <div style={{ fontSize: 13, color: '#DC2626', marginTop: 10, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><Icon C={AlertTriangle} size={13} color="#DC2626" /> {error}</div>}
        </div>
      </div>

      <div style={{ background: GRAD.darkHero, borderRadius: 18, padding: 20, position: 'relative', overflow: 'hidden', boxShadow: t.cardShadow }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: GRAD.orangeGlow, borderRadius: '50%', filter: 'blur(50px)', opacity: 0.3 }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Your Athlete ID</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'SF Mono, Monaco, monospace', letterSpacing: 4, color: '#fff' }}>{profile.userId}</div>
            <button onClick={copyMyId} style={{
              padding: '11px 20px', fontSize: 13, fontWeight: 700,
              background: copied ? GRAD.green : GRAD.orange, color: '#fff', border: 'none', borderRadius: 999,
              cursor: 'pointer', fontFamily: FONT,
              boxShadow: copied ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(232,69,27,0.3)',
            }}>{copied ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Check} size={13} color="#fff" /> COPIED</span> : 'COPY ID'}</button>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>Share this code with friends to let them add you.</div>
        </div>
      </div>
    </div>
  );
}

function PasteParser({ onImport, lbl, inp }) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState([]);

  const parsePastedExercises = (text) => {
    const lines = text.split(/\n|→|,(?=\s*[A-Z])/g).map(l => l.trim()).filter(l => l.length > 3);
    const keywords = {
      thruster: 'thrusters', squat: 'squats', bench: 'bench', deadlift: 'deadlifts',
      row: 'rows', "farmer's": 'farmers', farmer: 'farmers',
      lunge: 'lunges', burpee: 'burpees',
      interval: 'intervals', 'long run': 'longrun', 'z2': 'longrun',
      cycle: 'cycle', bike: 'cycle',
    };
    const parsed = [];
    for (const line of lines) {
      const lower = line.toLowerCase();
      let match = null;
      for (const [kw, id] of Object.entries(keywords)) {
        if (lower.includes(kw)) { match = EQUIV.find(e => e.id === id); if (match) break; }
      }
      if (!match) continue;
      const setsXreps = line.match(/(\d+)\s*[x×]\s*(\d+)/i);
      const weight = line.match(/(\d+(?:\.\d+)?)\s*kg/i);
      const distM = line.match(/(\d+(?:\.\d+)?)\s*m(?!in|\w)/i);
      const distKm = line.match(/(\d+(?:\.\d+)?)\s*km/i);
      const level = line.match(/(?:lvl|level)\s*(\d+)/i);
      const vals = {};
      for (const f of match.fields) {
        vals[f.k] = f.d;
        if (setsXreps) {
          if (f.k === 'sets') vals[f.k] = parseInt(setsXreps[1]);
          if (f.k === 'reps') vals[f.k] = parseInt(setsXreps[2]);
        }
        if (weight && f.k === 'weight') vals[f.k] = parseFloat(weight[1]);
        if (distM && f.k === 'distance' && !distKm) vals[f.k] = parseFloat(distM[1]);
        if (distKm && f.k === 'distance') vals[f.k] = parseFloat(distKm[1]);
        if (level && f.k === 'level') vals[f.k] = parseInt(level[1]);
      }
      parsed.push({ original: line, exId: match.id, name: match.name, station: match.station, match: match.match, inputs: vals, val: match.calc(vals) });
    }
    return parsed;
  };

  const handleClipboard = async () => {
    try { const tx = await navigator.clipboard.readText(); setText(tx); }
    catch (e) { alert('Clipboard access denied.'); }
  };

  if (!open) {
    return <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '16px', fontSize: 14, fontWeight: 700, background: t.surfaceAlt, color: t.text, border: `2px dashed ${t.borderInput}`, borderRadius: 12, cursor: 'pointer', marginBottom: 16, fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icon C={Clipboard} size={14} /> PASTE / IMPORT EXERCISES</button>;
  }

  return (
    <div style={{ background: t.card, border: `2px solid ${ACC}`, borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: '0 8px 24px rgba(232,69,27,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: ACC, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}><Icon C={Clipboard} size={14} color={ACC} /> IMPORT</div>
        <button onClick={() => { setOpen(false); setText(''); setParsed([]); }} style={{ background: 'none', border: 'none', color: t.textSec, cursor: 'pointer', fontSize: 24, fontFamily: FONT }}>×</button>
      </div>
      <div style={{ fontSize: 13, color: t.textSec, marginBottom: 12, lineHeight: 1.5 }}>Paste your routine — we'll parse and translate.</div>
      <button onClick={handleClipboard} style={{ fontSize: 13, padding: '10px 16px', background: t.card, color: ACC, border: `1.5px solid ${ACC}`, borderRadius: 10, cursor: 'pointer', marginBottom: 10, fontWeight: 700, fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Pin} size={13} color={ACC} /> PASTE FROM CLIPBOARD</button>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={`Squats 3×8\nDB Thrusters 5×15\nFarmer's Carry 4×40m`} rows={5} style={{ ...inp, resize: 'vertical' }} />
      {text && <button onClick={() => setParsed(parsePastedExercises(text))} style={{ marginTop: 10, width: '100%', padding: '14px', fontSize: 14, fontWeight: 700, background: GRAD.orange, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 4px 12px rgba(0,0,0,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icon C={Zap} size={14} color="#fff" /> PARSE</button>}
      {parsed.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.textSec, marginBottom: 10 }}>PARSED ({parsed.length})</div>
          <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            {parsed.map((p, i) => {
              const meta = getStationMeta(p.station);
              const col = p.station === 'run' ? ACC : STATION_META[p.station]?.color;
              return (
                <div key={i} style={{ background: t.surfaceAlt, borderRadius: 12, padding: '12px 14px', borderLeft: `4px solid ${col}` }}>
                  <div style={{ fontSize: 12, color: t.textSec, fontStyle: 'italic', marginBottom: 3 }}>"{p.original}"</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{p.name} → <span style={{ color: col, fontWeight: 700 }}>{p.val} {meta.unit} {meta.abbr}</span></div>
                </div>
              );
            })}
          </div>
          <button onClick={() => { onImport(parsed); setText(''); setParsed([]); setOpen(false); }} style={{ width: '100%', padding: '14px', fontSize: 14, fontWeight: 700, background: GRAD.green, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 4px 12px rgba(0,0,0,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icon C={Check} size={14} color="#fff" /> IMPORT ALL</button>
        </div>
      )}
    </div>
  );
}

function DayExerciseCard({ raw, equiv, parsed, onAdd, t, inp, lbl, swap }: any) {
  const hasReps = equiv.fields.some((f: any) => f.k === 'reps');
  const hasDistance = equiv.fields.some((f: any) => f.k === 'distance');
  const initial = (() => {
    const d: any = {};
    equiv.fields.forEach((f: any) => { d[f.k] = f.d; });
    if (parsed.sets != null && equiv.fields.some((f: any) => f.k === 'sets')) d.sets = parsed.sets;
    if (parsed.reps != null && hasReps) d.reps = parsed.reps;
    if (parsed.weight != null && equiv.fields.some((f: any) => f.k === 'weight')) d.weight = parsed.weight;
    if (parsed.distance != null && hasDistance) d.distance = parsed.distance;
    // "N×Mm" prescriptions: when EQUIV expects a per-set distance (not reps), use setDistance.
    if (parsed.setDistance != null && hasDistance && !hasReps) d.distance = parsed.setDistance;
    return d;
  })();
  const [vals, setVals] = useState<any>(initial);
  const meta = getStationMeta(equiv.station);
  const color = equiv.station === 'run' ? ACC : STATION_META[equiv.station]?.color;
  const grad = equiv.station === 'run' ? GRAD.orange : STATION_META[equiv.station]?.grad;
  const preview = equiv.calc(Object.fromEntries(Object.entries(vals).map(([k, v]) => {
    if (v === '' || v == null) return [k, 0];
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return [k, Number.isFinite(n) ? n : 0];
  })));
  const pct = Math.min(100, Math.round(preview * (equiv.match / 100) / meta.target * 100));
  const compactInp = { ...inp, padding: '9px 12px', fontSize: 14, borderRadius: 9 };
  const compactLbl = { ...lbl, fontSize: 10, marginBottom: 5 };
  const speedField = equiv.fields.find((f: any) => f.type === 'speed');
  const speed = speedField ? parseFloat(vals[speedField.k]) || 0 : 0;
  const paceStr = (() => {
    if (speed <= 0) return null;
    const secsPerKm = Math.round(3600 / speed);
    const m = Math.floor(secsPerKm / 60);
    const s = secsPerKm % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  })();
  const add = () => {
    onAdd({ exId: equiv.id, name: equiv.name, station: equiv.station, match: equiv.match, val: preview, inputs: { ...vals } });
    setVals(initial);
  };
  return (
    <div style={{ background: t.card, border: `1.5px solid ${t.border}`, borderRadius: 14, padding: 14, boxShadow: t.cardShadow, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: grad }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, paddingLeft: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{raw}</div>
        <Pill grad={grad} size="sm">→ {meta.abbr}</Pill>
      </div>
      <div style={{ fontSize: 11, color: t.textSec, fontWeight: 500, marginBottom: swap ? 4 : 12, paddingLeft: 4 }}>logs as <span style={{ color: ACC, fontWeight: 700 }}>{equiv.name}</span> · {equiv.match}% match</div>
      {swap && (
        <div style={{ fontSize: 11, color: t.textSec, fontStyle: 'italic', marginBottom: 12, paddingLeft: 4 }}>↳ no gear? swap: <span style={{ color: t.text, fontWeight: 600 }}>{swap}</span></div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${equiv.fields.length}, 1fr)`, gap: 8, marginBottom: 10 }}>
        {equiv.fields.map((f: any) => (
          <div key={f.k}>
            <label style={compactLbl}>{f.l.toUpperCase()}</label>
            <input type={f.type === 'text' ? 'text' : 'number'} step={f.type === 'speed' ? '0.1' : undefined} placeholder={String(f.d ?? '')} value={vals[f.k] ?? ''}
              onChange={e => setVals({ ...vals, [f.k]: e.target.value })}
              style={compactInp} />
          </div>
        ))}
      </div>
      {paceStr && (
        <div style={{ background: t.surfaceAlt, borderRadius: 10, padding: '9px 12px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: t.textSec, fontWeight: 500 }}>Pace from {speed} km/hr</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text, letterSpacing: -0.4 }}>{paceStr}<span style={{ fontSize: 11, color: t.textSec, fontWeight: 500 }}>/km</span></div>
        </div>
      )}
      <div style={{ background: grad, color: '#fff', borderRadius: 10, padding: '10px 12px', marginBottom: 10, boxShadow: `0 3px 10px ${color}25` }}>
        <div style={{ fontSize: 9, letterSpacing: 1.4, fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', opacity: 0.9 }}>Hyrox Equivalent</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.6 }}>{preview}</span>
          <span style={{ fontSize: 11, opacity: 0.9 }}>{meta.unit} of {meta.name}</span>
        </div>
        <div style={{ fontSize: 10, opacity: 0.85, marginTop: 3 }}>{pct}% of race target</div>
      </div>
      <button onClick={add} style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 700, background: grad, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: FONT, boxShadow: `0 3px 10px ${color}25` }}>+ ADD TO WORKOUT</button>
    </div>
  );
}

function TranslateMode({ translated, setTranslated, inp, lbl, profile }: any) {
  const { t } = useTheme();
  const week = profile ? getCurrentWeekPlan(profile, new Date()) : null;
  const todayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const activeDay = week?.days?.find((d: any) => d.day === todayName);

  const onAdd = (item: any) => setTranslated([...translated, item]);
  const remove = (i: number) => setTranslated(translated.filter((_, idx) => idx !== i));

  return (
    <div>
      <PasteParser onImport={(items) => setTranslated([...translated, ...items])} lbl={lbl} inp={inp} />

      {week && activeDay && (() => {
        const items = (activeDay.sessions || []).map((s: string) => {
          const p = parseExercisePrescription(s);
          const m = findEquivMatch(p);
          return { raw: s, parsed: p, match: m };
        });
        const matched = items.filter((it: any) => it.match);
        const unmatched = items.filter((it: any) => !it.match);
        return (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: ACC, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon C={Calendar} size={12} color={ACC} /> Today · {activeDay.day}
              </div>
              <div style={{ fontSize: 11, color: t.textSec, fontWeight: 500 }}>Week {week.n} · {week.phase?.label}</div>
            </div>

            {matched.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {matched.map((it: any, i: number) => (
                  <DayExerciseCard key={`${activeDay.day}_${i}_${it.raw}`} raw={it.raw} parsed={it.parsed} equiv={it.match} onAdd={onAdd} t={t} inp={inp} lbl={lbl} swap={getSubstitution(it.raw, profile?.equipment || 'gym')} />
                ))}
              </div>
            ) : (
              <div style={{ background: t.surfaceAlt, border: `1px dashed ${t.border}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center', fontSize: 12, color: t.textSec, fontStyle: 'italic' }}>
                No Hyrox-translatable exercises in today's plan. Use paste-import above for custom logging.
              </div>
            )}

            {unmatched.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: t.textSec, marginBottom: 8, textTransform: 'uppercase', paddingLeft: 4 }}>Other prescribed (no Hyrox equivalent)</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {unmatched.map((it: any, i: number) => (
                    <div key={i} style={{ padding: '10px 12px', background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 12, color: t.textSec, opacity: 0.75 }}>
                      {it.raw}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, color: t.textSec, marginTop: 12, fontStyle: 'italic', paddingLeft: 4 }}>Edit each exercise's sets/reps/weight to what you actually did, then tap Add.</div>
          </div>
        );
      })()}

      {week && !activeDay && (
        <div style={{ background: t.surfaceAlt, border: `1px dashed ${t.border}`, borderRadius: 12, padding: '16px', textAlign: 'center', fontSize: 13, color: t.textSec, marginBottom: 18 }}>
          Rest day — nothing scheduled for {todayName}. Use paste-import above to log anything else.
        </div>
      )}

      {!week && (
        <div style={{ background: t.surfaceAlt, border: `1px dashed ${t.border}`, borderRadius: 12, padding: '16px', textAlign: 'center', fontSize: 13, color: t.textSec, marginBottom: 18 }}>
          Set up your profile and weekly plan to see today's exercises here.
        </div>
      )}

      {translated.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: t.textSec, marginBottom: 12, textTransform: 'uppercase' }}>Added ({translated.length})</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {translated.map((tx, i) => {
              const col = tx.station === 'run' ? ACC : STATION_META[tx.station]?.color;
              const g = tx.station === 'run' ? GRAD.orange : STATION_META[tx.station]?.grad;
              const m = getStationMeta(tx.station);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: '12px 16px', boxShadow: t.cardShadow, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: g }} />
                  <div style={{ flex: 1, paddingLeft: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{tx.name}</div>
                    <div style={{ fontSize: 12, color: t.textSec, marginTop: 2 }}>→ {tx.val} {m.unit} {m.abbr}</div>
                  </div>
                  <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: t.textSec, cursor: 'pointer', fontSize: 22, padding: 4, fontFamily: FONT }}>×</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DirectMode({ stationData, setStation, runCount, setRunCount, runPace, setRunPace, inp, lbl }) {
  const { t } = useTheme();
  const [runMode, setRunMode] = useState('pace');
  const [runKm, setRunKm] = useState('');
  const [runSpeed, setRunSpeed] = useState('');

  useEffect(() => {
    if (runMode !== 'speed') return;
    const km = parseFloat(runKm);
    const speed = parseFloat(runSpeed);
    if (km > 0 && speed > 0) {
      const secsPerKm = Math.round(3600 / speed);
      const m = Math.floor(secsPerKm / 60);
      const s = secsPerKm % 60;
      setRunPace(`${m}:${String(s).padStart(2, '0')}`);
      setRunCount(Math.round(km));
    }
  }, [runKm, runSpeed, runMode]);

  return (
    <div>
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: 18, marginBottom: 14, boxShadow: t.cardShadow, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: GRAD.orange }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: ACC, letterSpacing: 1, textTransform: 'uppercase' }}>Running</div>
          <div style={{ display: 'flex', gap: 4, background: t.surfaceAlt, padding: 4, borderRadius: 10 }}>
            <button onClick={() => setRunMode('pace')} style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 700, borderRadius: 7, cursor: 'pointer', border: 'none', fontFamily: FONT,
              background: runMode === 'pace' ? t.card : 'transparent', color: runMode === 'pace' ? ACC : t.textSec,
              boxShadow: runMode === 'pace' ? t.cardShadow : 'none',
            }}>By Pace</button>
            <button onClick={() => setRunMode('speed')} style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 700, borderRadius: 7, cursor: 'pointer', border: 'none', fontFamily: FONT,
              background: runMode === 'speed' ? t.card : 'transparent', color: runMode === 'speed' ? ACC : t.textSec,
              boxShadow: runMode === 'speed' ? t.cardShadow : 'none',
            }}>By Speed</button>
          </div>
        </div>
        {runMode === 'pace' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>1KM RUNS</label><input type="number" min="0" max="12" placeholder="0" value={runCount === 0 ? '' : runCount} onChange={e => setRunCount(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)} style={inp} /></div>
            <div><label style={lbl}>AVG PACE (MM:SS)</label><input type="text" placeholder="5:30" value={runPace} onChange={e => setRunPace(e.target.value)} style={inp} /></div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div><label style={lbl}>DISTANCE (KM)</label><input type="number" step="0.1" value={runKm} onChange={e => setRunKm(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>SPEED (KM/HR)</label><input type="number" step="0.1" value={runSpeed} onChange={e => setRunSpeed(e.target.value)} style={inp} /></div>
            </div>
            {runPace && runKm && runSpeed && (
              <div style={{ background: GRAD.orange, color: '#fff', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(232,69,27,0.25)' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9 }}>Calculated Pace</div>
                  <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>{runKm}km @ {runSpeed}km/hr</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1 }}>{runPace}<span style={{ fontSize: 13, opacity: 0.8, fontWeight: 500 }}>/km</span></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: t.textSec, marginBottom: 10, textTransform: 'uppercase' }}>Stations</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {STATIONS.map(s => {
          const d = stationData[s.id] || {};
          const active = d.time || d.weight;
          const compactInp = { ...inp, padding: '9px 12px', fontSize: 14, borderRadius: 9 };
          const compactLbl = { ...lbl, fontSize: 10, marginBottom: 5 };
          return (
            <div key={s.id} style={{ background: t.card, border: `1px solid ${active ? s.color : t.border}`, borderRadius: 12, padding: '10px 12px', boxShadow: active ? `0 2px 10px ${s.color}20` : t.cardShadow, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: s.grad }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7, paddingLeft: 4 }}>
                <div><span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{s.name}</span><span style={{ fontSize: 11, color: t.textSec, marginLeft: 6 }}>{s.desc}</span></div>
                <Pill grad={s.grad} size="sm">{s.abbr}</Pill>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: s.hasWeight ? '1fr 1fr' : '1fr', gap: 8, paddingLeft: 4 }}>
                <div><label style={compactLbl}>TIME (MM:SS)</label><input type="text" placeholder="4:30" value={d.time || ''} onChange={e => setStation(s.id, 'time', e.target.value)} style={compactInp} /></div>
                {s.hasWeight && <div><label style={compactLbl}>WEIGHT (KG)</label><input type="number" step="2.5" placeholder="0" value={d.weight || ''} onChange={e => setStation(s.id, 'weight', e.target.value)} style={compactInp} /></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Diff a logged workout against today's planned prescriptions. Returns null if
// there's no plan or nothing today, otherwise a per-prescription adherence
// breakdown so the coach can be specific instead of generic.
function computePlanAdherence(workout: any, profile: any) {
  if (!profile) return null;
  const when = workout?.date ? new Date(workout.date) : new Date();
  const week = getCurrentWeekPlan(profile, when);
  if (!week) return null;
  const todayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][when.getDay()];
  const day = (week.days || []).find((d: any) => d.day === todayName);
  if (!day || !day.sessions?.length) return null;

  const prescribed = day.sessions.map((raw: string) => {
    const parsed = parseExercisePrescription(raw);
    const match = findEquivMatch(parsed);
    return { raw, parsed, match };
  }).filter((p: any) => p.match);

  if (!prescribed.length) return { hasPlan: true, prescribed: 0, items: [], overall: 'no-translatable' };

  const logged = workout?.translated || [];
  const stationLogs = workout?.stations || {};
  const hasRun = !!(workout?.runs && workout.runs.count > 0);

  const items = prescribed.map((p: any) => {
    const targetStation = p.match.station;
    const matchingLogs = logged.filter((l: any) => l.station === targetStation);
    const stationLog = stationLogs[targetStation];
    const wasLogged = matchingLogs.length > 0 || !!stationLog?.time || (targetStation === 'run' && hasRun);

    if (!wasLogged) return { ...p, status: 'skipped' as const, issues: [] as string[] };

    const lg = matchingLogs[0];
    if (!lg) return { ...p, status: 'done' as const, issues: [] as string[] };

    const inp = lg.inputs || {};
    const issues: string[] = [];
    const num = (v: any) => { const n = typeof v === 'string' ? parseFloat(v) : v; return Number.isFinite(n) ? n : null; };
    const ls = num(inp.sets), lr = num(inp.reps), lw = num(inp.weight), ld = num(inp.distance);
    const prescribedDist = p.parsed.distance ?? p.parsed.setDistance;
    if (p.parsed.sets != null && ls != null && ls < p.parsed.sets) issues.push('sets');
    if (p.parsed.reps != null && lr != null && lr < p.parsed.reps) issues.push('reps');
    if (p.parsed.weight != null && p.parsed.weight > 0 && lw != null && lw < p.parsed.weight) issues.push('weight');
    if (prescribedDist != null && ld != null && ld < prescribedDist) issues.push('distance');

    return { ...p, status: (issues.length ? 'partial' : 'done') as 'partial' | 'done', issues, logged: lg };
  });

  const done = items.filter(i => i.status === 'done').length;
  const partial = items.filter(i => i.status === 'partial').length;
  const skipped = items.filter(i => i.status === 'skipped').length;
  const prescribedStations = new Set(prescribed.map((p: any) => p.match.station));
  const offPlan = logged.filter((l: any) => !prescribedStations.has(l.station)).length;

  let overall: 'perfect' | 'all-skipped' | 'mostly-skipped' | 'partial' | 'mixed' | 'plan-plus';
  if (skipped === items.length) overall = 'all-skipped';
  else if (done === items.length && offPlan === 0) overall = 'perfect';
  else if (done === items.length && offPlan > 0) overall = 'plan-plus';
  else if (skipped > 0 && done === 0) overall = 'mostly-skipped';
  else if (partial > 0 && skipped === 0) overall = 'partial';
  else overall = 'mixed';

  return { hasPlan: true, prescribed: items.length, done, partial, skipped, offPlan, items, overall };
}

function getRecoveryTips(workout: any, allWorkouts: any[] = [], profile: any = null) {
  const stationIds = Object.keys(workout?.stations || {});
  const hasRun = !!(workout?.runs && workout.runs.count > 0);
  const heavy = ['sledPush', 'sledPull', 'farmers', 'lunges', 'wallballs'].filter(s => stationIds.includes(s));
  const cardio = ['skierg', 'rowing'].filter(s => stationIds.includes(s));
  const overhead = ['wallballs', 'burpee'].filter(s => stationIds.includes(s));
  const total = stationIds.length + (hasRun ? 1 : 0);

  // Weekly volume + back-to-back day awareness
  const now = Date.now();
  const weekCount = (allWorkouts || []).filter(w => (now - new Date(w.date).getTime()) <= 7 * 86400000).length;
  const yDate = new Date(now - 86400000).toDateString();
  const trainedYesterday = (allWorkouts || []).some(w => new Date(w.date).toDateString() === yDate && w.id !== workout?.id);

  // Race context
  const daysToRace = profile?.eventDate ? Math.max(0, Math.floor((new Date(profile.eventDate).getTime() - now) / 86400000)) : 999;
  const inTaper = daysToRace > 0 && daysToRace <= 14;

  // Voice memo sentiment
  const memo = (workout?.voiceMemo || '').toLowerCase();
  const tired = /\b(tired|exhausted|wiped|smoked|fried|cooked|drained)\b/.test(memo);
  const sore = /\b(sore|stiff|tight|aching|ache)\b/.test(memo);
  const great = /\b(great|strong|crushed|smashed|nailed|easy|fresh)\b/.test(memo);

  // Athlete profile
  const isStrength = profile?.athleteType === 'strength';
  const isEndurance = profile?.athleteType === 'endurance';
  const bw = parseFloat(profile?.bodyweight) || 75;
  const protein = Math.round(bw * 0.4);
  const carbs = Math.round(bw);

  // Stable PRNG seeded by workout id so the same log always yields the same tips
  let s = ((workout?.id || now) % 1_000_000) + 1;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const pick = (arr: any[]) => arr[Math.floor(rand() * arr.length)];

  const cands: Record<string, any[]> = { adherence: [], mobility: [], fuel: [], modality: [], context: [], soft: [] };

  // --- ADHERENCE (plan vs reality, with empathy) ---
  const adh = computePlanAdherence(workout, profile);
  if (adh && adh.prescribed > 0) {
    const skippedNames = adh.items.filter((i: any) => i.status === 'skipped').map((i: any) => i.match.name);
    const partialNames = adh.items.filter((i: any) => i.status === 'partial').map((i: any) => i.match.name);
    const weightDownItems = adh.items.filter((i: any) => i.issues?.includes('weight'));
    const setsRepsDownItems = adh.items.filter((i: any) => i.issues?.some((x: string) => x === 'sets' || x === 'reps'));

    if (adh.overall === 'perfect') {
      cands.adherence.push({ icon: Check, title: 'Plan executed clean', body: pick([
        'Hit every prescribed station today — no shortcuts. The boring days build the race.',
        "Followed today's plan to the letter. Consistency like this is what compounds.",
        "Plan complete, no skips. That's the quiet work that wins on race day.",
        'Nailed the script. Notice what made today flow — sleep, food, timing — and replicate.',
      ])});
    } else if (adh.overall === 'all-skipped') {
      cands.adherence.push({ icon: MessageCircle, title: "Today didn't go to plan", body: pick([
        `${skippedNames.length === 1 ? skippedNames[0] + ' got skipped' : `All ${skippedNames.length} planned items missed`} — life happens. Tomorrow's a fresh window.`,
        "Plan got cut short today. No drama — note why (energy, time, niggle?), and slot it back this week.",
        "Off the rails today. What matters is the next session, not this one. Pick tomorrow's slot now.",
        "Miss happens to everyone training for this. The streak isn't broken — show up tomorrow.",
      ])});
    } else if (adh.overall === 'mostly-skipped') {
      cands.adherence.push({ icon: MessageCircle, title: 'Partial session — that still counts', body: pick([
        `Got through ${adh.done + adh.partial} of ${adh.prescribed} today. Skipped: ${skippedNames.join(', ')}. Some work beats none.`,
        `Most of the plan went unlogged — was time the issue, or energy? Voice-memo it so the next plan can flex.`,
        `Today was light. Don't double-up tomorrow to "make up" — that compounds fatigue. Just hit the next one as written.`,
      ])});
    } else if (adh.overall === 'partial') {
      const doneCount = adh.done + adh.partial;
      const pct = Math.round(((adh.done + adh.partial * 0.6) / adh.prescribed) * 100);
      cands.adherence.push({ icon: HeartPulse, title: 'Came in under plan', body: pick([
        `Logged ${doneCount} of ${adh.prescribed}${partialNames.length ? ` — ${partialNames.join(', ')} below volume` : ''}. The work you did still counts.`,
        `Volume was ~${pct}% of plan today. If this is rare, ignore it. If recurring, ease the prescription before fatigue compounds.`,
        `Under plan today — fatigue, time, or just a tough day. Notice the pattern, not the one session.`,
        `Did less than written. That can be smart load management, or a sign to dial back this week. Voice-memo which one.`,
      ])});
    } else if (adh.overall === 'mixed') {
      cands.adherence.push({ icon: AlertTriangle, title: 'Mixed bag today', body: pick([
        `${adh.done} clean, ${adh.partial} partial, ${adh.skipped} skipped. Real life vs plan — happens.`,
        `Some hit, some missed${skippedNames.length ? ` (${skippedNames.slice(0, 2).join(', ')}${skippedNames.length > 2 ? '…' : ''})` : ''}. Patterns matter more than one session.`,
        `Today was a triage session. That's fine — name what got bumped and decide if it's a one-off.`,
      ])});
    } else if (adh.overall === 'plan-plus') {
      cands.adherence.push({ icon: Trophy, title: 'Plan + extras', body: pick([
        `Hit the plan and added ${adh.offPlan} extra. Nice — just don't make this a habit if recovery is tight.`,
        `Bonus volume on top of the plan. Track sleep + soreness this week; otherwise stick to the script.`,
        `Above-plan day. Reward yourself with proper food and sleep, not another session tomorrow.`,
      ])});
    }

    // Empathy when weights came in below prescription — separate slot, often useful even if overall was decent
    if (weightDownItems.length && adh.overall !== 'all-skipped') {
      cands.adherence.push({ icon: Dumbbell, title: 'Lifted lighter than plan', body: pick([
        `Used lighter weight on ${weightDownItems.map((i: any) => i.match.name).slice(0, 2).join(', ')} today. If form was tight or fatigue was high, that was the right call.`,
        `Weight under prescribed — note why in the memo so future-you knows. Smart load management isn't quitting.`,
        `Went lighter than plan. Either listen and recover more, or repeat at plan weight in 48h to confirm it was stress, not a regression.`,
      ])});
    } else if (setsRepsDownItems.length && adh.overall !== 'all-skipped' && !weightDownItems.length) {
      cands.adherence.push({ icon: Activity, title: 'Volume short on a couple', body: pick([
        `Cut sets/reps on ${setsRepsDownItems.map((i: any) => i.match.name).slice(0, 2).join(', ')}. If pace held, you protected quality — that's a win.`,
        `Reps came in under plan. Better than grinding garbage reps with broken form. Tomorrow: same target, fresh legs.`,
      ])});
    }
  }


  // --- MOBILITY ---
  if (heavy.length >= 2) cands.mobility.push({ icon: Footprints, title: 'Mobility flow', body: pick([
    'Heavy lower body today. 10 min on hip flexors, glutes and ankles tonight.',
    'Sled + lunge load tightens hips. Pigeon pose 90s each side, twice.',
    'Couch stretch and 90/90 hip rotations before bed — 6 minutes total.',
  ])});
  if (overhead.length >= 1) cands.mobility.push({ icon: Wind, title: 'Shoulder & wrist care', body: pick([
    'Overhead volume loads the rotator cuff. Doorway pec stretch + thread-the-needle.',
    'Wrist circles, 30s each direction. Then banded pull-aparts × 20.',
    'Sleeper stretch and foam-roll your T-spine — 5 minutes well spent.',
  ])});
  if (hasRun || cardio.includes('rowing')) cands.mobility.push({ icon: Activity, title: 'Hip flexor reset', body: pick([
    'Running tightens psoas. Half-kneeling lunge stretch, 60s each side.',
    'Couch stretch tonight, 2 min per side. Your race-day stride needs it.',
  ])});
  if (sore) cands.mobility.push({ icon: Footprints, title: 'Gentle, not aggressive', body: 'You flagged soreness. Skip deep stretching — easy yin holds, 90s, breath only.' });
  if (stationIds.includes('skierg')) cands.mobility.push({ icon: Wind, title: 'Lat & T-spine release', body: 'SkiErg loads lats hard. Foam-roll thoracic spine + child\'s pose with side reach.' });

  // --- FUEL ---
  if (hasRun || cardio.length >= 1) cands.fuel.push({ icon: Droplet, title: 'Electrolytes first', body: pick([
    'Cardio drains sodium. 500ml water + a pinch of salt within 30 min.',
    'LMNT, coconut water, or salt + lemon — get it in before your meal.',
    'Replace what you sweated. Sodium tab in 750ml water now.',
  ])});
  cands.fuel.push({ icon: Apple, title: 'Refuel window', body: pick([
    `${protein}g protein + ${carbs}g carb in the next 60 min.`,
    'Eggs + rice, chicken + sweet potato, or shake + banana — pick one fast.',
    `Aim for 0.4g protein per kg (≈${protein}g for you) and slow carbs alongside.`,
  ])});
  if (overhead.length >= 1 || heavy.length >= 2) cands.fuel.push({ icon: Apple, title: 'Magnesium tonight', body: pick([
    'Heavy reps + sweat = magnesium dip. Glycinate before bed helps sleep too.',
    'Spinach, almonds, dark chocolate — work 300mg of magnesium in tonight.',
  ])});
  if (total >= 4) cands.fuel.push({ icon: Droplet, title: 'Pre-bed hydration', body: '300ml water with a pinch of salt 90 min before bed — avoids the 3am wake-up.' });

  // --- MODALITY ---
  if (heavy.length >= 1) cands.modality.push({ icon: Snowflake, title: 'Cold exposure', body: pick([
    '3 min cold shower cuts DOMS for the next 24 hours.',
    'Last 90 seconds of your shower at full cold — legs first.',
    'Contrast finish: 60s hot / 30s cold × 3. Vascular flush.',
  ])});
  if (total >= 5 || tired) cands.modality.push({ icon: Moon, title: 'Sleep tonight', body: pick([
    `Volume was high${tired ? ' and you flagged fatigue' : ''}. Lock in 8 hours — adaptation happens in sleep.`,
    'Phone out of room, room cold (~18°C), 8 hours. Non-negotiable.',
    'No screens 30 min before bed. Magnesium + chamomile, lights low.',
  ])});
  if (cardio.length >= 1 || hasRun) cands.modality.push({ icon: HeartPulse, title: 'Z2 cooldown', body: pick([
    '5-min easy walk or cycle — drops HR gradually, flushes lactate.',
    'Skip the abrupt stop. 5 min nasal-breathing walk before showering.',
  ])});
  cands.modality.push({ icon: Wind, title: 'Box breathing', body: pick([
    '5 min box breathing (4-4-4-4) post-shower. Drops cortisol fast.',
    'Down-regulate: 4s inhale, 6s exhale × 12. Parasympathetic switch.',
  ])});

  // --- RACE / WEEK CONTEXT ---
  if (inTaper) cands.context.push({ icon: Calendar, title: `${daysToRace} days to race`, body: pick([
    'Taper window. Recovery > volume now. Prioritize sleep and easy aerobic work.',
    'Race close — today shouldn\'t have been all-out. Keep the next one sharper, shorter.',
  ])});
  if (weekCount >= 5) cands.context.push({ icon: AlertTriangle, title: 'High weekly volume', body: `${weekCount} sessions this week. Tomorrow: easy aerobic or rest. Don\'t grind through.` });
  if (trainedYesterday) cands.context.push({ icon: AlertTriangle, title: 'Back-to-back days', body: 'Trained yesterday too. Watch CNS — drop intensity if morning HR is elevated.' });
  if (great) cands.context.push({ icon: Trophy, title: 'Ride the wave', body: 'You felt strong. Note your pre-workout meal, sleep, and timing — replicate it.' });
  if (isStrength && (hasRun || cardio.length >= 1)) cands.context.push({ icon: Activity, title: 'Strength → engine', body: 'Cardio bias is a smart call for a strength athlete. Add one more Z2 this week.' });
  if (isEndurance && heavy.length >= 2) cands.context.push({ icon: Dumbbell, title: 'Endurance → load', body: 'Heavy work is your gap. Repeat this stimulus in 72 hours — not sooner.' });
  if (weekCount <= 1 && !trainedYesterday) cands.context.push({ icon: Flame, title: 'Build the streak', body: 'Light week so far. Schedule the next session before tomorrow ends — momentum > intensity.' });

  // --- MENTAL / SOFT ---
  if (tired || total >= 5) cands.soft.push({ icon: MessageCircle, title: 'Brain dump', body: '2 min journal tonight: what felt strong, what was off. Future-you will use this.' });
  if (great) cands.soft.push({ icon: Lightbulb, title: 'Capture the win', body: 'Voice-memo what worked while fresh — meal, sleep, mindset, warm-up.' });
  cands.soft.push({ icon: Target, title: "Pick tomorrow's focus", body: pick([
    'Decide tonight: one focus station for next session. Avoid the all-of-it trap.',
    'Pick the weakest station and own it tomorrow. Just one.',
    'Tomorrow: 80% of effort on one weakness, 20% maintenance.',
  ])});

  // Adherence always leads when we have a plan to compare against — that's the
  // empathy/contextual slot. The remaining 2 slots rotate through other categories.
  const picked: any[] = [];
  if (cands.adherence.length) picked.push(pick(cands.adherence));
  const order = ['mobility', 'fuel', 'modality', 'context', 'soft'];
  const offset = Math.floor(rand() * order.length);
  const rotated = [...order.slice(offset), ...order.slice(0, offset)];
  for (const cat of rotated) {
    if (cands[cat]?.length && picked.length < 3) picked.push(pick(cands[cat]));
  }
  // Top up if a category was empty
  const fallback = [
    { icon: Apple, title: 'Refuel within 60 min', body: 'Protein + carbs in your next meal. Don\'t skip it.' },
    { icon: Droplet, title: 'Hydrate', body: '500ml water + sodium now, again before bed.' },
    { icon: Moon, title: 'Sleep is recovery', body: 'Aim for 7–9 hours tonight. Phone out of bed.' },
  ];
  for (const f of fallback) {
    if (picked.length >= 3) break;
    if (!picked.find(p => p.title === f.title)) picked.push(f);
  }
  return picked.slice(0, 3);
}

function PostWorkoutInsight({ workout, allWorkouts, pbs, profile, onClose }) {
  const { t } = useTheme();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const analyze = async () => {
      try {
        const { coverage, overallPct } = computeCoverage(workout);
        const stationsHit = Object.keys(coverage);
        const weakStations = STATIONS.filter(s => {
          const sc = computeStationScore(s.id, allWorkouts, pbs[s.id]);
          return !sc || sc.score < 7;
        }).map(s => s.name);
        const newPBs = Object.entries(coverage).filter(([id]) => {
          const sc = computeStationScore(id, allWorkouts, pbs[id]);
          return sc?.isPB;
        }).map(([id]) => STATION_META[id]?.name).filter(Boolean);
        const daysToRace = Math.max(0, Math.floor((new Date(profile.eventDate).getTime() - new Date().getTime()) / 86400000));
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const weekCount = allWorkouts.filter(w => new Date(w.date) >= weekAgo).length;

        const prompt = `You are an elite Hyrox coach writing a SHORT post-workout note (max 4 sentences, conversational, no headers, no lists).
Athlete: ${profile.name}, ${profile.athleteType}, ${profile.level}, targeting Hyrox ${profile.eventCity} in ${daysToRace} days. Trained ${weekCount} times this week.
Today they logged:
- ${workout.sessionType === 'direct' ? 'Direct station times' : 'Translated exercises'}
- Stations hit: ${stationsHit.length ? stationsHit.map(id => STATION_META[id]?.name || id).join(', ') : 'none'}
- Race coverage: ${overallPct}%
${newPBs.length ? `- NEW PBs: ${newPBs.join(', ')}` : ''}
${workout.voiceMemo ? `- Voice memo: "${workout.voiceMemo}"` : ''}
Their weak stations: ${weakStations.join(', ') || 'none'}
Write a short note that acknowledges ONE specific thing from today and suggests ONE concrete focus for their next session. Warm, direct, actionable. No emoji. Return just the note.`;

        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
        });
        if (!resp.ok) throw new Error('API error');
        const data = await resp.json();
        const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('').trim();
        setInsight({ text, newPBs, overallPct });
      } catch (e) { setError('Could not generate insight'); } finally { setLoading(false); }
    };
    analyze();
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: t.card, borderRadius: 26, padding: 30, maxWidth: 520, width: '100%',
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)', border: `1px solid ${t.border}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, background: GRAD.orangeGlow, borderRadius: '50%', filter: 'blur(60px)', opacity: 0.2 }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2.5, color: ACC, fontWeight: 800, marginBottom: 6, textTransform: 'uppercase' }}>Coach</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: -0.6, display: 'flex', alignItems: 'center', gap: 8 }}>Session Saved <Icon C={Check} size={22} color={t.text} /></div>
            </div>
            <button onClick={onClose} style={{ background: t.surfaceAlt, border: 'none', color: t.textSec, cursor: 'pointer', fontSize: 20, fontFamily: FONT, lineHeight: 1, padding: 0, width: 36, height: 36, borderRadius: 18 }}>×</button>
          </div>

          {loading && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: t.textSec, fontSize: 14 }}>
              <div style={{ marginBottom: 12 }}><Icon C={MessageCircle} size={36} color={t.text} /></div>
              Coach is reviewing your session...
            </div>
          )}

          {error && !loading && <div style={{ padding: '20px 0', color: t.textSec, fontSize: 14, fontStyle: 'italic' }}>Great session! Keep the momentum going.</div>}

          {insight && !loading && (
            <>
              <div style={{ background: `linear-gradient(135deg, ${ACC}10 0%, ${ACC}05 100%)`, border: `1.5px solid ${ACC}30`, borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ fontSize: 15, color: t.text, lineHeight: 1.65, fontWeight: 500 }}>{insight.text}</div>
              </div>
              {insight.newPBs?.length > 0 && (
                <div style={{ background: GRAD.green, color: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 16, boxShadow: '0 8px 20px rgba(16,185,129,0.25)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase', opacity: 0.9, display: 'flex', alignItems: 'center', gap: 6 }}><Icon C={Trophy} size={11} color="#fff" className="anim-bounce" /> New Personal Best</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>You smashed your best on: {insight.newPBs.join(', ')}</div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: t.textSec, marginBottom: 20, padding: '0 2px', fontWeight: 500 }}>
                <span>Race coverage today</span>
                <span style={{ color: ACC, fontWeight: 800, fontSize: 14 }}>{insight.overallPct}%</span>
              </div>
            </>
          )}

          <div style={{ marginBottom: 18, border: `1px solid ${t.border}`, borderRadius: 16, padding: '16px 18px', background: t.surfaceAlt }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: t.textSec, fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon C={HeartPulse} size={12} color={t.textSec} /> Recovery tips
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {getRecoveryTips(workout, allWorkouts, profile).map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: t.card, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon C={tip.icon} size={15} color={t.text} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 2 }}>{tip.title}</div>
                    <div style={{ fontSize: 12, color: t.textSec, lineHeight: 1.5 }}>{tip.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onClose} style={{
            width: '100%', padding: '16px', fontSize: 15, fontWeight: 700,
            background: GRAD.orange, color: '#fff', border: 'none', borderRadius: 14,
            cursor: 'pointer', fontFamily: FONT, boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          }}>GOT IT</button>
        </div>
      </div>
    </div>
  );
}

function StravaImport({ onImport }: any) {
  const { t } = useTheme();
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null); setBusy(true);
    try {
      const text = await file.text();
      const act = parseActivityFile(text, file.name);
      setParsed({ ...act, fileName: file.name });
    } catch (err: any) {
      setError(err?.message || 'Failed to parse file');
      setParsed(null);
    } finally {
      setBusy(false);
      if (e.target) e.target.value = '';
    }
  };

  const confirm = () => {
    if (!parsed) return;
    onImport(activityToWorkout(parsed));
    setParsed(null);
    setOpen(false);
  };

  const sportIcon = parsed?.sport === 'Row' ? Wind : parsed?.sport === 'Ride' ? Activity : parsed?.sport === 'Ski' ? Snowflake : Footprints;
  const distKm = parsed ? parsed.distM / 1000 : 0;
  const pace = parsed && parsed.distM > 0 ? parsed.movingTimeS / (parsed.distM / 1000) : 0;
  const mappingNote = parsed && (
    parsed.sport === 'Row' && parsed.distM >= 800 && parsed.distM <= 1200 ? `Will log as Hyrox Rowing (1000m) station: ${fmtTime(parsed.movingTimeS)}` :
    parsed.sport === 'Ski' && parsed.distM >= 800 && parsed.distM <= 1200 ? `Will log as SkiErg (1000m) station: ${fmtTime(parsed.movingTimeS)}` :
    `Will log as ${Math.max(1, Math.round(distKm))} × 1km run @ ${fmtTime(Math.round(pace))}/km`
  );

  return (
    <div style={{ marginBottom: 16 }}>
      {!open && !parsed && (
        <button onClick={() => { setOpen(true); setTimeout(() => fileRef.current?.click(), 0); }} style={{
          width: '100%', padding: '14px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          background: t.card, color: t.text, border: `1.5px dashed ${ACC}60`,
          borderRadius: 12, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <Icon C={Clipboard} size={15} color={ACC} />
          Import from Strava (GPX / TCX)
        </button>
      )}

      <input ref={fileRef} type="file" accept=".gpx,.tcx,application/gpx+xml,application/vnd.garmin.tcx+xml,text/xml" onChange={onFile} style={{ display: 'none' }} />

      {busy && (
        <div style={{ padding: '14px 16px', background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, fontSize: 13, color: t.textSec, textAlign: 'center' }}>
          Parsing…
        </div>
      )}

      {error && (
        <div style={{ background: '#7f1d1d', border: '1px solid #EF4444', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon C={AlertTriangle} size={14} color="#fff" />
          <div style={{ fontSize: 13, color: '#fff', flex: 1 }}>{error}</div>
          <button onClick={() => { setError(null); setOpen(false); }} style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: 16, cursor: 'pointer', padding: 4 }}>×</button>
        </div>
      )}

      {parsed && !error && (
        <div style={{ background: t.card, border: `1.5px solid ${ACC}`, borderRadius: 14, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: ACC }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Icon C={sportIcon} size={18} color={ACC} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parsed.name}</div>
              <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>{parsed.dateISO} · {parsed.sport} · {parsed.fileName}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>Distance</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: t.text, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>{distKm.toFixed(2)}<span style={{ fontSize: 11, color: t.textSec, fontWeight: 500, marginLeft: 3 }}>km</span></div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>Time</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: t.text, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>{fmtHMS(parsed.movingTimeS)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>Pace</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: ACC, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>{fmtTime(Math.round(pace))}<span style={{ fontSize: 11, color: t.textSec, fontWeight: 500, marginLeft: 3 }}>/km</span></div>
            </div>
          </div>
          <div style={{ background: t.surfaceAlt, borderRadius: 10, padding: '10px 12px', borderLeft: `3px solid ${ACC}`, marginBottom: 12, fontSize: 12, color: t.text, lineHeight: 1.4 }}>
            {mappingNote}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setParsed(null); setOpen(false); }} style={{
              flex: 1, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: 'transparent', color: t.textSec, border: `1px solid ${t.border}`, borderRadius: 10, fontFamily: FONT,
            }}>Cancel</button>
            <button onClick={confirm} style={{
              flex: 2, padding: '11px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
              background: ACC, color: '#000', border: 'none', borderRadius: 10, fontFamily: FONT, letterSpacing: 0.3,
            }}>IMPORT WORKOUT</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LogWorkout({ workouts, saveWorkouts, profile, pbs }) {
  const { t } = useTheme();
  const today = new Date().toISOString().split('T')[0];
  const [mode, setMode] = useState('translate');
  const [date, setDate] = useState(today);
  const [stationData, setStationData] = useState({});
  const [runPace, setRunPace] = useState('');
  const [runCount, setRunCount] = useState(0);
  const [translated, setTranslated] = useState([]);
  const [notes, setNotes] = useState('');
  const [memo, setMemo] = useState('');
  const [saved, setSaved] = useState(false);
  const [insightFor, setInsightFor] = useState(null);
  const [testMode, setTestMode] = useState(false);

  const inp = { width: '100%', padding: '13px 15px', fontSize: 15, borderRadius: 12, border: `1.5px solid ${t.borderInput}`, background: t.inputBg, color: t.text, boxSizing: 'border-box' as const, fontFamily: FONT, transition: 'all 0.15s' };
  const lbl = { fontSize: 12, color: t.textSec, marginBottom: 8, display: 'block', fontWeight: 600, letterSpacing: 0.2 };

  const setStation = (id, field, val) => setStationData(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));

  const draft = {
    date, sessionType: mode,
    stations: Object.entries(stationData).reduce((a: any, [id, d]: [string, any]) => {
      if (d.time || d.weight) a[id] = { time: parseMMSS(d.time), weight: d.weight ? parseFloat(d.weight) : null };
      return a;
    }, {}),
    runs: runCount ? { count: runCount, pace: parseMMSS(runPace) } : null,
    translated,
  };

  const hasAny = translated.length || Object.keys(stationData).some(k => stationData[k]?.time || stationData[k]?.weight) || runCount || memo.trim() || notes.trim();

  const handleSave = async () => {
    if (!hasAny) return;
    const entry = { id: Date.now(), ...draft, notes, voiceMemo: memo || null, isTest: testMode };
    const newWorkouts = [...workouts, entry];
    try {
      await saveWorkouts(newWorkouts);
      setSaved(true);
      setInsightFor({ workout: entry, allWorkouts: newWorkouts });
      setTimeout(() => {
        setSaved(false); setStationData({}); setTranslated([]); setNotes(''); setMemo(''); setRunPace(''); setRunCount(0);
        setTestMode(false); // auto-reset test mode after save
      }, 2500);
    } catch (e) { console.error('Save failed:', e); }
  };

  const handleImport = async (workout: any) => {
    const newWorkouts = [...workouts, workout];
    try {
      await saveWorkouts(newWorkouts);
      setSaved(true);
      setInsightFor({ workout, allWorkouts: newWorkouts });
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error('Import failed:', e); }
  };

  return (
    <div>
      <StravaImport onImport={handleImport} />

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: t.surfaceAlt, padding: 4, borderRadius: 12 }}>
        <button onClick={() => setMode('translate')} style={{
          flex: 1, padding: '13px', fontSize: 14, fontWeight: 700, borderRadius: 9, cursor: 'pointer', border: 'none', fontFamily: FONT,
          background: mode === 'translate' ? t.card : 'transparent',
          color: mode === 'translate' ? ACC : t.textSec,
          boxShadow: mode === 'translate' ? t.cardShadow : 'none',
        }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={RefreshCw} size={14} /> Translate</span></button>
        <button onClick={() => setMode('direct')} style={{
          flex: 1, padding: '13px', fontSize: 14, fontWeight: 700, borderRadius: 9, cursor: 'pointer', border: 'none', fontFamily: FONT,
          background: mode === 'direct' ? t.card : 'transparent',
          color: mode === 'direct' ? ACC : t.textSec,
          boxShadow: mode === 'direct' ? t.cardShadow : 'none',
        }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Target} size={14} /> Direct Hyrox</span></button>
      </div>

      <button onClick={() => setTestMode(!testMode)} style={{
        width: '100%', padding: '13px 16px', marginBottom: 16, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        background: testMode ? GRAD.amber : t.card, color: testMode ? '#fff' : t.textSec,
        border: `1.5px ${testMode ? 'solid #F59E0B' : `dashed ${t.borderInput}`}`,
        borderRadius: 12, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: testMode ? '0 4px 14px rgba(245,158,11,0.25)' : 'none',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: testMode ? '#fff' : t.borderInput }} />
        {testMode ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={FlaskConical} size={13} /> TEST MODE — entries flagged</span> : 'Enable Test Mode'}
      </button>

      <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: '14px 16px', marginBottom: 16, fontSize: 13, color: t.textSec, lineHeight: 1.5 }}>
        {mode === 'translate' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Lightbulb} size={13} /> Log regular gym exercises — we translate to Hyrox stations.</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={CheckCircle2} size={13} /> Log actual Hyrox station times and weights.</span>}
      </div>

      <div style={{ marginBottom: 16 }}><label style={lbl}>DATE</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} /></div>

      {mode === 'translate'
        ? <TranslateMode translated={translated} setTranslated={setTranslated} inp={inp} lbl={lbl} profile={profile} />
        : <DirectMode stationData={stationData} setStation={setStation} runCount={runCount} setRunCount={setRunCount} runPace={runPace} setRunPace={setRunPace} inp={inp} lbl={lbl} />}

      {hasAny && (
        <div style={{ marginTop: 22 }}>
          <SectionTitle accent={ACC}>Live Preview</SectionTitle>
          <WorkoutSummary workout={draft} compact />
        </div>
      )}

      <VoiceMemoRecorder transcript={memo} setTranscript={setMemo} />

      <div style={{ marginTop: 16 }}>
        <label style={lbl}>QUICK NOTES (OPTIONAL)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything to jot down..." rows={2} style={{ ...inp, resize: 'vertical' }} />
      </div>

      <button onClick={handleSave} disabled={!hasAny} style={{
        marginTop: 18, width: '100%', padding: '18px', fontSize: 16, fontWeight: 800,
        background: saved ? GRAD.green : !hasAny ? t.borderInput : testMode ? GRAD.amber : GRAD.orange,
        color: '#fff', border: 'none', borderRadius: 16,
        cursor: hasAny ? 'pointer' : 'not-allowed', fontFamily: FONT, letterSpacing: 0.3,
        boxShadow: !hasAny ? 'none' : saved ? '0 8px 20px rgba(16,185,129,0.3)' : testMode ? '0 8px 20px rgba(245,158,11,0.3)' : '0 8px 20px rgba(232,69,27,0.3)',
      }}>{saved ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon C={Check} size={16} color="#fff" /> WORKOUT SAVED!</span> : testMode ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon C={FlaskConical} size={16} color="#fff" /> SAVE TEST WORKOUT</span> : 'SAVE WORKOUT'}</button>

      {insightFor && profile && (
        <PostWorkoutInsight
          workout={insightFor.workout} allWorkouts={insightFor.allWorkouts}
          pbs={computePBs(insightFor.allWorkouts)} profile={profile} onClose={() => setInsightFor(null)}
        />
      )}
    </div>
  );
}

function Progress({ workouts, pbs }) {
  const { t } = useTheme();
  const [view, setView] = useState('all');
  const [selected, setSelected] = useState('skierg');
  const station = STATIONS.find(s => s.id === selected);

  const getDataFor = (id) => extractStationSessions(workouts, id).map(s => ({
    date: new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    rawDate: s.date, time: s.time, weight: s.weight, source: s.source,
  }));

  const chartData = getDataFor(selected);
  const pb = pbs[selected];

  const Tip = ({ active, payload, label }: any = {}) => !active || !payload?.length ? null : (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 13, boxShadow: t.cardShadow }}>
      <div style={{ color: t.textSec }}>{label}</div>
      <div style={{ color: station.color, fontWeight: 700 }}>{fmtTime(payload[0]?.value)}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: t.surfaceAlt, padding: 4, borderRadius: 12 }}>
        {[{ id: 'all', l: 'All Stations' }, { id: 'single', l: 'Single' }].map(tb => (
          <button key={tb.id} onClick={() => setView(tb.id)} style={{
            flex: 1, padding: '12px', fontSize: 14, fontWeight: 700, borderRadius: 9, cursor: 'pointer', border: 'none', fontFamily: FONT,
            background: view === tb.id ? t.card : 'transparent', color: view === tb.id ? ACC : t.textSec,
            boxShadow: view === tb.id ? t.cardShadow : 'none',
          }}>{tb.l}</button>
        ))}
      </div>

      {view === 'all' ? (
        <div>
          <SectionTitle accent={ACC}>All Stations Progression</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {STATIONS.map(s => {
              const data = getDataFor(s.id);
              const spb = pbs[s.id];
              const sc = computeStationScore(s.id, workouts, spb);
              return (
                <div key={s.id} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: '16px 18px', boxShadow: t.cardShadow, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.grad }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, background: s.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.abbr}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{s.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {spb ? (
                        <>
                          <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{fmtTime(spb.time)}</div>
                          {sc && <div style={{ fontSize: 11, color: t.textSec, marginTop: 2, fontWeight: 500 }}>{sc.score.toFixed(1)}/10 · {data.length} sess</div>}
                        </>
                      ) : <div style={{ fontSize: 12, color: t.textSec }}>No data</div>}
                    </div>
                  </div>
                  {data.length < 2 ? (
                    <div style={{ fontSize: 12, color: t.textSec, textAlign: 'center', padding: '24px 0', background: t.surfaceAlt, borderRadius: 12, marginTop: 10, fontWeight: 500 }}>
                      {data.length === 0 ? 'Not logged yet' : 'Log 1 more session'}
                    </div>
                  ) : (
                    <div style={{ marginTop: 10 }}>
                      <ResponsiveContainer width="100%" height={90}>
                        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                          <defs>
                            <linearGradient id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip
                            cursor={{ stroke: s.color, strokeWidth: 1, strokeDasharray: '3 3' }}
                            content={({ active, payload, label }: any) => !active || !payload?.length ? null : (
                              <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: '8px 12px', fontSize: 12, boxShadow: t.cardShadow }}>
                                <div style={{ color: t.textSec, fontSize: 11 }}>{label}</div>
                                <div style={{ color: s.color, fontWeight: 700 }}>{fmtTime(payload[0]?.value)}</div>
                                {payload[0]?.payload?.weight != null && <div style={{ color: t.textSec, fontSize: 11, marginTop: 2 }}>{payload[0].payload.weight}{s.unit === 'reps' ? ' kg' : ' kg'}</div>}
                              </div>
                            )}
                          />
                          <Area type="monotone" dataKey="time" stroke={s.color} strokeWidth={2.5} fill={`url(#grad-${s.id})`} isAnimationActive={false} activeDot={{ r: 4, fill: s.color }} />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textSec, marginTop: 4, fontWeight: 500 }}>
                        <span>{data[0]?.date}</span><span>↓ lower = better</span><span>{data[data.length - 1]?.date}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
            {STATIONS.map(s => (
              <button key={s.id} onClick={() => setSelected(s.id)} style={{
                padding: '10px 16px', fontSize: 13, borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontFamily: FONT,
                background: selected === s.id ? s.grad : t.surfaceAlt, color: selected === s.id ? '#fff' : t.textSec,
                border: 'none', boxShadow: selected === s.id ? `0 4px 12px ${s.color}30` : 'none',
              }}>{s.abbr}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div><div style={{ fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>{station.name}</div><div style={{ fontSize: 13, color: t.textSec }}>{station.desc}</div></div>
            {pb && <div style={{ marginLeft: 'auto', background: station.grad, color: '#fff', borderRadius: 14, padding: '12px 20px', textAlign: 'center', boxShadow: `0 8px 20px ${station.color}30` }}>
              <div style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: 800, textTransform: 'uppercase', opacity: 0.9 }}>PB</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>{fmtTime(pb.time)}</div>
            </div>}
          </div>
          {chartData.length < 2 ? (
            <div style={{ background: t.surfaceAlt, borderRadius: 16, padding: '3rem', textAlign: 'center', color: t.textSec }}>
              <div style={{ marginBottom: 12 }}><Icon C={BarChart3} size={40} color={t.textSec} /></div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Log at least 2 {station.name} sessions</div>
            </div>
          ) : (
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: '20px 12px 12px', boxShadow: t.cardShadow }}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={station.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={station.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: t.textSec }} />
                  <YAxis tickFormatter={fmtTime} tick={{ fontSize: 11, fill: t.textSec }} width={44} />
                  <Tooltip content={<Tip />} />
                  {pb && <ReferenceLine y={pb.time} stroke={ACC} strokeDasharray="4 2" label={{ value: 'PB', fill: ACC, fontSize: 11, fontWeight: 700 }} />}
                  <Area type="monotone" dataKey="time" stroke={station.color} strokeWidth={3} fill="url(#chartGrad)" dot={{ fill: station.color, r: 5 }} activeDot={{ r: 7 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MyWeek({ profile }: any) {
  const { t } = useTheme();
  const today = new Date();
  const todayDayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
  const week = getCurrentWeekPlan(profile, today);
  const usingDefault = !profile.routine?.parsed?.days?.length;

  if (!week) {
    return (
      <div>
        <SectionTitle accent={ACC}>This Week</SectionTitle>
        <div style={{ background: t.surfaceAlt, borderRadius: 16, padding: '2.5rem', textAlign: 'center', color: t.textSec, fontSize: 14 }}>
          <div style={{ marginBottom: 10 }}><Icon C={Calendar} size={32} color={t.textSec} /></div>
          Race date is in the past — set a new event to generate a plan.
        </div>
      </div>
    );
  }

  const phase = week.phase;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: t.textSec, fontWeight: 600, marginBottom: 4 }}>Week {week.n} · {week.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {week.end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: -0.6 }}>This Week</div>
          <Pill grad={phase.grad} size="md">{phase.label.toUpperCase()}</Pill>
        </div>
      </div>

      {/* Phase focus card */}
      <div style={{ background: t.card, border: `1.5px solid ${phase.color}40`, borderRadius: 16, padding: '14px 18px', marginBottom: 18, position: 'relative', overflow: 'hidden', boxShadow: t.cardShadow }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: phase.grad }} />
        <div style={{ paddingLeft: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: phase.color, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon C={Target} size={11} color={phase.color} /> Hyrox Focus
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: week.extraSessions.length ? 8 : 0 }}>{week.hyroxFocus}</div>
          {week.extraSessions.map((s: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: t.textMute, marginBottom: 3 }}>
              <span style={{ color: phase.color, flexShrink: 0, fontWeight: 700 }}>›</span><span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {usingDefault && (
        <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: '12px 14px', marginBottom: 14, fontSize: 12, color: t.textSec, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon C={Lightbulb} size={13} color={ACC} />
          <span>Using a default {profile.level} split. Add your routine in <span style={{ color: ACC, fontWeight: 700 }}>Profile → Current Routine</span> to personalize.</span>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {week.days.map((d: any) => {
          const isToday = d.day === todayDayName;
          return (
            <div key={d.day} style={{
              background: isToday ? `linear-gradient(135deg, ${phase.color}10 0%, ${phase.color}05 100%)` : t.card,
              border: `1.5px solid ${isToday ? phase.color : t.border}`,
              borderRadius: 14, padding: '14px 16px', boxShadow: isToday ? `0 8px 20px ${phase.color}20` : t.cardShadow,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: phase.grad }} />
              <div style={{ paddingLeft: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: d.sessions.length ? 8 : 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: phase.color, minWidth: 36 }}>{d.day}</span>
                  {isToday && <span style={{ background: phase.grad, color: '#000', fontSize: 10, padding: '3px 10px', borderRadius: 999, fontWeight: 800, letterSpacing: 0.5 }}>TODAY</span>}
                </div>
                {d.sessions.map((s: string, j: number) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: t.textMute, marginBottom: 4 }}>
                    <span style={{ color: phase.color, flexShrink: 0, fontWeight: 700 }}>›</span><span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrainingPlan({ profile, workouts = [] }: any) {
  const { t } = useTheme();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const plan = generatePlan(profile, today);
  const eventDate = plan.eventDate;
  const planStart = plan.weeks[0]?.start || today;
  const usingDefault = plan.usingDefault;

  // Group weeks by phase id, in plan order
  const phaseGroups: Array<{ phase: any; weeks: any[] }> = [];
  for (const wk of plan.weeks) {
    let g = phaseGroups.find(p => p.phase.id === wk.phase.id);
    if (!g) { g = { phase: wk.phase, weeks: [] }; phaseGroups.push(g); }
    g.weeks.push(wk);
  }

  const taper = computeTaperStatus(workouts, profile);
  const urgencyColor = taper.urgency === 'critical' ? '#EF4444' : taper.urgency === 'warn' ? '#F59E0B' : ACC;
  const flagColor = taper.volumeFlag?.type === 'high' || taper.volumeFlag?.type === 'taper-warn' ? '#EF4444' : '#F59E0B';

  return (
    <div>
      {/* === SMART TAPER STATUS === */}
      <div style={{
        background: t.card, border: `2px solid ${urgencyColor}`, borderRadius: 20,
        padding: '20px 22px', marginBottom: 18, position: 'relative', overflow: 'hidden',
        boxShadow: `0 8px 24px ${urgencyColor}25`,
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: urgencyColor }} />
        <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, background: urgencyColor, borderRadius: '50%', filter: 'blur(70px)', opacity: 0.18 }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: t.textSec, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon C={HeartPulse} size={12} color={urgencyColor} className={taper.urgency === 'critical' ? 'anim-flicker' : ''} /> Smart Taper
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.4 }}>{taper.phaseLabel}</div>
              <div style={{ fontSize: 12, color: t.textSec, marginTop: 2 }}>{taper.daysToEvent} day{taper.daysToEvent === 1 ? '' : 's'} to race · target volume {Math.round(taper.volumeMultiplier * 100)}%</div>
            </div>
            <Pill color={urgencyColor} size="lg">{taper.phase}</Pill>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Last 7d</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.text, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>{taper.days7}<span style={{ fontSize: 12, color: t.textSec, fontWeight: 500, marginLeft: 4 }}>sess</span></div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Last 14d</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.text, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>{taper.days14}<span style={{ fontSize: 12, color: t.textSec, fontWeight: 500, marginLeft: 4 }}>sess</span></div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>3w avg</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.text, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>{taper.avgPerWeek.toFixed(1)}<span style={{ fontSize: 12, color: t.textSec, fontWeight: 500, marginLeft: 4 }}>/wk</span></div>
            </div>
          </div>

          <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${urgencyColor}` }}>
            <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon C={Lightbulb} size={11} color={t.textSec} /> Recommendation
            </div>
            <div style={{ fontSize: 13, color: t.text, lineHeight: 1.55 }}>{taper.advice}</div>
          </div>

          {taper.volumeFlag && (
            <div style={{
              marginTop: 10, background: `${flagColor}18`, border: `1px solid ${flagColor}50`,
              borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icon C={AlertTriangle} size={13} color={flagColor} />
              <div style={{ fontSize: 12, color: t.text, fontWeight: 600, lineHeight: 1.4 }}>{taper.volumeFlag.text}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: GRAD.darkHero, color: '#fff', borderRadius: 18, padding: '18px 22px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden', boxShadow: t.cardShadow }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: GRAD.orangeGlow, borderRadius: '50%', filter: 'blur(60px)', opacity: 0.4 }} />
        <div style={{ position: 'relative', display: 'flex' }}><Icon C={Calendar} size={32} color="#fff" /></div>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{plan.totalWeeks}-Week Plan → Hyrox {profile.eventCity}</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{planStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div style={{ fontSize: 11, color: ACC_BRIGHT, marginTop: 4, fontWeight: 600 }}>{usingDefault ? `Default ${profile.level} split — add a routine on Profile to personalize` : `Built on your routine (${profile.routine?.parsed?.days?.length || 0} days)`}</div>
        </div>
      </div>
      {phaseGroups.map(({ phase, weeks: groupWeeks }) => (
        <div key={phase.id} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: phase.grad }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: phase.color, letterSpacing: 1, textTransform: 'uppercase' }}>{phase.label}</div>
            <div style={{ fontSize: 11, color: t.textSec, fontWeight: 600 }}>· {groupWeeks.length} week{groupWeeks.length === 1 ? '' : 's'}</div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {groupWeeks.map((week: any) => (
              <div key={week.n} style={{
                background: week.isCurrent ? `linear-gradient(135deg, ${phase.color}15 0%, ${phase.color}05 100%)` : week.isPast ? t.surfaceAlt : t.card,
                border: `1.5px solid ${week.isCurrent ? phase.color : t.border}`,
                borderRadius: 14, padding: '14px 16px', opacity: week.isPast ? 0.55 : 1,
                position: 'relative', overflow: 'hidden',
                boxShadow: week.isCurrent ? `0 8px 24px ${phase.color}25` : week.isPast ? 'none' : t.cardShadow,
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: phase.grad }} />
                <div style={{ paddingLeft: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: phase.color }}>WEEK {week.n}</span>
                      {week.isCurrent && <span style={{ background: phase.grad, color: '#000', fontSize: 10, padding: '3px 10px', borderRadius: 999, fontWeight: 800 }}>CURRENT</span>}
                      {week.isPast && <span style={{ fontSize: 10, color: t.textSec, background: t.surfaceAlt, padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>DONE</span>}
                    </div>
                    <span style={{ fontSize: 13, color: t.textSec, fontWeight: 500 }}>{week.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 8 }}>{week.hyroxFocus}</div>
                  {week.extraSessions.map((s: string, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: t.textMute, marginBottom: 4 }}>
                      <span style={{ color: phase.color, flexShrink: 0, fontWeight: 700 }}>›</span><span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RaceDay({ workouts, pbs, profile }: any) {
  const { t } = useTheme();
  const [strategy, setStrategy] = useState('pb');
  const proj = projectRace(workouts, pbs, strategy);
  const ranking = rankStationsByWeakness(pbs);
  const weakest = ranking[0];
  const drills = weakest ? getDrillsForStation(weakest.station.id) : [];
  const stratMeta = PACING_STRATEGIES.find(s => s.id === strategy);
  const eventDays = Math.max(0, Math.floor((new Date(profile.eventDate).getTime() - new Date().getTime()) / 86400000));
  const stationsLogged = STATIONS.filter(s => pbs[s.id]).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: t.textSec, marginBottom: 4, fontWeight: 500 }}>Race readiness</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: -0.8, display: 'flex', alignItems: 'center', gap: 12 }}>
          Race Day <Icon C={Trophy} size={28} color={ACC} className="anim-flicker" />
        </div>
        <div style={{ fontSize: 13, color: t.textSec, marginTop: 6 }}>{eventDays} days · {stationsLogged}/8 stations logged{proj.hasPace ? ` · best pace ${fmtTime(proj.pace)}/km` : ' · no run data yet'}</div>
      </div>

      {/* PROJECTED FINISH HERO */}
      <div style={{
        background: GRAD.darkHero, color: '#fff', borderRadius: 24, padding: '28px 28px', marginBottom: 20,
        position: 'relative', overflow: 'hidden', boxShadow: t.heroShadow, border: `1px solid ${ACC}25`,
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, background: GRAD.orangeGlow, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.45 }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, background: ACC, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.15 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon C={Target} size={14} color={ACC_BRIGHT} />
            <div style={{ fontSize: 11, letterSpacing: 2.5, color: ACC_BRIGHT, fontWeight: 700, textTransform: 'uppercase' }}>Projected Finish</div>
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, background: GRAD.orangeGlow, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -2.5, lineHeight: 0.9 }}>{fmtHMS(proj.total)}</div>
          <div style={{ display: 'flex', gap: 24, marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Stations</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>{fmtHMS(proj.stationsTotal)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Run (8km)</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>{fmtHMS(proj.runsTotal)}</div>
            </div>
          </div>
          {(stationsLogged < 8 || !proj.hasPace) && (
            <div style={{ fontSize: 11, color: '#FBBF24', marginTop: 14, fontWeight: 600, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon C={AlertTriangle} size={12} color="#FBBF24" />
              {8 - stationsLogged > 0 && `${8 - stationsLogged} station${8 - stationsLogged > 1 ? 's' : ''} use slow-end estimates`}{!proj.hasPace && (stationsLogged < 8 ? ' · ' : '')}{!proj.hasPace && 'run pace defaulted to 6:00/km'}
            </div>
          )}
        </div>
      </div>

      {/* STRATEGY SELECTOR */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: t.textSec, marginBottom: 10, textTransform: 'uppercase' }}>Pacing Strategy</div>
        <Seg value={strategy} onChange={setStrategy} options={PACING_STRATEGIES.map(s => ({ v: s.id, l: s.label }))} />
        <div style={{ fontSize: 12, color: t.textSec, marginTop: 10, fontStyle: 'italic', paddingLeft: 4 }}>{stratMeta?.sub}</div>
      </div>

      {/* SEGMENT BREAKDOWN */}
      <SectionTitle accent={ACC}>Segment Breakdown</SectionTitle>
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: '4px 18px', marginBottom: 32, boxShadow: t.cardShadow }}>
        {proj.stations.map((s, i) => (
          <div key={s.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.textSec, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace', minWidth: 24 }}>R{i + 1}</span>
                <Icon C={Footprints} size={14} color={t.textMute} />
                <span style={{ fontSize: 13, color: t.textMute, fontWeight: 600 }}>1km Run</span>
              </div>
              <div style={{ fontSize: 14, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace', color: t.text, fontWeight: 700 }}>
                {fmtTime(proj.runs[i].time)}
                {proj.runs[i].isFallback && <span style={{ fontSize: 10, color: '#F59E0B', marginLeft: 6, fontWeight: 700 }}>EST</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < proj.stations.length - 1 ? `1px solid ${t.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Pill grad={s.grad} size="sm">{s.abbr}</Pill>
                <span style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>{s.name}</span>
              </div>
              <div style={{ fontSize: 14, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace', color: t.text, fontWeight: 700 }}>
                {fmtTime(s.time)}
                {s.isFallback && <span style={{ fontSize: 10, color: '#F59E0B', marginLeft: 6, fontWeight: 700 }}>EST</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* WEAKEST STATION */}
      <SectionTitle accent={ACC}>Focus Station</SectionTitle>
      {weakest && (
        <div style={{
          background: t.card, border: `2px solid ${ACC}`, borderRadius: 20,
          padding: '22px 22px 18px', boxShadow: t.cardShadow, position: 'relative', overflow: 'hidden', marginBottom: 14,
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: ACC }} />
          <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, background: ACC, borderRadius: '50%', filter: 'blur(60px)', opacity: 0.18 }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, color: t.textSec, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon C={AlertTriangle} size={11} color={t.textSec} /> Weakest Link
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: -0.4 }}>{weakest.station.name}</div>
                <div style={{ fontSize: 12, color: t.textSec, marginTop: 2 }}>{weakest.station.desc}</div>
              </div>
              <Pill grad={weakest.station.grad} size="lg">{weakest.station.abbr}</Pill>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Your PB</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: t.text, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>{weakest.hasData ? fmtTime(weakest.pb.time) : '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Target</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: ACC, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>{fmtTime(weakest.fast)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: t.textSec, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Gap</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#FBBF24', fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace' }}>
                  {weakest.hasData ? `+${fmtTime(Math.max(0, weakest.pb.time - weakest.fast))}` : 'N/A'}
                </div>
              </div>
            </div>
            {drills.length > 0 && (
              <div style={{ paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: t.textSec, marginBottom: 12, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon C={Dumbbell} size={12} color={t.textSec} /> Suggested Drills
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {drills.map(d => (
                    <div key={d.id} style={{
                      background: t.surfaceAlt, borderRadius: 12, padding: '12px 14px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{d.name}</div>
                        <div style={{ fontSize: 12, color: t.textSec, marginTop: 2 }}>
                          {d.fields.slice(0, 3).map(f => `${f.d} ${f.l.replace(/^\w+\s/, '').toLowerCase()}`).join(' · ')}
                        </div>
                      </div>
                      <Pill color={ACC} size="sm">{d.match}% MATCH</Pill>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATION RANKING */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, padding: '4px 20px', boxShadow: t.cardShadow }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: t.textSec, padding: '14px 0 10px', textTransform: 'uppercase' }}>All Stations · Weakest → Strongest</div>
        {ranking.map((r, i) => (
          <div key={r.station.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0', borderBottom: i < ranking.length - 1 ? `1px solid ${t.border}` : 'none', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
              <Pill grad={r.station.grad} size="sm">{r.station.abbr}</Pill>
              <span style={{ fontSize: 14, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.station.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {r.hasData ? (
                <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, SF Mono, Monaco, monospace', color: t.textSec, minWidth: 40, textAlign: 'right' }}>{fmtTime(r.pb.time)}</span>
              ) : (
                <span style={{ fontSize: 11, color: t.textSec, fontStyle: 'italic', minWidth: 40, textAlign: 'right' }}>untested</span>
              )}
              <div style={{ width: 56, height: 6, background: t.surfaceAlt, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, r.norm * 100)}%`, height: '100%', background: r.norm > 0.6 ? '#EF4444' : r.norm > 0.3 ? '#F59E0B' : ACC, borderRadius: 3, transition: 'width 0.5s' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstallPrompt() {
  const { t } = useTheme();
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onBefore = (e: any) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);
    if (window.matchMedia?.('(display-mode: standalone)').matches) setInstalled(true);
    try {
      const at = localStorage.getItem('hyrox_install_dismissed');
      if (at && Date.now() - parseInt(at) < 7 * 86400000) setDismissed(true);
    } catch {}
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    try {
      deferred.prompt();
      const result = await deferred.userChoice;
      setDeferred(null);
      if (result?.outcome === 'dismissed') {
        try { localStorage.setItem('hyrox_install_dismissed', String(Date.now())); } catch {}
        setDismissed(true);
      }
    } catch {}
  };

  const dismiss = () => {
    try { localStorage.setItem('hyrox_install_dismissed', String(Date.now())); } catch {}
    setDismissed(true);
  };

  if (installed || dismissed || !deferred) return null;

  return (
    <div style={{
      margin: '0 1.75rem 1rem', padding: '14px 16px',
      background: t.card, border: `1.5px solid ${ACC}40`, borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: `0 4px 16px ${ACC}15`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: ACC }} />
      <div style={{ paddingLeft: 4, flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 2 }}>Install Hyrox Tracker</div>
        <div style={{ fontSize: 12, color: t.textSec }}>Add to home screen for quick gym access · works offline</div>
      </div>
      <button onClick={install} style={{
        background: ACC, color: '#000', border: 'none', borderRadius: 10,
        padding: '9px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
        letterSpacing: 0.3, flexShrink: 0,
      }}>INSTALL</button>
      <button onClick={dismiss} aria-label="Dismiss" style={{
        background: 'transparent', color: t.textSec, border: 'none',
        padding: '6px 8px', fontSize: 16, cursor: 'pointer', fontFamily: FONT, flexShrink: 0,
      }}>×</button>
    </div>
  );
}

function Countdown({ eventDate }) {
  const [t, setT] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!eventDate) return;
    const ed = new Date(eventDate);
    const tick = () => {
      const diff = ed.getTime() - new Date().getTime();
      if (diff <= 0) { setT({ days: 0, hours: 0, mins: 0, secs: 0 }); return; }
      setT({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), mins: Math.floor((diff % 3600000) / 60000), secs: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  return (
    <div style={{ display: 'flex', gap: 8, perspective: '300px' }}>
      {[{ label: 'D', val: t.days }, { label: 'H', val: t.hours }, { label: 'M', val: t.mins }, { label: 'S', val: t.secs }].map(({ label, val }) => (
        <FlipUnit key={label} value={val} label={label} />
      ))}
    </div>
  );
}

function FlipUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        position: 'relative', width: 38, height: 32, borderRadius: 7,
        border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 6px rgba(0,0,0,0.4)',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.4)', marginTop: -0.5, zIndex: 2 }} />
        <div
          key={display}
          className="card-flip"
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: ACC_BRIGHT, letterSpacing: '-0.5px', fontFamily: FONT }}
        >
          {display}
        </div>
      </div>
      <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1, marginTop: 5, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function generateSeedWorkouts() {
  const STATION_IDS = ['skierg', 'sledPush', 'sledPull', 'burpee', 'rowing', 'farmers', 'lunges', 'wallballs'];
  const BASELINE = { skierg: 270, sledPush: 52, sledPull: 54, burpee: 360, rowing: 270, farmers: 88, lunges: 92, wallballs: 360 };
  const TARGET   = { skierg: 215, sledPush: 36, sledPull: 38, burpee: 270, rowing: 220, farmers: 64, lunges: 68, wallballs: 280 };
  const WEIGHT   = { sledPush: 102, sledPull: 102, farmers: 24, lunges: 20, wallballs: 6 };

  let s = 1337;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  const out: any[] = [];
  const today = new Date(); today.setHours(0,0,0,0);
  const start = new Date(today); start.setDate(start.getDate() - 60);

  for (let week = 0; week < 9; week++) {
    const progress = Math.min(1, week / 8);
    for (const dayOff of [0, 2, 5]) {
      const date = new Date(start); date.setDate(start.getDate() + week * 7 + dayOff);
      if (date > today) break;

      const numStations = 3 + Math.floor(rand() * 4);
      const ids = [...STATION_IDS].sort(() => rand() - 0.5).slice(0, numStations);
      const stations: any = {};
      for (const sid of ids) {
        const b = BASELINE[sid as keyof typeof BASELINE], tg = TARGET[sid as keyof typeof TARGET];
        const noise = (rand() - 0.5) * (b - tg) * 0.25;
        const time = Math.max(tg - 5, Math.round(b - (b - tg) * progress + noise));
        stations[sid] = { time, weight: WEIGHT[sid as keyof typeof WEIGHT] ?? null };
      }

      const runs = rand() < 0.55 ? { count: 4 + Math.floor(rand() * 5), pace: 240 + Math.floor(rand() * 90) } : null;
      out.push({
        id: date.getTime() + Math.floor(rand() * 1000),
        date: date.toISOString().slice(0, 10),
        sessionType: rand() < 0.5 ? 'direct' : 'translate',
        stations, runs, translated: [], notes: '', voiceMemo: null, isTest: false,
      });
    }
  }
  return out;
}

export default function HyroxTracker() {
  const [tab, setTab] = useState('dashboard');
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCompact, setIsCompact] = useState(typeof window !== 'undefined' && window.innerWidth < 480);
  const { t, mode, setMode } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsCompact(window.innerWidth < 480);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [w, p, th] = await Promise.all([
          window.storage.get('hyrox_workouts_v3').catch(() => null),
          window.storage.get('hyrox_profile_v2').catch(() => null),
          window.storage.get('hyrox_theme').catch(() => null),
        ]);
        if (w) {
          setWorkouts(JSON.parse(w.value));
        } else {
          const seed = generateSeedWorkouts();
          setWorkouts(seed);
          try { await window.storage.set('hyrox_workouts_v3', JSON.stringify(seed)); } catch (e) {}
        }
        if (p) {
          setProfile(JSON.parse(p.value));
        } else {
          const seedProfile = { ...DEFAULT_PROFILE, userId: genUserId(), name: 'Manav', age: '28', bodyweight: '75', occupation: 'Engineer' };
          setProfile(seedProfile);
          try { await window.storage.set('hyrox_profile_v2', JSON.stringify(seedProfile)); } catch (e) {}
        }
        if (th?.value === 'dark' || th?.value === 'light') setMode(th.value);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const syncPublic = async (prof, works) => {
    if (!prof?.userId) return;
    try {
      const _pbs = computePBs(works);
      const stationScores = STATIONS.reduce((a, s) => { a[s.id] = computeStationScore(s.id, works, _pbs[s.id])?.score || 0; return a; }, {});
      const snapshot = { name: prof.name, athleteType: prof.athleteType, level: prof.level, eventCity: prof.eventCity, eventDate: prof.eventDate, cumulativeScore: cumulativeScore(works, _pbs), stationScores, totalSessions: works.length, lastUpdated: new Date().toISOString() };
      await window.storage.set(`athlete:${prof.userId}`, JSON.stringify(snapshot), true);
    } catch (e) {}
  };

  useEffect(() => { if (profile && workouts) syncPublic(profile, workouts); }, [profile?.userId, workouts.length]);

  const saveWorkouts = async data => {
    setWorkouts(data);
    try { await window.storage.set('hyrox_workouts_v3', JSON.stringify(data)); } catch (e) {}
    if (profile) syncPublic(profile, data);
  };
  const deleteWorkout = async (id) => {
    const updated = workouts.filter(w => w.id !== id);
    await saveWorkouts(updated);
  };
  const saveProfile = async (p) => {
    const toSave = { ...p, userId: p.userId || genUserId() };
    setProfile(toSave);
    try { await window.storage.set('hyrox_profile_v2', JSON.stringify(toSave)); } catch (e) {}
    syncPublic(toSave, workouts);
  };
  const clearAllData = async () => {
    try {
      await window.storage.delete('hyrox_workouts_v3');
      await window.storage.delete('hyrox_profile_v2');
      if (profile?.userId) await window.storage.delete(`athlete:${profile.userId}`, true);
    } catch (e) {}
    setWorkouts([]); setProfile(null); setTab('dashboard');
  };

  const pbs = computePBs(workouts);

  if (loading) return <div style={{ fontFamily: FONT, padding: '3rem', color: t.textSec, textAlign: 'center', fontSize: 16, background: t.bg, minHeight: '100vh' }}>Loading...</div>;

  if (!profile) {
    return (
      <div style={{ fontFamily: FONT, background: t.bg, minHeight: '100vh', padding: '2rem 0' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1.5rem' }}>
          <ProfileForm onSave={saveProfile} isOnboarding />
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'dashboard', label: 'Home' }, { id: 'race', label: 'Race' },
    { id: 'friends', label: 'Crew' }, { id: 'myweek', label: 'Week' },
    { id: 'log', label: 'Log' }, { id: 'progress', label: 'Stats' },
    { id: 'plan', label: 'Plan' }, { id: 'profile', label: 'Profile' },
  ];

  return (
    <div style={{ fontFamily: FONT, maxWidth: 680, margin: '0 auto', fontSize: isCompact ? 14 : 15, lineHeight: 1.55, letterSpacing: '0.005em', color: t.text, background: t.bg, minHeight: '100vh' }}>
      <div style={{ background: t.headerBg, padding: isCompact ? '16px 14px 14px' : '28px 26px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 6px 24px rgba(0,0,0,0.4)', borderBottom: `1px solid ${ACC}30`, backgroundImage: `radial-gradient(circle at 12% 0%, ${ACC}18 0%, transparent 40%), radial-gradient(circle at 100% 100%, ${ACC}10 0%, transparent 50%)` }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ACC} 30%, ${ACC} 70%, transparent)`, opacity: 0.7 }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: isCompact ? 9 : 10, letterSpacing: isCompact ? 2 : 3, color: ACC, fontWeight: 800, marginBottom: isCompact ? 4 : 8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACC, boxShadow: `0 0 8px ${ACC}` }} />
            Hyrox · {profile.eventCity}
          </div>
          <div style={{ fontSize: isCompact ? 24 : 32, fontWeight: 900, color: '#fff', letterSpacing: -1, lineHeight: 1 }}>{profile.name?.split(' ')[0]?.toUpperCase() || 'ATHLETE'}</div>
          <div style={{ fontSize: isCompact ? 11 : 12, color: '#9ca3af', marginTop: isCompact ? 4 : 6, fontWeight: 500, letterSpacing: 0.3 }}>Race day · {new Date(profile.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, position: 'relative' }}>
          <Countdown eventDate={profile.eventDate} />
        </div>
      </div>

      <div className="hyrox-tabs" style={{ display: 'flex', background: t.tabBg, backdropFilter: t.glassBlur, borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, zIndex: 9 }}>
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            flex: 1, minWidth: 0, padding: isCompact ? '14px 2px' : '15px 6px', fontSize: isCompact ? 12 : 13, fontWeight: tab === tb.id ? 800 : 600,
            color: tab === tb.id ? ACC : t.textSec, background: 'none', border: 'none', fontFamily: FONT,
            borderBottom: `3px solid ${tab === tb.id ? ACC : 'transparent'}`, cursor: 'pointer',
            transition: 'all 0.15s', letterSpacing: isCompact ? 0 : 0.2,
            whiteSpace: 'nowrap', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{tb.label}</button>
        ))}
      </div>

      <InstallPrompt />

      <div style={{ padding: isCompact ? '0.875rem 0.875rem 3rem' : '1.25rem 1.75rem 4rem' }}>
        {/* Tabs stay mounted and only toggle visibility — switching is instant after first paint, state survives, no recharts/plan recompute. */}
        <div style={{ display: tab === 'dashboard' ? 'block' : 'none' }}><Dashboard workouts={workouts} pbs={pbs} setTab={setTab} profile={profile} deleteWorkout={deleteWorkout} /></div>
        <div style={{ display: tab === 'race' ? 'block' : 'none' }}><RaceDay workouts={workouts} pbs={pbs} profile={profile} /></div>
        <div style={{ display: tab === 'friends' ? 'block' : 'none' }}><Friends profile={profile} saveProfile={saveProfile} workouts={workouts} pbs={pbs} /></div>
        <div style={{ display: tab === 'myweek' ? 'block' : 'none' }}><MyWeek profile={profile} /></div>
        <div style={{ display: tab === 'log' ? 'block' : 'none' }}><LogWorkout workouts={workouts} saveWorkouts={saveWorkouts} profile={profile} pbs={pbs} /></div>
        <div style={{ display: tab === 'progress' ? 'block' : 'none' }}><Progress workouts={workouts} pbs={pbs} /></div>
        <div style={{ display: tab === 'plan' ? 'block' : 'none' }}><TrainingPlan profile={profile} workouts={workouts} /></div>
        <div style={{ display: tab === 'profile' ? 'block' : 'none' }}><ProfileView profile={profile} onSave={saveProfile} onClearData={clearAllData} /></div>
      </div>
    </div>
  );
}
