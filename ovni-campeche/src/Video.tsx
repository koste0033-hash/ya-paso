import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALABRAS} from './palabras';

// ---------- Tiempo ----------
export const FPS = 30;
const SPEED = 1.25; // la voz se aceleró 1.25x
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

// ---------- Escenas: el OVNI de Campeche ----------
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

// 1 · «Unos pilotos salieron a buscar narcos… y encontraron algo que sigue siendo un misterio.»
const E1: React.FC<SceneProps> = ({f, g, dur}) => {
  const q = spring({frame: g - T(4.9), fps: FPS, config: {damping: 9}});
  return (
    <Cam f={f} dur={dur} from={1.05} to={1.15} oy={900}>
      <Noche f={f} />
      {g > T(3.3) && <Ovni x={860} y={430} s={0.45} f={f} glow={ip(g, T(3.3), T(4.6), 0, 1)} />}
      <path d="M 300 900 L -200 1500 L 400 1500 Z" fill="#fff6b0" opacity={0.12} />
      <Avion x={480 + Math.sin(f * 0.05) * 30} y={880 + Math.sin(f * 0.11) * 14} s={1.05} f={f} rot={-4} />
      {g > T(4.9) && (
        <text x={540} y={560} fontSize={260 * q} fontWeight={900} textAnchor="middle" fill="#ffd23f" stroke={INK} strokeWidth={14} paintOrder="stroke" fontFamily="DejaVu Sans">?</text>
      )}
    </Cam>
  );
};

// 2 · «Cinco de marzo de 2004. Campeche, México.»
const E2: React.FC<SceneProps> = ({f, g, dur}) => {
  const cal = spring({frame: g - T(6.0), fps: FPS, config: {damping: 11}});
  const pin = spring({frame: g - T(8.25), fps: FPS, config: {damping: 7}});
  return (
    <Cam f={f} dur={dur} oy={1000}>
      <rect width={1080} height={1920} fill="#1d2a5c" />
      <g transform={`translate(540,470) scale(${cal}) rotate(-4)`}>
        <rect x={-230} y={-230} width={460} height={420} rx={26} fill="#fff" stroke={INK} strokeWidth={12} />
        <rect x={-230} y={-230} width={460} height={120} rx={26} fill="#e63946" stroke={INK} strokeWidth={12} />
        <text y={-145} fontSize={68} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">MARZO</text>
        <text y={60} fontSize={210} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">5</text>
        <text y={150} fontSize={64} fontWeight={800} textAnchor="middle" fill="#566573" fontFamily="DejaVu Sans">2004</text>
      </g>
      <g transform="translate(0,820)">
        <rect width={1080} height={700} fill="#3a7bd5" stroke={INK} strokeWidth={10} />
        <path d="M 0 520 Q 200 480 330 560 Q 420 620 520 560 Q 600 430 720 400 Q 880 380 1080 430 L 1080 700 L 0 700 Z" fill="#7fbf5a" stroke={INK} strokeWidth={10} />
        <text x={250} y={250} fontSize={44} fill="#cfe6ff" fontFamily="DejaVu Sans" fontStyle="italic">Golfo de México</text>
        <g transform={`translate(600,${560 - 120 * pin}) scale(${pin})`}>
          <path d="M 0 0 C -60 -70 -60 -150 0 -150 C 60 -150 60 -70 0 0 Z" fill="#e63946" stroke={INK} strokeWidth={8} />
          <circle cx={0} cy={-100} r={22} fill="#fff" />
        </g>
        <text x={600} y={660} fontSize={60} fontWeight={900} textAnchor="middle" fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans" opacity={pin}>CAMPECHE</text>
      </g>
    </Cam>
  );
};

