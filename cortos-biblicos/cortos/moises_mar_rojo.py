"""
Corto: Moisés y el mar Rojo (Éxodo 14) — 30 segundos.

Guion (lo que aparece en pantalla):
  0.0s  Detrás, un ejército… / …delante, el mar.
  4.3s  Moisés alzó su vara sobre el mar… / …y Dios abrió el mar con un fuerte viento.
 10.0s  ¡Cruzaron en seco, entre dos muros de agua!
 13.7s  «Jehová peleará por vosotros, y vosotros estaréis tranquilos.» — Éxodo 14:14
 17.5s  Cuando no veas salida… / …Dios abre un camino.
 23.6s  Escribe AMÉN si lo crees / Sígueme para más historias de la Biblia
"""
import math
import random

from motor import *  # noqa: F401,F403

TITULO = "Moisés y el mar Rojo"
DURACION = 30.0

MOISES = persona(360, "pastor")
MOISES_VARA = persona(360, "pastor", brazo_arriba=True)
CAMINANTE = persona(260, "pastor")

rnd = random.Random(21)
PUEBLO = sorted([(rnd.uniform(20, 300), rnd.uniform(1435, 1475), rnd.choice([95, 110, 125, 140]))
                 for _ in range(22)], key=lambda p: p[1])
CAMINANTES = [(i / 14 + rnd.uniform(0, 0.03), rnd.uniform(-1, 1)) for i in range(14)]

polvo_rojo = Polvo(40, 8, (255, 150, 100), tam=(1.5, 3.5), vel=(5, 20), alfa=(40, 120))
polvo_dorado = Polvo(80, 3, (255, 222, 140), tam=(1.5, 4.5), vel=(20, 60), parpadeo=0.6)
gotas = Polvo(60, 9, (200, 230, 255), tam=(1.5, 3), vel=(-80, -30), alfa=(60, 160))

HORIZONTE = 1150


# ------------------------------------------------------------ escena 1: la orilla
def _carro(d, x, y, s, c=SILUETA):
    """Carro egipcio diminuto con caballo, mirando a la derecha."""
    d.ellipse([x + 10 * s, y - 22 * s, x + 38 * s, y - 10 * s], fill=c)          # caballo
    d.polygon([(x + 34 * s, y - 20 * s), (x + 46 * s, y - 32 * s), (x + 48 * s, y - 26 * s),
               (x + 38 * s, y - 14 * s)], fill=c)                                 # cuello y cabeza
    for k in (13, 20, 28, 35):
        d.line([(x + k * s, y - 12 * s), (x + (k + 2) * s, y)], fill=c, width=max(1, int(2 * s)))
    d.rectangle([x - 12 * s, y - 24 * s, x + 6 * s, y - 8 * s], fill=c)           # carro
    d.ellipse([x - 12 * s, y - 14 * s, x + 2 * s, y], fill=c)                     # rueda
    d.ellipse([x - 7 * s, y - 38 * s, x - 1 * s, y - 32 * s], fill=c)             # soldado
    d.rectangle([x - 7 * s, y - 32 * s, x - 1 * s, y - 24 * s], fill=c)


