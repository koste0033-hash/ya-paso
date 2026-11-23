import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALABRAS} from './palabras';

// ---------- Tiempo ----------
export const FPS = 30;
const SPEED = 1.3; // la voz se aceleró 1.3x
export const F = (t: number) => Math.round((t / SPEED) * FPS); // segundos de la voz original -> cuadro
export const DURACION = F(54.3) + 18;

const ip = (f: number, a: number, b: number, c: number, d: number, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [c, d], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

const INK = '#1b1b2f';

// ---------- Caras ----------
type Cara = 'normal' | 'feliz' | 'habla' | 'listo' | 'susto' | 'cansado' | 'enojado' | 'triste' | 'estrellas' | 'orgulloso';

const Star: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => {
  const pts = Array.from({length: 10}, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`;
  }).join(' ');
  return <polygon points={pts} fill="#ffd23f" stroke={INK} strokeWidth={3} />;
};

const Face: React.FC<{cara: Cara; f: number}> = ({cara, f}) => {
  const eye = (x: number) => <circle cx={x} cy={-8} r={8} fill={INK} />;
  const blink = f % 70 < 3; // parpadeo
  const ojosNormales = blink ? (
    <>
      <path d="M -30 -8 L -14 -8" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path d="M 18 -8 L 34 -8" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    </>
  ) : (
    <>
      {eye(-22)}
      {eye(26)}
    </>
  );
  switch (cara) {
    case 'feliz':
      return (
        <>
          <path d="M -32 -6 Q -22 -22 -12 -6" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 16 -6 Q 26 -22 36 -6" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M -20 18 Q 4 52 30 18 Z" fill="#c0392b" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </>
      );
    case 'orgulloso':
      return (
        <>
          <path d="M -32 -6 Q -22 -22 -12 -6" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 16 -6 Q 26 -22 36 -6" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          <circle cx={-38} cy={16} r={11} fill="#ff8fa3" opacity={0.8} />
          <circle cx={44} cy={16} r={11} fill="#ff8fa3" opacity={0.8} />
          <path d="M -16 20 Q 4 46 26 20 Z" fill="#c0392b" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </>
      );
    case 'estrellas':
      return (
        <>
          <Star x={-22} y={-8} r={18} />
          <Star x={26} y={-8} r={18} />
          <path d="M -20 18 Q 4 54 30 18 Z" fill="#c0392b" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </>
      );
    case 'habla': {
      const open = 4 + 11 * Math.abs(Math.sin(f * 0.75));
      return (
        <>
          {ojosNormales}
          <ellipse cx={4} cy={28} rx={13} ry={open} fill="#7a1f1f" stroke={INK} strokeWidth={4} />
        </>
      );
    }
    case 'listo':
      return (
        <>
          <path d="M -34 -14 L -10 -10" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <path d="M 14 -10 L 38 -14" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <circle cx={-22} cy={-4} r={6} fill={INK} />
          <circle cx={26} cy={-4} r={6} fill={INK} />
          <path d="M -12 28 Q 12 34 30 14" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        </>
      );
    case 'susto':
      return (
        <>
          <circle cx={-22} cy={-10} r={16} fill="#fff" stroke={INK} strokeWidth={4} />
          <circle cx={26} cy={-10} r={16} fill="#fff" stroke={INK} strokeWidth={4} />
          <circle cx={-22} cy={-10} r={5} fill={INK} />
          <circle cx={26} cy={-10} r={5} fill={INK} />
          <ellipse cx={4} cy={32} rx={11} ry={15} fill="#7a1f1f" stroke={INK} strokeWidth={4} />
        </>
      );
    case 'cansado':
      return (
        <>
          <path d="M -32 -6 L -12 -6" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <path d="M 16 -6 L 36 -6" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <path d="M -30 6 Q -22 12 -14 6" stroke="#8e7cc3" strokeWidth={4} fill="none" />
          <path d="M 18 6 Q 26 12 34 6" stroke="#8e7cc3" strokeWidth={4} fill="none" />
          <path d="M -12 30 Q -4 24 4 30 Q 12 36 20 30" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      );
    case 'enojado':
      return (
        <>
          <path d="M -38 -30 L -10 -16" stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <path d="M 42 -30 L 14 -16" stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <circle cx={-22} cy={-4} r={7} fill={INK} />
          <circle cx={26} cy={-4} r={7} fill={INK} />
          <path d="M -16 36 Q 4 18 24 36" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        </>
      );
    case 'triste':
      return (
        <>
          <path d="M -34 -22 L -12 -28" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <path d="M 16 -28 L 38 -22" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          {eye(-22)}
          {eye(26)}
          <path d="M -14 36 Q 4 22 22 36" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M 30 ${4 + (f % 30)} q 6 10 0 14 q -6 -4 0 -14`} fill="#5dade2" />
        </>
      );
    default:
      return (
        <>
          {ojosNormales}
          <path d="M -12 24 Q 4 36 20 24" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        </>
      );
  }
};