/** cabina por dentro: ventana a la noche, tablero con luces */
const Cabina: React.FC<{f: number; children?: React.ReactNode}> = ({f, children}) => (
  <>
    <rect width={1080} height={1920} fill="#151a26" />
    <path d="M 60 220 L 1020 220 L 960 880 L 120 880 Z" fill="#0b1030" stroke={INK} strokeWidth={16} />
    {Array.from({length: 18}).map((_, i) => <circle key={i} cx={140 + (i * 97) % 800} cy={260 + (i * 61) % 560} r={4} fill="#fff" opacity={0.3 + 0.6 * Math.abs(Math.sin(f * 0.07 + i))} />)}
    <path d="M 540 220 L 540 880" stroke={INK} strokeWidth={16} />
    {children}
    <rect y={1380} width={1080} height={540} fill="#2b2f38" stroke={INK} strokeWidth={12} />
    {[150, 330, 510, 690, 870].map((cx, i) => (
      <g key={cx}>
        <circle cx={cx} cy={1520} r={62} fill="#0d1117" stroke="#5b6270" strokeWidth={8} />
        <path d={`M ${cx} 1520 L ${cx + 45 * Math.cos(f * 0.05 + i)} ${1520 + 45 * Math.sin(f * 0.05 + i)}`} stroke="#7dffb2" strokeWidth={6} />
      </g>
    ))}
    {Array.from({length: 10}).map((_, i) => <rect key={i} x={110 + i * 88} y={1660} width={50} height={26} rx={6} fill={Math.floor(f / 8 + i) % 3 ? "#7dffb2" : "#ffd23f"} opacity={0.85} />)}
  </>
);

// 3 · «Un avión de la Fuerza Aérea vuela de noche, buscando avionetas con droga.»
const E3: React.FC<SceneProps> = ({f, g, dur}) => {
  const bubble = spring({frame: g - T(12.7), fps: FPS, config: {damping: 10}});
  const mira = Math.sin(f * 0.08) * 6;
  return (
    <Cam f={f} dur={dur} oy={1100}>
      <Cabina f={f}>
        <Stick x={330} y={1700} s={1.15} f={f} cara="normal" flip={mira > 0} pose={{ra: [60, 30], la: [-60, -30]}} />
        <Casco x={330} y={1700} s={1.15} />
        <Stick x={770} y={1700} s={1.1} f={f} tipo="senor" cara="normal" pose={{ra: [60, 30], la: [-60, -30]}} />
        <Casco x={770} y={1700} s={1.1} />
      </Cabina>
      {g > T(12.7) && (
        <g transform={`translate(560,560) scale(${bubble})`}>
          <ellipse rx={300} ry={190} fill="#fff" stroke={INK} strokeWidth={10} />
          <circle cx={-160} cy={230} r={30} fill="#fff" stroke={INK} strokeWidth={8} />
          <g transform="scale(0.55)"><Avion x={-40} y={20} f={f} /></g>
          <text x={190} y={-60} fontSize={130} fontWeight={900} fill="#e63946" fontFamily="DejaVu Sans">?</text>
        </g>
      )}
    </Cam>
  );
};

// posiciones de los 11 puntos en la pantalla
const PUNTOS = [[-180, -150], [140, -200], [-60, 60], [260, 40], [-300, -20], [40, -300], [200, 230], [-220, 230], [320, -260], [-340, -260], [90, 140]];

