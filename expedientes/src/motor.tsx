import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const FPS = 30;
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


// =====================================================================================
// MOTOR DE EPISODIOS: cada episodio es una lista de escenas que empiezan en una palabra
// =====================================================================================
type Palabra = {text: string; start: number; end: number};
export type Beat = {at: string; s: string; [k: string]: any};
export type EpisodioDef = {id: string; num: number; hook: string; beats: Beat[]};
type Ctx = {f: number; g: number; dur: number; b: Beat; fr: (t: number) => number; num: number; hook: string};

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '');

/** busca la frase `at` en las palabras a partir de `desde`; devuelve el índice de su primera palabra */
const buscar = (ws: {n: string}[], at: string, desde: number) => {
  const toks = norm(at).split(' ').filter(Boolean);
  for (let i = desde; i < ws.length; i++) if (toks.every((t, k) => ws[i + k] && ws[i + k].n.startsWith(t))) return i;
  throw new Error(`No encontré «${at}» en la voz`);
};

export const prepararEpisodio = (def: EpisodioDef, voz: {speed: number; palabras: Palabra[]}) => {
  const fr = (t: number) => Math.round((t / voz.speed) * FPS);
  const ws = voz.palabras.map((w) => ({...w, n: norm(w.text)}));
  let idx = 0;
  const beats = def.beats.map((b, i) => {
    const wi = i === 0 ? 0 : buscar(ws, b.at, idx);
    idx = wi + 1;
    const out: Beat = {...b, desde: i === 0 ? 0 : fr(ws[wi].start)};
    for (const k of Object.keys(b)) if (k.endsWith('At') && typeof b[k] === 'string') out[k] = fr(ws[buscar(ws, b[k], wi)].start);
    return out;
  });
  const ultimo = fr(ws[ws.length - 1].end);
  return {def, voz, fr, beats, duracion: ultimo + 18 + EXTRA};
};