def escena_orilla(t):
    tormenta = prog(t, 5.5, 9.0)
    img = fondo_mezcla([(0, (30, 14, 36)), (0.4, (150, 60, 60)), (0.6, (240, 140, 80)), (1, (30, 15, 25))],
                       [(0, (14, 14, 40)), (0.4, (70, 60, 110)), (0.6, (150, 120, 150)), (1, (20, 16, 30))],
                       tormenta)
    sol(img, 820, HORIZONTE - 40, 60, halo=(255, 150, 80), fuerza_halo=0.7 * (1 - tormenta))
    d = ImageDraw.Draw(img)
    # mar (a la derecha) con olas
    d.polygon([(560, HORIZONTE), (W, HORIZONTE), (W, H), (380, H)], fill=(40, 70, 110))
    agitado = 1 + 3 * tormenta
    for k in range(40):
        y = HORIZONTE + 12 + (k * 53) % (H - HORIZONTE)
        prof = (y - HORIZONTE) / (H - HORIZONTE)
        x = 560 - prof * 180 + ((k * 131 + t * 40 * agitado) % (W - 380))
        largo = 20 + 60 * prof
        d.line([(x, y), (x + largo, y + math.sin(t * 3 * agitado + k) * 3 * agitado)],
               fill=(120, 160, 200), width=max(1, int(1 + 2 * prof)))
    # se abre el camino en el mar
    abre = salida(prog(t, 8.2, 10.0))
    if abre > 0:
        ax = 790
        izq, der = mezcla(ax, 520, abre), mezcla(ax, 960, abre)
        d.polygon([(ax - 4, HORIZONTE), (ax + 4, HORIZONTE), (der, H), (izq, H)], fill=(200, 165, 110))
        d.line([(ax, HORIZONTE), (izq, H)], fill=(230, 245, 255), width=10)
        d.line([(ax, HORIZONTE), (der, H)], fill=(230, 245, 255), width=10)
    # tierra firme (a la izquierda) con el ejército al fondo
    d.polygon([(0, HORIZONTE), (600, HORIZONTE), (420, H), (0, H)], fill=(70, 40, 40))
    pegar_centro(img, resplandor(300, (255, 110, 60), 0.8), 120, HORIZONTE - 20, 0.9)
    avance = t * 9
    for i in range(7):
        _carro(d, 10 + i * 46 + avance + (i % 2) * 12, HORIZONTE - 2 + (i % 3) * 4, 1.2, (40, 16, 18))
    for i in range(5):
        pegar_centro(img, resplandor(10, (255, 220, 120)), 30 + i * 70 + avance, HORIZONTE - 52, 0.8)
    colinas(img, 1500, 30, SILUETA, 71)
    d = ImageDraw.Draw(img)
    d.polygon([(0, 1420), (520, 1440), (440, H), (0, H)], fill=SILUETA)
    # el pueblo de Israel
    for x, y, alto in PUEBLO:
        pegar_figura(img, persona(alto, "pastor"), x, y)
    # Moisés sobre la roca
    d.polygon([(250, 1500), (300, 1420), (470, 1410), (520, 1500)], fill=SILUETA)
    if t < 4.3:
        pegar_figura(img, MOISES, 390, 1430)
    else:
        pegar_figura(img, MOISES_VARA, 390, 1430)
        hx, hy = ancla(MOISES_VARA, "mano_der", 390, 1430)
        d.line([(hx - 30, hy + 150), (hx + 22, hy - 170)], fill=SILUETA, width=9)
        pegar_centro(img, resplandor(70, (255, 240, 200)), hx + 22, hy - 170, 0.6 * prog(t, 4.3, 5.5))
    # viento
    if tormenta > 0:
        capa = Image.new("RGBA", (W, H))
        dc = ImageDraw.Draw(capa)
        for k in range(26):
            y = 300 + (k * 97) % 1200
            x = ((k * 211) + t * 900) % (W + 600) - 300
            dc.line([(x, y), (x + 220, y - 30)], fill=(255, 255, 255, int(70 * tormenta)), width=3)
        img.paste(capa, (0, 0), capa)
    polvo_rojo.dibujar(img, t, 1 - tormenta)
    return img


# ------------------------------------------------------------ escena 2: el camino entre las aguas
PF = (540, 900)          # punto de fuga
MURO = [(0, (20, 60, 110)), (0.5, (40, 110, 170)), (1, (10, 40, 80))]


def _muro(img, lado, t):
    s = -1 if lado == 0 else 1
    xb = 540 + s * 360                      # borde inferior del camino
    borde = [(PF[0] + s * 30, PF[1]), (xb, H)]
    cima = [(PF[0] + s * 30, PF[1] - 110), (540 + s * 700, 300)]
    poli = [borde[0], borde[1], (540 + s * 700, H), cima[1], cima[0]]
    mascara = Image.new("L", (W, H))
    ImageDraw.Draw(mascara).polygon(poli, fill=255)
    img.paste(fondo(MURO), (0, 0), mascara)
    capa = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(capa)
    for k in range(14):                     # ondas del agua (en perspectiva)
        f = ((k / 14 + t * 0.02) % 1)
        a = (cima[0][0], mezcla(cima[0][1], PF[1], f))
        b = (cima[1][0], mezcla(cima[1][1], H, f))
        pts = []
        for j in range(21):
            q = j / 20
            onda = math.sin(q * 14 + t * 2 + k) * 6 * q
            pts.append((mezcla(a[0], b[0], q), mezcla(a[1], b[1], q) + onda))
        d.line(pts, fill=(170, 220, 255, 55), width=2 + k % 3)
    for k in range(4):                      # peces
        fy = 0.25 + k * 0.15
        fx = ((t * (0.04 + k * 0.01) + k * 0.3) % 1)
        x = mezcla(540 + s * 80, 540 + s * 600, fx)
        y = mezcla(PF[1] - 150, 1500, fy) - fx * 300
        r = 14 + 10 * fx
        d.ellipse([x - r, y - r * 0.45, x + r, y + r * 0.45], fill=(10, 30, 60, 170))
        cola = x - s * r * -1
        d.polygon([(cola, y), (cola + s * r * 0.7, y - r * 0.5), (cola + s * r * 0.7, y + r * 0.5)],
                  fill=(10, 30, 60, 170))
    capa.putalpha(ImageChops.multiply(capa.getchannel("A"), mascara))
    img.paste(capa, (0, 0), capa)
    ImageDraw.Draw(img).line(borde, fill=(220, 240, 255), width=8)         # espuma del borde
    ImageDraw.Draw(img).line(cima, fill=(230, 245, 255), width=12)


