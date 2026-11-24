// «La Batalla de Puebla» — short completo (47.5 s), sincronizado con public/voz/voz.wav (voz original acelerada 1.25x).
// Gramática de cámara de la skill: la cámara nunca se detiene, deslizamientos smootherstep de 18-46 cuadros,
// cambio de lugar = fundido de 6 cuadros. Cada reacción cae 0-3 cuadros antes de su palabra.
//
// Palabras (cuadro = segundo original x 24): El ejército 0 · perdió 56 · mal armado 94 · y contra el lodo 136 · lodo 151 ·
// Cinco de mayo 175 · 1862 202 · Puebla 247 · Francia llega 282 · seis mil 313 · su general cree 345 · fácil 397 ·
// Atacan 430 · Loreto 468 · Una vez 503 · rechazan 526 · Dos veces 549 · rechazan 578 · Tres veces 599 · Y arriba 626 ·
// Zaragoza 669 · aguanta 685 · armas viejas 727 · empieza a llover 753 · lodo 829 · no pueden ni subir 874 ·
// Por suerte 906 · se retira 937 · quinientas 962 · Por desgracia 995 · volvió 1044 · sí tomó Puebla 1083 · Fíjate 1110 ·
// resbaladilla 1144 · dispara 1199 · Hoy el cinco de mayo 1230 · Estados Unidos 1283 · Y el general que ganó 1324 ·
// nació 1363 · Texas 1398 (fin 1413).
export const FPS = 30;
export const TOTAL = 1426;
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
const WT = WALL_TOP;