// ---------- piezas nuevas ----------
const Barba: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x},${y - 395 * s}) scale(${s})`}>
    <path d="M -62 18 Q -60 92 0 96 Q 60 92 62 18 Q 30 50 0 46 Q -30 50 -62 18 Z" fill="#3a2a20" stroke={INK} strokeWidth={6} />
  </g>
);
const Helicoptero: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => (
  <g transform={`translate(${x},${y + Math.sin(f * 0.1) * 10}) scale(${s})`}>
    <path d="M 120 -10 L 360 -30 L 360 10 L 120 30 Z" fill="#6f7c86" stroke={INK} strokeWidth={8} />
    <path d="M 340 -60 L 380 -60 L 370 20 L 345 20 Z" fill="#6f7c86" stroke={INK} strokeWidth={7} />
    <ellipse cx={0} cy={0} rx={170} ry={95} fill="#8794a0" stroke={INK} strokeWidth={10} />
    <path d="M -150 -20 Q -150 -80 -60 -80 L -30 -80 L -30 10 L -160 10 Z" fill="#9fd8ff" stroke={INK} strokeWidth={7} />
    <rect x={-10} y={-120} width={20} height={30} fill={INK} />
    <ellipse cx={0} cy={-122} rx={260 * Math.abs(Math.cos(f * 1.3))} ry={10} fill="#c8ced6" stroke={INK} strokeWidth={4} />
    <path d="M -110 95 L -110 125 M 110 95 L 110 125 M -160 125 L 160 125" stroke={INK} strokeWidth={10} />
    <text x={40} y={30} fontSize={44} fontWeight={900} fill="#fff" fontFamily="DejaVu Sans">ARMADA</text>
  </g>
);
const Cabra: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[-50, -20, 25, 55].map((lx) => <path key={lx} d={`M ${lx} 20 L ${lx} 90`} stroke={INK} strokeWidth={12} strokeLinecap="round" />)}
    <ellipse cx={0} cy={0} rx={85} ry={50} fill="#f4f1ea" stroke={INK} strokeWidth={8} />
    <g transform={`translate(85,-45) rotate(${Math.sin(f * 0.2) * 8})`}>
      <path d="M -10 -40 Q -30 -90 -50 -70 M 10 -40 Q 10 -95 -15 -85" stroke="#8b6b4a" strokeWidth={10} fill="none" strokeLinecap="round" />
      <ellipse cx={10} cy={0} rx={42} ry={36} fill="#f4f1ea" stroke={INK} strokeWidth={7} />
      <circle cx={22} cy={-8} r={6} fill={INK} />
      <path d="M 20 34 L 26 62 L 32 34" fill="#d9d2c3" stroke={INK} strokeWidth={4} />
    </g>
  </g>
);
const Jaula: React.FC<{x: number; y: number; s?: number; children?: React.ReactNode}> = ({x, y, s = 1, children}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {children}
    <rect x={-170} y={-200} width={340} height={260} fill="none" stroke="#5b6270" strokeWidth={12} />
    {[-110, -55, 0, 55, 110].map((bx) => <path key={bx} d={`M ${bx} -200 L ${bx} 60`} stroke="#5b6270" strokeWidth={8} />)}
    <path d="M -180 -210 L 180 -210" stroke={INK} strokeWidth={14} />
  </g>
);
const Reloj: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-50} y={-210} width={100} height={420} rx={30} fill="#5a4632" stroke={INK} strokeWidth={8} />
    <circle r={150} fill="#fffdf5" stroke={INK} strokeWidth={14} />
    <path d={`M 0 0 L ${90 * Math.sin(f * 0.25)} ${-90 * Math.cos(f * 0.25)}`} stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <path d={`M 0 0 L ${60 * Math.sin(f * 0.02)} ${-60 * Math.cos(f * 0.02)}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <rect x={-80} y={50} width={160} height={56} rx={8} fill="#e63946" stroke={INK} strokeWidth={5} />
    <text y={92} fontSize={40} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">+5 DÍAS</text>
  </g>
);
const Chupacabras: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${-60 + i * 30} -${300 - Math.abs(i - 2) * 30} l 15 -40 l 15 40 Z`} fill="#3d4a3a" stroke={INK} strokeWidth={5} />)}
    <Criatura x={0} y={0} f={f} brillo={0.3} ojos={1} bultos={0} />
  </g>
);

/** cielo y suelo según el lugar */
const Fondo: React.FC<{tipo: string; f: number; apagado?: number}> = ({tipo, f, apagado = 0}) => {
  if (tipo === 'campo' || tipo === 'finca') return <Pueblo f={f} />;
  if (tipo === 'dia') return <Barrio f={f} />;
  if (tipo === 'cerrodia') return <Terreno f={f} />;
  if (tipo === 'oficina') return (<><rect width={1080} height={1920} fill="#d9c9a6" /><rect y={1380} width={1080} height={540} fill="#8b5a2b" /></>);
  if (tipo === 'cielo' || tipo === 'mar') return (
    <>
      <rect width={1080} height={1920} fill="#8fc6f0" />
      {[[180, 300], [760, 220], [520, 520], [920, 640]].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${(cx - f * (1.5 + i * 0.4) + 2600) % 1300 - 110},${cy})`}>
          <ellipse rx={130} ry={46} fill="#fff" /><ellipse cx={-70} cy={14} rx={80} ry={36} fill="#fff" /><ellipse cx={80} cy={12} rx={90} ry={40} fill="#fff" />
        </g>
      ))}
      {tipo === 'mar' && (
        <>
          <rect y={1300} width={1080} height={620} fill="#2f78b8" />
          {Array.from({length: 10}).map((_, i) => <path key={i} d={`M ${(i * 140 + f * 4) % 1200 - 100} ${1360 + (i % 5) * 110} q 30 -16 60 0`} stroke="#9fd0ff" strokeWidth={6} fill="none" />)}
          <path d="M 0 1300 Q 160 1220 300 1290 L 300 1310 L 0 1310 Z" fill="#7a8a4a" stroke={INK} strokeWidth={6} />
        </>
      )}
    </>
  );
  if (tipo === 'eclipse') return (
    <>
      <rect width={1080} height={1920} fill="#2a2f55" />
      <circle cx={540} cy={420} r={170} fill="#fff6c8" opacity={0.35} />
      <circle cx={540} cy={420} r={128} fill="#fff1a8" opacity={0.7} />
      <circle cx={540} cy={420} r={110} fill="#0d0f20" stroke="#ffe27a" strokeWidth={6} />
      {Array.from({length: 18}).map((_, i) => <circle key={i} cx={(i * 263) % 1080} cy={(i * 97) % 800 + 60} r={3} fill="#fff" opacity={0.4} />)}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={i * 160} y={1180 - (i % 3) * 90} width={150} height={800} fill="#1b2140" stroke={INK} strokeWidth={6} />)}
      <rect y={1500} width={1080} height={420} fill="#3a3f55" />
    </>
  );
  if (tipo === 'volcan') return (
    <>
      <rect width={1080} height={1920} fill="#1a1f3d" />
      {Array.from({length: 30}).map((_, i) => <circle key={i} cx={(i * 263) % 1080} cy={(i * 151) % 700 + 40} r={3} fill="#fff" opacity={0.5} />)}
      {[0, 1, 2, 3].map((i) => { const k = ((f * 0.01 + i / 4) % 1); return <circle key={i} cx={540 + k * 120} cy={700 - k * 500} r={60 + k * 120} fill="#6b6f80" opacity={0.35 * (1 - k)} />; })}
      <path d="M -100 1500 L 440 720 L 640 720 L 1180 1500 Z" fill="#4a3f4f" stroke={INK} strokeWidth={10} />
      <path d="M 440 720 L 640 720 L 600 780 L 480 780 Z" fill="#ff7a1a" opacity={0.7} />
      <path d="M 440 720 L 360 830 L 410 840 L 470 780 Z M 640 720 L 720 830 L 670 840 L 610 780 Z" fill="#f4f1ea" />
      <rect y={1500} width={1080} height={420} fill="#2d3328" />
    </>
  );
  if (tipo === 'ciudad') return (
    <>
      <Noche f={f} />
      {Array.from({length: 8}).map((_, i) => (
        <g key={i}>
          <rect x={i * 140} y={1080 - (i % 4) * 110} width={130} height={500} fill="#24294a" stroke={INK} strokeWidth={6} />
          {Array.from({length: 10}).map((__, k) => (
            <rect key={k} x={i * 140 + 20 + (k % 3) * 36} y={1110 - (i % 4) * 110 + Math.floor(k / 3) * 60} width={22} height={30} fill={apagado > 0.5 ? '#1a1d33' : '#ffd84a'} opacity={apagado > 0.5 ? 1 : 0.85} />
          ))}
        </g>
      ))}
      <rect y={1520} width={1080} height={400} fill="#20243a" />
    </>
  );
  if (tipo === 'base') return (
    <>
      <Noche f={f} />
      <rect y={1450} width={1080} height={470} fill="#4a4f58" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={i * 240 + ((f * 6) % 240) - 120} y={1640} width={140} height={20} fill="#f1efe6" />)}
      <path d="M 700 1450 L 700 1260 Q 860 1160 1020 1260 L 1020 1450 Z" fill="#6f7c86" stroke={INK} strokeWidth={8} />
    </>
  );
  if (tipo === 'granja') return (
    <>
      <Noche f={f} />
      <rect y={1350} width={1080} height={570} fill="#3f5a2a" />
      <path d="M 640 1350 L 640 1080 L 800 960 L 960 1080 L 960 1350 Z" fill="#a33a2a" stroke={INK} strokeWidth={8} />
      <rect x={750} y={1200} width={100} height={150} fill="#5a2a1a" stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M ${i * 100} 1330 L ${i * 100} 1410`} stroke="#8b6b4a" strokeWidth={12} />)}
      <path d="M 0 1350 L 620 1350 M 0 1390 L 620 1390" stroke="#8b6b4a" strokeWidth={10} />
    </>
  );
  if (tipo === 'cerro') return (
    <>
      <Noche f={f} />
      <path d="M -100 1400 Q 200 900 520 1150 Q 780 820 1180 1400 Z" fill="#2c3a2e" stroke={INK} strokeWidth={8} />
      <rect y={1400} width={1080} height={520} fill="#3a4a2e" />
    </>
  );
  return <Noche f={f} />;
};

const POSTURA_MIEDO = {ra: [150, 170] as [number, number], la: [-150, -170] as [number, number]};
const POSTURA_FELIZ = {ra: [160, 175] as [number, number], la: [-160, -175] as [number, number]};
const Camarita = <rect x={-34} y={-30} width={68} height={48} rx={8} fill="#2b2f38" stroke={INK} strokeWidth={5} />;

/** escena general: fondo + objeto en el cielo + personajes + accesorios */
const Escena: React.FC<{c: Ctx; extra?: React.ReactNode}> = ({c, extra}) => {
  const {f, g, dur, b} = c;
  const ovni = b.ovni ?? 'ninguno';
  const hay = ovni !== 'ninguno';
  const apagado = b.apagonAt ? (g >= b.apagonAt ? 1 : 0) : b.apagon ? 1 : 0;
  const flash = b.apagonAt && g >= b.apagonAt && g < b.apagonAt + 6 ? 0.8 : 0;
  const [ox, oy] = b.ovniPos ?? [720, 560];
  const esq = b.esquiva ? Math.sin(f * 0.25) * 220 : 0;
  const persig = b.persecucion ? ((f * 9) % 1400) - 200 : 0;
  const ps: any[] = b.personajes ?? [];
  const n = ps.length;
  const desap = b.desaparecerAt ? ip(g, b.desaparecerAt, b.desaparecerAt + 10, 1, 0) : 1;
  const ovniX = ox + esq + (b.persecucion ? persig - 400 : 0);
  return (
    <>
    <Cam f={f} dur={dur} from={1.02} to={1.1} oy={1100}>
      <Fondo tipo={b.fondo ?? 'noche'} f={f} apagado={apagado} />
      {b.huella && <ellipse cx={540} cy={1560} rx={430} ry={110} fill="#2a1a10" opacity={0.85} stroke="#120a06" strokeWidth={10} />}
      {b.rayo && hay && <path d={`M ${ovniX - 80} ${oy + 30} L ${ovniX - 260} 1700 L ${ovniX + 260} 1700 L ${ovniX + 80} ${oy + 30} Z`} fill="#fff6a8" opacity={0.18 + 0.06 * Math.sin(f * 0.4)} />}
      {ovni === 'plato' && <Ovni x={ovniX} y={oy} s={b.ovniS ?? 0.9} f={f} />}
      {ovni === 'luz' && <Luz x={ovniX} y={oy} r={50} f={f} />}
      {ovni === 'luces' && [[260, 380], [520, 300], [800, 420], [380, 560], [700, 640]].map(([x, y], i) => (
        <Luz key={i} x={x + Math.sin(f * 0.05 + i) * 30 + (b.persecucion ? persig - 400 : 0)} y={y + Math.cos(f * 0.04 + i) * 20} r={32} f={f} i={i} />
      ))}
      {ovni === 'punto' && (
        <g transform={`translate(${740},${330})`}>
          <circle r={70 + 10 * Math.sin(f * 0.3)} fill="none" stroke="#ffd23f" strokeWidth={6} />
          <circle r={14} fill="#fff" />
        </g>
      )}
      {ovni === 'meteoro' && (() => {
        const k = ((f % 45) / 45);
        const x = 1000 - k * 520, y = 200 + k * 520;
        return <g opacity={k < 0.9 ? 1 : 0}><path d={`M ${x} ${y} L ${x + 260} ${y - 260}`} stroke="#fff6c8" strokeWidth={18} strokeLinecap="round" opacity={0.6} /><circle cx={x} cy={y} r={20} fill="#fff" /></g>;
      })()}
      {ovni === 'nube' && (
        <g transform={`translate(${ovniX},${oy})`}>
          <circle r={18} fill="#fff" stroke={INK} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => { const k = ((f * 0.02 + i / 4) % 1); return <circle key={i} cx={-k * 260} cy={-k * 40} r={20 + k * 70} fill="#e8eef4" opacity={0.7 * (1 - k)} />; })}
        </g>
      )}
      {b.avion && <Avion x={(b.persecucion ? 300 : 360) + Math.sin(f * 0.05) * 20} y={b.avionY ?? 1000} s={b.avion === 'comercial' ? 1.05 : 0.85} f={f} rot={-4} />}
      {b.disparos && hay && Array.from({length: 6}).map((_, i) => {
        const k = ((f * 0.08 + i / 6) % 1), x1 = 660, y1 = (b.avionY ?? 1000) - 10;
        const x = x1 + (ovniX - x1) * k, y = y1 + (oy - y1) * k;
        return <path key={i} d={`M ${x} ${y} l 24 -18`} stroke="#ffd84a" strokeWidth={10} strokeLinecap="round" />;
      })}
      {b.heli && <Helicoptero x={380} y={b.heliY ?? 1000} s={0.95} f={f} />}
      {b.criatura && <Chupacabras x={760} y={1620} s={1.1} f={f} />}
      {b.jaula && <Jaula x={b.jaulaX ?? 760} y={1690} s={1} >{b.cabra !== false && <Cabra x={0} y={-40} s={1} f={f} />}</Jaula>}
      {b.reloj && <Reloj x={780} y={760} s={1.1} f={f} />}
      {ps.map((p, i) => {
        const x = p.x ?? 540 + (i - (n - 1) / 2) * (n > 3 ? 220 : 300) - (b.jaula || b.criatura || b.reloj ? 220 : 0);
        const y = p.y ?? 1770, s = p.s ?? (n > 3 ? 0.85 : 0.95);
        const cara = p.cara ?? (hay || b.criatura || b.huella ? 'susto' : 'normal');
        const pose = p.pose ?? (cara === 'susto' ? POSTURA_MIEDO : cara === 'feliz' ? POSTURA_FELIZ : undefined);
        const op = i === 0 && b.desaparecerAt ? desap : 1;
        return (
          <g key={i} opacity={op}>
            <Stick x={x} y={y} s={s} f={f + i * 7} tipo={p.tipo ?? 'nino'} cara={cara} pose={pose} sudor={cara === 'susto'} flip={p.flip}
              mano={p.camara || b.camaras ? Camarita : p.linterna ? <path d="M 0 0 L 90 -60" stroke="#ffd84a" strokeWidth={30} opacity={0.6} /> : undefined} />
            {p.casco && <Casco x={x} y={y} s={s} />}
            {p.barba && <Barba x={x} y={y} s={s} />}
          </g>
        );
      })}
      {b.camaraRec && (
        <g>
          {[[60, 120, 1, 1], [1020, 120, -1, 1], [60, 1850, 1, -1], [1020, 1850, -1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M ${x} ${y + sy * 90} L ${x} ${y} L ${x + sx * 90} ${y}`} stroke="#fff" strokeWidth={10} fill="none" />)}
          <circle cx={120} cy={190} r={18} fill="#ff3b3b" opacity={Math.floor(f / 10) % 2 ? 1 : 0.2} />
          <text x={150} y={204} fontSize={44} fontWeight={900} fill="#fff" fontFamily="DejaVu Sans Mono">REC</text>
        </g>
      )}
      {b.etiqueta && (
        <g transform={`translate(540,250) scale(${spring({frame: f - 4, fps: FPS, config: {damping: 11}})})`}>
          <rect x={-420} y={-62} width={840} height={110} rx={55} fill="#fff" stroke={INK} strokeWidth={8} />
          <text y={18} fontSize={Math.min(54, Math.floor(1250 / String(b.etiqueta).length))} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">{b.etiqueta}</text>
        </g>
      )}
      <rect width={1080} height={1920} fill="#fff" opacity={flash} />
    </Cam>
    {extra}
    </>
  );
};

