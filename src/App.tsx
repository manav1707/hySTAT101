import { useState, useEffect, useRef, memo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", Arial, sans-serif';

// Gradient palette — vibrant, modern
const GRAD = {
  orange: 'linear-gradient(135deg, #FF6B35 0%, #E8451B 100%)',
  orangeGlow: 'linear-gradient(135deg, #FF8F5E 0%, #FF6B35 50%, #E8451B 100%)',
  purple: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
  pink: 'linear-gradient(135deg, #F472B6 0%, #DB2777 100%)',
  blue: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
  green: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
  amber: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
  red: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
  teal: 'linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)',
  lime: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
  darkHero: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 50%, #16213e 100%)',
  lightHero: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
};

const ACC = '#E8451B';
const ACC_BRIGHT = '#FF6B35';

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
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
}

const STATIONS = [
  { id: 'skierg', name: 'SkiErg', desc: '1000m', abbr: 'SKI', color: '#2563EB', bright: '#60A5FA', grad: GRAD.blue, hasWeight: false, target: 1000, unit: 'm' },
  { id: 'sledPush', name: 'Sled Push', desc: '50m', abbr: 'SP', color: '#7C3AED', bright: '#A78BFA', grad: GRAD.purple, hasWeight: true, target: 50, unit: 'm' },
  { id: 'sledPull', name: 'Sled Pull', desc: '50m', abbr: 'SL', color: '#DB2777', bright: '#F472B6', grad: GRAD.pink, hasWeight: true, target: 50, unit: 'm' },
  { id: 'burpee', name: 'Burpee BJ', desc: '80m', abbr: 'BBJ', color: '#D97706', bright: '#FBBF24', grad: GRAD.amber, hasWeight: false, target: 80, unit: 'm' },
  { id: 'rowing', name: 'Rowing', desc: '1000m', abbr: 'ROW', color: '#059669', bright: '#34D399', grad: GRAD.green, hasWeight: false, target: 1000, unit: 'm' },
  { id: 'farmers', name: 'Farmers Carry', desc: '200m', abbr: 'FC', color: '#DC2626', bright: '#F87171', grad: GRAD.red, hasWeight: true, target: 200, unit: 'm' },
  { id: 'lunges', name: 'Sandbag Lunges', desc: '100m', abbr: 'SBL', color: '#0891B2', bright: '#22D3EE', grad: GRAD.teal, hasWeight: true, target: 100, unit: 'm' },
  { id: 'wallballs', name: 'Wall Balls', desc: '100 reps', abbr: 'WB', color: '#65A30D', bright: '#A3E635', grad: GRAD.lime, hasWeight: true, target: 100, unit: 'reps' },
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
  return sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
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

// Theme
const THEMES = {
  light: {
    bg: '#FAFAFA', bgSolid: '#FAFAFA',
    surface: '#fff', surfaceAlt: '#F4F4F5', card: '#fff',
    border: '#E4E4E7', borderInput: '#D4D4D8',
    text: '#09090B', textSec: '#71717A', textMute: '#3F3F46',
    headerBg: '#09090B',
    tabBg: '#fff',
    inputBg: '#fff',
    cardShadow: '0 1px 2px rgba(0,0,0,0.04)',
    cardShadowHover: '0 4px 12px rgba(0,0,0,0.06)',
    heroShadow: '0 4px 16px rgba(0,0,0,0.06)',
    glassBlur: 'blur(12px) saturate(120%)',
  },
  dark: {
    bg: '#0A0A0B', bgSolid: '#0A0A0B',
    surface: '#18181B', surfaceAlt: '#27272A', card: '#18181B',
    border: '#27272A', borderInput: '#3F3F46',
    text: '#FAFAFA', textSec: '#A1A1AA', textMute: '#D4D4D8',
    headerBg: '#000',
    tabBg: '#0A0A0B',
    inputBg: '#18181B',
    cardShadow: '0 1px 2px rgba(0,0,0,0.2)',
    cardShadowHover: '0 4px 12px rgba(0,0,0,0.3)',
    heroShadow: '0 4px 16px rgba(0,0,0,0.3)',
    glassBlur: 'blur(12px) saturate(120%)',
  },
};

let currentTheme = 'light';
const themeSubscribers = new Set();
function setThemeMode(mode) {
  currentTheme = mode;
  try { window.storage?.set('hyrox_theme', mode); } catch (e) {}
  themeSubscribers.forEach(fn => fn(mode));
}
function useTheme() {
  const [mode, setMode] = useState(currentTheme);
  useEffect(() => {
    const fn = (m) => setMode(m);
    themeSubscribers.add(fn);
    return () => themeSubscribers.delete(fn);
  }, []);
  return { t: THEMES[mode], mode, setMode: setThemeMode };
}

function Pill({ color, grad, children, size = 'md' }) {
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

function SectionTitle({ children, action, accent }) {
  const { t } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, paddingLeft: 2 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: t.text, letterSpacing: -0.6, display: 'flex', alignItems: 'baseline', gap: 10 }}>
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

const ProfileForm = memo(function ProfileForm({ initial, onSave, isOnboarding }) {
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

  const inp = { width: '100%', padding: '14px 16px', fontSize: 16, borderRadius: 12, border: `1.5px solid ${t.borderInput}`, background: t.inputBg, color: t.text, boxSizing: 'border-box', fontFamily: FONT, transition: 'all 0.15s' };
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
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, letterSpacing: -0.8 }}>Let's build your plan 🔥</div>
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
          <Seg value={athleteType} onChange={setAthleteType} options={[{ v: 'strength', l: '💪 Strength' }, { v: 'hybrid', l: '⚡ Hybrid' }, { v: 'endurance', l: '🏃 Endurance' }]} />
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
  const eventDays = Math.max(0, Math.floor((new Date(profile.eventDate) - new Date()) / 86400000));
  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${t.border}`, fontSize: 15 }}>
      <span style={{ color: t.textSec }}>{label}</span>
      <span style={{ fontWeight: 600, color: t.text }}>{value || '—'}</span>
    </div>
  );
  const typeEmoji = { strength: '💪', hybrid: '⚡', endurance: '🏃' }[profile.athleteType] || '';

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
              <div style={{ fontSize: 32, lineHeight: 1 }}>{typeEmoji}</div>
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
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>⚠ Night shift</div>
          <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.95 }}>Prioritize sleep (7-9hrs), front-load calories, and consider a second recovery day.</div>
        </div>
      )}

      <button onClick={() => setEditing(true)} style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 700, background: t.card, color: ACC, border: `2px solid ${ACC}`, borderRadius: 14, cursor: 'pointer', fontFamily: FONT, marginBottom: 10 }}>EDIT PROFILE</button>
      {onClearData && !confirmClear && (
        <button onClick={() => setConfirmClear(true)} style={{ width: '100%', padding: '13px', fontSize: 13, fontWeight: 500, background: 'transparent', color: '#DC2626', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: FONT }}>Clear all data & reset</button>
      )}
      {onClearData && confirmClear && (
        <div style={{ background: '#FEE2E2', border: '1.5px solid #DC2626', borderRadius: 14, padding: 18, marginTop: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#991B1B', marginBottom: 6 }}>⚠ Are you sure?</div>
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
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) setSupported(false);
  }, []);

  const start = async () => {
    setError(null);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
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
          <div style={{ fontSize: 15, fontWeight: 700, color: ACC, display: 'flex', alignItems: 'center', gap: 6 }}>🎤 Voice Memo</div>
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
        style={{ width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: 12, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, boxSizing: 'border-box', resize: 'vertical', fontFamily: FONT, lineHeight: 1.5, position: 'relative' }} />
      {error && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 8, padding: '8px 10px', background: '#FEE2E2', borderRadius: 8, fontWeight: 500 }}>⚠ {error}</div>}
    </div>
  );
}

function computeCoverage(workout) {
  const coverage = {};
  if (workout.stations) {
    Object.entries(workout.stations).forEach(([id, data]) => {
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
  const totalElements = workouts.reduce((a, w) => a + Object.values(w.stations || {}).filter(s => s.time).length + (w.translated?.length || 0), 0);
  const cumulative = cumulativeScore(workouts, pbs);
  const firstName = profile.name?.split(' ')[0] || 'athlete';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const scorePct = cumulative / 80 * 100;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: t.textSec, marginBottom: 4, fontWeight: 500 }}>{greeting},</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: -0.8 }}>{firstName} 👋</div>
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
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2.5, color: ACC_BRIGHT, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>Hyrox Score</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 64, fontWeight: 900, background: GRAD.orangeGlow, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -2.5, lineHeight: 0.9 }}>{cumulative.toFixed(1)}</span>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Sessions" value={workouts.length} sub="all time" icon="📊" grad={GRAD.blue} />
        <StatCard label="This week" value={thisWeek} sub="sessions" icon="🔥" grad={GRAD.orange} />
        <StatCard label="Elements" value={totalElements} sub="logged" icon="⚡" grad={GRAD.purple} />
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
            }}>🗑 Delete this test workout</button>
          )}
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <SectionTitle accent={ACC}>Station Scores</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 12 }}>
          {STATIONS.map(s => {
            const pb = pbs[s.id];
            const sc = computeStationScore(s.id, workouts, pb);
            const scoreColor = sc ? (sc.score >= 9 ? '#10B981' : sc.score >= 7 ? ACC_BRIGHT : '#F59E0B') : t.borderInput;
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
        const r = await window.storage.get(`athlete:${fid}`, true);
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
      const r = await window.storage.get(`athlete:${id}`, true);
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

  const typeEmoji = { strength: '💪', hybrid: '⚡', endurance: '🏃' };
  const leaderboard = [
    { userId: profile.userId, name: profile.name, athleteType: profile.athleteType, eventCity: profile.eventCity, cumulativeScore: myCumulative, stationScores: myStationScores, totalSessions: workouts.length, isMe: true },
    ...friends
  ].sort((a, b) => (b.cumulativeScore || 0) - (a.cumulativeScore || 0));
  const myRank = leaderboard.findIndex(x => x.isMe) + 1;
  const medals = ['🥇', '🥈', '🥉'];

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
          <div style={{ fontSize: 64 }}>{myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🏆'}</div>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <SectionTitle accent={ACC}>Leaderboard</SectionTitle>
        <div style={{ display: 'grid', gap: 10 }}>
          {leaderboard.map((a, i) => {
            const rank = i + 1;
            const isMe = a.isMe;
            const emoji = typeEmoji[a.athleteType] || '🏃';
            return (
              <div key={a.userId} style={{
                background: isMe ? `linear-gradient(135deg, ${ACC}15 0%, ${ACC}05 100%)` : t.card,
                border: `1.5px solid ${isMe ? ACC : t.border}`,
                borderRadius: 16, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: isMe ? '0 8px 24px rgba(232,69,27,0.12)' : t.cardShadow,
              }}>
                <div style={{ minWidth: 40, textAlign: 'center' }}>
                  {rank <= 3 ? <span style={{ fontSize: 26 }}>{medals[rank - 1]}</span> : <span style={{ fontSize: 20, fontWeight: 800, color: t.textSec }}>#{rank}</span>}
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 24,
                  background: isMe ? GRAD.orange : t.surfaceAlt,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  boxShadow: isMe ? '0 4px 12px rgba(232,69,27,0.3)' : 'none',
                }}>{emoji}</div>
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
              style={{ flex: 1, padding: '16px', fontSize: 20, fontWeight: 700, borderRadius: 12, border: `1.5px solid ${t.borderInput}`, background: t.inputBg, color: t.text, boxSizing: 'border-box', fontFamily: 'SF Mono, Monaco, monospace', letterSpacing: 4, textAlign: 'center', textTransform: 'uppercase' }} />
            <button onClick={addFriend} disabled={adding || !addId} style={{
              padding: '16px 24px', fontSize: 14, fontWeight: 700,
              background: adding || !addId ? t.borderInput : GRAD.orange, color: '#fff', border: 'none', borderRadius: 12,
              cursor: adding || !addId ? 'not-allowed' : 'pointer', fontFamily: FONT,
              boxShadow: adding || !addId ? 'none' : '0 4px 12px rgba(232,69,27,0.3)',
            }}>{adding ? '...' : 'ADD'}</button>
          </div>
          {error && <div style={{ fontSize: 13, color: '#DC2626', marginTop: 10, fontWeight: 500 }}>⚠ {error}</div>}
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
            }}>{copied ? '✓ COPIED' : 'COPY ID'}</button>
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
    return <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '16px', fontSize: 14, fontWeight: 700, background: t.surfaceAlt, color: t.text, border: `2px dashed ${t.borderInput}`, borderRadius: 12, cursor: 'pointer', marginBottom: 16, fontFamily: FONT }}>📋 PASTE / IMPORT EXERCISES</button>;
  }

  return (
    <div style={{ background: t.card, border: `2px solid ${ACC}`, borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: '0 8px 24px rgba(232,69,27,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: ACC, letterSpacing: 0.5 }}>📋 IMPORT</div>
        <button onClick={() => { setOpen(false); setText(''); setParsed([]); }} style={{ background: 'none', border: 'none', color: t.textSec, cursor: 'pointer', fontSize: 24, fontFamily: FONT }}>×</button>
      </div>
      <div style={{ fontSize: 13, color: t.textSec, marginBottom: 12, lineHeight: 1.5 }}>Paste your routine — we'll parse and translate.</div>
      <button onClick={handleClipboard} style={{ fontSize: 13, padding: '10px 16px', background: t.card, color: ACC, border: `1.5px solid ${ACC}`, borderRadius: 10, cursor: 'pointer', marginBottom: 10, fontWeight: 700, fontFamily: FONT }}>📌 PASTE FROM CLIPBOARD</button>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={`Squats 3×8\nDB Thrusters 5×15\nFarmer's Carry 4×40m`} rows={5} style={{ ...inp, resize: 'vertical' }} />
      {text && <button onClick={() => setParsed(parsePastedExercises(text))} style={{ marginTop: 10, width: '100%', padding: '14px', fontSize: 14, fontWeight: 700, background: GRAD.orange, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 4px 12px rgba(232,69,27,0.25)' }}>⚡ PARSE</button>}
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
          <button onClick={() => { onImport(parsed); setText(''); setParsed([]); setOpen(false); }} style={{ width: '100%', padding: '14px', fontSize: 14, fontWeight: 700, background: GRAD.green, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>✓ IMPORT ALL</button>
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

  const preview = ex ? ex.calc(Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, typeof v === 'string' && !isNaN(v) ? parseFloat(v) : v]))) : 0;
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

      {ex && (
        <div style={{ background: t.card, border: `2px solid ${color}`, borderRadius: 18, padding: 18, marginBottom: 16, boxShadow: `0 8px 24px ${color}20`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: grad }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: t.text }}>{ex.name}</div>
            <Pill grad={grad}>→ {meta.abbr}</Pill>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ex.fields.length}, 1fr)`, gap: 10, marginBottom: 16 }}>
            {ex.fields.map(f => (
              <div key={f.k}>
                <label style={lbl}>{f.l.toUpperCase()}</label>
                <input type={f.type === 'text' ? 'text' : 'number'} step={f.type === 'speed' ? '0.1' : undefined} value={vals[f.k] ?? ''}
                  onChange={e => setVals({ ...vals, [f.k]: f.type === 'text' ? e.target.value : parseFloat(e.target.value) || 0 })}
                  style={inp} />
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
          <div style={{ background: grad, color: '#fff', borderRadius: 14, padding: '16px 18px', marginBottom: 14, boxShadow: `0 8px 20px ${color}30` }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', opacity: 0.9 }}>Hyrox Equivalent</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>{preview}</span>
              <span style={{ fontSize: 14, opacity: 0.9 }}>{meta.unit} of {meta.name}</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>{pct}% of race target · {ex.match}% pattern match</div>
          </div>
          <button onClick={handleAdd} style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, background: grad, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, boxShadow: `0 4px 14px ${color}30` }}>+ ADD TO WORKOUT</button>
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
            <div><label style={lbl}>1KM RUNS</label><input type="number" min="0" max="12" value={runCount} onChange={e => setRunCount(parseInt(e.target.value) || 0)} style={inp} /></div>
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
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: t.textSec, marginBottom: 12, textTransform: 'uppercase' }}>Stations</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {STATIONS.map(s => {
          const d = stationData[s.id] || {};
          const active = d.time || d.weight;
          return (
            <div key={s.id} style={{ background: t.card, border: `1.5px solid ${active ? s.color : t.border}`, borderRadius: 16, padding: '14px 16px', boxShadow: active ? `0 4px 16px ${s.color}20` : t.cardShadow, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: s.grad }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingLeft: 4 }}>
                <div><span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{s.name}</span><span style={{ fontSize: 12, color: t.textSec, marginLeft: 8 }}>{s.desc}</span></div>
                <Pill grad={s.grad} size="sm">{s.abbr}</Pill>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: s.hasWeight ? '1fr 1fr' : '1fr', gap: 10, paddingLeft: 4 }}>
                <div><label style={lbl}>TIME (MM:SS)</label><input type="text" placeholder="4:30" value={d.time || ''} onChange={e => setStation(s.id, 'time', e.target.value)} style={inp} /></div>
                {s.hasWeight && <div><label style={lbl}>WEIGHT (KG)</label><input type="number" step="2.5" placeholder="0" value={d.weight || ''} onChange={e => setStation(s.id, 'weight', e.target.value)} style={inp} /></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
        const daysToRace = Math.max(0, Math.floor((new Date(profile.eventDate) - new Date()) / 86400000));
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
              <div style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: -0.6 }}>Session Saved ✓</div>
            </div>
            <button onClick={onClose} style={{ background: t.surfaceAlt, border: 'none', color: t.textSec, cursor: 'pointer', fontSize: 20, fontFamily: FONT, lineHeight: 1, padding: 0, width: 36, height: 36, borderRadius: 18 }}>×</button>
          </div>

          {loading && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: t.textSec, fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>💭</div>
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
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase', opacity: 0.9 }}>🏆 New Personal Best</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>You smashed your best on: {insight.newPBs.join(', ')}</div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: t.textSec, marginBottom: 20, padding: '0 2px', fontWeight: 500 }}>
                <span>Race coverage today</span>
                <span style={{ color: ACC, fontWeight: 800, fontSize: 14 }}>{insight.overallPct}%</span>
              </div>
            </>
          )}

          <button onClick={onClose} style={{
            width: '100%', padding: '16px', fontSize: 15, fontWeight: 700,
            background: GRAD.orange, color: '#fff', border: 'none', borderRadius: 14,
            cursor: 'pointer', fontFamily: FONT, boxShadow: '0 8px 20px rgba(232,69,27,0.3)',
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

  const inp = { width: '100%', padding: '13px 15px', fontSize: 15, borderRadius: 12, border: `1.5px solid ${t.borderInput}`, background: t.inputBg, color: t.text, boxSizing: 'border-box', fontFamily: FONT, transition: 'all 0.15s' };
  const lbl = { fontSize: 12, color: t.textSec, marginBottom: 8, display: 'block', fontWeight: 600, letterSpacing: 0.2 };

  const setStation = (id, field, val) => setStationData(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));

  const draft = {
    date, sessionType: mode,
    stations: Object.entries(stationData).reduce((a, [id, d]) => {
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
        }}>🔄 Translate</button>
        <button onClick={() => setMode('direct')} style={{
          flex: 1, padding: '13px', fontSize: 14, fontWeight: 700, borderRadius: 9, cursor: 'pointer', border: 'none', fontFamily: FONT,
          background: mode === 'direct' ? t.card : 'transparent',
          color: mode === 'direct' ? ACC : t.textSec,
          boxShadow: mode === 'direct' ? t.cardShadow : 'none',
        }}>🎯 Direct Hyrox</button>
      </div>

      <button onClick={() => setTestMode(!testMode)} style={{
        width: '100%', padding: '13px 16px', marginBottom: 16, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        background: testMode ? GRAD.amber : t.card, color: testMode ? '#fff' : t.textSec,
        border: `1.5px ${testMode ? 'solid #F59E0B' : `dashed ${t.borderInput}`}`,
        borderRadius: 12, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: testMode ? '0 4px 14px rgba(245,158,11,0.25)' : 'none',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: testMode ? '#fff' : t.borderInput }} />
        {testMode ? '🧪 TEST MODE — entries flagged yellow' : 'Enable Test Mode'}
      </button>

      <div style={{ background: t.surfaceAlt, borderRadius: 12, padding: '14px 16px', marginBottom: 16, fontSize: 13, color: t.textSec, lineHeight: 1.5 }}>
        {mode === 'translate' ? '💡 Log regular gym exercises — we translate to Hyrox stations.' : '✅ Log actual Hyrox station times and weights.'}
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
      }}>{saved ? '✓ WORKOUT SAVED!' : testMode ? '🧪 SAVE TEST WORKOUT' : 'SAVE WORKOUT'}</button>

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

  const Tip = ({ active, payload, label }) => !active || !payload?.length ? null : (
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
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
                          <Area type="monotone" dataKey="time" stroke={s.color} strokeWidth={2.5} fill={`url(#grad-${s.id})`} isAnimationActive={false} />
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
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
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
          {profile.athleteType === 'strength' && '💪 As a strength athlete, prioritize extending running volume.'}
          {profile.athleteType === 'hybrid' && '⚡ Hybrid profile — well-matched. Focus on sharpening transitions.'}
          {profile.athleteType === 'endurance' && '🏃 As an endurance athlete, add more loaded carries and sled work.'}
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
  ['Race week', ['2×easy 1km', 'Rest Wed-Fri', 'RACE DAY 🔥']],
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
        <div style={{ fontSize: 32, position: 'relative' }}>🗓</div>
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
      const diff = ed - new Date();
      if (diff <= 0) { setT({ days: 0, hours: 0, mins: 0, secs: 0 }); return; }
      setT({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), mins: Math.floor((diff % 3600000) / 60000), secs: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {[{ label: 'D', val: t.days }, { label: 'H', val: t.hours }, { label: 'M', val: t.mins }, { label: 'S', val: t.secs }].map(({ label, val }) => (
        <div key={label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', padding: '8px 10px', borderRadius: 10, minWidth: 42, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: ACC_BRIGHT, lineHeight: 1, letterSpacing: -0.5 }}>{String(val).padStart(2, '0')}</div>
          <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1, marginTop: 3, fontWeight: 700 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function HyroxTracker() {
  const [tab, setTab] = useState('dashboard');
  const [workouts, setWorkouts] = useState([]);
  const [profile, setProfile] = useState(null);
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
        if (w) setWorkouts(JSON.parse(w.value));
        if (p) setProfile(JSON.parse(p.value));
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
    <div style={{ fontFamily: FONT, maxWidth: 640, margin: '0 auto', fontSize: 15, color: t.text, background: t.bg, minHeight: '100vh' }}>
      <div style={{ background: t.headerBg, padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: ACC_BRIGHT, fontWeight: 800, marginBottom: 6, textTransform: 'uppercase' }}>Hyrox · {profile.eventCity}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.7 }}>{profile.name?.split(' ')[0]?.toUpperCase() || 'ATHLETE'}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3, fontWeight: 500 }}>{new Date(profile.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} style={{
            background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: 999, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
          }}>{mode === 'light' ? '🌙' : '☀️'}</button>
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

      <div style={{ padding: '2rem 1.5rem 3rem' }}>
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