// ---------- Monito ----------
type Pose = {la: [number, number]; ra: [number, number]; ll: [number, number]; rl: [number, number]};
const POSE_BASE: Pose = {la: [-22, -8], ra: [22, 8], ll: [-12, -4], rl: [12, 4]};
const rad = (d: number) => (d * Math.PI) / 180;
const limb = (x: number, y: number, a1: number, a2: number, l1: number, l2: number) => {
  const ex = x + l1 * Math.sin(rad(a1));
  const ey = y + l1 * Math.cos(rad(a1));
  const hx = ex + l2 * Math.sin(rad(a2));
  const hy = ey + l2 * Math.cos(rad(a2));
  return {d: `M ${x} ${y} L ${ex} ${ey} L ${hx} ${hy}`, hx, hy};
};

type Tipo = 'nino' | 'mama' | 'maestra' | 'vecina';

const Stick: React.FC<{
  x: number; y: number; s?: number; flip?: boolean; pose?: Partial<Pose>; cara?: Cara; tipo?: Tipo;
  tinte?: string; f: number; mano?: React.ReactNode; manoIzq?: React.ReactNode; bob?: number; sudor?: boolean;
}> = ({x, y, s = 1, flip = false, pose = {}, cara = 'normal', tipo = 'nino', tinte = '#fff', f, mano, manoIzq, bob = 1, sudor = false}) => {
  const p = {...POSE_BASE, ...pose};
  const by = -Math.abs(Math.sin(f * 0.12)) * 6 * bob; // respiración / rebote
  const sh = {x: 0, y: -300};
  const la = limb(sh.x, sh.y, p.la[0], p.la[1], 85, 80);
  const ra = limb(sh.x, sh.y, p.ra[0], p.ra[1], 85, 80);
  const ll = limb(0, -170, p.ll[0], p.ll[1], 90, 85);
  const rl = limb(0, -170, p.rl[0], p.rl[1], 90, 85);
  const stroke = {stroke: INK, strokeWidth: 15, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <ellipse cx={0} cy={4} rx={80} ry={14} fill="#000" opacity={0.15} />
      <g transform={`translate(0,${by})`}>
        {tipo === 'mama' || tipo === 'maestra' || tipo === 'vecina' ? (
          <>
            <path d={ll.d} {...stroke} />
            <path d={rl.d} {...stroke} />
            <path
              d="M 0 -320 L -62 -140 L 62 -140 Z"
              fill={tipo === 'mama' ? '#9b59b6' : tipo === 'maestra' ? '#2e86c1' : '#7f8c8d'}
              stroke={INK} strokeWidth={8} strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            <path d={ll.d} {...stroke} />
            <path d={rl.d} {...stroke} />
            <path d="M 0 -170 L 0 -325" {...stroke} />
          </>
        )}
        <path d={la.d} {...stroke} />
        <path d={ra.d} {...stroke} />
        {mano && <g transform={`translate(${ra.hx},${ra.hy})`}>{mano}</g>}
        {manoIzq && <g transform={`translate(${la.hx},${la.hy})`}>{manoIzq}</g>}
        <g transform="translate(0,-395)">
          {tipo === 'mama' && (
            <>
              <circle cx={-30} cy={-62} r={34} fill="#6e3b1f" stroke={INK} strokeWidth={6} />
              <path d="M -78 20 Q -90 -80 0 -78 Q 80 -76 74 -10 Z" fill="#6e3b1f" stroke={INK} strokeWidth={6} />
            </>
          )}
          {tipo === 'maestra' && <path d="M -80 30 Q -88 -84 0 -80 Q 86 -80 78 30 Z" fill="#c0392b" stroke={INK} strokeWidth={6} />}
          {tipo === 'vecina' && (
            <>
              <circle cx={-48} cy={-46} r={30} fill="#d5d8dc" stroke={INK} strokeWidth={5} />
              <circle cx={0} cy={-66} r={32} fill="#d5d8dc" stroke={INK} strokeWidth={5} />
              <circle cx={48} cy={-46} r={30} fill="#d5d8dc" stroke={INK} strokeWidth={5} />
            </>
          )}
          <circle cx={0} cy={0} r={70} fill={tinte} stroke={INK} strokeWidth={9} />
          <Face cara={cara} f={f} />
          {tipo === 'nino' && (
            <>
              <path d="M -66 -22 A 68 68 0 0 1 66 -22 Z" fill="#e63946" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M 52 -26 L 122 -18 L 118 -6 L 54 -12 Z" fill="#a4161a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
              <circle cx={0} cy={-70} r={8} fill="#a4161a" stroke={INK} strokeWidth={4} />
            </>
          )}
          {(tipo === 'maestra' || tipo === 'vecina') && (
            <>
              <circle cx={-22} cy={-8} r={20} fill="none" stroke={INK} strokeWidth={5} />
              <circle cx={26} cy={-8} r={20} fill="none" stroke={INK} strokeWidth={5} />
              <path d="M -2 -8 L 6 -8" stroke={INK} strokeWidth={5} />
            </>
          )}
          {sudor && (
            <>
              <path d={`M 72 ${-30 + ((f * 2) % 40)} q 9 14 0 20 q -9 -6 0 -20`} fill="#5dade2" stroke={INK} strokeWidth={3} />
              <path d={`M -80 ${-10 + ((f * 2 + 20) % 40)} q 8 12 0 18 q -8 -6 0 -18`} fill="#5dade2" stroke={INK} strokeWidth={3} />
            </>
          )}
        </g>
      </g>
    </g>
  );
};