// 4 · «De pronto, la cámara infrarroja detecta algo. Un punto. Luego dos. Luego… once.»
const E4: React.FC<SceneProps> = ({f, g, dur}) => {
  const n = g >= T(21.2) ? 11 : g >= T(18.85) ? 2 : g >= T(17.45) ? 1 : 0;
  const p = Punch(g, T(21.2), 0.12);
  const sx = Shake(g, T(21.2), 10, 16);
  const puntos = PUNTOS.map(([x, y], i) => ({
    x: x + Math.sin(f * 0.05 + i) * 20, y: y + Math.cos(f * 0.04 + i) * 16,
    a: i < n ? spring({frame: g - (i === 0 ? T(17.45) : i === 1 ? T(18.85) : T(21.2) + (i - 2) * 1.5), fps: FPS, config: {damping: 10}}) : 0,
  }));
  return (
    <Cam f={f} dur={dur} from={1} to={1.06} oy={760} punch={p}>
      <rect width={1080} height={1920} fill="#151a26" />
      <g transform={`translate(${sx},0)`}>
        <Flir x={540} y={760} w={900} h={900} f={f} puntos={puntos} />
      </g>
      {n > 0 && (
        <text x={540} y={1380} fontSize={n === 11 ? 220 : 160} fontWeight={900} textAnchor="middle" fill={n === 11 ? "#ff3b3b" : "#ffd23f"} stroke={INK} strokeWidth={14} paintOrder="stroke" fontFamily="DejaVu Sans">{n}</text>
      )}
      {n === 11 && <Stick x={880} y={1960} s={0.9} f={f} cara="susto" sudor />}
      {n === 11 && <Casco x={880} y={1960} s={0.9} />}
    </Cam>
  );
};

// 5 · «A simple vista no se ve nada. Pero en la pantalla, los objetos brillan… y parecen rodearlos.»
const E5: React.FC<SceneProps> = ({f, g, dur}) => {
  const pantalla = g >= T(23.85);
  const orbita = ip(g, T(27.0), T(28.1), 0, 1);
  const puntos = PUNTOS.map(([x, y], i) => {
    const a = (i / 11) * Math.PI * 2 + f * 0.05 * orbita;
    const r = 250;
    return {x: x * (1 - orbita) + Math.cos(a) * r * orbita, y: y * 0.6 * (1 - orbita) + Math.sin(a) * r * 0.8 * orbita, a: 0.8 + 0.25 * Math.sin(f * 0.3 + i)};
  });
  return (
    <>
      <rect width={1080} height={1920} fill="#151a26" />
      <svg x={0} y={0} width={1080} height={960} viewBox="0 0 1080 960" opacity={pantalla ? 0.45 : 1}>
        <Noche f={f} />
        <Stick x={540} y={1260} s={1.3} f={f} cara="normal" pose={{ra: [160, 165], la: [-160, -165]}}
          mano={<g transform="translate(-60,-30)"><rect x={-70} y={-50} width={60} height={70} rx={14} fill="#2b2f38" stroke={INK} strokeWidth={6} /><rect x={10} y={-50} width={60} height={70} rx={14} fill="#2b2f38" stroke={INK} strokeWidth={6} /></g>} />
        <Casco x={540} y={1260} s={1.3} />
        <text x={540} y={170} fontSize={70} fontWeight={900} textAnchor="middle" fill="#fff" opacity={0.85} fontFamily="DejaVu Sans">. . .</text>
      </svg>
      <rect y={950} width={1080} height={22} fill={INK} />
      <svg x={0} y={970} width={1080} height={950} viewBox="0 0 1080 950" opacity={pantalla ? 1 : 0.35}>
        <Flir x={540} y={470} w={860} h={760} f={f} puntos={puntos}>
          <g transform="scale(0.28)"><Avion x={0} y={0} f={f} /></g>
        </Flir>
      </svg>
    </>
  );
};

