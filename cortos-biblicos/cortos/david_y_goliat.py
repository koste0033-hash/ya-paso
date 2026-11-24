"""
Corto: David y Goliat (1 Samuel 17) — ~46 segundos.

Guion (lo que aparece en pantalla):
  0.0s  Un gigante de casi 3 metros…  …y nadie se atrevía a enfrentarlo.
  5.5s  Durante 40 días desafió al ejército de Israel. / Todos tenían miedo.
 13.0s  Entonces llegó David, un joven pastor. / Sin armadura… solo una honda y 5 piedras lisas.
 21.0s  «Tú vienes a mí con espada y lanza y jabalina; mas yo vengo a ti en el
         nombre de Jehová de los ejércitos.» — 1 Samuel 17:45
 29.0s  Una sola piedra… / ¡y el gigante cayó!
 36.5s  Tu gigante puede ser el miedo, una enfermedad o una deuda… / …pero no es más grande que tu Dios.
 42.5s  Escribe AMÉN si lo crees / Sígueme para más historias de la Biblia
"""
import math
import random

from motor import *  # noqa: F401,F403

TITULO = "David y Goliat"
DURACION = 46.5

# ------------------------------------------------------------ figuras
GOLIAT_GANCHO = persona(1450, "guerrero", casco=True, lanza=True, escudo=True)
GOLIAT_VALLE = persona(800, "guerrero", casco=True, lanza=True, escudo=True)
GOLIAT = persona(700, "guerrero", casco=True, lanza=True, escudo=True)
GOLIAT_CAE = persona(700, "guerrero", casco=True, escudo=True)  # suelta la lanza al caer
SOLDADO = persona(165, "guerrero", casco=True, lanza=True)
DAVID_RIO = persona(400, "pastor", color=(40, 28, 24), baston=True)
DAVID = persona(300, "pastor")
DAVID_HONDA = persona(300, "pastor", brazo_arriba=True)
DAVID_VICTORIA = persona(210, "pastor", brazos_arriba=True)

POS_GOLIAT = (880, 1515)
POS_DAVID = (130, 1505)

ceniza = Polvo(70, 1, (255, 130, 90), tam=(1.5, 4), vel=(10, 45))
polvo_tarde = Polvo(40, 2, (255, 200, 150), tam=(1.5, 3.5), vel=(5, 20), alfa=(40, 120))
polvo_dorado = Polvo(90, 3, (255, 220, 140), tam=(1.5, 5), vel=(20, 70), parpadeo=0.6)
estrellas = Polvo(110, 4, (255, 255, 255), tam=(1, 2.6), vel=(0, 0), area=(0, 0, W, 1100),
                  vaiven=0, parpadeo=0.8, alfa=(120, 255))


# ------------------------------------------------------------ escenas
def escena_gancho(t):
    img = fondo([(0, (10, 0, 6)), (0.5, (85, 8, 16)), (0.78, (170, 45, 22)), (1, (20, 5, 5))])
    pegar_centro(img, resplandor(750, (255, 90, 40), 0.8), W / 2, 1250)
    colinas(img, 1560, 50, (40, 8, 10), 11)
    sube = (1 - salida(prog(t, 0, 4.8))) * 380
    pegar_figura(img, GOLIAT_GANCHO, W / 2 + 30, 1790 + sube)
    colinas(img, 1700, 25, SILUETA, 12)
    ceniza.dibujar(img, t)
    rayo = max(pulso(t, 0.25, 0.05), 0.6 * pulso(t, 0.45, 0.04), 0.9 * pulso(t, 2.85, 0.05))
    return destello(img, rayo * 0.55, (225, 215, 255))


def escena_valle(t):
    img = fondo([(0, (40, 20, 70)), (0.45, (195, 85, 70)), (0.6, (250, 170, 95)), (1, (30, 15, 30))])
    pan = mezcla(0, -60, suave(prog(t, 5.5, 13.5)))
    sol(img, W / 2 + pan * 0.3, 1120, 70)
    colinas(img, 1180, 45, (110, 45, 60), 21, pan * 0.4)
    colinas(img, 1330, 70, (60, 25, 42), 22, pan * 0.7)
    pegar_figura(img, GOLIAT_VALLE, 290 + pan, 1450)
    miedo = 2.8 if t > 9.6 else 0.8
    for i in range(9):
        x = 640 + i * 50 + (i % 2) * 18 + pan * 1.2
        y = 1475 + (i % 2) * 28
        x += math.sin(t * 43 + i * 1.7) * miedo
        pegar_figura(img, SOLDADO, x, y)
    colinas(img, 1500, 22, SILUETA, 23, pan)
    polvo_tarde.dibujar(img, t)
    return img