// ---------- Gato ----------
const Gato: React.FC<{x: number; y: number; s?: number; color: string; enojado?: boolean; f: number; flip?: boolean}> = ({x, y, s = 1, color, enojado, f, flip}) => {
  const tail = Math.sin(f * 0.15 + x) * 15;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <ellipse cx={0} cy={4} rx={70} ry={10} fill="#000" opacity={0.15} />
      <path d={`M 50 -30 Q ${95 + tail} -60 ${80 + tail} -120`} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={`M 50 -30 Q ${95 + tail} -60 ${80 + tail} -120`} stroke={color} strokeWidth={12} fill="none" strokeLinecap="round" />
      <ellipse cx={10} cy={-50} rx={62} ry={52} fill={color} stroke={INK} strokeWidth={7} />
      <g transform="translate(-30,-110)">
        <path d="M -42 -20 L -36 -72 L -6 -40 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 42 -20 L 36 -72 L 6 -40 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={0} cy={0} r={52} fill={color} stroke={INK} strokeWidth={7} />
        {enojado ? (
          <>
            <path d="M -32 -22 L -6 -10" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <path d="M 32 -22 L 6 -10" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <ellipse cx={-18} cy={0} rx={9} ry={6} fill="#ff1e1e" stroke={INK} strokeWidth={3} />
            <ellipse cx={18} cy={0} rx={9} ry={6} fill="#ff1e1e" stroke={INK} strokeWidth={3} />
            <path d="M -12 26 L -6 20 L 0 26 L 6 20 L 12 26" stroke={INK} strokeWidth={4} fill="none" />
          </>
        ) : (
          <>
            <ellipse cx={-18} cy={-2} rx={7} ry={11} fill={INK} />
            <ellipse cx={18} cy={-2} rx={7} ry={11} fill={INK} />
            <path d="M -8 18 Q 0 26 0 16 Q 0 26 8 18" stroke={INK} strokeWidth={4} fill="none" />
          </>
        )}
        <path d="M -30 12 L -64 6 M -30 18 L -62 22 M 30 12 L 64 6 M 30 18 L 62 22" stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};

// ---------- Objetos ----------
const Trapeador: React.FC<{a: number}> = ({a}) => (
  <g transform={`rotate(${a})`}>
    <path d="M 0 -150 L 0 170" stroke="#a0522d" strokeWidth={14} strokeLinecap="round" />
    <path d="M -50 170 L 50 170 L 40 215 L -40 215 Z" fill="#ecf0f1" stroke={INK} strokeWidth={6} />
    <path d="M -30 175 L -34 212 M -10 175 L -10 214 M 10 175 L 10 214 M 30 175 L 34 212" stroke="#bdc3c7" strokeWidth={4} />
  </g>
);
const Plumon = () => (
  <g transform="rotate(-30)">
    <rect x={-12} y={-90} width={24} height={110} rx={8} fill="#2e86c1" stroke={INK} strokeWidth={5} />
    <path d="M -8 20 L 0 40 L 8 20 Z" fill={INK} />
  </g>
);
const Telefono = () => (
  <g transform="rotate(-10)">
    <rect x={-28} y={-80} width={56} height={100} rx={10} fill="#34495e" stroke={INK} strokeWidth={5} />
    <rect x={-20} y={-70} width={40} height={70} rx={4} fill="#85c1e9" />
  </g>
);
const Control: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}>
    <path d="M -150 -40 Q -170 -70 -110 -70 L 110 -70 Q 170 -70 150 -40 L 175 70 Q 180 110 130 90 L 80 40 L -80 40 L -130 90 Q -180 110 -175 70 Z" fill="#2c3e50" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M -110 -20 L -110 20 M -130 0 L -90 0" stroke="#ecf0f1" strokeWidth={12} strokeLinecap="round" />
    <circle cx={100} cy={-20} r={13} fill="#e74c3c" />
    <circle cx={130} cy={5} r={13} fill="#f1c40f" />
    <circle cx={70} cy={5} r={13} fill="#2ecc71" />
    <circle cx={100} cy={30} r={13} fill="#3498db" />
  </g>
);