const Gancho: React.FC<{c: Ctx}> = ({c}) => {
  const {f, hook, num} = c;
  const s = spring({frame: f - 3, fps: FPS, config: {damping: 9, stiffness: 160}});
  const sh = f < 14 ? Math.sin(f * 2.2) * 6 * (1 - f / 14) : 0;
  const lineas = hook.split('|');
  return (
    <Escena c={c} extra={
      <>
        <g transform="translate(540,140)">
          <rect x={-300} y={-46} width={600} height={84} rx={42} fill="#7dffb2" stroke={INK} strokeWidth={7} />
          <text y={14} fontSize={42} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">📁 EXPEDIENTE #{String(num).padStart(2, '0')}</text>
        </g>
        <rect x={0} y={250} width={1080} height={300} fill="#0a0c1e" opacity={0.55 * s} />
        <g transform={`translate(${540 + sh},${420}) scale(${s}) rotate(-3)`}>
          {lineas.map((l, i) => (
            <text key={i} y={i * 118 - (lineas.length - 1) * 59 + 40} fontSize={Math.min(118, Math.floor(1300 / l.length))} fontWeight={900} textAnchor="middle"
              fill={i === lineas.length - 1 ? '#ffd23f' : '#fff'} stroke={INK} strokeWidth={16} paintOrder="stroke" fontFamily="DejaVu Sans">{l}</text>
          ))}
        </g>
      </>
    } />
  );
};

