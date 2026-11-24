import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALABRAS} from './palabras';

// ---------- Tiempo ----------
export const FPS = 30;
const SPEED = 1.35; // la voz se aceleró 1.35x
export const F = (t: number) => Math.round((t / SPEED) * FPS); // segundos de la voz original -> cuadro
export const DURACION = F(65.3) + 18;

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

type Tipo = 'nino' | 'mama' | 'maestra' | 'vecina' | 'senor' | 'cientifico';

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
          {tipo === 'cientifico' && (
            <>
              <circle cx={-56} cy={-30} r={28} fill="#e5e7e9" stroke={INK} strokeWidth={5} />
              <circle cx={56} cy={-30} r={28} fill="#e5e7e9" stroke={INK} strokeWidth={5} />
            </>
          )}
          <circle cx={0} cy={0} r={70} fill={tinte} stroke={INK} strokeWidth={9} />
          {tipo === 'senor' && <path d="M -66 -22 Q -60 -78 0 -76 Q 60 -78 66 -22 Q 30 -50 -66 -22 Z" fill="#2a1d16" stroke={INK} strokeWidth={6} />}
          {tipo === 'senor' && <path d="M -26 16 Q 4 4 34 16 Q 4 26 -26 16 Z" fill="#2a1d16" />}
          <Face cara={cara} f={f} />
          {tipo === 'nino' && (
            <>
              <path d="M -66 -22 A 68 68 0 0 1 66 -22 Z" fill="#e63946" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M 52 -26 L 122 -18 L 118 -6 L 54 -12 Z" fill="#a4161a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
              <circle cx={0} cy={-70} r={8} fill="#a4161a" stroke={INK} strokeWidth={4} />
            </>
          )}
          {(tipo === 'maestra' || tipo === 'vecina' || tipo === 'cientifico') && (
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

// ---------- Escenas: el E.T. de Varginha ----------
type SceneProps = {f: number; g: number; dur: number};
const T = (t: number) => F(t); // segundo de la voz original -> cuadro global

const Noche: React.FC<{f: number}> = ({f}) => (
  <>
    <defs>
      <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0b1030" /><stop offset="0.7" stopColor="#1d2a5c" /><stop offset="1" stopColor="#2c3e70" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#cielo)" />
    {Array.from({length: 40}).map((_, i) => (
      <circle key={i} cx={(i * 263) % 1080} cy={(i * 151) % 1300 + 40} r={3 + (i % 3)} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(f * 0.08 + i))} />
    ))}
    <circle cx={880} cy={240} r={80} fill="#f6f1d0" />
    <circle cx={850} cy={220} r={80} fill="#0f1640" />
    <rect y={1500} width={1080} height={420} fill="#0e2a4a" />
    {Array.from({length: 8}).map((_, i) => (
      <path key={i} d={`M ${(i * 150 + f * 3) % 1200 - 100} ${1560 + (i % 4) * 80} q 30 -14 60 0`} stroke="#3b6a9a" strokeWidth={5} fill="none" />
    ))}
  </>
);