const Hoja: React.FC<{nueve: number; f: number}> = ({nueve}) => (
  <g>
    <rect x={-260} y={-330} width={520} height={660} rx={10} fill="#fffdf5" stroke={INK} strokeWidth={8} />
    {Array.from({length: 9}).map((_, i) => (
      <line key={i} x1={-230} x2={230} y1={-180 + i * 55} y2={-180 + i * 55} stroke="#aed6f1" strokeWidth={3} />
    ))}
    <text x={-225} y={-250} fontSize={58} fontWeight={900} fill={INK} fontFamily="DejaVu Sans">EXAMEN</text>
    <text x={-225} y={-195} fontSize={30} fill="#566573" fontFamily="DejaVu Sans">Nombre: ______________</text>
    <text x={-60} y={150} fontSize={290} fontWeight={900} fill="#e74c3c" fontFamily="DejaVu Sans" textAnchor="middle">4</text>
    <text x={130} y={130} fontSize={110} fontWeight={900} fill="#e74c3c" fontFamily="DejaVu Sans" textAnchor="middle">/10</text>
    <ellipse cx={30} cy={60} rx={220} ry={160} fill="none" stroke="#e74c3c" strokeWidth={9} transform="rotate(-8 30 60)" />
    {/* el "arreglo" con plumón azul: cierra el 4 para hacerlo 9 (mal) */}
    <path
      d="M -85 -40 C -190 -60 -190 60 -100 40 C -60 30 -45 0 -40 -40"
      fill="none" stroke="#1f4fbf" strokeWidth={26} strokeLinecap="round"
      strokeDasharray={520} strokeDashoffset={520 * (1 - nueve)}
    />
  </g>
);

// ---------- Fondos ----------
const Casa: React.FC = () => (
  <>
    <rect width={1080} height={1920} fill="#ffe8a3" />
    {Array.from({length: 7}).map((_, i) => (
      <rect key={i} x={i * 160 + 40} y={0} width={60} height={1380} fill="#ffdf80" />
    ))}
    <rect x={620} y={300} width={340} height={380} rx={12} fill="#9fd8ff" stroke={INK} strokeWidth={10} />
    <path d="M 790 300 L 790 680 M 620 490 L 960 490" stroke={INK} strokeWidth={10} />
    <rect y={1380} width={1080} height={540} fill="#c8875a" />
    {Array.from({length: 6}).map((_, i) => (
      <line key={i} x1={0} x2={1080} y1={1440 + i * 90} y2={1440 + i * 90} stroke="#a86a42" strokeWidth={6} />
    ))}
    <rect y={1370} width={1080} height={18} fill="#8d5a3b" />
  </>
);
const CasaVecina: React.FC = () => (
  <>
    <rect width={1080} height={1920} fill="#c9b8e8" />
    {Array.from({length: 40}).map((_, i) => (
      <circle key={i} cx={(i % 8) * 140 + 60} cy={Math.floor(i / 8) * 260 + 120} r={18} fill="#b39ddb" />
    ))}
    <rect x={80} y={380} width={260} height={320} fill="#fff8e1" stroke={INK} strokeWidth={10} />
    <circle cx={210} cy={540} r={80} fill="#ffcc80" stroke={INK} strokeWidth={6} />
    <text x={210} y={565} fontSize={70} textAnchor="middle" fontFamily="DejaVu Sans">🐱</text>
    <rect y={1380} width={1080} height={540} fill="#8e6e53" />
    <rect y={1370} width={1080} height={18} fill="#5d4037" />
  </>
);
const Escritorio: React.FC = () => (
  <>
    <rect width={1080} height={1920} fill="#2c3e6b" />
    <circle cx={880} cy={260} r={90} fill="#fdf2c4" />
    <circle cx={850} cy={240} r={90} fill="#2c3e6b" />
    {Array.from({length: 14}).map((_, i) => (
      <circle key={i} cx={(i * 211) % 1080} cy={(i * 137) % 600 + 60} r={4} fill="#fff" opacity={0.7} />
    ))}
    <path d="M 120 1000 L 960 1000" stroke="#ffe08a" strokeWidth={0} />
    <rect y={1330} width={1080} height={590} fill="#8b5a2b" />
    <rect y={1320} width={1080} height={24} fill="#6d4421" />
  </>
);
const Escuela: React.FC = () => (
  <>
    <rect width={1080} height={960} fill="#f6ddcc" />
    <rect x={60} y={120} width={960} height={420} rx={10} fill="#1e5631" stroke="#8b5a2b" strokeWidth={18} />
    <text x={540} y={270} fontSize={64} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans" opacity={0.85}>2 + 2 = 4</text>
    <text x={540} y={380} fontSize={46} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans" opacity={0.6}>Tareas pendientes: 3</text>
    <rect y={820} width={1080} height={140} fill="#b07d56" />
  </>
);

// ---------- Cámara: siempre se mueve un poco ----------
const Cam: React.FC<{f: number; dur: number; from?: number; to?: number; ox?: number; oy?: number; punch?: number; children: React.ReactNode}> = ({
  f, dur, from = 1, to = 1.08, ox = 540, oy = 1100, punch = 0, children,
}) => {
  const z = interpolate(f, [0, dur], [from, to], {extrapolateRight: 'clamp'}) + punch;
  return <g transform={`translate(${ox},${oy}) scale(${z}) translate(${-ox},${-oy})`}>{children}</g>;
};

