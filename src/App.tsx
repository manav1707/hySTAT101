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
    /* Split-flap flip-clock animation */
    @keyframes flip-top-down {
      0%   { transform: rotateX(0deg); }
      100% { transform: rotateX(-90deg); opacity: 0; }
    }
    @keyframes flip-bottom-up {
      0%   { transform: rotateX(90deg); opacity: 0; }
      100% { transform: rotateX(0deg); opacity: 1; }
    }
    .flap-top { transform-origin: bottom; will-change: transform, opacity; backface-visibility: hidden; animation: flip-top-down 0.18s cubic-bezier(0.4,0,0.2,1) forwards; }
    .flap-bottom { transform-origin: top; opacity: 0; will-change: transform, opacity; backface-visibility: hidden; animation: flip-bottom-up 0.18s cubic-bezier(0.4,0,0.2,1) 0.18s forwards; }
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
  eventCity: 'Mumbai', eventDate: '2026-09-19', friends: [],
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
  const [error, setError] = useState('');

  const nameRef = useRef(null), ageRef = useRef(null), bwRef = useRef(null);
  const occRef = useRef(null), hrsRef = useRef(null), mealsRef = useRef(null);

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
    onSave({ ...initialData, name, age, bodyweight, occupation, workHours, meals, sex, shift, level, athleteType, eventCity, eventDate });
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
        <div style={{ fontSize: 14, color: t.textSec, marginBottom: 4, fontWeight: 500 }}>{greeting},</div>
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