/** avioneta militar de hélice, vista de lado, mirando a la derecha */
const Avion: React.FC<{x: number; y: number; s?: number; f: number; rot?: number}> = ({x, y, s = 1, f, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -300 -10 Q -280 -60 -200 -55 L 180 -45 Q 280 -40 300 0 Q 280 40 180 40 L -200 40 Q -290 40 -300 -10 Z" fill="#9aa5b1" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M -260 -45 L -320 -170 L -230 -170 L -170 -50 Z" fill="#7d8896" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M -60 10 L -160 140 L -60 140 L 60 15 Z" fill="#7d8896" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M 150 -45 Q 200 -90 260 -30 L 160 -30 Z" fill="#9fd8ff" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[-120, -40, 40].map((wx) => <circle key={wx} cx={wx} cy={-8} r={14} fill="#9fd8ff" stroke={INK} strokeWidth={5} />)}
    <circle cx={-200} cy={0} r={14} fill="#2f8a4a" stroke={INK} strokeWidth={4} />
    <ellipse cx={310} cy={0} rx={10 + 6 * Math.abs(Math.sin(f * 1.7))} ry={110} fill="#c8ced6" opacity={0.6} />
    <circle cx={305} cy={0} r={14} fill={INK} />
  </g>
);

const Casco: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x},${y - 395 * s}) scale(${s})`}>
    <path d="M -78 10 A 78 82 0 0 1 78 10 L 78 -6 Z" fill="#5f6b3a" stroke={INK} strokeWidth={8} />
    <path d="M -80 12 A 80 84 0 0 1 80 12" fill="none" stroke={INK} strokeWidth={8} />
    <rect x={-60} y={-70} width={120} height={34} rx={14} fill="#2b2f38" stroke={INK} strokeWidth={6} />
    <circle cx={-82} cy={10} r={18} fill="#2b2f38" stroke={INK} strokeWidth={6} />
    <path d="M -82 28 Q -70 70 -20 66" stroke={INK} strokeWidth={6} fill="none" />
    <circle cx={-18} cy={66} r={8} fill={INK} />
  </g>
);

const Ovni: React.FC<{x: number; y: number; s?: number; f: number; glow?: number}> = ({x, y, s = 1, f, glow = 1}) => (
  <g transform={`translate(${x},${y + Math.sin(f * 0.15) * 10}) scale(${s})`}>
    <ellipse cx={0} cy={30} rx={200} ry={60} fill="#b6fff0" opacity={0.18 * glow} />
    <path d="M -70 -10 Q -60 -90 0 -92 Q 60 -90 70 -10 Z" fill="#a9e7ff" stroke={INK} strokeWidth={8} />
    <ellipse cx={0} cy={0} rx={170} ry={42} fill="#c3cad3" stroke={INK} strokeWidth={9} />
    {[-110, -55, 0, 55, 110].map((lx, i) => (
      <circle key={lx} cx={lx} cy={4} r={11} fill={Math.floor(f / 6 + i) % 2 ? "#ffd23f" : "#7dffb2"} stroke={INK} strokeWidth={4} />
    ))}
  </g>
);

/** pantalla de la cámara infrarroja: gris verdoso, ruido, mira, puntos que brillan */
const Flir: React.FC<{x: number; y: number; w: number; h: number; f: number; puntos: {x: number; y: number; a: number}[]; children?: React.ReactNode}> = ({x, y, w, h, f, puntos, children}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-w / 2 - 30} y={-h / 2 - 30} width={w + 60} height={h + 60} rx={30} fill="#2b2f38" stroke={INK} strokeWidth={12} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#26302a" />
    {Array.from({length: 70}).map((_, i) => (
      <rect key={i} x={-w / 2 + ((i * 97 + f * 31) % w)} y={-h / 2 + ((i * 53 + f * 17) % h)} width={4} height={4} fill="#5d6e62" opacity={0.6} />
    ))}
    {Array.from({length: 12}).map((_, i) => <rect key={`l${i}`} x={-w / 2} y={-h / 2 + ((i * h) / 12 + f * 4) % h} width={w} height={3} fill="#3a463d" opacity={0.6} />)}
    {children}
    {puntos.map((p, i) => p.a > 0 && (
      <g key={i} transform={`translate(${p.x},${p.y}) scale(${p.a})`}>
        <circle r={34} fill="#ffffff" opacity={0.18} />
        <circle r={16} fill="#ffffff" />
      </g>
    ))}
    <path d={`M -60 0 L -20 0 M 20 0 L 60 0 M 0 -60 L 0 -20 M 0 20 L 0 60`} stroke="#d8f5d8" strokeWidth={5} />
    <text x={-w / 2 + 24} y={-h / 2 + 50} fontSize={36} fill="#d8f5d8" fontFamily="DejaVu Sans Mono">IR  WHT</text>
    <text x={w / 2 - 24} y={h / 2 - 26} fontSize={32} fill="#d8f5d8" fontFamily="DejaVu Sans Mono" textAnchor="end">05/03/2004</text>
    <circle cx={w / 2 - 50} cy={-h / 2 + 40} r={12} fill="#ff3b3b" opacity={Math.floor(f / 10) % 2 ? 1 : 0.2} />
  </g>
);

const Plataforma: React.FC<{x: number; y: number; s?: number; f: number; i?: number}> = ({x, y, s = 1, f, i = 0}) => {
  const fl = Math.sin(f * 0.6 + i * 2) * 12;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M -90 0 L -70 -120 M 90 0 L 70 -120 M -80 -60 L 80 -60" stroke={INK} strokeWidth={10} />
      <rect x={-110} y={-150} width={220} height={36} fill="#e0a43a" stroke={INK} strokeWidth={8} />
      <path d="M 40 -150 L 70 -300 L 90 -300 L 70 -150 Z" fill="#c9ccd2" stroke={INK} strokeWidth={6} />
      <path d={`M 80 -300 Q ${40 + fl} -360 ${78} ${-430 - fl} Q ${120 - fl} -360 80 -300 Z`} fill="#ff7a1a" stroke={INK} strokeWidth={5} />
      <path d={`M 80 -305 Q ${62 + fl / 2} -345 80 ${-380 - fl / 2} Q ${98} -345 80 -305 Z`} fill="#ffd84a" />
      <circle cx={80} cy={-360} r={90} fill="#ffb347" opacity={0.15} />
    </g>
  );
};

/** bola de luz misteriosa con halo */
const Luz: React.FC<{x: number; y: number; r?: number; f: number; i?: number; col?: string}> = ({x, y, r = 40, f, i = 0, col = "#fff6a8"}) => {
  const p = 1 + 0.12 * Math.sin(f * 0.3 + i);
  return (
    <g transform={`translate(${x},${y}) scale(${p})`}>
      <circle r={r * 3} fill={col} opacity={0.12} />
      <circle r={r * 1.8} fill={col} opacity={0.25} />
      <circle r={r} fill="#ffffff" stroke={INK} strokeWidth={4} />
    </g>
  );
};
const Fogata: React.FC<{x: number; y: number; s?: number; f: number; i?: number}> = ({x, y, s = 1, f, i = 0}) => {
  const fl = Math.sin(f * 0.5 + i * 2) * 10;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle cx={0} cy={-60} r={160} fill="#ffb347" opacity={0.18} />
      <path d="M -70 0 L 70 -24 M -70 -24 L 70 0" stroke="#6b4a2a" strokeWidth={22} strokeLinecap="round" />
      <path d={`M -50 -10 Q ${-70 + fl} -90 ${-10} ${-170 - fl} Q ${10 + fl} -110 ${30} -150 Q ${70 - fl} -80 50 -10 Z`} fill="#ff7a1a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M -25 -12 Q ${-30 + fl / 2} -70 0 ${-110 - fl / 2} Q ${30} -70 25 -12 Z`} fill="#ffd84a" />
    </g>
  );
};
/** pueblo de noche junto al río: casitas con techo de palma */
const Pueblo: React.FC<{f: number}> = ({f}) => (
  <>
    <Noche f={f} />
    <rect y={1300} width={1080} height={620} fill="#2d4a2a" />
    {[[90, 1300], [330, 1290], [820, 1305]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x},${y})`}>
        <rect x={0} y={-150} width={190} height={150} fill="#a07850" stroke={INK} strokeWidth={8} />
        <path d="M -30 -140 L 95 -250 L 220 -140 Z" fill="#c9a650" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <rect x={70} y={-90} width={50} height={90} fill="#3a2618" />
        <rect x={20} y={-120} width={36} height={30} fill="#ffd84a" opacity={0.7} />
      </g>
    ))}
    {[60, 980, 640].map((x, i) => (
      <g key={i} transform={`translate(${x},1310)`}>
        <path d="M 0 0 Q 10 -160 -10 -300" stroke="#5a3a22" strokeWidth={22} fill="none" />
        {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M -10 -300 q ${-120 + k * 60} ${-40 + Math.abs(k - 2) * 25} ${-150 + k * 75} ${60}`} stroke="#2f6a3a" strokeWidth={26} fill="none" strokeLinecap="round" />)}
      </g>
    ))}
  </>
);