const Punch = (f: number, at: number, amount = 0.12) => {
  if (f < at) return 0;
  return amount * spring({frame: f - at, fps: FPS, config: {damping: 14, stiffness: 180}});
};

const Shake = (f: number, at: number, len = 8, amp = 14) => {
  const d = f - at;
  if (d < 0 || d > len) return 0;
  return (d % 2 === 0 ? 1 : -1) * amp * (1 - d / len);
};

// ---------- Escenas ----------
type SceneProps = {f: number; g: number; dur: number};

// 1. Gancho: limpiando la casa de la vecina con gatos
const E1: React.FC<SceneProps> = ({f, dur}) => {
  const mop = Math.sin(f * 0.35) * 22;
  return (
    <Cam f={f} dur={dur} from={1.12} to={1.0}>
      <CasaVecina />
      <Gato x={200} y={1560} color="#f39c12" f={f} />
      <Gato x={880} y={1520} color="#7f8c8d" f={f} flip s={0.9} />
      <Gato x={760} y={1760} color="#ecf0f1" f={f} s={0.8} enojado />
      <ellipse cx={540 + mop * 3} cy={1650} rx={150} ry={26} fill="#5dade2" opacity={0.5} />
      <Stick x={520} y={1640} s={1.25} f={f} cara="cansado" sudor
        pose={{ra: [40 + mop, 20 + mop], la: [30 + mop * 0.6, 10 + mop]}}
        mano={<Trapeador a={-mop * 0.8} />} />
      <g transform={`translate(540,${330 - Math.max(0, 30 - f) * 4})`}>
        <rect x={-220} y={-70} width={440} height={120} rx={24} fill="#fff" stroke={INK} strokeWidth={8} />
        <text y={14} fontSize={62} fontWeight={900} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">DÍA 1 / 30</text>
      </g>
    </Cam>
  );
};

// 2. Mamá promete el videojuego
const E2: React.FC<SceneProps> = ({f, g, dur}) => {
  const pensando = g >= F(11.8);
  const sp = spring({frame: g - F(11.8), fps: FPS, config: {damping: 10}});
  const habla = g >= F(8.3) && g < F(12.5);
  return (
    <Cam f={f} dur={dur}>
      <Casa />
      <Stick x={300} y={1600} s={1.3} f={f} tipo="mama" cara={habla ? 'habla' : 'normal'}
        pose={{ra: [150 + Math.sin(f * 0.3) * 10, 175]}} />
      <Stick x={780} y={1600} s={1.05} f={f} flip cara={pensando ? 'estrellas' : 'normal'} />
      {pensando && (
        <g transform={`translate(760,820) scale(${sp})`}>
          <circle cx={-90} cy={260} r={18} fill="#fff" stroke={INK} strokeWidth={6} />
          <circle cx={-60} cy={200} r={28} fill="#fff" stroke={INK} strokeWidth={6} />
          <ellipse cx={0} cy={0} rx={250} ry={170} fill="#fff" stroke={INK} strokeWidth={8} />
          <Control s={0.9} />
        </g>
      )}
    </Cam>
  );
};

// 3. Saqué un 4... de 10
const E3: React.FC<SceneProps> = ({f, g, dur}) => {
  const p = Punch(g, F(15.0), 0.35);
  const asoma = ip(f, 6, 18, 400, 0, Easing.out(Easing.back(1.6)));
  return (
    <>
      <rect width={1080} height={1920} fill="#58b368" />
      <Cam f={f} dur={dur} from={1} to={1.05} oy={900} ox={620} punch={p}>
        <g transform="translate(540,880) rotate(-4)">
          <Hoja nueve={0} f={f} />
        </g>
      </Cam>
      <g transform={`translate(0,${asoma})`}>
        <Stick x={540} y={2050} s={1.4} f={f} cara="susto" sudor={g > F(15.0)} />
      </g>
    </>
  );
};

