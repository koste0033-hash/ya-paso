// «La Batalla de Puebla» — avance 3D v1 (~10 s). Tiempos provisionales: se ajustan a la voz real (palabras.json).
// Gramática de cámara de la skill: la cámara nunca se detiene, deslizamientos smootherstep de 18-46 cuadros,
// cambio de lugar = fundido de 6 cuadros.
export const FPS = 30;
export const TOTAL = 300;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };

// ---- el cerro de los fuertes: loma suave (perfil coseno) centrada en (0, HILL.zc); empieza en z = zc - rz ----
export const HILL = { zc: 85, rx: 80, rz: 45, h: 22 };
export const hillY = (x: number, z: number) => {
  const d = Math.sqrt((x / HILL.rx) ** 2 + ((z - HILL.zc) / HILL.rz) ** 2);
  return d >= 1 ? 0 : HILL.h * 0.5 * (1 + Math.cos(Math.PI * d));
};
/** punto a dy metros sobre el terreno */
const G = (x: number, z: number, dy: number): V3 => [x, hillY(x, z) + dy, z];
/** muro frontal del fuerte de Loreto y la fila de defensores detrás */
export const WALL = { z: 60, w: 50, t: 1.4 };
export const DEF_Z = 61.3;
export const WALL_TOP = hillY(0, DEF_Z) + 1.05;
/** el soldado francés que resbala */
export const SLIP = { x: 0.6, z: 48 };

type Key = { f: number; pos: V3; look: V3; fov: number; glide?: boolean };
export type ShotDef = { id: number; a: number; b: number; keys: Key[]; fog: [number, number]; rain?: boolean };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 110, fog: [120, 1500], keys: [
    { f: 0, pos: [0.25, 2.0, 4.9], look: [0, 2.3, 0], fov: 40 }, // Lorencez de frente, sus soldados detrás
    { f: 14, pos: [0.2, 2.0, 4.5], look: [0, 2.3, 0], fov: 40 },
    { f: 42, pos: [-2.7, 2.3, -1.3], look: [0.5, 1.8, -9], fov: 44, glide: true }, // pasamos frente a él, entre sus filas
    { f: 82, pos: [0, 40, 16], look: [0, 0, -40], fov: 56, glide: true }, // arriba: los 6,000
    { f: 110, pos: [0, 41, 17], look: [0, 0, -40], fov: 56 },
  ] },
  { id: 2, a: 104, b: 196, fog: [160, 1300], keys: [
    { f: 104, pos: [0, 2.2, 26], look: G(0, WALL.z, 2), fov: 46 }, // al pie del cerro, mirando el fuerte arriba
    { f: 116, pos: [0, 2.6, 27.5], look: G(0, WALL.z, 2.2), fov: 46 },
    { f: 156, pos: [1.2, WALL_TOP + 0.95, 56.4], look: G(0, DEF_Z, 1.9), fov: 40, glide: true }, // subimos hasta Zaragoza en el muro
    { f: 196, pos: [0.9, WALL_TOP + 0.95, 57.2], look: G(0, DEF_Z, 1.9), fov: 40 },
  ] },
  { id: 3, a: 190, b: TOTAL, fog: [60, 700], rain: true, keys: [
    { f: 190, pos: [-7, 3.0, 33], look: G(0, 58, 0), fov: 44 }, // lluvia: los franceses suben la ladera de lodo
    { f: 236, pos: [-5.5, 3.6, 36.5], look: G(0, 58, 0.5), fov: 44 },
    { f: 262, pos: G(-0.4, 44, 2.0), look: G(SLIP.x, SLIP.z, 1.1), fov: 40, glide: true }, // uno resbala (cámara lenta)
    { f: TOTAL, pos: G(-0.3, 44.4, 2.0), look: G(SLIP.x, SLIP.z - 0.7, 0.9), fov: 40 },
  ] },
];
export const XFADE = 6;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const camAt = (id: number, f: number) => {
  const k = SHOTS[id - 1].keys;
  if (f <= k[0].f) return { pos: k[0].pos, look: k[0].look, fov: k[0].fov };
  for (let i = 1; i < k.length; i++) if (f <= k[i].f) {
    const u = (f - k[i - 1].f) / (k[i].f - k[i - 1].f), t = k[i].glide ? smoother(u) : u;
    return { pos: lerp3(k[i - 1].pos, k[i].pos, t), look: lerp3(k[i - 1].look, k[i].look, t), fov: lerp(k[i - 1].fov, k[i].fov, t) };
  }
  const l = k[k.length - 1];
  return { pos: l.pos, look: l.look, fov: l.fov };
};

/** una o dos capas: cada toma nueva entra encima de la anterior durante XFADE cuadros */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (let i = SHOTS.length - 1; i > 0; i--) {
    const a = SHOTS[i].a;
    if (f >= a + XFADE) return [{ id: i + 1, alpha: 1 }];
    if (f >= a) return [{ id: i, alpha: 1 }, { id: i + 1, alpha: (f - a + 1) / (XFADE + 1) }];
  }
  return [{ id: 1, alpha: 1 }];
};

// ---- cámara lenta cuando el soldado resbala: el reloj del mundo corre al 25 % ----
const SLOW = { in0: 250, in1: 258, out0: 292, out1: 300, rate: 0.25 };
const rateAt = (f: number) => 1 - (1 - SLOW.rate) * (smooth((f - SLOW.in0) / (SLOW.in1 - SLOW.in0)) - smooth((f - SLOW.out0) / (SLOW.out1 - SLOW.out0)));
const WF = (() => { const a = [0]; for (let f = 1; f <= TOTAL + 2; f++) a.push(a[f - 1] + rateAt(f - 0.5)); return a; })();
export const worldF = (f: number) => { const i = Math.max(0, Math.min(TOTAL + 1, Math.floor(f))); return WF[i] + (WF[i + 1] - WF[i]) * (f - i); };

/** desenfoque: cInf = blur al infinito (px a 1080p); focus = punto enfocado (por defecto, donde mira la cámara) */
export const dofAt = (id: number, f: number): { cInf: number; focus?: V3 } => {
  if (id === 1) return f < 16 ? { cInf: 14, focus: [0, 2.35, 0] } : { cInf: lerp(10, 0, smooth((f - 30) / 30)) };
  if (id === 2) return f < 140 ? { cInf: 4 } : { cInf: 12, focus: G(0, DEF_Z, 1.9) };
  return f < 250 ? { cInf: 6 } : { cInf: 12, focus: G(SLIP.x, SLIP.z, 1.2) };
};

export const gait = (t: number, hz: number) => Math.floor(((((t * hz) % 1) + 1) % 1) * 8) / 8;

// ---- cifras discretas arriba del cuadro ----
export const MARKS = [
  { shot: 1, a: 64, b: 104, label: "6,000", sub: "soldados franceses", col: "#ffffff" },
  { shot: 2, a: 118, b: 150, label: "Puebla, 1862", sub: "Fuerte de Loreto", col: "#ffd23f" },
];