/** la criatura de Varginha, versión caricatura: piel café brillosa, ojos rojos, tres bultos en la cabeza */
const Criatura: React.FC<{x: number; y: number; s?: number; f: number; brillo?: number; ojos?: number; bultos?: number}> = ({x, y, s = 1, f, brillo = 1, ojos = 1, bultos = 1}) => (
  <g transform={`translate(${x},${y + Math.sin(f * 0.1) * 4}) scale(${s})`}>
    <ellipse cx={0} cy={10} rx={130} ry={18} fill="#000" opacity={0.2} />
    <path d="M -90 0 Q -110 -120 -40 -150 Q 0 -160 40 -150 Q 110 -120 90 0 Z" fill="#6b4a32" stroke={INK} strokeWidth={9} />
    <path d="M -80 -40 Q -130 -10 -120 10 M 80 -40 Q 130 -10 120 10" stroke={INK} strokeWidth={14} strokeLinecap="round" fill="none" />
    <g transform="translate(0,-210)">
      {[-38, 0, 38].map((bx, i) => (
        <ellipse key={i} cx={bx} cy={-78 + (i === 1 ? -8 : 0)} rx={20 * bultos} ry={26 * bultos} fill="#5a3c28" stroke={INK} strokeWidth={6} />
      ))}
      <ellipse cx={0} cy={0} rx={90} ry={86} fill="#6b4a32" stroke={INK} strokeWidth={9} />
      <ellipse cx={-30} cy={-40} rx={22} ry={10} fill="#fff" opacity={0.55 * brillo} transform="rotate(-25 -30 -40)" />
      <ellipse cx={40} cy={30} rx={14} ry={6} fill="#fff" opacity={0.4 * brillo} />
      {[[-34, -6], [34, -6]].map(([ex, ey], i) => (
        <g key={i}>
          <circle cx={ex} cy={ey} r={26 * (0.6 + 0.4 * ojos)} fill="#ff2a2a" opacity={0.25 * ojos} />
          <ellipse cx={ex} cy={ey} rx={20} ry={24} fill={ojos > 0.5 ? "#ff2a2a" : "#2a1d16"} stroke={INK} strokeWidth={6} />
          <circle cx={ex - 5} cy={ey - 8} r={6} fill="#fff" opacity={ojos} />
        </g>
      ))}
      <path d="M -14 40 Q 0 48 14 40" stroke={INK} strokeWidth={5} fill="none" />
    </g>
    {brillo > 0.5 && [0, 1, 2].map((i) => {
      const k = (f * 0.08 + i * 0.33) % 1;
      return <path key={i} d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" fill="#fff6b0" transform={`translate(${[-110, 120, 60][i]},${[-260, -200, -330][i]}) scale(${Math.sin(k * Math.PI)})`} />;
    })}
  </g>
);

