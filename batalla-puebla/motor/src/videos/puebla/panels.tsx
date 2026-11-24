// Viñetas 2D del short de Puebla (la comparación cotidiana y el dato de la fiesta), dibujadas en SVG con la misma
// tinta ciruela y personajes de palito con cabeza de frijol que el resto del video.
import React from "react";
import { smooth } from "./story";

const INK = "#241726";
const SKIN = "#ffe2c2";

type Hat = "kepi" | "sombrero" | "none";
const Stick: React.FC<{ x: number; y: number; s?: number; hat?: Hat; jacket?: string; pants?: string; arms?: [number, number]; legs?: [number, number]; face?: "susto" | "risa" | "normal"; rot?: number; flip?: boolean }> = ({
  x, y, s = 1, hat = "none", jacket = "#2a3a78", pants = "#c0262c", arms = [30, -30], legs = [12, -12], face = "normal", rot = 0, flip = false,
}) => {
  const limb = (x0: number, y0: number, a: number, l: number) => [x0 + l * Math.sin((a * Math.PI) / 180), y0 + l * Math.cos((a * Math.PI) / 180)];
  const [lax, lay] = limb(-30, -250, -arms[0], 120), [rax, ray] = limb(30, -250, -arms[1], 120);
  const [llx, lly] = limb(-18, -120, legs[0], 125), [rlx, rly] = limb(18, -120, legs[1], 125);
  const st = { stroke: INK, strokeWidth: 16, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -s : s},${s})`}>
      <path d={`M -18 -120 L ${llx} ${lly}`} {...st} stroke={pants} strokeWidth={22} />
      <path d={`M 18 -120 L ${rlx} ${rly}`} {...st} stroke={pants} strokeWidth={22} />
      <path d={`M -30 -250 L ${lax} ${lay}`} {...st} />
      <path d={`M 30 -250 L ${rax} ${ray}`} {...st} />
      <ellipse cx={0} cy={-190} rx={52} ry={82} fill={jacket} stroke={INK} strokeWidth={9} />
      <g transform="translate(0,-330)">
        <ellipse cx={0} cy={0} rx={62} ry={70} fill={SKIN} stroke={INK} strokeWidth={9} />
        {face === "susto" ? (
          <>
            <circle cx={-20} cy={-6} r={15} fill="#fff" stroke={INK} strokeWidth={5} /><circle cx={22} cy={-6} r={15} fill="#fff" stroke={INK} strokeWidth={5} />
            <circle cx={-20} cy={-6} r={5} fill={INK} /><circle cx={22} cy={-6} r={5} fill={INK} />
            <ellipse cx={2} cy={34} rx={11} ry={15} fill="#5a1e28" />
          </>
        ) : face === "risa" ? (
          <>
            <path d="M -32 -4 Q -20 -18 -8 -4 M 10 -4 Q 22 -18 34 -4" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M -20 18 Q 2 52 26 18 Z" fill="#5a1e28" />
          </>
        ) : (
          <>
            <circle cx={-20} cy={-6} r={7} fill={INK} /><circle cx={22} cy={-6} r={7} fill={INK} />
            <path d="M -12 26 Q 2 34 16 26" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          </>
        )}
        {hat === "kepi" && (
          <>
            <path d="M -50 -40 L -44 -100 L 44 -92 L 50 -40 Z" fill="#c0262c" stroke={INK} strokeWidth={7} />
            <rect x={-50} y={-62} width={100} height={22} fill="#22305c" />
            <path d="M -50 -40 Q 0 -26 66 -34" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
          </>
        )}
        {hat === "sombrero" && (
          <>
            <ellipse cx={0} cy={-58} rx={110} ry={22} fill="#d9b860" stroke={INK} strokeWidth={7} />
            <path d="M -40 -60 Q -40 -118 0 -118 Q 40 -118 40 -60 Z" fill="#d9b860" stroke={INK} strokeWidth={7} />
            <rect x={-40} y={-74} width={80} height={10} fill="#7a4a2a" />
          </>
        )}
      </g>
    </g>
  );
};

/** «es como subir una resbaladilla mojada… mientras alguien te dispara desde arriba» */
const Resbaladilla: React.FC<{ f: number }> = ({ f }) => {
  const lf = f - 1106;
  // el monito sube un poco y resbala hasta abajo, dos veces
  const cyc = (lf % 46) / 46, up = cyc < 0.7 ? smooth(cyc / 0.7) * 0.42 : 0.42 * (1 - smooth((cyc - 0.7) / 0.3));
  const A = [170, 1560], B = [800, 760]; // pie y cima de la resbaladilla
  const px = A[0] + (B[0] - A[0]) * (0.12 + up), py = A[1] + (B[1] - A[1]) * (0.12 + up);
  const shoot = lf >= 90; // «dispara desde arriba»
  const zoom = 1 + 0.06 * (lf / 124);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <g transform={`translate(540,1100) scale(${zoom}) translate(-540,-1100)`}>
        <rect width={1080} height={1920} fill="#8fd0ff" />
        <circle cx={160} cy={260} r={90} fill="#fff3b0" />
        <rect y={1560} width={1080} height={360} fill="#7fbf5a" />
        <rect y={1550} width={1080} height={18} fill="#5f9a40" />
        {/* escalera y plataforma */}
        <path d="M 860 760 L 900 1560 M 980 760 L 1020 1560" stroke={INK} strokeWidth={14} />
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <path key={k} d={`M ${866 + k * 5} ${860 + k * 105} L ${986 + k * 5} ${860 + k * 105}`} stroke={INK} strokeWidth={10} />)}
        <rect x={790} y={740} width={210} height={30} fill="#e24b3b" stroke={INK} strokeWidth={8} />
        {/* la resbaladilla, mojada y brillante */}
        <path d={`M ${A[0] - 60} ${A[1]} L ${B[0]} ${B[1] - 20} L ${B[0]} ${B[1] + 40} L ${A[0] + 40} ${A[1] + 10} Z`} fill="#ffcf3a" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
        {[0.15, 0.35, 0.55, 0.75].map((k, i) => (
          <path key={i} d={`M ${A[0] + (B[0] - A[0]) * k} ${A[1] + (B[1] - A[1]) * k - 6} l 90 -100`} stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.75} />
        ))}
        {Array.from({ length: 14 }).map((_, i) => {
          const k = ((i * 0.071 + lf * 0.012) % 1), x = A[0] + (B[0] - A[0]) * (1 - k), y = A[1] + (B[1] - A[1]) * (1 - k) - 10;
          return <ellipse key={i} cx={x} cy={y} rx={12} ry={7} fill="#5dade2" stroke={INK} strokeWidth={3} />;
        })}
        {/* el francés que intenta subir */}
        <Stick x={px} y={py + 10} s={0.62} hat="kepi" face={cyc < 0.7 ? "normal" : "susto"} rot={-40} arms={[120, 150]} legs={[40, -30]} />
        {/* arriba, el que dispara agua */}
        <Stick x={900} y={745} s={0.6} hat="sombrero" jacket="#f1ece0" pants="#f1ece0" face={shoot ? "risa" : "normal"} arms={[20, -110]} flip />
        <g transform="translate(828,535) rotate(-25)">
          <rect x={-70} y={-16} width={90} height={32} rx={10} fill="#3aa0ff" stroke={INK} strokeWidth={6} />
          <rect x={-30} y={14} width={22} height={40} rx={6} fill="#3aa0ff" stroke={INK} strokeWidth={6} />
        </g>
        {shoot && Array.from({ length: 9 }).map((_, i) => {
          const k = ((lf - 90) * 0.06 + i / 9) % 1;
          return <circle key={i} cx={760 - k * 420} cy={570 + k * 520} r={16 - k * 6} fill="#5dade2" stroke={INK} strokeWidth={3} />;
        })}
      </g>
    </svg>
  );
};

/** «Hoy el cinco de mayo se celebra más en Estados Unidos que en México» */
const Fiesta: React.FC<{ f: number }> = ({ f }) => {
  const lf = f - 1226;
  const topIn = smooth(lf / 8), botIn = smooth((lf - 72) / 8);
  const conf = Array.from({ length: 60 }).map((_, i) => {
    const x = (i * 97) % 1080, y = ((i * 53 + lf * (6 + (i % 5))) % 900), c = ["#e24b3b", "#2f8a4a", "#ffd23f", "#3aa0ff", "#ff7ab6"][i % 5];
    return <rect key={i} x={x} y={y} width={18} height={10} fill={c} transform={`rotate(${(i * 37 + lf * 9) % 360} ${x} ${y})`} />;
  });
  const papel = (y: number) => ["#e24b3b", "#2f8a4a", "#ffd23f", "#3aa0ff", "#ff7ab6", "#f7f3ea"].map((c, i) => (
    <path key={i} d={`M ${i * 180} ${y} l 180 0 l 0 70 l -30 -12 l -30 12 l -30 -12 l -30 12 l -30 -12 l -30 12 Z`} fill={c} stroke={INK} strokeWidth={4} />
  ));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <rect width={1080} height={1920} fill={INK} />
      {/* arriba: Estados Unidos, fiesta enorme */}
      <g opacity={topIn} transform={`translate(0,${(1 - topIn) * -60})`}>
        <rect width={1080} height={950} fill="#3b2a6e" />
        {conf}
        {papel(30)}
        <text x={540} y={250} textAnchor="middle" fontFamily="Arial Rounded MT Bold, Arial Black, DejaVu Sans, sans-serif" fontWeight={900} fontSize={84} fill="#ffd23f" stroke={INK} strokeWidth={10} paintOrder="stroke">Estados Unidos</text>
        {[150, 330, 540, 750, 930].map((x, i) => (
          <Stick key={i} x={x} y={900} s={0.82} hat={i % 2 ? "sombrero" : "none"} jacket={["#e24b3b", "#2f8a4a", "#3aa0ff", "#ff7ab6", "#ffd23f"][i]} pants="#2e3350" face="risa"
            arms={[150 + 25 * Math.sin(lf * 0.4 + i), -150 - 25 * Math.cos(lf * 0.4 + i)]} legs={[12 + 10 * Math.sin(lf * 0.5 + i), -12]} />
        ))}
      </g>
      {/* abajo: México, tranquilo (sobre todo se celebra en Puebla) */}
      <g opacity={botIn} transform={`translate(0,${(1 - botIn) * 60})`}>
        <rect y={970} width={1080} height={950} fill="#f3e3c3" />
        <text x={540} y={1150} textAnchor="middle" fontFamily="Arial Rounded MT Bold, Arial Black, DejaVu Sans, sans-serif" fontWeight={900} fontSize={84} fill="#2f8a4a" stroke={INK} strokeWidth={10} paintOrder="stroke">México</text>
        <g transform="translate(700,1520)">
          <rect x={-130} y={-170} width={260} height={250} rx={18} fill="#fff" stroke={INK} strokeWidth={9} />
          <rect x={-130} y={-170} width={260} height={70} rx={18} fill="#e24b3b" stroke={INK} strokeWidth={9} />
          <text y={-118} textAnchor="middle" fontFamily="DejaVu Sans, sans-serif" fontWeight={900} fontSize={40} fill="#fff">MAYO</text>
          <text y={40} textAnchor="middle" fontFamily="DejaVu Sans, sans-serif" fontWeight={900} fontSize={130} fill={INK}>5</text>
        </g>
        <Stick x={330} y={1820} s={0.82} hat="sombrero" jacket="#f1ece0" pants="#3b3f52" arms={[100, -100]} />
      </g>
    </svg>
  );
};

export const Panel: React.FC<{ kind: string; f: number }> = ({ kind, f }) => (kind === "fiesta" ? <Fiesta f={f} /> : <Resbaladilla f={f} />);