type Key = { f: number; pos: V3; look: V3; fov: number; glide?: boolean };
export type ShotDef = {
  id: number; a: number; b: number; keys: Key[]; fog: [number, number];
  /** viñeta 2D (sin 3D): "resbaladilla" o "fiesta" */
  panel?: string;
  storm?: boolean; rain?: boolean;
  lorencez?: boolean; guard?: boolean; defenders?: boolean; zaragoza?: boolean;
  /** cuadro en que los defensores alzan los fusiles y gritan */
  raiseAt?: number;
  climb?: "sol" | "lluvia"; slipAt?: number; retreat?: boolean; francia1863?: boolean; fallen?: boolean;
  /** cuadro en que Zaragoza sonríe */
  grinAt?: number;
  dof?: { cInf: number; focus?: V3 };
};
export const SHOTS: ShotDef[] = [
  // 1 · «El ejército más temido del mundo…»: el ejército francés desde arriba, nunca termina
  { id: 1, a: 0, b: 62, fog: [160, 1500], lorencez: true, guard: true, keys: [
    { f: 0, pos: [0, 46, 20], look: [0, 0, -46], fov: 56 },
    { f: 62, pos: [0, 41, 13], look: [0, 0, -46], fov: 56 },
  ] },
  // 2 · «…perdió contra un ejército mal armado»: los voluntarios de la sierra en el muro, de lado a lado
  { id: 2, a: 56, b: 140, fog: [120, 1300], defenders: true, zaragoza: true, dof: { cInf: 10 }, keys: [
    { f: 56, pos: [-14, WT + 0.9, 56.6], look: [-12.5, WT + 0.5, DEF_Z], fov: 42 },
    { f: 140, pos: [-8.5, WT + 0.9, 56.8], look: [-7, WT + 0.5, DEF_Z], fov: 42 },
  ] },
  // 3 · «…y contra el lodo»: uno resbala en el lodo, en cámara lenta
  { id: 3, a: 136, b: 177, fog: [60, 700], storm: true, rain: true, climb: "lluvia", slipAt: 140, defenders: true, zaragoza: true, fallen: true,
    dof: { cInf: 12, focus: G(SLIP.x, SLIP.z, 1.1) }, keys: [
    { f: 136, pos: G(-0.4, 44, 2.0), look: G(SLIP.x, SLIP.z, 1.1), fov: 40 },
    { f: 177, pos: G(-0.3, 44.5, 2.0), look: G(SLIP.x, SLIP.z - 0.7, 0.9), fov: 40 },
  ] },
  // 4 · «Cinco de mayo de 1862. Puebla, México.»: el cerro y el fuerte, con los franceses en primer plano
  { id: 4, a: 171, b: 282, fog: [160, 1500], lorencez: true, guard: true, defenders: true, zaragoza: true, keys: [
    { f: 171, pos: [-30, 6, -6], look: [0, 9, 70], fov: 42 },
    { f: 282, pos: [-23, 6.6, 3], look: [0, 9.5, 70], fov: 42 },
  ] },
  // 5 · «Francia llega con unos seis mil soldados»: entre sus filas y arriba
  { id: 5, a: 278, b: 352, fog: [160, 1500], lorencez: true, guard: true, raiseAt: 282, keys: [
    { f: 278, pos: [-2.7, 2.3, -1.3], look: [0.5, 1.8, -9], fov: 44 },
    { f: 290, pos: [-2.6, 2.4, -1.6], look: [0.5, 1.8, -9], fov: 44 },
    { f: 334, pos: [0, 40, 16], look: [0, 0, -40], fov: 56, glide: true },
    { f: 352, pos: [0, 40.8, 16.6], look: [0, 0, -40], fov: 56 },
  ] },
  // 6 · «…y su general cree que tomar México será fácil y rápido»: Lorencez de frente, muy confiado
  { id: 6, a: 346, b: 430, fog: [160, 1500], lorencez: true, guard: true, dof: { cInf: 14, focus: [0, 2.35, 0] }, keys: [
    { f: 346, pos: [0.3, 2.0, 5.4], look: [0, 2.3, 0], fov: 40 },
    { f: 430, pos: [0.2, 2.0, 4.2], look: [0, 2.3, 0], fov: 40 },
  ] },
  // 7 · «Atacan el cerro… Una vez… Dos veces… Tres veces.»: tres asaltos, cada uno rechazado
  { id: 7, a: 426, b: 626, fog: [140, 1400], climb: "sol", defenders: true, zaragoza: true, keys: [
    { f: 426, pos: [-34, 7, 35], look: [0, 6, 54], fov: 42 },
    { f: 626, pos: [-27, 7.6, 40], look: [0, 6.6, 55], fov: 42 },
  ] },
  // 8 · «Y arriba, el general Ignacio Zaragoza aguanta…»: subimos hasta él
  { id: 8, a: 622, b: 753, fog: [160, 1300], defenders: true, zaragoza: true, raiseAt: 684, keys: [
    { f: 622, pos: [0, 2.6, 27.5], look: G(0, WALL.z, 2.2), fov: 46 },
    { f: 668, pos: [1.2, WT + 0.95, 56.4], look: G(0, DEF_Z, 1.9), fov: 40, glide: true },
    { f: 753, pos: [0.9, WT + 0.95, 57.3], look: G(0, DEF_Z, 1.9), fov: 40 },
  ] },
  // 9 · «Entonces empieza a llover… ya no pueden ni subir.»
  { id: 9, a: 749, b: 906, fog: [60, 700], storm: true, rain: true, climb: "lluvia", slipAt: 866, defenders: true, zaragoza: true, fallen: true, keys: [
    { f: 749, pos: [-7, 3.0, 33], look: G(0, 58, 0), fov: 44 },
    { f: 840, pos: [-5.5, 3.6, 36.5], look: G(0, 58, 0.5), fov: 44 },
    { f: 872, pos: G(-0.4, 44, 2.0), look: G(SLIP.x, SLIP.z, 1.1), fov: 40, glide: true },
    { f: 906, pos: G(-0.3, 44.5, 2.0), look: G(SLIP.x, SLIP.z - 0.7, 0.9), fov: 40 },
  ] },
  // 10 · «Por suerte, Francia se retira con más de quinientas bajas.»: desde el fuerte, el ejército se va
  { id: 10, a: 902, b: 995, fog: [90, 900], storm: true, retreat: true, fallen: true, defenders: true, zaragoza: true, raiseAt: 930, keys: [
    { f: 902, pos: [3, WT + 2.4, 63.5], look: [0, 0, -25], fov: 50 },
    { f: 995, pos: [3, WT + 3.6, 65.5], look: [0, 0, -25], fov: 50 },
  ] },
  // 11 · «Por desgracia… un año después volvió, y esta vez sí tomó Puebla.»: 1863, la bandera francesa en el fuerte
  { id: 11, a: 991, b: 1110, fog: [120, 1300], defenders: true, francia1863: true, raiseAt: 1080, keys: [
    { f: 991, pos: [3.5, WT - 0.4, 53.5], look: [8.4, WT + 4.2, DEF_Z + 2.6], fov: 46 },
    { f: 1110, pos: [3.9, WT - 0.2, 55.0], look: [8.4, WT + 4.6, DEF_Z + 2.6], fov: 44 },
  ] },
  // 12 · «Fíjate: es como subir una resbaladilla mojada… mientras alguien te dispara desde arriba.» (viñeta 2D)
  { id: 12, a: 1106, b: 1230, fog: [120, 1300], panel: "resbaladilla", keys: [{ f: 1106, pos: [0, 2, 0], look: [0, 2, -1], fov: 40 }] },
  // 13 · «Hoy el cinco de mayo se celebra más en Estados Unidos que en México.» (viñeta 2D)
  { id: 13, a: 1226, b: 1326, fog: [120, 1300], panel: "fiesta", keys: [{ f: 1226, pos: [0, 2, 0], look: [0, 2, -1], fov: 40 }] },
  // 14 · «Y el general que ganó… nació en lo que hoy es Texas.»: Zaragoza de frente; sonríe en «Texas»
  { id: 14, a: 1322, b: TOTAL, fog: [160, 1300], defenders: true, zaragoza: true, grinAt: 1395, dof: { cInf: 14, focus: G(0, DEF_Z, 1.9) }, keys: [
    { f: 1322, pos: [0.7, WT + 0.95, 57.4], look: G(0, DEF_Z, 1.9), fov: 40 },
    { f: TOTAL, pos: [0.5, WT + 0.95, 58.3], look: G(0, DEF_Z, 1.9), fov: 40 },
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

// ---- cámara lenta en los dos resbalones: el reloj del mundo corre al 30 % ----
const SLOWS = [{ in0: 138, in1: 144, out0: 168, out1: 177 }, { in0: 864, in1: 870, out0: 896, out1: 906 }];
const rateAt = (f: number) => 1 - 0.7 * SLOWS.reduce((m, s) => Math.max(m, smooth((f - s.in0) / (s.in1 - s.in0)) - smooth((f - s.out0) / (s.out1 - s.out0))), 0);
const WF = (() => { const a = [0]; for (let f = 1; f <= TOTAL + 2; f++) a.push(a[f - 1] + rateAt(f - 0.5)); return a; })();
export const worldF = (f: number) => { const i = Math.max(0, Math.min(TOTAL + 1, Math.floor(f))); return WF[i] + (WF[i + 1] - WF[i]) * (f - i); };

/** desenfoque: cInf = blur al infinito (px a 1080p); focus = punto enfocado (por defecto, donde mira la cámara) */
export const dofAt = (id: number, _f: number): { cInf: number; focus?: V3 } => SHOTS[id - 1].dof ?? { cInf: 5 };

export const gait = (t: number, hz: number) => Math.floor(((((t * hz) % 1) + 1) % 1) * 8) / 8;

/** los tres asaltos de la toma 7: cuánto ha subido la columna (0 = al pie, 1 = cerca del muro) */
const WAVES = [{ go: 436, back: 524, end: 548 }, { go: 548, back: 576, end: 598 }, { go: 598, back: 626, end: 640 }];
export const assault = (f: number) => {
  for (const w of WAVES) if (f < w.end) return f < w.back ? 0.15 + 0.75 * smooth((f - w.go) / (w.back - w.go)) : 0.9 - 0.75 * smooth((f - w.back) / (w.end - w.back));
  return 0.15;
};
/** descargas de fusilería desde el muro (humo) */
export const VOLLEYS = [520, 572, 618];

// ---- cifras discretas arriba del cuadro ----
export const MARKS = [
  { shot: 4, a: 180, b: 276, label: "5 de mayo de 1862", sub: "Puebla, México", col: "#ffffff" },
  { shot: 5, a: 312, b: 348, label: "6,000", sub: "soldados franceses", col: "#ffffff" },
  { shot: 7, a: 501, b: 546, label: "1", sub: "primer ataque", col: "#ffd23f" },
  { shot: 7, a: 547, b: 597, label: "2", sub: "segundo ataque", col: "#ffd23f" },
  { shot: 7, a: 597, b: 624, label: "3", sub: "tercer ataque", col: "#ffd23f" },
  { shot: 8, a: 668, b: 748, label: "Ignacio Zaragoza", sub: "general, 33 años", col: "#ffffff" },
  { shot: 10, a: 960, b: 992, label: "+500", sub: "bajas francesas", col: "#ffd23f" },
  { shot: 11, a: 1040, b: 1106, label: "1863", sub: "Francia toma Puebla", col: "#ffffff" },
  { shot: 14, a: 1392, b: TOTAL, label: "Goliad, Texas", sub: "nació ahí en 1829 (entonces México)", col: "#ffd23f" },
];