/** calle de barrio de día (tarde nublada) */
const Barrio: React.FC<{f: number}> = ({f}) => (
  <>
    <rect width={1080} height={1920} fill="#9fc4e8" />
    {[[200, 260], [700, 180], [950, 380]].map(([cx, cy], i) => (
      <g key={i} transform={`translate(${(cx + f * 0.6) % 1300 - 100},${cy})`}>
        <ellipse cx={0} cy={0} rx={130} ry={50} fill="#fff" /><ellipse cx={-70} cy={15} rx={80} ry={40} fill="#fff" /><ellipse cx={80} cy={12} rx={90} ry={42} fill="#fff" />
      </g>
    ))}
    {[[20, "#f2c38b"], [300, "#9ed1a8"], [600, "#f4a7a1"], [860, "#c3b5e8"]].map(([x, c], i) => (
      <g key={i} transform={`translate(${x},1300)`}>
        <rect x={0} y={-330 - (i % 2) * 60} width={240} height={330 + (i % 2) * 60} fill={c as string} stroke={INK} strokeWidth={8} />
        <rect x={40} y={-260 - (i % 2) * 60} width={60} height={60} fill="#cfe6ff" stroke={INK} strokeWidth={5} />
        <rect x={140} y={-260 - (i % 2) * 60} width={60} height={60} fill="#cfe6ff" stroke={INK} strokeWidth={5} />
        <rect x={90} y={-120} width={60} height={120} fill="#7a4a2a" stroke={INK} strokeWidth={5} />
      </g>
    ))}
    <rect y={1300} width={1080} height={620} fill="#b9a68a" />
    <rect y={1300} width={1080} height={26} fill="#8d7a5e" />
  </>
);
/** terreno baldío con hierba y una barda rota */
const Terreno: React.FC<{f: number}> = ({f}) => (
  <>
    <rect width={1080} height={1920} fill="#8fb0cf" />
    <rect y={600} width={1080} height={700} fill="#d9c9a6" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={i * 140} y={900 + (i % 3) * 30} width={130} height={400} fill="#c9b48e" stroke={INK} strokeWidth={6} />)}
    <rect y={1300} width={1080} height={620} fill="#7a8a3a" />
    {Array.from({length: 40}).map((_, i) => (
      <path key={i} d={`M ${(i * 53) % 1080} ${1320 + (i * 37) % 560} q ${-10 + Math.sin(f * 0.1 + i) * 6} -50 ${-4} -90 M ${(i * 53) % 1080 + 14} ${1320 + (i * 37) % 560} q ${12} -40 ${18} -70`} stroke="#4f6a24" strokeWidth={8} fill="none" strokeLinecap="round" />
    ))}
  </>
);

// 1 · «Tres muchachas vieron algo agachado en un terreno… y su ciudad nunca volvió a ser la misma.»
const E1: React.FC<SceneProps> = ({f, g, dur}) => {
  const sale = ip(g, T(1.4), T(2.6), 0, 1);
  return (
    <Cam f={f} dur={dur} from={1.04} to={1.16} oy={1400}>
      <Terreno f={f} />
      <Criatura x={760} y={1560} s={0.9} f={f} brillo={sale} ojos={sale} bultos={1} />
      <path d="M 560 1600 q 60 -120 130 -20 q 80 -150 160 0 q 60 -110 120 10 L 980 1640 L 560 1640 Z" fill="#4f6a24" stroke={INK} strokeWidth={6} opacity={1 - 0.6 * sale} />
      <Stick x={160} y={1780} s={0.85} f={f} tipo="mama" cara={sale > 0.5 ? "susto" : "normal"} sudor={sale > 0.5} />
      <Stick x={330} y={1790} s={0.85} f={f} tipo="maestra" cara={sale > 0.5 ? "susto" : "normal"} />
      <Stick x={490} y={1800} s={0.82} f={f} tipo="mama" flip cara={sale > 0.5 ? "susto" : "normal"} />
      {g > T(3.6) && <text x={540} y={560} fontSize={200 * spring({frame: g - T(3.6), fps: FPS, config: {damping: 9}})} fontWeight={900} textAnchor="middle" fill="#ffd23f" stroke={INK} strokeWidth={14} paintOrder="stroke" fontFamily="DejaVu Sans">!!</text>}
    </Cam>
  );
};