// 6 · «Los pilotos lo graban todo, y el video le da la vuelta al mundo.»
const E6: React.FC<SceneProps> = ({f, g, dur}) => {
  const mundo = g >= T(30.35);
  const sp = spring({frame: g - T(30.35), fps: FPS, config: {damping: 12}});
  return (
    <Cam f={f} dur={dur} oy={900}>
      {!mundo ? (
        <>
          <Cabina f={f} />
          <Stick x={540} y={1700} s={1.2} f={f} cara="listo" pose={{ra: [150, 120]}} />
          <Casco x={540} y={1700} s={1.2} />
          <g transform="translate(540,600)">
            <rect x={-220} y={-110} width={440} height={220} rx={30} fill="#2b2f38" stroke={INK} strokeWidth={10} />
            <circle cx={-120} cy={0} r={40} fill="#ff3b3b" opacity={Math.floor(f / 8) % 2 ? 1 : 0.3} />
            <text x={40} y={30} fontSize={90} fontWeight={900} fill="#fff" textAnchor="middle" fontFamily="DejaVu Sans">REC</text>
          </g>
        </>
      ) : (
        <>
          <rect width={1080} height={1920} fill="#0b1030" />
          <g transform={`translate(540,900) scale(${sp}) rotate(${f * 1.5})`}>
            <circle r={300} fill="#3a7bd5" stroke={INK} strokeWidth={12} />
            <path d="M -200 -120 Q -120 -220 -20 -150 Q 40 -60 -80 -20 Q -180 20 -200 -120 Z M 60 40 Q 160 -20 230 60 Q 220 180 120 200 Q 40 140 60 40 Z M -150 120 Q -90 100 -60 170 Q -110 230 -170 190 Z" fill="#7fbf5a" stroke={INK} strokeWidth={8} />
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 + f * 0.04;
            const k = spring({frame: g - T(30.35) - i * 3, fps: FPS, config: {damping: 10}});
            return (
              <g key={i} transform={`translate(${540 + Math.cos(a) * 420},${900 + Math.sin(a) * 520}) scale(${k})`}>
                <rect x={-90} y={-65} width={180} height={130} rx={14} fill="#26302a" stroke={INK} strokeWidth={8} />
                <circle cx={-30} cy={-10} r={12} fill="#fff" /><circle cx={30} cy={15} r={12} fill="#fff" />
                <path d="M -30 65 L -50 100 M 30 65 L 50 100" stroke={INK} strokeWidth={8} />
              </g>
            );
          })}
        </>
      )}
    </Cam>
  );
};

// 7 · «Por suerte, nadie salió herido. Por desgracia… la Fuerza Aérea dijo que no sabía qué eran.»
const E7: React.FC<SceneProps> = ({f, g, dur}) => {
  const oficina = g >= T(34.4);
  const sello = spring({frame: g - T(37.1), fps: FPS, config: {damping: 9, stiffness: 160}});
  return (
    <Cam f={f} dur={dur} oy={1100}>
      {!oficina ? (
        <>
          <rect width={1080} height={1920} fill="#2c3e70" />
          <rect y={1300} width={1080} height={620} fill="#4a4f58" />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={i * 240 + ((f * 6) % 240) - 120} y={1560} width={140} height={22} fill="#f1efe6" />)}
          <Avion x={540} y={1180} s={0.95} f={0} />
          <Stick x={330} y={1720} s={1.0} f={f} cara="feliz" pose={{ra: [160, 175]}} />
          <Casco x={330} y={1720} s={1.0} />
          <Stick x={760} y={1720} s={0.95} f={f} tipo="senor" cara="feliz" pose={{ra: [160, 175]}} />
          <Casco x={760} y={1720} s={0.95} />
        </>
      ) : (
        <>
          <rect width={1080} height={1920} fill="#d9c9a6" />
          <rect x={80} y={300} width={300} height={380} fill="#8d6e4a" stroke={INK} strokeWidth={10} />
          <rect y={1380} width={1080} height={540} fill="#8b5a2b" />
          <Stick x={540} y={1500} s={1.35} f={f} tipo="senor" cara="susto" pose={{ra: [130, 175], la: [-130, -175]}} />
          <path d="M 470 940 L 540 900 L 610 940 L 610 960 L 470 960 Z" fill="#5f6b3a" stroke={INK} strokeWidth={6} transform="translate(0,-50)" />
          <rect x={100} y={1360} width={880} height={60} fill="#6d4421" stroke={INK} strokeWidth={8} />
          {g >= T(37.1) && (
            <g transform={`translate(540,640) scale(${3 - 2 * sello}) rotate(-10)`} opacity={sello}>
              <rect x={-370} y={-80} width={740} height={160} rx={20} fill="none" stroke="#e63946" strokeWidth={16} />
              <text y={26} fontSize={72} fontWeight={900} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">NO IDENTIFICADOS</text>
            </g>
          )}
        </>
      )}
    </Cam>
  );
};

