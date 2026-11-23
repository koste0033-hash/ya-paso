// «La Batalla de Puebla» — un solo mundo three.js posado por cuadro (función pura de toma + cuadro), armado con las
// piezas de la plantilla de Alejandro: cielo pintado, materiales de dos tonos, tarjetas de personajes con sombra de
// contacto, tinta del mundo. Nuevo aquí: el cerro con el Fuerte de Loreto, defensores en el muro, el ejército francés
// (quepí rojo, casaca azul, pantalón rojo), voluntarios de la sierra con sombrero y la lluvia de la tarde.
// Franceses en z <= 0 (Lorencez a caballo en el origen); el cerro empieza en z = 40 y el muro está en z = 60.
import * as THREE from "three";
import { Pen, bodyFront, Outfit, Expr, SKINS, horseFront, rideFront } from "./toon";
import { Pool, Actor, Fx, Stage, tier, tierW, light2D, blob } from "./troop";
import { BODY, WIDE } from "./troop";
import { Crowd, atlas } from "./crowd";
import { NOINK } from "./ink";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "./lights";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { cloudHD, rep, ctex } from "./paint";
import { FPS, SHOTS, camAt, smooth, gait, worldF, hillY, HILL, WALL, DEF_Z, WALL_TOP, SLIP } from "./story";

// ---------------- luz: mañana de batalla con humo (tomas 1-2) y tormenta de la tarde (toma 3) ----------------
const BL: LightPreset = { ...LIGHTS.golden, el: 30, lit: [1.38, 1.05, 0.78], shade: [0.2, 0.19, 0.28], lift: [0.05, 0.05, 0.1],
  charTint: [1.0, 0.9, 0.78], fog: "#b8987a", sunCol: "#ffd29a", sunI: 3.0, sky: "#e0b898", ground: "#5a5040", hemiI: 0.55, actorShadow: false };
const BK: WorldLook = { ...LOOK.golden, sky: { c: ["#d6ab84", "#c59670", "#a87e66", "#7e6460", "#4e4650"], e: [0, 4, 10, 20, 40] }, sat: 0.85 };
const STORM: LightPreset = { ...BL, el: 48, lit: [0.92, 0.97, 1.06], shade: [0.3, 0.32, 0.4], lift: [0.08, 0.09, 0.12],
  charTint: [0.86, 0.92, 1.0], fog: "#6f7782", sunCol: "#c8d4e0", sunI: 1.5, sky: "#9aa4b0", ground: "#40403a", hemiI: 0.95 };
const STORMK: WorldLook = { ...BK, sky: { c: ["#7c848e", "#6c7480", "#5a626e", "#484e5a", "#363a44"], e: [0, 4, 10, 20, 40] }, sat: 0.68 };
const SMOKY = { lit: "#e2b08a", mid: "#9a7466", shade: "#56454e" };
const STORMY = { lit: "#9aa2ae", mid: "#6a7280", shade: "#3e4450" };

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const lam = (p: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(p));
const LIGHT = -2.1;

// ---------------- reparto ----------------
const FR_SKIN = [SKINS[0], SKINS[2], SKINS[0], SKINS[1]];
/** infantería francesa de línea, 1862: quepí rojo, casaca azul oscuro, pantalón rojo garance */
const french = (v: number): Outfit => ({
  jacket: "#2a3a78", pants: "#c0262c", boots: "#1d1b22", hat: "kepi", cap: "#c0262c", belt: "#f1efe6", buttons: "#e8c45a",
  rifle: true, skin: FR_SKIN[v % 4], moustache: v % 4 === 1 ? "#4a3426" : v % 4 === 3 ? "#2a201a" : undefined,
});
const MX_SKIN = [SKINS[1], SKINS[3], SKINS[2], SKINS[3]];
/** defensores: soldados de línea (casaca azul, chacó) y voluntarios de la sierra (manta blanca, sombrero, faja roja) */
const mexican = (v: number): Outfit => v % 3 === 0
  ? { jacket: "#2b3550", pants: "#efe9da", boots: "#3a2a20", hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true, skin: MX_SKIN[v % 4], moustache: v % 2 ? "#2a1d16" : undefined }
  : { jacket: "#f1ece0", pants: "#f1ece0", boots: "#6b4a2a", hat: "sombrero", cap: v % 2 ? "#d9b860" : "#c9a650", sash: "#c0353a", rifle: true, skin: MX_SKIN[(v + 1) % 4], moustache: v % 4 === 1 ? "#2a1d16" : undefined };