// 2 · «20 de enero de 1996. Varginha, Brasil.»
const E2: React.FC<SceneProps> = ({f, g, dur}) => {
  const cal = spring({frame: g - T(6.8), fps: FPS, config: {damping: 11}});
  const pin = spring({frame: g - T(10.0), fps: FPS, config: {damping: 7}});
  return (
    <Cam f={f} dur={dur} oy={1000}>
      <rect width={1080} height={1920} fill="#1d2a5c" />
      <g transform={`translate(540,470) scale(${cal}) rotate(-4)`}>
        <rect x={-230} y={-230} width={460} height={420} rx={26} fill="#fff" stroke={INK} strokeWidth={12} />
        <rect x={-230} y={-230} width={460} height={120} rx={26} fill="#2f8a4a" stroke={INK} strokeWidth={12} />
        <text y={-145} fontSize={68} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">ENERO</text>
        <text y={60} fontSize={200} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">20</text>
        <text y={150} fontSize={64} fontWeight={800} textAnchor="middle" fill="#566573" fontFamily="DejaVu Sans">1996</text>
      </g>
      <g transform="translate(0,820)">
        <rect width={1080} height={720} fill="#3a7bd5" stroke={INK} strokeWidth={10} />
        <path d="M 60 40 Q 400 0 700 80 Q 900 140 980 300 Q 1000 420 880 520 Q 760 640 620 700 L 300 720 Q 160 560 120 400 Q 40 220 60 40 Z" fill="#4f9a45" stroke={INK} strokeWidth={10} />
        <text x={330} y={260} fontSize={64} fontWeight={900} fill="#e8f7e0" fontFamily="DejaVu Sans" opacity={0.8}>BRASIL</text>
        <g transform={`translate(720,${520 - 110 * pin}) scale(${pin})`}>
          <path d="M 0 0 C -60 -70 -60 -150 0 -150 C 60 -150 60 -70 0 0 Z" fill="#e63946" stroke={INK} strokeWidth={8} />
          <circle cx={0} cy={-100} r={22} fill="#fff" />
        </g>
        <text x={700} y={620} fontSize={56} fontWeight={900} textAnchor="middle" fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans" opacity={pin}>VARGINHA</text>
      </g>
    </Cam>
  );
};

// 3 · «Es la tarde, y tres jóvenes caminan por su barrio.»
const E3: React.FC<SceneProps> = ({f, dur}) => (
  <Cam f={f} dur={dur} oy={1500}>
    <Barrio f={f} />
    {[["mama", 240, false], ["maestra", 520, false], ["mama", 790, true]].map(([t, x, fl], i) => (
      <Stick key={i} x={(x as number) + f * 1.2} y={1760 + (i % 2) * 20} s={0.95} f={f * 2} tipo={t as Tipo} flip={fl as boolean} cara="feliz"
        pose={{ll: [-15 + 15 * Math.sin(f * 0.3 + i), -5], rl: [15 - 15 * Math.sin(f * 0.3 + i), 5]}} />
    ))}
  </Cam>
);