def escena_rio(t):
    img = fondo([(0, (105, 165, 220)), (0.48, (250, 215, 160)), (0.6, (255, 192, 125)), (1, (55, 75, 45))])
    sol(img, 800, 1030, 65, halo=(255, 200, 120), fuerza_halo=0.7)
    colinas(img, 1110, 50, (125, 135, 110), 31)
    colinas(img, 1230, 40, (78, 98, 62), 32)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 1290, W, H], fill=(62, 84, 46))
    d.rectangle([0, 1440, W, 1580], fill=(78, 138, 178))
    for k in range(16):
        x = (k * 97 + (t - 13) * 55) % (W + 200) - 100
        y = 1455 + (k * 37) % 110
        d.line([(x, y), (x + 50 + (k % 3) * 20, y)], fill=(175, 215, 235), width=3)
    d.rectangle([0, 1580, W, H], fill=(52, 70, 38))
    # piedras que aparecen una por una
    for i in range(5):
        ti = 16.7 + i * 0.5
        e = salida(prog(t, ti, ti + 0.3))
        if e > 0:
            x, y = 470 + i * 62, 1428 + (i % 2) * 8
            rw, rh = 22 * e, 15 * e
            d.ellipse([x - rw, y - rh, x + rw, y + rh], fill=(150, 148, 150))
            d.ellipse([x - rw * 0.5, y - rh * 0.7, x, y - rh * 0.1], fill=(205, 205, 210))
            pegar_centro(img, resplandor(40, (255, 255, 220)), x, y, (1 - prog(t, ti, ti + 0.6)) * 0.9)
    for i, (ox, oy) in enumerate([(700, 1395), (860, 1375), (600, 1345)]):
        pegar(img, oveja(95), ox - 76 + math.sin(t * 0.8 + i) * 12, oy - 95 + abs(math.sin(t * 3 + i)) * -4)
    camina = salida(prog(t, 13.0, 15.5))
    x = mezcla(-150, 330, camina)
    paso = abs(math.sin(t * 9)) * 8 * (1 - camina)
    pegar_figura(img, DAVID_RIO, x, 1425 - paso)
    return img


def _base_duelo(t):
    img = fondo([(0, (25, 10, 40)), (0.5, (165, 58, 50)), (0.68, (255, 165, 80)),
                 (0.76, (255, 210, 140)), (1, (20, 10, 20))])
    sol(img, W / 2, 1360, 120, halo=(255, 150, 70))
    rayos(img, W / 2, 1360, t, 0.55)
    colinas(img, 1420, 40, (70, 25, 35), 41)
    colinas(img, 1515, 14, SILUETA, 42)
    return img


def escena_duelo(t):
    img = _base_duelo(t)
    pegar_figura(img, GOLIAT, *POS_GOLIAT)
    pegar_figura(img, DAVID, *POS_DAVID)
    polvo_tarde.dibujar(img, t)
    return img


T_SUELTA, T_IMPACTO, T_CAE, T_SUELO = 32.0, 32.9, 33.15, 34.6


def escena_honda(t):
    img = _base_duelo(t)
    # Goliat: de pie, y después del impacto cae de cara (1 Sam 17:49)
    caida = entrada(prog(t, T_CAE, T_SUELO))
    if caida < 0.003:
        pegar_figura(img, GOLIAT, *POS_GOLIAT)
    else:
        # la lanza cae hacia atrás y Goliat hacia adelante
        xl = ancla(GOLIAT, "mano_der", *POS_GOLIAT)[0]
        a = math.radians(78 * caida)
        largo = 700 * 1.2
        ImageDraw.Draw(img).line([(xl, POS_GOLIAT[1]), (xl + math.sin(a) * largo, POS_GOLIAT[1] - math.cos(a) * largo)],
                                 fill=SILUETA, width=8)
        pegar_rotado(img, GOLIAT_CAE, *POS_GOLIAT, 80 * caida)
    # David girando la honda
    pegar_figura(img, DAVID_HONDA, *POS_DAVID)
    mano = ancla(DAVID_HONDA, "mano_der", *POS_DAVID)
    d = ImageDraw.Draw(img)
    if t < T_SUELTA:
        dt = max(0.0, t - 29.0)
        a = 2 * math.pi * (1.0 * dt + 0.55 * dt * dt)
        piedra = (mano[0] + math.cos(a) * 62, mano[1] - 8 + math.sin(a) * 20)
        d.line([mano, piedra], fill=SILUETA, width=4)
        d.ellipse([piedra[0] - 9, piedra[1] - 9, piedra[0] + 9, piedra[1] + 9], fill=SILUETA)
    elif t < T_IMPACTO:
        frente = ancla(GOLIAT, "frente", *POS_GOLIAT)
        for k in range(8):
            p = prog(t - k * 0.018, T_SUELTA, T_IMPACTO)
            x = mezcla(mano[0], frente[0], p)
            y = mezcla(mano[1], frente[1], p) - math.sin(p * math.pi) * 90
            r = 9 - k
            col = (255, 235, 190) if k else (40, 30, 30)
            d.ellipse([x - r, y - r, x + r, y + r], fill=col)
    # polvo cuando Goliat golpea el suelo
    if t > T_SUELO:
        dt = t - T_SUELO
        rnd = random.Random(5)
        capa = Image.new("RGBA", (W, H))
        dc = ImageDraw.Draw(capa)
        for _ in range(70):
            x0 = rnd.uniform(120, 900)
            vx, vy = rnd.uniform(-160, 160), rnd.uniform(-420, -120)
            x = x0 + vx * dt
            y = 1505 + vy * dt + 380 * dt * dt
            r = rnd.uniform(6, 22) * (1 + dt)
            a = int(110 * max(0, 1 - dt / 1.6))
            if y < 1530:
                dc.ellipse([x - r, y - r, x + r, y + r], fill=(215, 160, 115, a))
        capa = capa.filter(ImageFilter.GaussianBlur(7))
        img.paste(capa, (0, 0), capa)
    polvo_tarde.dibujar(img, t)
    return img