function TranslateMode({ translated, setTranslated, inp, lbl }) {
  const { t } = useTheme();
  const [picker, setPicker] = useState('');
  const [vals, setVals] = useState({});
  const ex = EQUIV.find(e => e.id === picker);

  const handlePick = (id) => {
    setPicker(id);
    const e = EQUIV.find(x => x.id === id);
    if (e) { const defaults = {}; e.fields.forEach(f => { defaults[f.k] = f.d; }); setVals(defaults); }
  };

  const preview = ex ? ex.calc(Object.fromEntries(Object.entries(vals).map(([k, v]) => {
    if (v === '' || v == null) return [k, 0];
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return [k, Number.isFinite(n) ? n : 0];
  }))) : 0;
  const meta = ex ? getStationMeta(ex.station) : null;
  const color = ex ? (ex.station === 'run' ? ACC : STATION_META[ex.station]?.color) : t.textSec;
  const grad = ex ? (ex.station === 'run' ? GRAD.orange : STATION_META[ex.station]?.grad) : null;
  const pct = ex && meta ? Math.min(100, Math.round(preview * (ex.match / 100) / meta.target * 100)) : 0;

  const handleAdd = () => {
    if (!ex) return;
    setTranslated([...translated, { exId: ex.id, name: ex.name, station: ex.station, match: ex.match, val: preview, inputs: { ...vals } }]);
    setPicker(''); setVals({});
  };

  const remove = (i) => setTranslated(translated.filter((_, idx) => idx !== i));

  return (
    <div>
      <PasteParser onImport={(items) => setTranslated([...translated, ...items])} lbl={lbl} inp={inp} />

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: t.textSec, marginBottom: 12, textTransform: 'uppercase' }}>Or Pick Manually</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 10, marginBottom: 18 }}>
        {EQUIV.map(e => {
          const st = getStationMeta(e.station);
          const col = e.station === 'run' ? ACC : STATION_META[e.station]?.color;
          const g = e.station === 'run' ? GRAD.orange : STATION_META[e.station]?.grad;
          return (
            <button key={e.id} onClick={() => handlePick(e.id)} style={{
              padding: '12px 14px', fontSize: 13, borderRadius: 14, cursor: 'pointer', textAlign: 'left', fontFamily: FONT,
              background: picker === e.id ? col + '12' : t.card,
              border: `1.5px solid ${picker === e.id ? col : t.border}`,
              boxShadow: picker === e.id ? `0 4px 16px ${col}25` : t.cardShadow,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: g }} />
              <div style={{ fontWeight: 700, color: t.text, marginBottom: 3, fontSize: 14 }}>{e.name}</div>
              <div style={{ fontSize: 11, color: t.textSec, fontWeight: 500 }}>→ {st.abbr} · {e.match}%</div>
            </button>
          );
        })}
      </div>

      {ex && (() => {
        const compactInp = { ...inp, padding: '9px 12px', fontSize: 14, borderRadius: 9 };
        const compactLbl = { ...lbl, fontSize: 10, marginBottom: 5 };
        return (
        <div style={{ background: t.card, border: `1.5px solid ${color}`, borderRadius: 14, padding: 14, marginBottom: 14, boxShadow: `0 4px 16px ${color}15`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: grad }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{ex.name}</div>
            <Pill grad={grad} size="sm">→ {meta.abbr}</Pill>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ex.fields.length}, 1fr)`, gap: 8, marginBottom: 10 }}>
            {ex.fields.map(f => (
              <div key={f.k}>
                <label style={compactLbl}>{f.l.toUpperCase()}</label>
                <input type={f.type === 'text' ? 'text' : 'number'} step={f.type === 'speed' ? '0.1' : undefined} placeholder={String(f.d ?? '')} value={vals[f.k] ?? ''}
                  onChange={e => setVals({ ...vals, [f.k]: e.target.value })}
                  style={compactInp} />
              </div>
            ))}
          </div>
          {(() => {
            const speedField = ex.fields.find(f => f.type === 'speed');
            if (!speedField) return null;
            const speed = parseFloat(vals[speedField.k]) || 0;
            if (speed <= 0) return null;
            const secsPerKm = Math.round(3600 / speed);
            const m = Math.floor(secsPerKm / 60);
            const s = secsPerKm % 60;
            const paceStr = `${m}:${String(s).padStart(2, '0')}`;
            return (
              <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: '12px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: t.textSec, fontWeight: 500 }}>Pace from {speed} km/hr</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>{paceStr}<span style={{ fontSize: 12, color: t.textSec, fontWeight: 500 }}>/km</span></div>
              </div>
            );
          })()}
          <div style={{ background: grad, color: '#fff', borderRadius: 10, padding: '11px 14px', marginBottom: 10, boxShadow: `0 4px 14px ${color}25` }}>
            <div style={{ fontSize: 10, letterSpacing: 1.4, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', opacity: 0.9 }}>Hyrox Equivalent</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.7 }}>{preview}</span>
              <span style={{ fontSize: 12, opacity: 0.9 }}>{meta.unit} of {meta.name}</span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>{pct}% of race target · {ex.match}% pattern match</div>
          </div>
          <button onClick={handleAdd} style={{ width: '100%', padding: '11px', fontSize: 13, fontWeight: 700, background: grad, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: FONT, boxShadow: `0 3px 10px ${color}25` }}>+ ADD TO WORKOUT</button>
        </div>
        );
      })()}

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

  const cands: Record<string, any[]> = { mobility: [], fuel: [], modality: [], context: [], soft: [] };

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

  // Pull one tip per category, in order, until we have 3 — guarantees variety
  const order = ['mobility', 'fuel', 'modality', 'context', 'soft'];
  // Rotate the starting category by workout id so different logs lead with different angles
  const offset = Math.floor(rand() * order.length);
  const rotated = [...order.slice(offset), ...order.slice(0, offset)];
  const picked: any[] = [];
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

  return (
    <div>
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
        ? <TranslateMode translated={translated} setTranslated={setTranslated} inp={inp} lbl={lbl} />
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
                          <YAxis hide domain={['auto', 'auto']} reversed />
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

const WEEKLY = [
  { day: 'Mon', label: 'Push', color: '#7C3AED', grad: GRAD.purple, sessions: ['Squats 3×8', 'Bench 3×8', '4km Run @ 8.5 km/hr'], hyrox: ['WB', 'SP'] },
  { day: 'Tue', label: 'Pull', color: '#2563EB', grad: GRAD.blue, sessions: ['Deadlifts 3×5', 'Rows 3×12', '5km Cycle @ Lvl 18', '15 Burpees/km'], hyrox: ['SL', 'SKI', 'BBJ'] },
  { day: 'Wed', label: 'Recovery', color: '#059669', grad: GRAD.green, sessions: ['Steam Room', 'Hip & Ankle Mobility'], hyrox: [] },
  { day: 'Thu', label: 'Engine', color: ACC, grad: GRAD.orange, sessions: ['DB Thrusters 5×15', '8× (1km @ 11km/hr + 1min rest)'], hyrox: ['WB', 'RUN'] },
  { day: 'Fri', label: 'Hybrid', color: '#D97706', grad: GRAD.amber, sessions: ["Farmer's Carries 4×40m", 'Walking Lunges 3×20', '3km Run', 'Steam'], hyrox: ['FC', 'SBL'] },
  { day: 'Sat', label: 'Long Run', color: '#0891B2', grad: GRAD.teal, sessions: ['6–8km Zone 2'], hyrox: ['RUN'] },
  { day: 'Sun', label: 'Rest', color: '#8E8E93', grad: 'linear-gradient(135deg, #D1D5DB 0%, #6B7280 100%)', sessions: ['Full rest'], hyrox: [] },
];

function MyWeek({ profile }) {
  const { t } = useTheme();
  const today = new Date().getDay();
  const dayMap = [6, 0, 1, 2, 3, 4, 5];
  const todayIdx = dayMap[today];

  return (
    <div>
      <SectionTitle accent={ACC}>Your Weekly Split</SectionTitle>
      {profile.athleteType && (
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: '14px 18px', marginBottom: 18, fontSize: 14, color: t.textMute, lineHeight: 1.5, boxShadow: t.cardShadow }}>
          {profile.athleteType === 'strength' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Dumbbell} size={13} /> As a strength athlete, prioritize extending running volume.</span>}
          {profile.athleteType === 'hybrid' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Zap} size={13} /> Hybrid profile — well-matched. Focus on sharpening transitions.</span>}
          {profile.athleteType === 'endurance' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon C={Activity} size={13} /> As an endurance athlete, add more loaded carries and sled work.</span>}
        </div>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        {WEEKLY.map((d, i) => {
          const isToday = i === todayIdx;
          return (
            <div key={d.day} style={{
              background: isToday ? `linear-gradient(135deg, ${d.color}10 0%, ${d.color}05 100%)` : t.card,
              border: `1.5px solid ${isToday ? d.color : t.border}`,
              borderRadius: 16, padding: '14px 18px', boxShadow: isToday ? `0 8px 24px ${d.color}20` : t.cardShadow,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: d.grad }} />
              <div style={{ paddingLeft: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: d.sessions.length ? 10 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: d.color, minWidth: 36 }}>{d.day}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{d.label}</span>
                    {isToday && <span style={{ background: d.grad, color: '#fff', fontSize: 10, padding: '4px 10px', borderRadius: 999, fontWeight: 800, letterSpacing: 0.5, boxShadow: `0 2px 8px ${d.color}40` }}>TODAY</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {d.hyrox.map(h => {
                      const st = h === 'RUN' ? { grad: GRAD.orange } : STATIONS.find(s => s.abbr === h);
                      return <Pill key={h} grad={st?.grad} size="sm">{h}</Pill>;
                    })}
                  </div>
                </div>
                {d.sessions.map((s, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: t.textMute, marginBottom: 4 }}>
                    <span style={{ color: d.color, flexShrink: 0, fontWeight: 700 }}>›</span><span>{s}</span>
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

const PLAN_WEEKS = [
  ['Aerobic foundation', ['2×1km easy', 'SkiErg 3×500m', 'Rowing 3×500m']],
  ['Volume intro', ['3×1km runs', 'SkiErg 2×1000m', 'Farmers Carry × 3 sets']],
  ['Station familiarity', ['4×1km runs', 'Burpee BJs 3×20m', 'Wall Balls 3×20']],
  ['Light combos', ['Run + SkiErg combo', 'Empty sled 3×50m', 'Sandbag Lunges 3×30m']],
  ['Aerobic threshold', ['5km tempo', 'All stations light', 'Active recovery']],
  ['Deload', ['Easy 3km run', 'Light stations 50%', 'Mobility']],
  ['Strength intro', ['Sled Push loaded 4×50m', 'Farmers Carry heavy', '4×1km @ race pace']],
  ['Station power', ['Sled Push + Pull superset', 'Sandbag Lunges 4×50m', 'Wall Balls 4×25']],
  ['Running economy', ['6×1km intervals', 'SkiErg 3×1000m', 'Rowing 3×1000m']],
  ['Full volume', ['Half Hyrox: 4km + 4 stations', 'Heavy sled', 'Burpees 3×40m']],
  ['Intensity ramp', ['8×1km race pace', 'All 8 stations time trials', 'Strength']],
  ['Deload', ['Easy 5km', 'Light stations 50%', 'Rest']],
  ['Race simulation', ['Full Hyrox', 'Transition practice', 'Weakness focus']],
  ['Pace work', ['5×1km race pace', 'Station combos', 'SkiErg + Row']],
  ['Heat adaptation', ['Outdoor heat runs', 'Full station run-through', 'Recovery']],
  ['Race sim #2', ['Full Hyrox timed', 'Weak station focus', 'Race nutrition']],
  ['Speed sharpening', ['3×1km fast', 'Quick transitions', 'Strength maintenance']],
  ['Deload', ['Easy 4km', 'Light stations 40%', 'Recovery']],
  ['Final push', ['3×1km goal pace', 'Station race intensity', 'Rest']],
  ['Taper begins', ['2×1km easy', 'Light station touch', 'Visualize']],
  ['Race week', ['2×easy 1km', 'Rest Wed-Fri', 'RACE DAY']],
];
const PHASES = [
  { phase: 'BASE', color: '#059669', grad: GRAD.green, label: 'Base Building' },
  { phase: 'BUILD', color: '#D97706', grad: GRAD.amber, label: 'Strength & Volume' },
  { phase: 'RACE', color: '#7C3AED', grad: GRAD.purple, label: 'Hyrox Specific' },
  { phase: 'PEAK', color: ACC, grad: GRAD.orange, label: 'Peak & Taper' },
];

function TrainingPlan({ profile }) {
  const { t } = useTheme();
  const eventDate = new Date(profile.eventDate);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const planStart = new Date(eventDate); planStart.setDate(planStart.getDate() - 21 * 7);

  const weeks = [];
  for (let i = 0; i < 21; i++) {
    const start = new Date(planStart); start.setDate(start.getDate() + i * 7);
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const phaseIdx = i < 6 ? 0 : i < 12 ? 1 : i < 18 ? 2 : 3;
    const [focus, sessions] = PLAN_WEEKS[i] || ['Training', []];
    weeks.push({ n: i + 1, start, end, phase: PHASES[phaseIdx], focus, sessions, isCurrent: today >= start && today <= end, isPast: end < today });
  }

  return (
    <div>
      <div style={{ background: GRAD.darkHero, color: '#fff', borderRadius: 18, padding: '18px 22px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden', boxShadow: t.cardShadow }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: GRAD.orangeGlow, borderRadius: '50%', filter: 'blur(60px)', opacity: 0.4 }} />
        <div style={{ position: 'relative', display: 'flex' }}><Icon C={Calendar} size={32} color="#fff" /></div>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>21-Week Plan → Hyrox {profile.eventCity}</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{planStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>
      {PHASES.map(phase => (
        <div key={phase.phase} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: phase.grad }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: phase.color, letterSpacing: 1, textTransform: 'uppercase' }}>{phase.label}</div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {weeks.filter(w => w.phase.phase === phase.phase).map(week => (
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
                      {week.isCurrent && <span style={{ background: phase.grad, color: '#fff', fontSize: 10, padding: '3px 10px', borderRadius: 999, fontWeight: 800 }}>CURRENT</span>}
                      {week.isPast && <span style={{ fontSize: 10, color: t.textSec, background: t.surfaceAlt, padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>DONE</span>}
                    </div>
                    <span style={{ fontSize: 13, color: t.textSec, fontWeight: 500 }}>{week.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 8 }}>{week.focus}</div>
                  {week.sessions.map((s, i) => (
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
  const [prev, setPrev] = useState(display);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (display !== prev) {
      setFlipKey((k) => k + 1);
      const id = window.setTimeout(() => setPrev(display), 360);
      return () => window.clearTimeout(id);
    }
  }, [display, prev]);

  const flipping = display !== prev;
  const cardW = 38, cardH = 32, fontSz = 22, lh = 32;
  const halfStyle: React.CSSProperties = { position: 'absolute', left: 0, right: 0, height: '50%', overflow: 'hidden', display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,0.06)' };
  const digitStyle: React.CSSProperties = { fontSize: fontSz, fontWeight: 800, color: ACC_BRIGHT, lineHeight: `${lh}px`, letterSpacing: '-0.5px', fontFamily: FONT };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: cardW, height: cardH, borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 6px rgba(0,0,0,0.4)' }}>
        {/* Top static: top half of NEW digit (revealed as flap falls away) */}
        <div style={{ ...halfStyle, top: 0, alignItems: 'flex-start' }}>
          <span style={digitStyle}>{display}</span>
        </div>
        {/* Bottom static: bottom half of OLD digit (still visible until bottom flap completes) */}
        <div style={{ ...halfStyle, bottom: 0, alignItems: 'flex-end' }}>
          <span style={{ ...digitStyle, transform: `translateY(-${lh / 2}px)` }}>{prev}</span>
        </div>
        {/* Seam line */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.55)', marginTop: -0.5, zIndex: 3 }} />
        {flipping && (
          <>
            {/* Top flap: shows OLD top half, rotates down/away */}
            <div key={`t-${flipKey}`} className="flap-top" style={{ ...halfStyle, top: 0, alignItems: 'flex-start', zIndex: 4 }}>
              <span style={digitStyle}>{prev}</span>
            </div>
            {/* Bottom flap: shows NEW bottom half, rotates up into place */}
            <div key={`b-${flipKey}`} className="flap-bottom" style={{ ...halfStyle, bottom: 0, alignItems: 'flex-end', zIndex: 4 }}>
              <span style={{ ...digitStyle, transform: `translateY(-${lh / 2}px)` }}>{display}</span>
            </div>
          </>
        )}
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
  const { t, mode, setMode } = useTheme();

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
    { id: 'dashboard', label: 'Home' }, { id: 'friends', label: 'Friends' },
    { id: 'myweek', label: 'Week' }, { id: 'log', label: 'Log' },
    { id: 'progress', label: 'Progress' }, { id: 'plan', label: 'Plan' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div style={{ fontFamily: FONT, maxWidth: 680, margin: '0 auto', fontSize: 15, lineHeight: 1.55, letterSpacing: '0.005em', color: t.text, background: t.bg, minHeight: '100vh' }}>
      <div style={{ background: t.headerBg, padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: ACC_BRIGHT, fontWeight: 800, marginBottom: 6, textTransform: 'uppercase' }}>Hyrox · {profile.eventCity}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.7 }}>{profile.name?.split(' ')[0]?.toUpperCase() || 'ATHLETE'}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3, fontWeight: 500 }}>{new Date(profile.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <Countdown eventDate={profile.eventDate} />
        </div>
      </div>

      <div style={{ display: 'flex', background: t.tabBg, backdropFilter: t.glassBlur, borderBottom: `1px solid ${t.border}`, overflowX: 'auto', position: 'sticky', top: 0, zIndex: 9 }}>
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            flex: 1, minWidth: 74, padding: '15px 6px', fontSize: 13, fontWeight: tab === tb.id ? 800 : 600,
            color: tab === tb.id ? ACC : t.textSec, background: 'none', border: 'none', fontFamily: FONT,
            borderBottom: `3px solid ${tab === tb.id ? ACC : 'transparent'}`, cursor: 'pointer',
            transition: 'all 0.15s', letterSpacing: 0.2,
          }}>{tb.label}</button>
        ))}
      </div>

      <div style={{ padding: '2.5rem 1.75rem 4rem' }}>
        {tab === 'dashboard' && <Dashboard workouts={workouts} pbs={pbs} setTab={setTab} profile={profile} deleteWorkout={deleteWorkout} />}
        {tab === 'friends' && <Friends profile={profile} saveProfile={saveProfile} workouts={workouts} pbs={pbs} />}
        {tab === 'myweek' && <MyWeek profile={profile} />}
        {tab === 'log' && <LogWorkout workouts={workouts} saveWorkouts={saveWorkouts} profile={profile} pbs={pbs} />}
        {tab === 'progress' && <Progress workouts={workouts} pbs={pbs} />}
        {tab === 'plan' && <TrainingPlan profile={profile} />}
        {tab === 'profile' && <ProfileView profile={profile} onSave={saveProfile} onClearData={clearAllData} />}
      </div>
    </div>
  );
}