// 4 · «De pronto, en un terreno baldío, ven una criatura agachada. Piel brillosa. Ojos rojos. Bultos en la cabeza.»
const E4: React.FC<SceneProps> = ({f, g, dur}) => {
  const brillo = ip(g, T(18.9), T(19.4), 0, 1);
  const ojos = ip(g, T(19.8), T(20.3), 0, 1);
  const bultos = spring({frame: g - T(21.05), fps: FPS, config: {damping: 7}});
  const zoom = Punch(g, T(17.3), 0.25);
  return (
    <Cam f={f} dur={dur} from={1} to={1.05} oy={1320} punch={zoom}>
      <Terreno f={f} />
      <Criatura x={540} y={1620} s={1.6} f={f} brillo={brillo} ojos={ojos} bultos={g >= T(21.05) ? 0.4 + 0.6 * bultos : 0.4} />
      {g >= T(18.9) && g < T(19.8) && <text x={540} y={560} fontSize={90} fontWeight={900} textAnchor="middle" fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans">✨ piel brillosa</text>}
      {g >= T(19.8) && g < T(21.05) && <text x={540} y={560} fontSize={90} fontWeight={900} textAnchor="middle" fill="#ff4a4a" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans">👀 ojos rojos</text>}
      {g >= T(21.05) && <text x={540} y={560} fontSize={90} fontWeight={900} textAnchor="middle" fill="#ffd23f" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans">3 bultos</text>}
    </Cam>
  );
};

// 5 · «¡Corren a su casa gritando!»
const E5: React.FC<SceneProps> = ({f, dur}) => (
  <Cam f={f} dur={dur} oy={1500}>
    <Barrio f={f * 4} />
    {[["mama", 760], ["maestra", 520], ["mama", 280]].map(([t, x], i) => (
      <Stick key={i} x={(x as number) - f * 14} y={1760} s={0.95} f={f * 4} tipo={t as Tipo} cara="susto" flip sudor
        pose={{ra: [160, 175], la: [-160, -175], ll: [-45 + 30 * Math.sin(f * 0.8 + i), -10], rl: [45 - 30 * Math.sin(f * 0.8 + i), 10]}} />
    ))}
    <text x={540} y={700} fontSize={130} fontWeight={900} textAnchor="middle" fill="#fff" stroke={INK} strokeWidth={12} paintOrder="stroke" fontFamily="DejaVu Sans" transform={`rotate(${Math.sin(f) * 3} 540 700)`}>¡AAAHHH!</text>
  </Cam>
);

// 6 · «Y en pocos días, todo Brasil habla del E.T. de Varginha. Las revistas le dicen: el Roswell brasileño.»
const E6: React.FC<SceneProps> = ({f, g, dur}) => {
  const revista = spring({frame: g - T(28.4), fps: FPS, config: {damping: 10}});
  return (
    <Cam f={f} dur={dur} oy={900}>
      <rect width={1080} height={1920} fill="#263c6e" />
      {Array.from({length: 7}).map((_, i) => {
        const k = spring({frame: g - T(24.4) - i * 4, fps: FPS, config: {damping: 11}});
        return (
          <g key={i} transform={`translate(${180 + (i * 233) % 760},${300 + (i * 211) % 1200}) rotate(${(i * 41) % 50 - 25}) scale(${k * 0.9})`}>
            <rect x={-170} y={-120} width={340} height={240} fill="#f4f1ea" stroke={INK} strokeWidth={7} />
            <text y={-60} fontSize={36} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">¡E.T. EN</text>
            <text y={-20} fontSize={36} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">VARGINHA!</text>
            <g transform="translate(0,90) scale(0.28)"><Criatura x={0} y={0} f={f} /></g>
          </g>
        );
      })}
      {g >= T(28.4) && (
        <g transform={`translate(540,900) scale(${revista}) rotate(4)`}>
          <rect x={-330} y={-460} width={660} height={900} fill="#e63946" stroke={INK} strokeWidth={12} />
          <text y={-360} fontSize={70} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">REVISTA</text>
          <g transform="translate(0,170) scale(1.1)"><Criatura x={0} y={0} f={f} /></g>
          <rect x={-300} y={-300} width={600} height={160} fill="#fff" stroke={INK} strokeWidth={8} />
          <text y={-238} fontSize={56} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">EL ROSWELL</text>
          <text y={-170} fontSize={56} fontWeight={900} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">BRASILEÑO</text>
        </g>
      )}
    </Cam>
  );
};

// 7 · «Por suerte, nadie salió lastimado. Por desgracia… el caso dejó más preguntas que respuestas.»
const E7: React.FC<SceneProps> = ({f, g, dur}) => {
  const preguntas = g >= T(33.9);
  return (
    <Cam f={f} dur={dur} oy={1300}>
      <Barrio f={f} />
      {!preguntas ? (
        [["mama", 270], ["maestra", 540], ["mama", 810]].map(([t, x], i) => (
          <Stick key={i} x={x as number} y={1760} s={0.95} f={f} tipo={t as Tipo} cara="feliz" pose={{ra: [150, 175]}} />
        ))
      ) : (
        <>
          {Array.from({length: 14}).map((_, i) => {
            const k = spring({frame: g - T(34.0) - i * 3, fps: FPS, config: {damping: 8}});
            return <text key={i} x={100 + (i * 157) % 880} y={300 + (i * 233) % 1000} fontSize={(110 + (i % 3) * 50) * k} fontWeight={900} textAnchor="middle" fill={["#ffd23f", "#e63946", "#fff"][i % 3]} stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans" transform={`rotate(${(i * 29) % 40 - 20} ${100 + (i * 157) % 880} ${300 + (i * 233) % 1000})`}>?</text>;
          })}
          <Stick x={540} y={1760} s={1.1} f={f} cara="susto" pose={{ra: [130, 175], la: [-130, -175]}} />
        </>
      )}
    </Cam>
  );
};

// 8 · «Años después, un informe militar dijo que probablemente vieron a un vecino del barrio, agachado en ese terreno. Pero muchos ufólogos dicen que eso no lo explica todo.»
const E8: React.FC<SceneProps> = ({f, g, dur}) => {
  const ufologo = g >= T(44.8);
  const linea = g >= T(42.2);
  return (
    <Cam f={f} dur={dur} oy={1000}>
      <rect width={1080} height={1920} fill="#d9c9a6" />
      <rect y={1380} width={1080} height={540} fill="#8b5a2b" />
      {!ufologo ? (
        <g transform="translate(540,780) rotate(-2)">
          <path d="M -380 -460 L -140 -460 L -100 -500 L 380 -500 L 380 460 L -380 460 Z" fill="#c9b48e" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
          <rect x={-330} y={-420} width={660} height={840} fill="#fff" stroke={INK} strokeWidth={8} />
          <text y={-320} fontSize={58} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">INFORME MILITAR</text>
          {Array.from({length: 6}).map((_, l) => <rect key={l} x={-260} y={-240 + l * 50} width={520 - (l % 3) * 90} height={14} fill="#9aa5b1" />)}
          {linea && (
            <g opacity={spring({frame: g - T(42.2), fps: FPS})}>
              <rect x={-280} y={90} width={560} height={200} rx={16} fill="#fff59d" stroke={INK} strokeWidth={6} />
              <text y={165} fontSize={46} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">PROBABLEMENTE:</text>
              <text y={235} fontSize={46} fontWeight={900} textAnchor="middle" fill="#2f5fae" fontFamily="DejaVu Sans">un vecino del barrio</text>
            </g>
          )}
        </g>
      ) : (
        <>
          <g transform={`translate(540,640) scale(${spring({frame: g - T(44.8), fps: FPS, config: {damping: 10}})})`}>
            <rect x={-420} y={-140} width={840} height={260} rx={36} fill="#fff" stroke={INK} strokeWidth={12} />
            <text y={-30} fontSize={72} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">«Eso no lo</text>
            <text y={70} fontSize={72} fontWeight={900} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">explica todo»</text>
          </g>
          <Stick x={540} y={1760} s={1.3} f={f} tipo="cientifico" cara="enojado" pose={{ra: [150, 160]}} />
        </>
      )}
    </Cam>
  );
};

// 9 · «¿Y la ciudad qué hizo? Le construyó una plaza, una estatua… y hasta un memorial al E.T.»
const E9: React.FC<SceneProps> = ({f, g, dur}) => {
  const estatua = spring({frame: g - T(51.7), fps: FPS, config: {damping: 8}});
  const memorial = spring({frame: f, fps: FPS, config: {damping: 12}}) + Punch(g, T(53.0), 0.15);
  const z = Punch(g, T(50.7), 0.06);
  return (
    <Cam f={f} dur={dur} oy={1200} punch={z}>
      <rect width={1080} height={1920} fill="#9fc4e8" />
      <g transform={`translate(780,${1180}) scale(${memorial})`}>
        <rect x={-230} y={-360} width={460} height={360} fill="#e9e1cf" stroke={INK} strokeWidth={10} />
        <path d="M -260 -360 L 0 -470 L 260 -360 Z" fill="#c0503a" stroke={INK} strokeWidth={10} />
        <rect x={-190} y={-320} width={380} height={80} fill="#fff" stroke={INK} strokeWidth={6} />
        <text y={-268} fontSize={40} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">MEMORIAL DEL E.T.</text>
        <rect x={-50} y={-140} width={100} height={140} fill="#7a4a2a" />
      </g>
      <rect y={1180} width={1080} height={740} fill="#c9c2b0" />
      {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M 0 ${1260 + k * 110} L 1080 ${1260 + k * 110}`} stroke="#b3ab97" strokeWidth={6} />)}
      <g transform={`translate(330,1420) scale(${estatua})`}>
        <rect x={-150} y={-60} width={300} height={120} fill="#9aa5b1" stroke={INK} strokeWidth={8} />
        <g transform="translate(0,-60) scale(1.1)"><Criatura x={0} y={0} f={0} brillo={0} ojos={1} /></g>
      </g>
      {[700, 860, 980].map((x, i) => (
        <g key={i}>
          <Stick x={x - 120} y={1820} s={0.8} f={f} tipo={i % 2 ? "senor" : "nino"} cara="feliz" pose={{ra: [130, 150]}} mano={<rect x={-30} y={-30} width={60} height={44} rx={8} fill="#2b2f38" stroke={INK} strokeWidth={5} />} />
          {Math.floor((f + i * 13) / 20) % 4 === 0 && <circle cx={x - 120 + 50} cy={1820 - 420} r={60} fill="#fff" opacity={0.7} />}
        </g>
      ))}
    </Cam>
  );
};

// 10 · «Así que, o fue un extraterrestre… o es el misterio que más turistas le ha traído a una ciudad.»
const E10: React.FC<SceneProps> = ({f, g}) => {
  const arriba = ip(g, T(55.7), T(56.2), 0, 1) * (1 - ip(g, T(56.9), T(57.3), 0, 1));
  const abajo = ip(g, T(56.9), T(57.3), 0, 1);
  return (
    <>
      <svg x={0} y={0} width={1080} height={960} viewBox="0 0 1080 960">
        <rect width={1080} height={960} fill="#0b1030" />
        <rect width={1080} height={960} fill="#7dffb2" opacity={0.12 * arriba} />
        <g transform={`translate(540,520) scale(${1 + 0.12 * arriba})`}>
          <Ovni x={0} y={-200} s={1.1} f={f} glow={1 + arriba} />
          <Criatura x={0} y={330} s={1.1} f={f} />
        </g>
        <text x={60} y={110} fontSize={66} fontWeight={900} fill="#7dffb2" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans" opacity={0.5 + 0.5 * arriba}>👽 ¿Extraterrestre?</text>
      </svg>
      <rect y={950} width={1080} height={22} fill={INK} />
      <svg x={0} y={970} width={1080} height={950} viewBox="0 0 1080 950">
        <rect width={1080} height={950} fill="#9fc4e8" />
        <rect width={1080} height={950} fill="#ffd23f" opacity={0.15 * abajo} />
        <rect y={700} width={1080} height={250} fill="#c9c2b0" />
        {[160, 340, 540, 740, 920].map((x, i) => (
          <g key={i}>
            <Stick x={x} y={900} s={0.7} f={f} tipo={["nino", "senor", "mama", "maestra", "senor"][i] as Tipo} cara="feliz" pose={{ra: [130, 150]}} mano={<rect x={-30} y={-30} width={60} height={44} rx={8} fill="#2b2f38" stroke={INK} strokeWidth={5} />} />
            {Math.floor((f + i * 9) / 14) % 3 === 0 && <circle cx={x + 45} cy={900 - 370} r={50} fill="#fff" opacity={0.8} />}
          </g>
        ))}
        <text x={60} y={110} fontSize={66} fontWeight={900} fill="#2f5fae" stroke="#fff" strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans" opacity={0.5 + 0.5 * abajo}>📸 ¿Imán de turistas?</text>
      </svg>
    </>
  );
};

// 11 · «¿Tú le hubieras tomado una foto… o hubieras salido corriendo? Te leo en los comentarios.»
const E11: React.FC<SceneProps> = ({f, dur}) => {
  const s = spring({frame: f, fps: FPS, config: {damping: 12}});
  const b1 = spring({frame: f - 10, fps: FPS, config: {damping: 9}});
  const b2 = spring({frame: f - 18, fps: FPS, config: {damping: 9}});
  return (
    <Cam f={f} dur={dur} from={1} to={1.05}>
      <Terreno f={f} />
      <g transform={`translate(540,420) scale(${s})`}>
        <rect x={-470} y={-210} width={940} height={360} rx={40} fill="#fff" stroke={INK} strokeWidth={12} />
        <text y={-90} fontSize={64} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">¿Le hubieras tomado</text>
        <text y={0} fontSize={64} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">una foto… o hubieras</text>
        <text y={95} fontSize={70} fontWeight={900} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">salido corriendo?</text>
      </g>
      <g transform={`translate(290,860) scale(${b1})`}>
        <rect x={-190} y={-90} width={380} height={180} rx={40} fill="#cfe6ff" stroke={INK} strokeWidth={10} />
        <text y={24} fontSize={64} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">📸 FOTO</text>
      </g>
      <g transform={`translate(750,860) scale(${b2})`}>
        <rect x={-210} y={-90} width={420} height={180} rx={40} fill="#ffb347" stroke={INK} strokeWidth={10} />
        <text y={24} fontSize={60} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">🏃 CORRER</text>
      </g>
      <Criatura x={760} y={1640} s={0.9} f={f} />
      <Stick x={300} y={1780} s={0.95} f={f} cara="listo" />
    </Cam>
  );
};

const ESCENAS: {desde: number; C: React.FC<SceneProps>; svg?: boolean; sub?: number}[] = [
  {desde: 0, C: E1, sub: 1000},
  {desde: 6.75, C: E2, sub: 1620},
  {desde: 11.6, C: E3, sub: 1000},
  {desde: 14.85, C: E4, sub: 760},
  {desde: 22.5, C: E5, sub: 1000},
  {desde: 24.3, C: E6, sub: 1520},
  {desde: 31.45, C: E7, sub: 1000},
  {desde: 38.0, C: E8, sub: 1480},
  {desde: 48.55, C: E9, sub: 640},
  {desde: 54.3, C: E10, svg: false, sub: 1700},
  {desde: 60.45, C: E11},
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
  if (g >= F(60.45)) return null;
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