// 4. El plumón: 4 -> 9
const E4: React.FC<SceneProps> = ({f, g, dur}) => {
  const nueve = ip(g, F(19.1), F(21.0), 0, 1, Easing.inOut(Easing.quad));
  const zoom = Punch(g, F(22.95), 0.55);
  const cara: Cara = g < F(18.2) ? 'listo' : g < F(21.2) ? 'listo' : 'orgulloso';
  const foco = g < F(18.2) ? 1 : 0;
  return (
    <Cam f={f} dur={dur} from={1} to={1.06} ox={460} oy={640} punch={zoom}>
      <Escritorio />
      {/* lámpara */}
      <path d="M 900 1330 L 900 1000 L 760 900" stroke="#bdc3c7" strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d="M 700 860 L 820 860 L 860 950 L 660 950 Z" fill="#f1c40f" stroke={INK} strokeWidth={7} />
      <path d="M 660 950 L 400 1330 L 1060 1330 L 860 950 Z" fill="#fff6b0" opacity={0.25} />
      <g transform="translate(460,640) scale(0.85) rotate(-3)">
        <Hoja nueve={nueve} f={f} />
      </g>
      <Stick x={540} y={1800} s={1.15} f={f} cara={cara}
        pose={{ra: g >= F(18.2) && g < F(21.2) ? [160 + Math.sin(f * 0.9) * 12, 150 + Math.sin(f * 0.9) * 20] : [150, 200]}}
        mano={<Plumon />} />
      {foco === 1 && (
        <g transform={`translate(280,${1190 + Math.sin(f * 0.2) * 8})`}>
          <circle r={60} fill="#fff59d" stroke={INK} strokeWidth={6} />
          <rect x={-22} y={55} width={44} height={30} fill="#95a5a6" stroke={INK} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={0} y1={0} x2={Math.cos(i) * 110} y2={Math.sin(i) * -110} stroke="#fff59d" strokeWidth={6} opacity={0.6} />
          ))}
        </g>
      )}
      {g >= F(21.2) && g < F(22.95) && <Star x={720} y={420} r={40 + Math.sin(f * 0.5) * 6} />}
    </Cam>
  );
};

// 5. Mamá orgullosa... y saca el teléfono
const E5: React.FC<SceneProps> = ({f, g, dur}) => {
  const telefono = g >= F(28.0);
  const ninoCara: Cara = telefono ? 'susto' : 'listo';
  const hearts = [0, 1, 2, 3].map((i) => {
    const t = (f + i * 12) % 48;
    return (
      <text key={i} x={240 + i * 60} y={760 - t * 6} fontSize={70} opacity={1 - t / 48} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">❤</text>
    );
  });
  return (
    <Cam f={f} dur={dur}>
      <Casa />
      {!telefono && hearts}
      <Stick x={330} y={1600} s={1.3} f={f} tipo="mama" cara={g < F(26.1) ? 'feliz' : telefono ? 'habla' : 'orgulloso'}
        pose={telefono ? {ra: [125, -170]} : {ra: [140, 170], la: [-140, -170]}}
        mano={telefono ? <Telefono /> : <g transform="rotate(8)"><rect x={-60} y={-160} width={120} height={150} fill="#fffdf5" stroke={INK} strokeWidth={5} /><text x={0} y={-60} fontSize={80} fontWeight={900} textAnchor="middle" fill="#1f4fbf" fontFamily="DejaVu Sans">9</text></g>} />
      <Stick x={800} y={1600} s={1.05} f={f} flip cara={ninoCara} sudor={telefono} />
    </Cam>
  );
};

// 6. Yo... dejé de respirar
const E6: React.FC<SceneProps> = ({f, dur}) => {
  const pale = ip(f, 0, 20, 0, 1);
  const tinte = `rgb(${255 - 70 * pale},${255 - 25 * pale},255)`;
  return (
    <Cam f={f} dur={dur} from={1.0} to={1.25} oy={950}>
      <rect width={1080} height={1920} fill="#1b2a49" />
      {Array.from({length: 16}).map((_, i) => (
        <line key={i} x1={540} y1={950} x2={540 + Math.cos(i * 0.4) * 1400} y2={950 + Math.sin(i * 0.4) * 1400} stroke="#243b6b" strokeWidth={50} />
      ))}
      <Stick x={540} y={2150} s={3.0} f={0} cara="susto" tinte={tinte} sudor bob={0} />
    </Cam>
  );
};

// 7. La maestra contesta (pantalla dividida)
const E7: React.FC<SceneProps> = ({f, g, dur}) => {
  const enojo = ip(g, F(36.4), F(37.6), 0, 1);
  const tinte = `rgb(255,${255 - 110 * enojo},${255 - 120 * enojo})`;
  const flash = g >= F(37.68) && g < F(38.9) ? 0.25 + 0.15 * Math.sin(f) : 0;
  const sx = Shake(g, F(37.68), 10, 18);
  const habla = g >= F(33.9) && g < F(38.75);
  return (
    <>
      <svg width={1080} height={960} viewBox="0 0 1080 960" style={{position: 'absolute', top: 0}}>
        <Cam f={f} dur={dur} oy={600}>
          <Escuela />
          <Stick x={540} y={900} s={0.95} f={f} tipo="maestra" cara={habla ? 'habla' : 'normal'}
            pose={{ra: [125, -170]}} mano={<Telefono />} />
        </Cam>
      </svg>
      <svg width={1080} height={960} viewBox="0 0 1080 960" style={{position: 'absolute', top: 960}}>
        <g transform={`translate(${sx},0)`}>
          <Cam f={f} dur={dur} oy={500}>
            <g transform="translate(0,-700)"><Casa /></g>
            <Stick x={540} y={900} s={0.95} f={f} tipo="mama" cara={enojo > 0.5 ? 'enojado' : 'feliz'} tinte={tinte}
              pose={{ra: [125, -170]}} mano={<Telefono />} />
          </Cam>
        </g>
        <rect width={1080} height={960} fill="#ff0000" opacity={flash} />
      </svg>
      <div style={{position: 'absolute', top: 948, left: 0, width: 1080, height: 24, background: INK}} />
    </>
  );
};