// 8 · «Años después, unos investigadores dijeron que podían ser las llamas de unos pozos petroleros… a decenas de kilómetros.»
const E8: React.FC<SceneProps> = ({f, g, dur}) => {
  const z = Punch(g, T(41.6), 0.18);
  const linea = ip(g, T(43.6), T(44.6), 0, 1);
  return (
    <Cam f={f} dur={dur} oy={700} ox={700} punch={z}>
      <Noche f={f} />
      <rect y={900} width={1080} height={1020} fill="#0e2a4a" />
      <Plataforma x={640} y={960} s={0.7} f={f} i={0} />
      <Plataforma x={850} y={990} s={0.85} f={f} i={1} />
      <Plataforma x={1000} y={940} s={0.6} f={f} i={2} />
      <g transform="scale(0.32)"><Avion x={420} y={1500} f={f} /></g>
      <path d={`M 230 470 L ${230 + 560 * linea} ${470 + 180 * linea}`} stroke="#ffd23f" strokeWidth={8} strokeDasharray="24 18" />
      {linea > 0.6 && <text x={520} y={520} fontSize={52} fontWeight={900} fill="#ffd23f" stroke={INK} strokeWidth={8} paintOrder="stroke" fontFamily="DejaVu Sans" transform="rotate(16 520 520)">decenas de km</text>}
      <Stick x={260} y={1760} s={1.15} f={f} tipo="cientifico" cara="listo" pose={{ra: [130, 120]}} mano={<path d="M 0 0 L 160 -160" stroke="#8b5a2b" strokeWidth={10} strokeLinecap="round" />} />
    </Cam>
  );
};

// 9 · «Así que, o eran extraterrestres… o la Fuerza Aérea persiguió fogatas gigantes toda la noche.»
const E9: React.FC<SceneProps> = ({f, g, dur}) => {
  const izq = ip(g, T(46.4), T(46.9), 0, 1) * (1 - ip(g, T(49.1), T(49.5), 0, 1));
  const der = ip(g, T(49.1), T(49.5), 0, 1);
  const a = f * 0.06;
  return (
    <>
      <svg x={0} y={0} width={1080} height={960} viewBox="0 0 1080 960">
        <rect width={1080} height={960} fill="#0b1030" />
        <rect width={1080} height={960} fill="#7dffb2" opacity={0.12 * izq} />
        <g transform={`translate(540,480) scale(${1 + 0.12 * izq})`}>
          <Ovni x={0} y={-120} s={1.3} f={f} glow={1 + izq} />
          <path d="M -120 -60 L -260 330 L 260 330 L 120 -60 Z" fill="#b6fff0" opacity={0.15 + 0.2 * izq} />
          <g transform="translate(0,300)">
            <ellipse cx={0} cy={-120} rx={70} ry={90} fill="#8be28b" stroke={INK} strokeWidth={8} />
            <ellipse cx={-28} cy={-125} rx={20} ry={30} fill={INK} transform="rotate(-20 -28 -125)" />
            <ellipse cx={28} cy={-125} rx={20} ry={30} fill={INK} transform="rotate(20 28 -125)" />
            <path d="M 0 -30 L 0 60 M 0 0 L -50 40 M 0 0 L 50 -30" stroke={INK} strokeWidth={14} strokeLinecap="round" />
          </g>
        </g>
        <text x={60} y={110} fontSize={70} fontWeight={900} fill="#7dffb2" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans" opacity={0.5 + 0.5 * izq}>👽 ¿OVNI?</text>
      </svg>
      <rect y={950} width={1080} height={22} fill={INK} />
      <svg x={0} y={970} width={1080} height={950} viewBox="0 0 1080 950">
        <rect width={1080} height={950} fill="#1d1a2e" />
        <rect width={1080} height={950} fill="#ff7a1a" opacity={0.12 * der} />
        <rect y={700} width={1080} height={250} fill="#0e2a4a" />
        <g transform={`translate(540,700) scale(${1 + 0.12 * der})`}>
          {[0, 1, 2].map((i) => {
            const fl = Math.sin(f * 0.5 + i) * 18;
            return <path key={i} d={`M ${-160 + i * 160} 0 Q ${-220 + i * 160 + fl} -200 ${-150 + i * 160} ${-420 - fl} Q ${-60 + i * 160 - fl} -200 ${-120 + i * 160} 0 Z`} fill={i === 1 ? "#ffd84a" : "#ff7a1a"} stroke={INK} strokeWidth={6} />;
          })}
          <circle cx={0} cy={-200} r={330} fill="#ffb347" opacity={0.12 + 0.12 * der} />
        </g>
        <g transform={`translate(${540 + Math.cos(a) * 380},${360 + Math.sin(a) * 120}) scale(${Math.cos(a) > 0 ? 0.3 : -0.3},0.3)`}><Avion x={0} y={0} f={f} rot={Math.sin(a) * 10} /></g>
        <text x={60} y={110} fontSize={70} fontWeight={900} fill="#ffb347" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans" opacity={0.5 + 0.5 * der}>🔥 ¿FOGATA?</text>
      </svg>
    </>
  );
};