NOCHE = [(0, (8, 10, 35)), (0.6, (30, 28, 78)), (1, (12, 8, 26))]
ALBA = [(0, (40, 60, 130)), (0.5, (240, 150, 110)), (0.66, (255, 215, 150)), (1, (40, 28, 40))]


def escena_amanecer(t):
    p = suave(prog(t, 36.5, 40.5))
    img = fondo_mezcla(NOCHE, ALBA, p)
    estrellas.dibujar(img, t, 1 - p)
    y_sol = mezcla(1650, 1290, salida(prog(t, 36.5, 42)))
    sol(img, W / 2, y_sol, 110, halo=(255, 180, 90), fuerza_halo=0.4 + 0.5 * p)
    rayos(img, W / 2, 1290, t, 0.25 + 0.5 * p)
    colinas(img, 1440, 60, mezcla_color((20, 15, 40), (90, 45, 50), p), 51)
    colinas(img, 1520, 30, SILUETA, 52)
    pegar_figura(img, DAVID_VICTORIA, W / 2, 1500 + 6)
    polvo_dorado.dibujar(img, t, 0.4 + 0.6 * p)
    return img


ESCENAS = [
    (0.0, escena_gancho),
    (5.5, escena_valle),
    (13.0, escena_rio),
    (21.0, escena_duelo),
    (29.0, escena_honda),
    (36.5, escena_amanecer),
]


def post(img, t):
    img = destello(img, 0.85 * pulso(t, T_IMPACTO + 0.02, 0.07))
    sacudida = 0
    if t > T_IMPACTO:
        sacudida += 16 * math.exp(-(t - T_IMPACTO) * 6)
    if t > T_SUELO:
        sacudida += 22 * math.exp(-(t - T_SUELO) * 5)
    return temblor(img, t, sacudida)


# ------------------------------------------------------------ textos
ARRIBA = 520
TEXTOS = [
    dict(txt="DAVID  Y  GOLIAT", inicio=0.0, fin=DURACION, y=175, tam=44, color=DORADO,
         por_palabra=False, borde=4, desaparecer=0.01),
    dict(txt="Un gigante de casi *3 metros*…", inicio=0.25, fin=2.85, y=980, tam=92),
    dict(txt="…y nadie se atrevía a *enfrentarlo*.", inicio=2.85, fin=5.6, y=980, tam=88),
    dict(txt="Durante *40 días* desafió al ejército de Israel.", inicio=5.8, fin=9.6, y=ARRIBA, tam=80),
    dict(txt="Todos tenían *miedo*.", inicio=9.6, fin=13.0, y=ARRIBA, tam=90),
    dict(txt="Entonces llegó *David*, un joven pastor.", inicio=13.3, fin=16.6, y=ARRIBA, tam=80),
    dict(txt="Sin armadura… solo una honda y *5 piedras* lisas.", inicio=16.6, fin=21.0, y=ARRIBA, tam=78),
    dict(txt="«Tú vienes a mí con espada y lanza y jabalina; mas yo vengo a ti en el nombre de "
             "*Jehová de los ejércitos*.»",
         inicio=21.3, fin=28.8, y=560, tam=68, estilo="verso", color=(255, 244, 228), max_ancho=900),
    dict(txt="1 Samuel 17:45", inicio=22.5, fin=28.8, y=880, tam=42, estilo="normal", color=DORADO,
         por_palabra=False, borde=4),
    dict(txt="Una sola *piedra*…", inicio=29.2, fin=32.9, y=ARRIBA, tam=96),
    dict(txt="¡y el gigante *cayó*!", inicio=33.0, fin=36.6, y=ARRIBA, tam=110),
    dict(txt="Tu gigante puede ser el miedo, una enfermedad o una deuda…", inicio=36.8, fin=39.9,
         y=760, tam=80),
    dict(txt="…pero *no es más grande* que tu Dios.", inicio=39.9, fin=42.6, y=760, tam=92),
    dict(txt="Escribe *AMÉN* si lo crees", inicio=42.7, fin=DURACION, y=700, tam=76, max_ancho=1020, desaparecer=0.01),
    dict(txt="Sígueme para más historias de la Biblia", inicio=43.4, fin=DURACION, y=900, tam=46, max_ancho=1020,
         estilo="normal", borde=5, desaparecer=0.01),
]