// 8. No me compraron el videojuego
const E8: React.FC<SceneProps> = ({f, g, dur}) => {
  const sello = spring({frame: g - F(39.0), fps: FPS, config: {damping: 9, stiffness: 160}});
  return (
    <Cam f={f} dur={dur} oy={800}>
      <rect width={1080} height={1920} fill="#34495e" />
      <g transform="translate(540,760)">
        <Control s={1.7} />
        <g transform={`scale(${3 - 2 * sello}) rotate(-12)`} opacity={sello}>
          <path d="M -260 -200 L 260 200 M 260 -200 L -260 200" stroke="#e63946" strokeWidth={60} strokeLinecap="round" />
        </g>
      </g>
      <Stick x={540} y={1720} s={1.1} f={f} cara="triste" pose={{la: [-8, -2], ra: [8, 2]}} />
    </Cam>
  );
};

// 9. Castigo: limpiar la casa de la vecina un mes
const E9: React.FC<SceneProps> = ({f, g, dur}) => {
  const cal = spring({frame: g - F(44.7), fps: FPS, config: {damping: 11}});
  return (
    <Cam f={f} dur={dur}>
      <CasaVecina />
      <Stick x={300} y={1600} s={1.2} f={f} tipo="vecina" cara="feliz" pose={{ra: [60, 30]}} />
      <Stick x={780} y={1600} s={1.05} f={f} flip cara="triste" pose={{ra: [40, 20]}} mano={<Trapeador a={-10} />} />
      {g >= F(44.7) && (
        <g transform={`translate(540,560) scale(${cal})`}>
          <rect x={-190} y={-200} width={380} height={380} rx={20} fill="#fff" stroke={INK} strokeWidth={10} />
          <rect x={-190} y={-200} width={380} height={100} rx={20} fill="#e63946" stroke={INK} strokeWidth={10} />
          <text y={-128} fontSize={56} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">CASTIGO</text>
          <text y={60} fontSize={150} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">30</text>
          <text y={140} fontSize={50} fontWeight={700} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">DÍAS</text>
        </g>
      )}
    </Cam>
  );
};

// 10. Nueve gatos... y uno lo odiaba
const GATOS: {x: number; y: number; c: string; s: number}[] = [
  {x: 180, y: 900, c: '#f39c12', s: 0.85}, {x: 540, y: 880, c: '#7f8c8d', s: 0.85}, {x: 900, y: 900, c: '#ecf0f1', s: 0.85},
  {x: 120, y: 1250, c: '#2c3e50', s: 0.9}, {x: 420, y: 1230, c: '#d35400', s: 0.9}, {x: 700, y: 1240, c: '#f5cba7', s: 0.9}, {x: 970, y: 1260, c: '#95a5a6', s: 0.9},
  {x: 260, y: 1620, c: '#fdebd0', s: 1}, {x: 820, y: 1640, c: '#1c1c1c', s: 1.05},
];
const E10: React.FC<SceneProps> = ({f, g, dur}) => {
  const inicio = F(45.5);
  const odio = g >= F(48.1);
  const z = odio ? Punch(g, F(48.1), 0.7) : 0;
  return (
    <Cam f={f} dur={dur} from={1} to={1.04} ox={800} oy={1560} punch={z}>
      <CasaVecina />
      {GATOS.map((c, i) => {
        const t = inicio + i * 3;
        const s = spring({frame: g - t, fps: FPS, config: {damping: 10}});
        if (g < t) return null;
        return <Gato key={i} x={c.x} y={c.y} s={c.s * s} color={c.c} f={f} enojado={i === 8 && odio} flip={i % 2 === 1} />;
      })}
      <g transform={`translate(540,330) scale(${spring({frame: g - F(46.5), fps: FPS})})`}>
        <circle r={120} fill="#f1c40f" stroke={INK} strokeWidth={10} />
        <text y={55} fontSize={160} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">9</text>
      </g>
      {odio && (
        <text x={820} y={1330} fontSize={70} textAnchor="middle" fontFamily="DejaVu Sans" fill="#e63946" fontWeight={900}>
          {'💢'}
        </text>
      )}
    </Cam>
  );
};