const Fecha: React.FC<{c: Ctx}> = ({c}) => {
  const {f, dur, b} = c;
  const cal = spring({frame: f, fps: FPS, config: {damping: 11}});
  const pin = spring({frame: f - Math.round(dur * 0.45), fps: FPS, config: {damping: 7}});
  return (
    <Cam f={f} dur={dur} oy={1000}>
      <rect width={1080} height={1920} fill="#1d2a5c" />
      <g transform={`translate(540,470) scale(${cal}) rotate(-4)`}>
        <rect x={-240} y={-230} width={480} height={420} rx={26} fill="#fff" stroke={INK} strokeWidth={12} />
        <rect x={-240} y={-230} width={480} height={120} rx={26} fill="#e63946" stroke={INK} strokeWidth={12} />
        <text y={-145} fontSize={64} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">{b.mes || 'AÑO'}</text>
        <text y={b.dia ? 60 : 70} fontSize={b.dia ? 200 : 150} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">{b.dia || b.anio}</text>
        {b.dia && <text y={150} fontSize={64} fontWeight={800} textAnchor="middle" fill="#566573" fontFamily="DejaVu Sans">{b.anio}</text>}
      </g>
      <g transform="translate(0,820)">
        <rect width={1080} height={700} fill="#3a7bd5" stroke={INK} strokeWidth={10} />
        <path d="M 120 120 Q 420 40 700 130 Q 940 200 960 400 Q 940 600 640 660 Q 300 690 160 560 Q 40 400 120 120 Z" fill="#4f9a45" stroke={INK} strokeWidth={10} />
        <text x={540} y={175} fontSize={64} fontWeight={900} textAnchor="middle" fill="#e8f7e0" fontFamily="DejaVu Sans" opacity={0.85}>{b.pais}</text>
        <g transform={`translate(560,${540 - 110 * pin}) scale(${pin})`}>
          <path d="M 0 0 C -60 -70 -60 -150 0 -150 C 60 -150 60 -70 0 0 Z" fill="#e63946" stroke={INK} strokeWidth={8} />
          <circle cx={0} cy={-100} r={22} fill="#fff" />
        </g>
        <text x={540} y={590} fontSize={b.lugar && b.lugar.length > 14 ? 50 : 62} fontWeight={900} textAnchor="middle" fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans" opacity={pin}>{b.lugar}</text>
      </g>
    </Cam>
  );
};