const LORENCEZ: Outfit = { jacket: "#22305c", pants: "#c0262c", boots: "#1d1b22", hat: "kepi", cap: "#c0262c", buttons: "#e8c45a", sash: "#e8c45a", sword: true, moustache: "#5a4632", build: "stout", skin: SKINS[0] };
const ZARAGOZA: Outfit = { jacket: "#1f2a44", pants: "#1f2a44", boots: "#1d1b22", hat: "hair", hair: "#2a1d16", buttons: "#e8c45a", sash: "#2f8a4a", sword: true, moustache: "#2a1d16", build: "stout", skin: SKINS[1] };
const HORSE = { coat: "#6a4428", mane: "#241a14", blaze: true, cloth: "#22305c" };

/** la guardia de Lorencez como tarjetas: 12 x 7 detrás de él; el resto del ejército es el bloque instanciado */
const GUARD = (() => {
  const out: { x: number; z: number; v: number; i: number }[] = [];
  let i = 0;
  for (let r = 0; r < 7; r++) for (let c = 0; c < 12; c++) {
    out.push({ x: -6.05 + c * 1.1 + (hh(i, 1) - 0.5) * 0.2, z: -3.2 - r * 1.25 + (hh(i, 2) - 0.5) * 0.2, v: (i * 7 + (i >> 3)) % 12, i }); i++;
  }
  return out;
})();
const grid = (x0: number, x1: number, z0: number, z1: number, step: number, seed: number) => {
  const out: { x: number; z: number }[] = [];
  let i = 0;
  for (let z = z0; z <= z1; z += step) for (let x = x0; x <= x1; x += step) {
    out.push({ x: x + (hh(i, seed) - 0.5) * step * 0.6, z: z + (hh(i, seed + 1) - 0.5) * step * 0.6 }); i++;
  }
  return out;
};
/** defensores en el muro: dos filas; Zaragoza al centro de la primera */
const DEFENDERS = [...Array.from({ length: 36 }, (_, k) => ({ x: -20.3 + k * 1.16, z: DEF_Z + (hh(k, 3) - 0.5) * 0.15, row: 0 })),
  ...Array.from({ length: 34 }, (_, k) => ({ x: -19.7 + k * 1.2, z: DEF_Z + 1.25 + (hh(k, 4) - 0.5) * 0.2, row: 1 }))]
  .filter((d) => !(d.row === 0 && Math.abs(d.x) < 0.9)).map((d, i) => ({ ...d, v: (i * 5 + 1) % 12, i }));
/** franceses subiendo la ladera bajo la lluvia */
const CLIMB = grid(-15, 15, 41, 55, 1.55, 17).filter((q) => Math.hypot(q.x - SLIP.x, q.z - SLIP.z) > 2.2 && !(q.z < SLIP.z + 0.5 && Math.abs(q.x - SLIP.x) < 3.8)).map((q, i) => ({ ...q, v: i % 12, i, slip: hh(i, 18) < 0.16 }));
const FALLEN = Array.from({ length: 30 }, (_, k) => ({ x: (hh(k, 70) - 0.5) * 40, z: 34 + hh(k, 71) * 18, rot: hh(k, 72) * 6.28, v: k }));
const SMOKE = [[-18, 61], [9, 62], [22, 61], [-30, 58], [0, 64], [-60, 20], [50, 30]].map(([x, z], i) => ({ x, z, i }));
const MUD = Array.from({ length: 60 }, (_, k) => ({ x: (hh(k, 80) - 0.5) * 50, z: 30 + hh(k, 81) * 26, w: 3 + hh(k, 82) * 6, rot: hh(k, 83) * 6.28 }));