def escena_camino(t):
    luz = suave(prog(t, 17.0, 20.5))
    img = fondo([(0, (60, 90, 160)), (0.42, (255, 190, 130)), (0.5, (255, 225, 170)), (1, (200, 160, 110))])
    sol(img, PF[0], PF[1] - 30, 70, halo=(255, 200, 120), fuerza_halo=0.6 + 0.4 * luz)
    rayos(img, PF[0], PF[1] - 30, t, 0.3 + 0.5 * luz)
    d = ImageDraw.Draw(img)
    d.polygon([(PF[0] - 30, PF[1]), (PF[0] + 30, PF[1]), (900, H), (180, H)], fill=(196, 160, 108))
    for k in range(8):                      # piedritas del fondo del mar
        f = ((k * 0.23 + t * 0.12) % 1) ** 2
        y = mezcla(PF[1], H, f)
        x = PF[0] + (k - 3.5) * 70 * f
        r = 2 + 10 * f
        d.ellipse([x - r, y - r * 0.5, x + r, y + r * 0.5], fill=(150, 118, 80))
    _muro(img, 0, t)
    _muro(img, 1, t)
    # el pueblo camina hacia la luz
    gente = []
    for s0, carril in CAMINANTES:
        s = (s0 + t * 0.035) % 1
        gente.append((s, carril))
    for s, carril in sorted(gente, reverse=True):
        esc = mezcla(1.0, 0.04, s ** 0.55)
        y = mezcla(1880, PF[1] + 4, s ** 0.55)
        x = PF[0] + carril * 230 * esc
        spr = CAMINANTE[0].resize((max(2, int(CAMINANTE[0].width * esc)), max(2, int(CAMINANTE[0].height * esc))))
        bamboleo = abs(math.sin(t * 7 + carril * 3)) * 6 * esc
        pegar(img, spr, x - spr.width / 2, y - spr.height - bamboleo, lim(0.3 + esc * 2))
    gotas.dibujar(img, t, 0.6)
    polvo_dorado.dibujar(img, t, luz)
    return img


ESCENAS = [
    (0.0, escena_orilla),
    (10.0, escena_camino),
]


def post(img, t):
    img = destello(img, 0.45 * pulso(t, 0.2, 0.06), (255, 200, 170))
    img = destello(img, 0.6 * pulso(t, 9.9, 0.12), (230, 245, 255))
    return temblor(img, t, 10 * math.exp(-(t - 8.2) * 2.5) if t > 8.2 else 0)