// 11. Pregunta final
const E11: React.FC<SceneProps> = ({f, dur}) => {
  const s = spring({frame: f, fps: FPS, config: {damping: 12}});
  const b = spring({frame: f - 25, fps: FPS, config: {damping: 9}});
  return (
    <Cam f={f} dur={dur} from={1} to={1.05}>
      <rect width={1080} height={1920} fill="#ffd23f" />
      {Array.from({length: 12}).map((_, i) => (
        <path key={i} d={`M 540 1000 L ${540 + Math.cos(i * 0.5236 + f * 0.01) * 1500} ${1000 + Math.sin(i * 0.5236 + f * 0.01) * 1500} L ${540 + Math.cos(i * 0.5236 + 0.26 + f * 0.01) * 1500} ${1000 + Math.sin(i * 0.5236 + 0.26 + f * 0.01) * 1500} Z`} fill="#ffc300" />
      ))}
      <g transform={`translate(540,520) scale(${s})`}>
        <rect x={-460} y={-230} width={920} height={400} rx={40} fill="#fff" stroke={INK} strokeWidth={12} />
        <text y={-110} fontSize={70} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">¿Alguna vez una</text>
        <text y={-20} fontSize={70} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">mentira te salió</text>
        <text y={70} fontSize={70} fontWeight={900} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">así de mal?</text>
      </g>
      <Stick x={380} y={1620} s={1.15} f={f} cara="cansado" />
      <Gato x={760} y={1620} color="#1c1c1c" f={f} enojado flip />
      <g transform={`translate(540,1790) scale(${b})`}>
        <rect x={-300} y={-70} width={600} height={120} rx={60} fill="#e63946" stroke={INK} strokeWidth={8} />
        <text y={14} fontSize={52} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">COMÉNTALO 👇</text>
      </g>
    </Cam>
  );
};

const ESCENAS: {desde: number; C: React.FC<SceneProps>; svg?: boolean; sub?: number}[] = [
  {desde: 0, C: E1},
  {desde: 6.6, C: E2},
  {desde: 12.75, C: E3, sub: 1250},
  {desde: 15.75, C: E4, sub: 1000},
  {desde: 23.62, C: E5},
  {desde: 30.3, C: E6},
  {desde: 32.6, C: E7, svg: false, sub: 790},
  {desde: 38.85, C: E8},
  {desde: 40.8, C: E9},
  {desde: 45.35, C: E10, sub: 1000},
  {desde: 50.55, C: E11},
];

// ---------- Subtítulos palabra por palabra ----------
type Chunk = {words: [string, number, number][]; start: number; end: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: [string, number, number][] = [];
  for (const w of PALABRAS) {
    cur.push(w);
    const punct = /[.,:?!…”]$/.test(w[0]);
    if (cur.length >= 3 || punct) {
      out.push({words: cur, start: cur[0][1], end: cur[cur.length - 1][2]});
      cur = [];
    }
  }
  if (cur.length) out.push({words: cur, start: cur[0][1], end: cur[cur.length - 1][2]});
  return out;
})();

const Subtitulos: React.FC<{g: number; y: number}> = ({g, y}) => {
  if (g >= F(50.55)) return null;
  const t = (g / FPS) * SPEED;
  let idx = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (CHUNKS[i].start - 0.05 <= t) idx = i;
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  const next = CHUNKS[idx + 1];
  if (t > ch.end + 0.6 && (!next || t < next.start - 0.05)) return null;
  const pop = spring({frame: g - F(ch.start), fps: FPS, config: {damping: 12, stiffness: 220}});
  return (
    <div style={{position: 'absolute', top: y, width: 1080, display: 'flex', justifyContent: 'center', transform: `scale(${0.85 + 0.15 * pop})`}}>
      <div style={{fontFamily: 'DejaVu Sans', fontWeight: 900, fontSize: 84, textAlign: 'center', lineHeight: 1.1, maxWidth: 960, textTransform: 'uppercase'}}>
        {ch.words.map(([w, s], i) => {
          const activa = t >= s - 0.03;
          return (
            <span key={i} style={{
              color: activa ? '#ffd23f' : '#ffffff',
              WebkitTextStroke: '14px #1b1b2f', paintOrder: 'stroke fill',
              marginRight: 22, display: 'inline-block',
            }}>{w.replace(/[“”]/g, '')}</span>
          );
        })}
      </div>
    </div>
  );
};

export const Video: React.FC = () => {
  const g = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  let i = 0;
  for (let k = 0; k < ESCENAS.length; k++) if (g >= F(ESCENAS[k].desde)) i = k;
  const esc = ESCENAS[i];
  const start = F(esc.desde);
  const end = i + 1 < ESCENAS.length ? F(ESCENAS[i + 1].desde) : durationInFrames;
  const f = g - start;
  const C = esc.C;
  // pequeño "pop" al cambiar de escena
  const pop = 1 + 0.06 * (1 - spring({frame: f, fps: FPS, config: {damping: 16, stiffness: 200}}));
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Audio src={staticFile('voz.wav')} />
      <AbsoluteFill style={{transform: `scale(${pop})`}}>
        {esc.svg === false ? (
          <C f={f} g={g} dur={end - start} />
        ) : (
          <svg width={1080} height={1920} viewBox="0 0 1080 1920">
            <C f={f} g={g} dur={end - start} />
          </svg>
        )}
      </AbsoluteFill>
      <Subtitulos g={g} y={esc.sub ?? 1430} />
    </AbsoluteFill>
  );
};