const smokeDraw = (p: Pen) => {
  const g = p.g;
  for (const [x, y, r, a, c] of [[128, 140, 110, 0.55, "200,196,190"], [96, 120, 70, 0.45, "170,166,160"], [160, 110, 76, 0.45, "220,214,206"], [128, 90, 60, 0.4, "236,230,222"]] as const) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(0.6, `rgba(${c},${a * 0.6})`); gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  }
};
const mudDraw = (p: Pen) => {
  const g = p.g;
  for (let k = 0; k < 6; k++) {
    const x = 128 + Math.cos(k * 2.1) * 50, y = 128 + Math.sin(k * 1.3) * 46, r = 70 - k * 6;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(52,38,26,0.5)"); gr.addColorStop(0.6, "rgba(60,44,30,0.28)"); gr.addColorStop(1, "rgba(60,44,30,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  }
  for (let k = 0; k < 8; k++) { g.fillStyle = "rgba(190,205,220,0.55)"; g.beginPath(); g.ellipse(128 + Math.cos(k * 3.7) * 50, 128 + Math.sin(k * 2.3) * 44, 9, 4, 0, 0, 6.3); g.fill(); } // charcos
};
/** bandera mexicana de 1862 (verde, blanco, rojo, águila al centro), 3:2 */
const flagTex = () => ctex("banderaMX", 384, 256, (g) => {
  g.fillStyle = "#006847"; g.fillRect(0, 0, 128, 256);
  g.fillStyle = "#f7f3ea"; g.fillRect(128, 0, 128, 256);
  g.fillStyle = "#ce1126"; g.fillRect(256, 0, 128, 256);
  g.fillStyle = "#7a5a2a"; g.beginPath(); g.ellipse(192, 128, 30, 36, 0, 0, 6.3); g.fill();
  g.fillStyle = "#3f7a3a"; g.beginPath(); g.ellipse(192, 166, 34, 8, 0, 0, 6.3); g.fill();
});

// ---------------- lluvia: rayas que caen en una caja que rodea a la cámara ----------------
const RAIN = { n: 9000, b: 26, h: 14 };
const RAIN_VS = `
attribute vec4 aSeed; uniform float uT; uniform vec3 uCam; uniform float uPx; varying float vA;
void main() {
  float B = ${RAIN.b.toFixed(1)}, H = ${RAIN.h.toFixed(1)};
  vec3 p = position;
  p.y = uCam.y - 4.0 + mod(p.y - uT * (11.0 + 5.0 * aSeed.x), H);
  p.x += uT * 1.2;
  p.xz = uCam.xz + mod(p.xz - uCam.xz + 0.5 * B, B) - 0.5 * B;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = clamp(0.5 * uPx / max(0.1, -mv.z), 3.0, 80.0);
  vA = (0.25 + 0.35 * aSeed.y) * smoothstep(0.6, 2.0, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const RAIN_FS = `
uniform float uFade; varying float vA;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float x = d.x + d.y * 0.12;
  if (abs(x) > 0.035) discard;
  gl_FragColor = vec4(0.82, 0.88, 0.95, vA * uFade * (1.0 - abs(d.y) * 1.6));
}`;

// ---------------- mundo ----------------
export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#bccbec", 120, 1500);
  private clouds: THREE.Mesh[] = []; private stormClouds: THREE.Mesh[] = [];
  private army: Crowd; private garrison: Crowd;
  private hillMat: THREE.MeshLambertMaterial; private flag: THREE.Mesh;
  private rain = { uT: { value: 0 }, uCam: { value: new THREE.Vector3() }, uPx: { value: 1000 }, uFade: { value: 0 } };
  private sunCache = new Map<number, THREE.Vector3>();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor() {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(2400, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);
    // nubes: un anillo en el horizonte (mañana) y nubes de tormenta bajas (tarde)
    const cm = [0, 1, 2, 3].map((k) => cloudHD(k, SMOKY)), sm = [0, 1, 2, 3].map((k) => cloudHD(k, STORMY));
    const cloud = (x: number, y: number, z: number, w: number, k: number, storm: boolean) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: (storm ? sm : cm)[k % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(x, y, z); m.scale.set(w, w / 2, 1); m.layers.set(NOINK); (storm ? this.stormClouds : this.clouds).push(m); R.add(m);
    };
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2 + hh(i, 20), d = 700 + hh(i, 21) * 600;
      cloud(Math.cos(a) * d, 140 + hh(i, 22) * 300, Math.sin(a) * d, 160 + hh(i, 23) * 140, i, false);
    }
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2 + hh(i, 24), d = 160 + hh(i, 25) * 400;
      cloud(Math.cos(a) * d, 70 + hh(i, 26) * 60, 60 + Math.sin(a) * d, 180 + hh(i, 27) * 160, i, true);
    }

    // suelo: llanura de pasto seco de Puebla
    const field = ctex("campoPuebla", 512, 512, (g, r) => {
      g.fillStyle = "#8f8a52"; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 260; i++) { const x = r() * 512, y = r() * 512, rr = 6 + r() * 40, gr = g.createRadialGradient(x, y, 0, x, y, rr);
        const c = r() < 0.45 ? "92,100,52" : r() < 0.7 ? "150,128,84" : "112,92,60"; gr.addColorStop(0, `rgba(${c},0.5)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
      g.strokeStyle = "rgba(60,64,30,0.45)"; g.lineWidth = 1.5;
      for (let i = 0; i < 120; i++) { const x = r() * 512, y = r() * 512; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - 8 - r() * 8); g.stroke(); }
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000).rotateX(-Math.PI / 2), lam({ map: rep(field, 900, 900), color: "#ffffff" }));
    ground.receiveShadow = true; R.add(ground);
    // el cerro de Loreto: malla desplazada con la misma función que usa la cámara
    {
      const W = 2 * HILL.rx + 4, D = 2 * HILL.rz + 4, geo = new THREE.PlaneGeometry(W, D, 160, 100).rotateX(-Math.PI / 2), pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i) + HILL.zc; pos.setY(i, hillY(x, z) - 0.04); pos.setZ(i, z); }
      geo.computeVertexNormals();
      this.hillMat = lam({ map: rep(field, W / 6, D / 6), color: "#ffffff" });
      const hill = new THREE.Mesh(geo, this.hillMat); hill.receiveShadow = true; hill.castShadow = true; R.add(hill);
    }
    // el Fuerte de Loreto: muro de piedra con almenas, muros laterales y la bandera
    {
      const stone = lam({ color: "#d9c9a6" }), dark = lam({ color: "#b8a684" });
      const yBase = hillY(WALL.w / 2, WALL.z) - 1.2, hMain = WALL_TOP - yBase;
      const front = new THREE.Mesh(new THREE.BoxGeometry(WALL.w, hMain, WALL.t), stone);
      front.position.set(0, yBase + hMain / 2, WALL.z); front.castShadow = true; front.receiveShadow = true; R.add(front);
      for (let k = 0; k < 16; k++) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, WALL.t + 0.1), stone);
        m.position.set(-WALL.w / 2 + 1.0 + k * ((WALL.w - 2) / 15), WALL_TOP + 0.35, WALL.z); m.castShadow = true; R.add(m);
      }
      for (const s of [-1, 1]) {
        const len = 30, yb = hillY(s * WALL.w / 2, WALL.z + len / 2) - 1.5, h = WALL_TOP + 1 - yb;
        const side = new THREE.Mesh(new THREE.BoxGeometry(WALL.t, h, len), dark);
        side.position.set(s * WALL.w / 2, yb + h / 2, WALL.z + len / 2); side.castShadow = true; side.receiveShadow = true; R.add(side);
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, h + 2.5, 18), stone);
        tower.position.set(s * WALL.w / 2, yb + (h + 2.5) / 2, WALL.z); tower.castShadow = true; R.add(tower);
      }
      const chapel = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 7), stone); // la vieja capilla de Loreto dentro del fuerte
      chapel.position.set(-9, hillY(-9, 78) + 3, 78); chapel.castShadow = true; R.add(chapel);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), dark);
      dome.position.set(-9, hillY(-9, 78) + 6, 78); R.add(dome);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 7, 8), lam({ color: "#5a4632" }));
      pole.position.set(7, WALL_TOP + 2.6, DEF_Z + 2.6); R.add(pole);
      this.flag = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.8, 12, 1), new THREE.MeshLambertMaterial({ map: flagTex(), side: THREE.DoubleSide }));
      this.flag.position.set(7 + 1.38, WALL_TOP + 5.1, DEF_Z + 2.6); R.add(this.flag);
    }
    // volcanes nevados en el horizonte (Popocatépetl e Iztaccíhuatl se ven desde Puebla)
    const peakM = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
    const ROCK = new THREE.Color("#5e5566"), SNOW = new THREE.Color("#fbf6f2"), HAZE = new THREE.Color("#b8a28a");
    for (const [a, d, h, r, wide] of [[1.15, 1700, 700, 620, 0], [1.42, 1800, 560, 900, 1]] as const) {
      const geo = new THREE.ConeGeometry(r, h, 40, 12).toNonIndexed(), pos = geo.attributes.position, col: number[] = [];
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), up = (y + h / 2) / h, q = Math.atan2(z, x);
        const n = 1 + 0.08 * Math.sin(q * 5) * Math.sin(up * 9), flat = wide ? 1 + 0.6 * Math.max(0, up - 0.7) : 1;
        pos.setXYZ(i, x * n * flat, wide ? Math.min(y, h * 0.28) : y, z * n);
      }
      geo.computeVertexNormals();
      for (let i = 0; i < pos.count; i += 3) {
        const up = ((pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3 + h / 2) / h;
        const c = (up > 0.62 ? SNOW : ROCK).clone().lerp(HAZE, 0.32);
        for (let j = 0; j < 3; j++) col.push(c.r, c.g, c.b);
      }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      const m = new THREE.Mesh(geo, peakM);
      m.position.set(Math.cos(a) * d, h / 2 - 6, Math.sin(a) * d - 400);
      R.add(m);
    }
    // el ejército francés instanciado (~6,000) y la guarnición detrás del muro
    const fAt = atlas(Array.from({ length: 8 }, (_, i) => french(i)), LIGHT, (i) => (i % 2 ? { raise: 1, expr: "shout" } : { expr: "stern" }));
    this.army = new Crowd(R, fAt, grid(-38, 38, -90, -11, 1.05, 50), 2.3);
    const mAt = atlas(Array.from({ length: 8 }, (_, i) => mexican(i)), LIGHT, (i) => (i % 2 ? { raise: 1, expr: "shout" } : { expr: "stern" }));
    this.garrison = new Crowd(R, mAt, grid(-20, 20, DEF_Z + 3.2, 80, 1.3, 60).map((q) => ({ ...q, y: hillY(q.x, q.z) })), 3.3);
    // lluvia
    {
      const N = RAIN.n, pos = new Float32Array(N * 3), sd = new Float32Array(N * 4);
      for (let i = 0; i < N; i++) {
        pos.set([hh(i, 90) * RAIN.b, hh(i, 91) * RAIN.h, hh(i, 92) * RAIN.b], i * 3);
        sd.set([hh(i, 93), hh(i, 94), hh(i, 95), hh(i, 96)], i * 4);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("aSeed", new THREE.BufferAttribute(sd, 4));
      const mat = new THREE.ShaderMaterial({ uniforms: this.rain, transparent: true, depthWrite: false, vertexShader: RAIN_VS, fragmentShader: RAIN_FS });
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false; pts.layers.set(NOINK); pts.renderOrder = 5;
      const u = this.rain.uPx;
      pts.onBeforeRender = (r, _s, c) => { const rt = r.getRenderTarget(), h = rt ? rt.height : r.domElement.height; u.value = h / (2 * Math.tan(THREE.MathUtils.degToRad((c as THREE.PerspectiveCamera).fov) / 2)); };
      R.add(pts);
    }
  }

  /** sol fijo por toma, relativo a la dirección media de la cámara */
  private shotSun(id: number) {
    let v = this.sunCache.get(id);
    if (v) return v;
    const s = SHOTS[id - 1], L = s.rain ? STORM : BL;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) { const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(id === 1 ? 70 : id === 2 ? 115 : -60), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const S = SHOTS[id - 1], storm = !!S.rain;
    const fw = worldF(f), t = fw / FPS, L = storm ? STORM : BL, K = storm ? STORMK : BK;
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
    cam.fov = c.fov; cam.near = c.pos[1] > 30 ? 1 : 0.2; cam.far = 5000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const focus = V(...c.look), dist = cam.position.distanceTo(focus), sunDir = this.shotSun(id);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 120);
    this.sun.position.copy(focus).addScaledVector(sunDir, 300); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 700; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce);
    TONE.uSat.value = storm ? 0.7 : 0.82;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color);
    const up = smooth((c.pos[1] - 5) / 300);
    this.fog.near = THREE.MathUtils.lerp(storm ? 40 : 70, S.fog[0], up); this.fog.far = THREE.MathUtils.lerp(storm ? 520 : 1100, S.fog[1], up);
    scene.fog = this.fog; scene.background = null;
    for (const m of this.clouds) { m.visible = !storm; m.quaternion.copy(cam.quaternion); }
    for (const m of this.stormClouds) { m.visible = storm; m.quaternion.copy(cam.quaternion); }
    this.hillMat.color.set(storm ? "#9a8c78" : "#ffffff"); // con la lluvia el cerro se vuelve lodo
    this.rain.uT.value = t; this.rain.uCam.value.copy(cam.position); this.rain.uFade.value = storm ? 1 : 0;
    // la bandera ondea
    { const pos = (this.flag.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) + 1.35; pos.setZ(i, Math.sin(x * 2.2 - t * 7) * 0.18 * x / 2.7); }
      pos.needsUpdate = true; }

    // ---- reparto ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const light = light2D(sunDir, right);
    const st: Stage = { places: [], fx: [] };
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const lidAt = (i: number) => {
      let s = Math.round(-60 * hh(i, 9));
      for (let n = 0; s <= f && n < 80; n++) { const k = f - s; if (k >= 0 && k < 4) return [0.5, 1, 1, 0.5][k]; s += Math.round(15 + 54 * hh(i * 31 + n, 13)); }
      return 0;
    };
    const visible = (x: number, y: number, z: number, r: number) => this.frustum.intersectsSphere(this.sph.set(this.v.set(x, y, z), r));
    const person = (who: string, o: Outfit, x: number, y: number, z: number, opts: Parameters<typeof bodyFront>[2], i: number, contact = true) => {
      if (!visible(x, y + 1.1, z, 3.5)) return;
      const d = cam.position.distanceTo(this.v.set(x, y + 1.2, z)), [w, h, k] = tier(d), near = d < 16;
      const o2 = { ...opts, light, seed: (i * 5 + 3) % 7 + 1, blink: near ? lidAt(i) : 0 };
      if (!near) o2.expr = "neutral";
      st.places.push({ key: `${who}|${JSON.stringify(o2)}`, x, y, z, size: [w, h, k], draw: (p) => bodyFront(p, o, o2) });
      if (contact && d < 60) blob(st, sunDir, x, y, z);
    };
    const side = (key: string, x: number, z: number, scale: number, draw: (p: Pen) => void, dir = -1) => {
      if (!visible(x, 1.5 * scale, z, 5 * scale)) return;
      const d = cam.position.distanceTo(this.v.set(x, 1.4 * scale, z)) / scale, [w, h, k] = tierW(d);
      const mirror = dir !== 0 && dir * right.z < 0;
      st.places.push({ key: `${key}|${w}`, x, y: 0, z, size: [w, h, k], wide: true, scale, mirror, draw });
      if (d * scale < 80) { blob(st, sunDir, x - 1.0 * scale, 0, z, 1.6 * scale); blob(st, sunDir, x + 1.0 * scale, 0, z, 1.6 * scale); }
    };

    if (id === 1) {
      // Lorencez a caballo, confiado; su guardia alza los fusiles y grita cuando pasamos (la primera fila primero)
      const rear = Math.round(16 * (smooth(f / 14) - smooth((f - 34) / 16)));
      const ao = { expr: "grin" as Expr, light, seed: 3, blink: lidAt(1), look: 0, prop: ["sword", 0.2] as ["sword", number] };
      side(`lorencez|${rear}|${JSON.stringify(ao)}`, 0, 0, 1, (p) => { horseFront(p, HORSE, 1000, () => rideFront(p, LORENCEZ, 1000, rear, ao, 1.1, false), rear, -1); }, 0);
      for (const s of GUARD) {
        const r0 = 6 + ((-3.2 - s.z) / 1.25) * 2.2 + hh(s.i, 21) * 7;
        const upk = Math.round(6 * smooth((f - r0) / 9)) / 6;
        person(`f${s.v}`, french(s.v), s.x, 0, s.z, { mode: "stand", expr: upk > 0.5 ? "shout" : s.i % 3 === 0 ? "neutral" : "stern", facing: 0, raise: upk }, s.i + 10);
      }
    }
    // Zaragoza y los defensores en el muro (se ven en las tomas 2 y 3)
    if (id >= 2) {
      const zo = { mode: "stand" as const, expr: "stern" as Expr, facing: 0 as const, prop: ["sword", f > 160 && id === 2 ? 0 : 0.6] as ["sword", number] };
      person("zaragoza", ZARAGOZA, 0, hillY(0, DEF_Z), DEF_Z, zo, 1, false);
      for (const d of DEFENDERS) {
        const r0 = 150 + Math.abs(d.x) * 1.2 + hh(d.i, 22) * 6;
        const upk = id === 2 ? Math.round(6 * smooth((f - r0) / 9)) / 6 : 0.4 + 0.4 * Math.sin(t * 3 + d.i);
        person(`mx${d.v}`, mexican(d.v), d.x, hillY(d.x, d.z), d.z, { mode: "stand", expr: upk > 0.5 ? "shout" : "stern", facing: 0, raise: upk }, d.i + 2000, false);
      }
    }
    if (id === 3) {
      // los franceses suben resbalando; uno se cae en cámara lenta
      for (const q of CLIMB) {
        const slide = q.slip ? 0.6 * (1 - Math.cos(t * 2 + q.i)) : 0, z = q.z - slide;
        person(`fc${q.v}|${q.slip}`, french(q.v), q.x, hillY(q.x, z), z,
          q.slip ? { mode: "fall", expr: "shock", facing: 0 } : { mode: "march", phase: gait(t, 0.55), expr: "nervous", facing: 0, lift: 30 }, q.i + 3000);
      }
      const k = smooth((f - 256) / 26), z = SLIP.z - 1.4 * k;
      person("slip", french(2), SLIP.x, hillY(SLIP.x, z) + 0.25 * Math.sin(Math.PI * k), z,
        k < 0.15 ? { mode: "march", phase: gait(t, 0.55), expr: "nervous", facing: 0, lift: 30 } : { mode: "fall", expr: "shock", facing: 0, tilt: -0.5 * k }, 7);
    }

    // el campo de batalla
    if (id === 3) for (const b of FALLEN) {
      const o = french(b.v);
      st.fx.push({ key: `caido|${b.v % 6}`, cw: 300, ch: 500, draw: (p) => { p.g.scale(0.5, 0.5); bodyFront(p, o, { mode: "fall", expr: "dazed", light: LIGHT, seed: (b.v % 7) + 1 }); }, x: b.x, y: hillY(b.x, b.z) + 0.03, z: b.z, w: 1.3, h: 2.16, flat: true, rot: b.rot });
    }
    if (id === 3) for (const m of MUD) st.fx.push({ key: "lodo", cw: 256, ch: 256, draw: mudDraw, x: m.x, y: hillY(m.x, m.z) + 0.05, z: m.z, w: m.w, h: m.w * 0.8, flat: true, rot: m.rot, soft: true });
    for (const sm of SMOKE) for (let k = 0; k < 5; k++) {
      const u = (t * 0.09 + k / 5 + sm.i * 0.13) % 1, sz = 3 + u * 12, y0 = hillY(sm.x, sm.z) + 1.5;
      if (cam.position.distanceTo(this.v.set(sm.x - u * 10, y0 + u * 22, sm.z + u * 3)) < sz * 1.6) continue;
      st.fx.push({ key: "humo", cw: 256, ch: 256, draw: smokeDraw, x: sm.x - u * 10, y: y0 + u * 22, z: sm.z + u * 3, w: sz, h: sz, soft: true });
    }

    let ai = 0;
    for (const p of st.places) {
      const a = this.actor(ai++), [w, h, k] = p.size, s = p.scale ?? 1;
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.geometry = p.wide ? WIDE : BODY;
      a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0);
      a.mesh.scale.set(p.mirror ? -s : s, s, s);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    for (const p of st.fx) {
      if (!visible(p.x, p.y, p.z, Math.max(p.w, p.h))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft); e.mesh.visible = true; e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else {
        const yaw = Math.atan2(cam.position.x - p.x, cam.position.z - p.z);
        e.mesh.rotation.order = "YXZ"; e.mesh.rotation.set(0, yaw, p.lean ?? 0);
        if (p.soft) e.mesh.quaternion.copy(cam.quaternion);
      }
      e.mesh.scale.set(p.w, p.h, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (let i = 0; i < ai; i++) this.actors[i].bind();
    for (let i = 0; i < fi; i++) this.fxs[i].bind();
    return focus;
  }
}