# ------------------------------------------------------------ textos
TEXTOS = [
    dict(txt="MOISÉS  Y  EL  MAR  ROJO", inicio=0.0, fin=DURACION, y=175, tam=44, color=DORADO,
         por_palabra=False, borde=4, desaparecer=0.01),
    dict(txt="Detrás, un *ejército*…", inicio=0.2, fin=2.2, y=700, tam=96),
    dict(txt="…delante, el *mar*.", inicio=2.2, fin=4.3, y=700, tam=110),
    dict(txt="Moisés alzó su vara sobre el mar…", inicio=4.4, fin=7.0, y=620, tam=82),
    dict(txt="…y Dios *abrió el mar* con un fuerte viento.", inicio=7.0, fin=10.0, y=620, tam=82),
    dict(txt="¡Cruzaron en *seco*, entre dos muros de agua!", inicio=10.2, fin=13.6, y=470, tam=80),
    dict(txt="«Jehová peleará por vosotros, y vosotros estaréis *tranquilos*.»", inicio=13.7, fin=17.4,
         y=470, tam=74, estilo="verso", color=(255, 244, 228), max_ancho=900),
    dict(txt="Éxodo 14:14", inicio=14.3, fin=17.4, y=690, tam=42, estilo="normal", color=DORADO,
         por_palabra=False, borde=4),
    dict(txt="Cuando no veas *salida*…", inicio=17.5, fin=20.2, y=470, tam=96),
    dict(txt="…Dios *abre un camino*.", inicio=20.2, fin=23.5, y=470, tam=100),
    dict(txt="Escribe *AMÉN* si lo crees", inicio=23.6, fin=DURACION, y=440, tam=76, max_ancho=1020,
         desaparecer=0.01),
    dict(txt="Sígueme para más historias de la Biblia", inicio=24.1, fin=DURACION, y=600, tam=46,
         max_ancho=1020, estilo="normal", borde=5, desaparecer=0.01),
]


# ------------------------------------------------------------ música y sonido
def _retumbo(m, t, dur=1.5, vol=0.5):
    n = int(dur * SR)
    r = np.random.default_rng(int(t * 100) + 7)
    s = np.convolve(r.standard_normal(n), np.ones(150) / 150, mode="same") * 10
    tt = np.arange(n) / n
    m.agregar(t, s * np.sin(np.pi * tt), vol)


def audio():
    m = Mezcla(DURACION)
    acordes = [
        (0.0, 4.3, ["D2", "D3", "A3", "D4", "F4"]),
        (4.3, 7.0, ["Bb1", "Bb2", "F3", "Bb3", "D4"]),
        (7.0, 10.0, ["C2", "C3", "G3", "C4", "E4", "G4"]),
        (10.0, 12.5, ["F2", "F3", "A3", "C4", "F4"]),
        (12.5, 15.0, ["C2", "C3", "G3", "C4", "E4"]),
        (15.0, 17.5, ["D2", "D3", "A3", "D4", "F4"]),
        (17.5, 20.2, ["Bb1", "Bb2", "F3", "Bb3", "D4"]),
        (20.2, 22.5, ["F2", "F3", "A3", "C4", "F4"]),
        (22.5, 25.0, ["C2", "C3", "G3", "C4", "E4"]),
        (25.0, 30.0, ["F2", "F3", "A3", "C4", "F4"]),
    ]
    for ini, fin, notas in acordes:
        m.pad(ini, fin, notas, vol=0.07)
    m.arpegio(10.0, 12.5, ["F4", "A4", "C5", "A4"], 0.42, 0.06)
    m.arpegio(12.5, 15.0, ["E4", "G4", "C5", "G4"], 0.42, 0.06)
    m.arpegio(15.0, 17.5, ["D4", "F4", "A4", "F4"], 0.42, 0.06)
    m.arpegio(17.5, 20.2, ["D4", "F4", "Bb4", "F4"], 0.42, 0.06)
    m.arpegio(20.2, 22.5, ["F4", "A4", "C5", "A4"], 0.42, 0.06)
    m.arpegio(22.5, 25.0, ["E4", "G4", "C5", "G4"], 0.42, 0.06)
    m.arpegio(25.0, 29.8, ["F4", "A4", "C5", "A4"], 0.42, 0.06)
    # efectos
    m.golpe(0.2, 1.0)
    _retumbo(m, 0.0, 4.5, 0.35)                     # galope del ejército
    t = 0.4
    while t < 4.2:
        m.tambor(t, 0.25)
        t += 0.33
    m.golpe(4.4, 0.45, grave=1.2)
    for k in range(4):                              # viento
        m.silbido(5.5 + k * 0.9, 2.6, 0.32)
    _retumbo(m, 8.0, 2.2, 0.6)
    m.golpe(9.9, 1.0, ruido=0.4)
    for i, nota in enumerate(["F5", "A5", "C6", "F6"]):
        m.campana(10.1 + i * 0.12, nota, 0.07, pan=-0.3 + i * 0.2)
    m.campana(20.2, "C6", 0.1)
    m.campana(23.6, "F6", 0.09)
    return m.final()