# ------------------------------------------------------------ música y sonido
def audio():
    m = Mezcla(DURACION)
    acordes = [
        (0.0, 5.5, ["D2", "D3", "A3", "D4", "F4"]),
        (5.5, 9.5, ["Bb1", "Bb2", "F3", "Bb3", "D4"]),
        (9.5, 13.0, ["A1", "A2", "E3", "A3", "C#4"]),
        (13.0, 15.0, ["F2", "F3", "A3", "C4", "F4"]),
        (15.0, 17.0, ["C2", "C3", "G3", "C4", "E4"]),
        (17.0, 19.0, ["D2", "D3", "A3", "D4", "F4"]),
        (19.0, 21.0, ["Bb1", "Bb2", "F3", "Bb3", "D4"]),
        (21.0, 23.0, ["D2", "D3", "A3", "D4", "F4"]),
        (23.0, 25.0, ["Bb1", "Bb2", "F3", "Bb3", "D4"]),
        (25.0, 27.0, ["F2", "F3", "A3", "C4", "F4"]),
        (27.0, 29.0, ["A1", "A2", "E3", "A3", "C#4"]),
        (29.0, 32.9, ["D2", "D3", "A3", "D4", "F4", "A4"]),
        (36.5, 39.0, ["D2", "D3", "A3", "D4", "F#4"]),
        (39.0, 41.5, ["A1", "A2", "E3", "A3", "C#4"]),
        (41.5, 44.0, ["B1", "B2", "F#3", "B3", "D4"]),
        (44.0, 46.5, ["G1", "G2", "D3", "G3", "B3"]),
    ]
    for ini, fin, notas in acordes:
        m.pad(ini, fin, notas, vol=0.07)
    # arpegios suaves (esperanza)
    m.arpegio(13.0, 15.0, ["F4", "A4", "C5", "A4"], 0.5)
    m.arpegio(15.0, 17.0, ["C4", "E4", "G4", "E4"], 0.5)
    m.arpegio(17.0, 19.0, ["D4", "F4", "A4", "F4"], 0.5)
    m.arpegio(19.0, 21.0, ["Bb3", "D4", "F4", "D4"], 0.5)
    m.arpegio(36.5, 39.0, ["D5", "A4", "F#5", "A4"], 0.42, 0.06)
    m.arpegio(39.0, 41.5, ["C#5", "A4", "E5", "A4"], 0.42, 0.06)
    m.arpegio(41.5, 44.0, ["B4", "F#4", "D5", "F#4"], 0.42, 0.06)
    m.arpegio(44.0, 46.4, ["G4", "D5", "B4", "D5"], 0.42, 0.06)
    # efectos
    m.golpe(0.25, 1.0)
    m.golpe(2.85, 0.6)
    m.golpe(9.6, 0.4, grave=1.2)
    for i in range(5):
        m.campana(16.7 + i * 0.5, ["E6", "G6", "A6", "C7", "D7"][i], 0.05, pan=-0.4 + i * 0.2)
    m.golpe(21.0, 0.45)
    t = 29.2
    while t < T_SUELTA:
        m.tambor(t, 0.35 + 0.15 * (t - 29.2))
        t += 0.55 - 0.08 * (t - 29.2)
    m.silbido(T_SUELTA - 0.9, 1.8, 0.4)
    m.golpe(T_IMPACTO, 1.1, ruido=0.6)
    m.golpe(T_SUELO, 1.0, grave=0.8, ruido=0.5)
    m.campana(36.6, "D6", 0.08)
    m.campana(39.9, "A5", 0.12)
    m.campana(39.95, "D6", 0.08, pan=0.3)
    m.campana(42.7, "F#6", 0.09)
    return m.final()