const Dato: React.FC<{c: Ctx}> = ({c}) => {
  const {f, dur, b} = c;
  const s = spring({frame: f, fps: FPS, config: {damping: 8, stiffness: 170}});
  const num = String(b.num);
  const n = parseInt(num.replace(/\D/g, ''), 10);
  const mostrado = !isNaN(n) && /^\+?\d+$/.test(num) ? num.replace(/\d+/, String(Math.round(n * ip(f, 0, 16, 0, 1)))) : num;
  return (
    <Cam f={f} dur={dur} from={1} to={1.12} oy={900}>
      <rect width={1080} height={1920} fill="#14183a" />
      {Array.from({length: 14}).map((_, i) => <path key={i} d={`M 540 900 L ${540 + Math.cos(i * 0.449 + f * 0.01) * 1500} ${900 + Math.sin(i * 0.449 + f * 0.01) * 1500} L ${540 + Math.cos(i * 0.449 + 0.22 + f * 0.01) * 1500} ${900 + Math.sin(i * 0.449 + 0.22 + f * 0.01) * 1500} Z`} fill="#1f2552" />)}
      <g transform={`translate(${540 + (f < 10 ? Math.sin(f * 2) * 10 : 0)},850) scale(${s})`}>
        <text y={60} fontSize={mostrado.length > 3 ? 260 : 360} fontWeight={900} textAnchor="middle" fill="#ff3b3b" stroke={INK} strokeWidth={20} paintOrder="stroke" fontFamily="DejaVu Sans">{mostrado}</text>
        <text y={200} fontSize={b.sub && b.sub.length > 16 ? 58 : 72} fontWeight={900} textAnchor="middle" fill="#fff" stroke={INK} strokeWidth={12} paintOrder="stroke" fontFamily="DejaVu Sans">{b.sub}</text>
      </g>
    </Cam>
  );
};