// 10 · «¿Tú qué crees que eran? Te leo en los comentarios.»
const E10: React.FC<SceneProps> = ({f, dur}) => {
  const s = spring({frame: f, fps: FPS, config: {damping: 12}});
  const b1 = spring({frame: f - 10, fps: FPS, config: {damping: 9}});
  const b2 = spring({frame: f - 18, fps: FPS, config: {damping: 9}});
  return (
    <Cam f={f} dur={dur} from={1} to={1.05}>
      <Noche f={f} />
      <g transform={`translate(540,520) scale(${s})`}>
        <rect x={-460} y={-200} width={920} height={330} rx={40} fill="#fff" stroke={INK} strokeWidth={12} />
        <text y={-70} fontSize={78} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">¿Tú qué crees</text>
        <text y={40} fontSize={78} fontWeight={900} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">que eran?</text>
      </g>
      <g transform={`translate(300,1000) scale(${b1})`}>
        <rect x={-210} y={-90} width={420} height={180} rx={40} fill="#7dffb2" stroke={INK} strokeWidth={10} />
        <text y={26} fontSize={74} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">👽 OVNI</text>
      </g>
      <g transform={`translate(780,1000) scale(${b2})`}>
        <rect x={-230} y={-90} width={460} height={180} rx={40} fill="#ffb347" stroke={INK} strokeWidth={10} />
        <text y={26} fontSize={70} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">🔥 FOGATA</text>
      </g>
      <Stick x={540} y={1680} s={1.0} f={f} cara="listo" />
      <Casco x={540} y={1680} s={1.0} />
    </Cam>
  );
};

const ESCENAS: {desde: number; C: React.FC<SceneProps>; svg?: boolean; sub?: number}[] = [
  {desde: 0, C: E1},
  {desde: 6.0, C: E2, sub: 1620},
  {desde: 9.85, C: E3, sub: 1000},
  {desde: 14.1, C: E4, sub: 1500},
  {desde: 21.85, C: E5, svg: false, sub: 880},
  {desde: 28.1, C: E6, sub: 1000},
  {desde: 32.3, C: E7, sub: 1000},
  {desde: 38.25, C: E8, sub: 1150},
  {desde: 45.4, C: E9, svg: false, sub: 1700},
  {desde: 51.55, C: E10},
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
  if (g >= F(51.55)) return null;
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