const Radar: React.FC<{c: Ctx}> = ({c}) => {
  const {f, dur, b} = c;
  if (b.modo === 'flir') {
    return (
      <Cam f={f} dur={dur} from={1} to={1.08} oy={800}>
        <rect width={1080} height={1920} fill="#151a26" />
        <Flir x={540} y={800} w={900} h={900} f={f} puntos={[]}>
          <g transform={`translate(${120 - f * 2},${-60})`}>
            {[0, 1, 2, 3, 4].map((i) => { const k = ((f * 0.025 + i / 5) % 1); return <circle key={i} cx={-k * 330} cy={-k * 30} r={20 + k * 90} fill="#e8f5e8" opacity={0.55 * (1 - k)} />; })}
            <circle r={20} fill="#fff" />
          </g>
        </Flir>
      </Cam>
    );
  }
  const total = b.n ?? 0;
  const vis = Math.round(total * ip(f, 6, Math.max(12, dur * 0.7), 0, 1));
  const a = f * 0.09;
  return (
    <Cam f={f} dur={dur} from={1} to={1.08} oy={820}>
      <rect width={1080} height={1920} fill="#0b1410" />
      <g transform="translate(540,820)">
        <circle r={440} fill="#0f2a1a" stroke="#3cff8a" strokeWidth={8} />
        {[110, 220, 330].map((r) => <circle key={r} r={r} fill="none" stroke="#2a8a4a" strokeWidth={4} />)}
        <path d="M -440 0 L 440 0 M 0 -440 L 0 440" stroke="#2a8a4a" strokeWidth={4} />
        <path d={`M 0 0 L ${Math.cos(a) * 440} ${Math.sin(a) * 440} A 440 440 0 0 0 ${Math.cos(a - 0.5) * 440} ${Math.sin(a - 0.5) * 440} Z`} fill="#3cff8a" opacity={0.25} />
        {Array.from({length: vis}).map((_, i) => {
          const r = 120 + ((i * 97) % 300), t = i * 2.4;
          return <circle key={i} cx={Math.cos(t) * r} cy={Math.sin(t) * r} r={14} fill="#bfffd6" opacity={0.6 + 0.4 * Math.sin(f * 0.3 + i)} />;
        })}
      </g>
      <text x={540} y={1430} fontSize={total ? 150 : 90} fontWeight={900} textAnchor="middle" fill={total ? '#3cff8a' : '#ff3b3b'} stroke={INK} strokeWidth={14} paintOrder="stroke" fontFamily="DejaVu Sans">{total ? vis : 'SIN SEÑAL'}</text>
      {b.etiqueta && <text x={540} y={1540} fontSize={60} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">{b.etiqueta}</text>}
    </Cam>
  );
};

const Titular: React.FC<{c: Ctx}> = ({c}) => {
  const {f, dur, b} = c;
  const big = spring({frame: f - 8, fps: FPS, config: {damping: 10}});
  return (
    <Cam f={f} dur={dur} oy={900}>
      <rect width={1080} height={1920} fill="#263c6e" />
      {Array.from({length: 6}).map((_, i) => {
        const k = spring({frame: f - i * 3, fps: FPS, config: {damping: 11}});
        return (
          <g key={i} transform={`translate(${180 + (i * 233) % 760},${300 + (i * 271) % 1300}) rotate(${(i * 41) % 50 - 25}) scale(${k * 0.85})`}>
            <rect x={-170} y={-120} width={340} height={240} fill="#f4f1ea" stroke={INK} strokeWidth={7} />
            {[0, 1, 2, 3].map((l) => <rect key={l} x={-130} y={-60 + l * 40} width={260 - (l % 2) * 80} height={14} fill="#9aa5b1" />)}
          </g>
        );
      })}
      <g transform={`translate(540,880) scale(${big}) rotate(-3)`}>
        <rect x={-470} y={-230} width={940} height={420} fill="#f4f1ea" stroke={INK} strokeWidth={12} />
        <rect x={-470} y={-230} width={940} height={90} fill={INK} />
        <text y={-170} fontSize={50} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">ÚLTIMA HORA</text>
        {String(b.texto).split('|').map((l, i, arr) => (
          <text key={i} y={i * 100 - (arr.length - 1) * 50 + 60} fontSize={l.length > 18 ? 62 : 80} fontWeight={900} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">{l}</text>
        ))}
      </g>
    </Cam>
  );
};

const Oficial: React.FC<{c: Ctx}> = ({c}) => {
  const {f, g, dur, b} = c;
  const at = b.selloAt ?? g - f + 30;
  const sello = spring({frame: g - at, fps: FPS, config: {damping: 9, stiffness: 160}});
  return (
    <Cam f={f} dur={dur} oy={1000}>
      <Fondo tipo="oficina" f={f} />
      <g transform="translate(540,760) rotate(-2)">
        <path d="M -380 -460 L -140 -460 L -100 -500 L 380 -500 L 380 460 L -380 460 Z" fill="#c9b48e" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
        <rect x={-330} y={-420} width={660} height={840} fill="#fff" stroke={INK} strokeWidth={8} />
        <text y={-320} fontSize={Math.min(58, Math.floor(1000 / String(b.titulo).length))} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">{b.titulo}</text>
        {Array.from({length: 9}).map((_, l) => <rect key={l} x={-260} y={-240 + l * 55} width={520 - (l % 3) * 90} height={14} fill="#9aa5b1" />)}
      </g>
      {g >= at && (
        <g transform={`translate(540,800) scale(${3 - 2 * sello}) rotate(-12)`} opacity={sello}>
          <rect x={-380} y={-80} width={760} height={160} rx={20} fill="none" stroke="#e63946" strokeWidth={16} />
          <text y={28} fontSize={String(b.sello).length > 14 ? 64 : 80} fontWeight={900} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">{b.sello}</text>
        </g>
      )}
      <Stick x={880} y={1760} s={0.95} f={f} tipo="senor" cara={g >= at ? 'triste' : 'listo'} />
    </Cam>
  );
};

const Conferencia: React.FC<{c: Ctx}> = ({c}) => {
  const {f, dur, b} = c;
  return (
    <Cam f={f} dur={dur} oy={1100}>
      <rect width={1080} height={1920} fill="#2a3560" />
      <rect x={140} y={300} width={800} height={500} rx={20} fill="#1f6f4a" stroke={INK} strokeWidth={10} />
      <text x={540} y={590} fontSize={Math.min(70, Math.floor(1250 / String(b.texto).length))} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">{b.texto}</text>
      <Stick x={540} y={1650} s={1.2} f={f} tipo="senor" cara="habla" pose={{ra: [130, 150]}} />
      <rect x={300} y={1300} width={480} height={360} fill="#8b5a2b" stroke={INK} strokeWidth={10} />
      {[-120, -40, 40, 120].map((mx, i) => <g key={i}><path d={`M ${540 + mx} 1300 L ${540 + mx * 0.4} 1150`} stroke={INK} strokeWidth={8} /><circle cx={540 + mx * 0.4} cy={1150} r={20} fill={['#e63946', '#3aa0ff', '#ffd23f', '#7dffb2'][i]} stroke={INK} strokeWidth={5} /></g>)}
      {Math.floor(f / 7) % 3 === 0 && <circle cx={(f * 97) % 1000 + 40} cy={1800} r={120} fill="#fff" opacity={0.5} />}
    </Cam>
  );
};

/** iconos para explicaciones y comparaciones */
const Icono: React.FC<{tipo: string; f: number}> = ({tipo, f}) => {
  switch (tipo) {
    case 'ovni': return <Ovni x={0} y={0} s={1.1} f={f} />;
    case 'tiempo': return (
      <g>
        <path d="M -110 -170 L 110 -170 L 10 0 L 110 170 L -110 170 L -10 0 Z" fill="#cfe6ff" stroke={INK} strokeWidth={10} />
        <path d={`M -70 ${-120 + (f % 60)} L 70 ${-120 + (f % 60)} L 0 -10 Z`} fill="#e0b060" />
        <path d="M -80 150 L 80 150 L 0 60 Z" fill="#e0b060" />
      </g>
    );
    case 'chisme': return (
      <g>
        <Stick x={-120} y={260} s={0.6} f={f} tipo="senor" cara="habla" />
        <Stick x={120} y={260} s={0.6} f={f + 5} cara="susto" flip />
        <g transform="translate(-60,-170)"><ellipse rx={150} ry={70} fill="#fff" stroke={INK} strokeWidth={6} /><text y={16} fontSize={48} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">bla bla…</text></g>
      </g>
    );
    case 'globo': return (
      <g transform={`translate(0,${Math.sin(f * 0.1) * 10})`}>
        <ellipse cx={0} cy={-60} rx={130} ry={160} fill="#f4f1ea" stroke={INK} strokeWidth={10} />
        <path d="M 0 100 L 0 200" stroke={INK} strokeWidth={6} />
        <rect x={-40} y={200} width={80} height={50} fill="#8b6b4a" stroke={INK} strokeWidth={6} />
      </g>
    );
    case 'venus': return (
      <g>
        <circle r={160} fill="#f3d38a" stroke={INK} strokeWidth={10} />
        <path d="M -150 -40 Q 0 -10 150 -50 M -140 50 Q 0 80 145 40" stroke="#d9a441" strokeWidth={14} fill="none" />
        <text y={250} fontSize={64} fontWeight={900} textAnchor="middle" fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans">VENUS</text>
      </g>
    );
    case 'meteoro': return (
      <g>
        <path d={`M -40 40 L 220 -220`} stroke="#ffb347" strokeWidth={60} strokeLinecap="round" opacity={0.5} />
        <path d={`M -40 40 L 160 -160`} stroke="#fff6c8" strokeWidth={26} strokeLinecap="round" />
        <circle cx={-40} cy={40} r={60} fill="#8a6a5a" stroke={INK} strokeWidth={8} />
      </g>
    );
    case 'avion': return <Avion x={0} y={0} s={0.8} f={f} />;
    case 'radar': return (
      <g>
        <circle r={170} fill="#0f2a1a" stroke="#3cff8a" strokeWidth={8} />
        <path d={`M 0 0 L ${Math.cos(f * 0.1) * 170} ${Math.sin(f * 0.1) * 170}`} stroke="#3cff8a" strokeWidth={8} />
              </g>
    );
    case 'apagon': return (
      <g>
        <circle cy={-40} r={130} fill="#3a3f55" stroke={INK} strokeWidth={10} />
        <rect x={-60} y={80} width={120} height={80} fill="#9aa5b1" stroke={INK} strokeWidth={8} />
        <path d="M -40 -60 L 40 20 M 40 -60 L -40 20" stroke="#e63946" strokeWidth={14} />
      </g>
    );
    case 'cabra': return <Cabra x={0} y={40} s={1.6} f={f} />;
    case 'turistas': return (
      <g>
        {[-180, 0, 180].map((x, i) => <Stick key={i} x={x} y={260} s={0.55} f={f + i * 5} tipo={['nino', 'mama', 'senor'][i] as Tipo} cara="feliz" pose={{ra: [130, 150]}} mano={Camarita} />)}
        {Math.floor(f / 8) % 2 === 0 && <circle cx={60} cy={-80} r={90} fill="#fff" opacity={0.7} />}
      </g>
    );
    case 'luna': return (
      <g>
        <circle r={150} fill="#f6f1d0" />
        <circle cx={-50} cy={-30} r={150} fill="#1d1a2e" />
      </g>
    );
    case 'fogata': return <Fogata x={0} y={120} s={1.4} f={f} />;
    default: return <Ovni x={0} y={0} s={1.1} f={f} />;
  }
};

const Explicacion: React.FC<{c: Ctx}> = ({c}) => {
  const {f, dur, b} = c;
  const s = spring({frame: f - 4, fps: FPS, config: {damping: 10}});
  return (
    <Cam f={f} dur={dur} oy={1100}>
      <rect width={1080} height={1920} fill="#2a3560" />
      <rect x={100} y={260} width={880} height={820} rx={30} fill="#1f4f3a" stroke="#8b5a2b" strokeWidth={22} />
      <g transform={`translate(540,640) scale(${s})`}><Icono tipo={b.icono} f={f} /></g>
      <g transform={`translate(540,1200) scale(${s})`}>
        <rect x={-460} y={-80} width={920} height={130} rx={30} fill="#fff" stroke={INK} strokeWidth={10} />
        <text y={20} fontSize={String(b.etiqueta).length > 20 ? 52 : 66} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">{b.etiqueta}</text>
      </g>
      <Stick x={230} y={1800} s={1.0} f={f} tipo={b.persona ?? 'cientifico'} cara="listo" pose={{ra: [130, 120]}} mano={<path d="M 0 0 L 160 -160" stroke="#8b5a2b" strokeWidth={10} strokeLinecap="round" />} />
    </Cam>
  );
};

const Split: React.FC<{c: Ctx}> = ({c}) => {
  const {f, g, b} = c;
  const abajoAt = b.abajoAt ?? g - f + 50;
  const arriba = ip(f, 0, 8, 0, 1) * (1 - ip(g, abajoAt - 4, abajoAt + 4, 0, 1));
  const abajo = ip(g, abajoAt - 4, abajoAt + 4, 0, 1);
  const Mitad: React.FC<{texto: string; icono: string; on: number; color: string; fondo: string}> = ({texto, icono, on, color, fondo}) => (
    <>
      <rect width={1080} height={960} fill={fondo} />
      <rect width={1080} height={960} fill={color} opacity={0.14 * on} />
      <g transform={`translate(540,520) scale(${0.9 + 0.15 * on})`}><Icono tipo={icono} f={f} /></g>
      <text x={60} y={120} fontSize={texto.length > 20 ? 58 : 68} fontWeight={900} fill={color} stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans" opacity={0.45 + 0.55 * on}>{texto}</text>
    </>
  );
  return (
    <>
      <svg x={0} y={0} width={1080} height={960} viewBox="0 0 1080 960"><Mitad texto={b.arriba} icono={b.iconoArriba ?? 'ovni'} on={arriba} color="#7dffb2" fondo="#0b1030" /></svg>
      <rect y={950} width={1080} height={22} fill={INK} />
      <svg x={0} y={970} width={1080} height={950} viewBox="0 0 1080 960"><Mitad texto={b.abajo} icono={b.iconoAbajo ?? 'fogata'} on={abajo} color="#ffb347" fondo="#1d1a2e" /></svg>
    </>
  );
};

const Cierre: React.FC<{c: Ctx}> = ({c}) => {
  const {f, dur, b} = c;
  const s = spring({frame: f, fps: FPS, config: {damping: 12}});
  const b1 = spring({frame: f - 10, fps: FPS, config: {damping: 9}});
  const b2 = spring({frame: f - 18, fps: FPS, config: {damping: 9}});
  return (
    <Cam f={f} dur={dur} from={1} to={1.05}>
      <Noche f={f} />
      <g transform={`translate(540,520) scale(${s})`}>
        <rect x={-470} y={-200} width={940} height={330} rx={40} fill="#fff" stroke={INK} strokeWidth={12} />
        <text y={-70} fontSize={b.l1.length > 20 ? 62 : 74} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">{b.l1}</text>
        <text y={40} fontSize={b.l2.length > 20 ? 62 : 74} fontWeight={900} textAnchor="middle" fill="#e63946" fontFamily="DejaVu Sans">{b.l2}</text>
      </g>
      <g transform={`translate(285,980) scale(${b1})`}>
        <rect x={-225} y={-90} width={450} height={180} rx={40} fill="#7dffb2" stroke={INK} strokeWidth={10} />
        <text y={24} fontSize={Math.min(66, Math.floor(560 / b.b1.length))} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">{b.b1}</text>
      </g>
      <g transform={`translate(795,980) scale(${b2})`}>
        <rect x={-225} y={-90} width={450} height={180} rx={40} fill="#ffb347" stroke={INK} strokeWidth={10} />
        <text y={24} fontSize={Math.min(66, Math.floor(560 / b.b2.length))} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="DejaVu Sans">{b.b2}</text>
      </g>
      <Stick x={540} y={1680} s={1.0} f={f} cara="listo" />
    </Cam>
  );
};

const ESCENA: Record<string, React.FC<{c: Ctx}>> = {
  gancho: Gancho, fecha: Fecha, escena: ({c}) => <Escena c={c} />, dato: Dato, radar: Radar, titular: Titular, oficial: Oficial,
  conferencia: Conferencia, explicacion: Explicacion, split: Split, cierre: Cierre,
  suerte: ({c}) => <Escena c={{...c, b: {...c.b, fondo: c.b.fondo ?? 'dia', ovni: 'ninguno', personajes: (c.b.personajes ?? [{}, {tipo: 'senor'}]).map((p: any) => ({...p, cara: 'feliz'}))}}} />,
};
const SUB_Y: Record<string, number> = {fecha: 1640, dato: 1500, oficial: 1520, radar: 1660, titular: 1500, explicacion: 1500, conferencia: 860, split: 1760};

// ---------- subtítulos y botón de suscríbete ----------
type Chunk = {words: Palabra[]; start: number; end: number};
const chunks = (ps: Palabra[]): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Palabra[] = [];
  for (const w of ps) {
    cur.push(w);
    if (cur.length >= 3 || /[.,:?!…]$/.test(w.text)) { out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end}); cur = []; }
  }
  if (cur.length) out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
  return out;
};
const Subs: React.FC<{g: number; y: number; ch: Chunk[]; fr: (t: number) => number}> = ({g, y, ch, fr}) => {
  let idx = -1;
  for (let i = 0; i < ch.length; i++) if (fr(ch[i].start) - 2 <= g) idx = i;
  if (idx < 0) return null;
  const c = ch[idx], next = ch[idx + 1];
  if (g > fr(c.end) + 18 && (!next || g < fr(next.start) - 2)) return null;
  const pop = spring({frame: g - fr(c.start), fps: FPS, config: {damping: 12, stiffness: 220}});
  return (
    <div style={{position: 'absolute', top: y, width: 1080, display: 'flex', justifyContent: 'center', transform: `scale(${0.85 + 0.15 * pop})`}}>
      <div style={{fontFamily: 'DejaVu Sans', fontWeight: 900, fontSize: 84, textAlign: 'center', lineHeight: 1.1, maxWidth: 960, textTransform: 'uppercase'}}>
        {c.words.map((w, i) => (
          <span key={i} style={{color: g >= fr(w.start) - 1 ? '#ffd23f' : '#fff', WebkitTextStroke: '14px #1b1b2f', paintOrder: 'stroke fill', marginRight: 22, display: 'inline-block'}}>
            {w.text.replace(/[“”"¡!]/g, '')}
          </span>
        ))}
      </div>
    </div>
  );
};

const EXTRA = 66;
const Suscribete: React.FC<{g: number; total: number}> = ({g, total}) => {
  const f = g - (total - EXTRA - 6);
  if (f < 0) return null;
  const entra = spring({frame: f, fps: FPS, config: {damping: 11}});
  const clic = 26, hecho = f >= clic;
  const mano = interpolate(f, [6, clic - 2], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const aprieta = f >= clic - 2 && f < clic + 3 ? 0.92 : 1;
  const campana = hecho ? Math.sin((f - clic) * 0.9) * 18 * Math.max(0, 1 - (f - clic) / 24) : 0;
  return (
    <AbsoluteFill style={{backgroundColor: `rgba(10,12,30,${0.55 * entra})`}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540,1290) scale(${entra})`}>
          <text y={0} fontSize={58} fontWeight={900} textAnchor="middle" fill="#7dffb2" stroke={INK} strokeWidth={10} paintOrder="stroke" fontFamily="DejaVu Sans">👽 EXPEDIENTE OVNI MONITO</text>
        </g>
        <g transform={`translate(540,1460) scale(${entra * aprieta})`}>
          <rect x={-330} y={-95} width={660} height={190} rx={95} fill={hecho ? '#9aa0a6' : '#e62117'} stroke={INK} strokeWidth={10} />
          <text x={-40} y={30} fontSize={76} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="DejaVu Sans">{hecho ? 'SUSCRITO' : 'SUSCRÍBETE'}</text>
          <g transform={`translate(240,0) rotate(${campana})`}>
            <path d="M -38 22 Q -40 -40 0 -46 Q 40 -40 38 22 L 48 34 L -48 34 Z" fill="#ffd23f" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <circle cx={0} cy={44} r={10} fill="#ffd23f" stroke={INK} strokeWidth={5} />
          </g>
        </g>
        {f > 4 && (
          <g transform={`translate(${600 + 300 * mano},${1540 + 300 * mano}) scale(${aprieta})`} opacity={f > clic + 18 ? Math.max(0, 1 - (f - clic - 18) / 8) : 1}>
            <path d="M 0 0 L 0 -90 Q 0 -110 20 -110 Q 40 -110 40 -90 L 40 -40 L 90 -30 Q 115 -24 112 0 L 100 70 Q 96 92 72 92 L 20 92 Q 0 92 -10 76 L -46 18 Q -56 0 -38 -8 Q -20 -14 0 0 Z" fill="#ffe2c2" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- el video ----------
export const Episodio: React.FC<{ep: ReturnType<typeof prepararEpisodio>}> = ({ep}) => {
  const g = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {beats, fr, def, voz} = ep;
  let i = 0;
  for (let k = 0; k < beats.length; k++) if (g >= beats[k].desde) i = k;
  const b = beats[i];
  const end = i + 1 < beats.length ? beats[i + 1].desde : durationInFrames;
  const f = g - b.desde;
  const C = ESCENA[b.s] ?? ESCENA.escena;
  const pop = 1 + 0.06 * (1 - spring({frame: f, fps: FPS, config: {damping: 16, stiffness: 200}}));
  const ch = React.useMemo(() => chunks(voz.palabras), [voz]);
  const ctx: Ctx = {f, g, dur: end - b.desde, b, fr, num: def.num, hook: def.hook};
  const enSvg = b.s !== 'split';
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Audio src={staticFile(`${def.id}.wav`)} />
      <Sequence from={durationInFrames - EXTRA - 6 + 26}><Audio src={staticFile('ding.wav')} /></Sequence>
      <AbsoluteFill style={{transform: `scale(${pop})`}}>
        {enSvg ? <svg width={1080} height={1920} viewBox="0 0 1080 1920"><C c={ctx} /></svg> : <C c={ctx} />}
      </AbsoluteFill>
      {b.s !== 'cierre' && <Subs g={g} y={b.subY ?? SUB_Y[b.s] ?? 1180} ch={ch} fr={fr} />}
      <Suscribete g={g} total={durationInFrames} />
    </AbsoluteFill>
  );
};
