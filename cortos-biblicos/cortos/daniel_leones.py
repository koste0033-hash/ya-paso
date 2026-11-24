"""
Corto: Daniel en el foso de los leones (Daniel 6) — ~49 segundos.

Guion (lo que aparece en pantalla):
  0.0s  Lo echaron a un foso de leones… / …por orar.
  5.5s  El rey firmó una ley: durante 30 días solo se podía orar al rey. / El que desobedeciera… ¡a los leones!
 13.0s  Pero Daniel abrió su ventana y oró a Dios 3 veces al día, como siempre. / Sus enemigos lo espiaban… y lo acusaron.
 21.0s  Lo arrojaron al foso… / …y sellaron la entrada con una piedra.
 29.0s  Pero Dios no lo abandonó… / «Mi Dios envió su ángel, el cual cerró la boca de los leones» — Daniel 6:22
 37.0s  Al amanecer, el rey corrió al foso… ¡Daniel estaba vivo! / Ninguna herida… porque confió en su Dios.
 43.0s  Si Dios cerró la boca de los leones, puede cuidarte a ti. / Escribe AMÉN si lo crees
"""
import functools
import math
import random

from PIL import ImageOps

from motor import *  # noqa: F401,F403

TITULO = "Daniel en el foso de los leones"
DURACION = 49.0

SOMBRA_LEON = (30, 20, 16)
OJO = (255, 214, 90)


# ------------------------------------------------------------ figuras propias
@functools.lru_cache(16)
def leon(largo, dormido=False, color=SILUETA, izquierda=False):
    """Silueta de león de perfil. Devuelve (sprite, anclas) con los pies abajo al centro."""
    S = 2
    L = largo * S
    w, h = int(L * 1.3), int(L * 0.75)
    img = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(img)
    c = tuple(color) + (255,)
    baja = 0.17 if dormido else 0.0       # dormido: todo más cerca del suelo

    def P(x, y):
        return (x * L, (y + baja) * L)

    # cola
    d.line([P(0.14, 0.35), P(0.05, 0.3), P(0.03, 0.2) if not dormido else P(0.0, 0.45)],
           fill=c, width=int(0.03 * L), joint="curve")
    tx, ty = (0.03, 0.2) if not dormido else (0.0, 0.45)
    d.ellipse([*P(tx - 0.035, ty - 0.035), *P(tx + 0.035, ty + 0.035)], fill=c)
    # patas
    if dormido:
        d.ellipse([*P(0.8, 0.45), *P(1.22, 0.55)], fill=c)            # patas delanteras estiradas
        d.ellipse([*P(0.12, 0.4), *P(0.42, 0.55)], fill=c)            # pata trasera
    else:
        for x in (0.2, 0.33, 0.68, 0.8):
            d.rectangle([*P(x, 0.4), *P(x + 0.075, 0.69)], fill=c)
            d.ellipse([*P(x - 0.01, 0.66), *P(x + 0.1, 0.72)], fill=c)
    # cuerpo
    d.ellipse([*P(0.12, 0.22), *P(0.88, 0.52 if not dormido else 0.5)], fill=c)
    # melena con picos
    mx, my = (0.88, 0.27) if not dormido else (0.9, 0.3)
    pts = []
    for i in range(28):
        a = 2 * math.pi * i / 28
        r = 0.2 if i % 2 == 0 else 0.178
        pts.append(P(mx + math.cos(a) * r, my + math.sin(a) * r * 0.95))
    d.polygon(pts, fill=c)
    # cabeza y hocico
    hx, hy = (mx + 0.1, my + 0.03) if not dormido else (mx + 0.12, my + 0.08)
    d.ellipse([*P(hx - 0.1, hy - 0.1), *P(hx + 0.1, hy + 0.1)], fill=c)
    d.ellipse([*P(hx + 0.02, hy - 0.02), *P(hx + 0.17, hy + 0.09)], fill=c)
    sprite = img.resize((w // S, h // S), Image.LANCZOS)
    ojo = ((hx + 0.04) * largo, (hy - 0.035 + baja) * largo)
    if izquierda:
        sprite = ImageOps.mirror(sprite)
        ojo = (sprite.width - ojo[0], ojo[1])
    return sprite, {"ojo": ojo, "pies": (sprite.width / 2, sprite.height)}


@functools.lru_cache(4)
def orando(alto, color=SILUETA):
    """Daniel de rodillas, con las manos levantadas, mirando a la derecha."""
    S = 2
    u = alto * S
    w, h = int(alto * 0.85) * S, int(alto) * S
    img = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(img)
    c = tuple(color) + (255,)

    def P(x, y):
        return (x * u, y * u)

    d.ellipse([*P(0.36, 0.03), *P(0.54, 0.21)], fill=c)                                   # cabeza
    d.polygon([P(0.28, 0.2), P(0.5, 0.2), P(0.56, 0.55), P(0.8, 0.84), P(0.8, 1.0),
               P(0.08, 1.0), P(0.1, 0.86), P(0.24, 0.62)], fill=c)                        # túnica
    d.ellipse([*P(0.26, 0.16), *P(0.52, 0.3)], fill=c)                                    # hombros
    d.line([P(0.46, 0.27), P(0.66, 0.1)], fill=c, width=int(0.07 * u), joint="curve")     # brazos
    d.ellipse([*P(0.62, 0.04), *P(0.72, 0.14)], fill=c)                                   # manos
    return img.resize((w // S, h // S), Image.LANCZOS)


def pegar_leon(img, fig, x, y, opacidad=1.0, ojos=0.0, t=0.0, fase=0.0):
    pegar_figura(img, fig, x, y, opacidad)
    if ojos > 0.01:
        parpadeo = 0.15 if (t * 0.6 + fase) % 3.1 < 0.12 else 1.0
        ox, oy = ancla(fig, "ojo", x, y)
        pegar_centro(img, resplandor(26, OJO), ox, oy, ojos * parpadeo)
        r = 4 * parpadeo
        ImageDraw.Draw(img).ellipse([ox - 5, oy - r, ox + 5, oy + r], fill=(255, 240, 170))


LEON = leon(300, color=SOMBRA_LEON)
LEON_I = leon(300, color=SOMBRA_LEON, izquierda=True)
LEON_G = leon(340, color=SILUETA)
LEON_GI = leon(340, color=SILUETA, izquierda=True)
LEON_D = leon(300, dormido=True, color=SOMBRA_LEON)
LEON_DI = leon(300, dormido=True, color=SOMBRA_LEON, izquierda=True)
LEON_GD = leon(340, dormido=True, color=SILUETA)
LEON_GDI = leon(340, dormido=True, color=SILUETA, izquierda=True)

REY = persona(900, "pastor", corona=True)
DANIEL = persona(330, "pastor")
DANIEL_ALABA = persona(330, "pastor", brazos_arriba=True)
ESPIA = persona(520, "pastor", color=(8, 6, 10))
DANIEL_ORA = orando(380, (20, 14, 16))

estrellas = Polvo(120, 4, (255, 255, 255), tam=(1, 2.6), vel=(0, 0), area=(0, 0, W, 900),
                  vaiven=0, parpadeo=0.8, alfa=(120, 255))
polvo_cueva = Polvo(40, 6, (200, 170, 140), tam=(1.5, 3), vel=(4, 15), alfa=(30, 90))
polvo_dorado = Polvo(90, 3, (255, 222, 140), tam=(1.5, 5), vel=(20, 70), parpadeo=0.6)


# ------------------------------------------------------------ escenas
def escena_gancho(t):
    img = fondo([(0, (6, 3, 4)), (0.5, (52, 24, 14)), (0.8, (88, 44, 22)), (1, (12, 6, 4))])
    pegar_centro(img, resplandor(700, (170, 80, 30), 0.6), W / 2, 1300)
    leones = [(220, 1180, LEON, 0.2), (860, 1250, LEON_I, 0.6), (250, 1560, LEON_G, 1.0),
              (830, 1620, LEON_GI, 1.4), (540, 900, LEON_I, 1.9), (560, 1420, LEON, 2.4)]
    for x, y, fig, ti in leones:
        aparece = suave(prog(t, ti, ti + 0.8))
        pegar_leon(img, fig, x, y, 0.95 * aparece, ojos=aparece, t=t, fase=ti)
    polvo_cueva.dibujar(img, t)
    return destello(img, 0.35 * pulso(t, 0.2, 0.06), (255, 200, 150))


CIELO_NOCHE = [(0, (6, 8, 30)), (0.45, (22, 26, 70)), (0.7, (60, 45, 80)), (1, (14, 10, 22))]


def ciudad(img, y, color, semilla):
    rnd = random.Random(semilla)
    d = ImageDraw.Draw(img)
    x = -20
    while x < W:
        ancho, alto = rnd.randint(80, 170), rnd.randint(80, 260)
        d.rectangle([x, y - alto, x + ancho, y + 400], fill=color)
        for k in range(0, ancho, 24):                    # almenas
            d.rectangle([x + k, y - alto - 16, x + k + 12, y - alto], fill=color)
        x += ancho - 4
    zx = 760                                             # zigurat de Babilonia
    for i in range(5):
        a = 300 - i * 55
        d.rectangle([zx - a / 2, y - 120 - i * 70, zx + a / 2, y - 50 - i * 70], fill=color)


def escena_palacio(t):
    img = fondo(CIELO_NOCHE)
    estrellas.dibujar(img, t)
    sol(img, 820, 330, 55, color=(240, 240, 255), halo=(120, 130, 200), fuerza_halo=0.5)
    ciudad(img, 1330, (30, 22, 45), 61)
    ciudad(img, 1450, (18, 12, 26), 62)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 1540, W, H], fill=SILUETA)
    for x in (110, 990):                                 # antorchas
        fl = 0.75 + 0.25 * math.sin(t * 17 + x) * math.sin(t * 7.3 + x)
        pegar_centro(img, resplandor(130, (255, 140, 50), 0.9), x, 1250, fl)
        d.rectangle([x - 8, 1260, x + 8, 1540], fill=SILUETA)
        pegar_centro(img, resplandor(26, (255, 230, 150)), x, 1245, fl)
    entra = salida(prog(t, 5.5, 7.5))
    x_rey = mezcla(200, 330, entra)
    pegar_figura(img, REY, x_rey, 1590)
    mx, my = ancla(REY, "mano_der", x_rey, 1590)
    rollo = salida(prog(t, 6.5, 7.5))
    if rollo > 0:
        alto = 190 * rollo
        d.rectangle([mx - 8, my - alto, mx + 140, my + 10], fill=(232, 212, 160))
        for k in range(int(5 * rollo)):
            d.line([(mx + 10, my - alto + 30 + k * 30), (mx + 120, my - alto + 30 + k * 30)],
                   fill=(130, 100, 60), width=4)
        d.ellipse([mx - 16, my - alto - 10, mx + 2, my + 20], fill=(200, 180, 130))
    # sello del rey
    if t > 8.4:
        pegar_centro(img, resplandor(50, (255, 80, 60)), mx + 70, my - 30, 1 - prog(t, 8.4, 9.4))
    return img


def _cielo_ventana(t):
    # amanecer -> mediodía -> atardecer: "3 veces al día"
    a = [(0, (250, 170, 120)), (1, (255, 220, 170))]
    b = [(0, (90, 160, 230)), (1, (200, 230, 250))]
    c = [(0, (120, 60, 120)), (1, (255, 140, 80))]
    p = prog(t, 13.0, 21.0) * 2
    if p < 1:
        return fondo_mezcla(a, b, suave(p))
    return fondo_mezcla(b, c, suave(p - 1))


@functools.lru_cache(1)
def _mascara_ventana():
    m = Image.new("L", (W, H))
    d = ImageDraw.Draw(m)
    d.rectangle([620, 900, 960, 1330], fill=255)
    d.ellipse([620, 730, 960, 1070], fill=255)
    return m


@functools.lru_cache(1)
def _luz_ventana():
    capa = Image.new("RGBA", (W, H))
    ImageDraw.Draw(capa).polygon([(620, 1330), (960, 1330), (700, 1560), (150, 1560)], fill=(255, 220, 160, 90))
    return capa.filter(ImageFilter.GaussianBlur(14))


def escena_ventana(t):
    img = fondo([(0, (28, 20, 26)), (0.7, (48, 34, 36)), (1, (20, 14, 16))])
    cielo = _cielo_ventana(t)
    # sol que cruza la ventana
    p = prog(t, 13.0, 21.0)
    sx, sy = mezcla(660, 920, p), 1150 - math.sin(p * math.pi) * 280
    sol(cielo, sx, sy, 45, halo=(255, 210, 140), fuerza_halo=0.7)
    img.paste(cielo, (0, 0), _mascara_ventana())
    d = ImageDraw.Draw(img)
    d.line([(790, 730), (790, 1330)], fill=(28, 20, 26), width=14)       # marco
    d.line([(620, 1060), (960, 1060)], fill=(28, 20, 26), width=14)
    d.rectangle([590, 1330, 990, 1360], fill=(60, 44, 44))
    d.rectangle([0, 1560, W, H], fill=(24, 16, 18))
    pegar(img, _luz_ventana(), 0, 0, 0.8 + 0.2 * math.sin(t * 2))
    pegar(img, DANIEL_ORA, 300, 1560 - DANIEL_ORA.height)
    # los enemigos espían desde la puerta
    for i, ti in enumerate((17.0, 17.5)):
        e = salida(prog(t, ti, ti + 1.0))
        if e > 0:
            pegar_figura(img, ESPIA, mezcla(-260, -60 + i * 110, e), 1600 + i * 20)
    return img


CIELO_FOSO = [(0, (8, 10, 32)), (1, (30, 30, 70))]
CIELO_ALBA = [(0, (120, 150, 220)), (1, (255, 205, 150))]


@functools.lru_cache(4)
def _haz(color, alfa):
    capa = Image.new("RGBA", (W, H))
    ImageDraw.Draw(capa).polygon([(455, 470), (625, 470), (830, 1600), (250, 1600)], fill=color + (alfa,))
    return capa.filter(ImageFilter.GaussianBlur(22))


@functools.lru_cache(2)
def _roca():
    S = 2
    w, h = 300, 140
    img = Image.new("RGBA", (w * S, h * S))
    d = ImageDraw.Draw(img)
    d.ellipse([0, 0, w * S, h * S], fill=(58, 52, 54, 255))
    d.ellipse([w * 0.25 * S, h * 0.12 * S, w * 0.6 * S, h * 0.4 * S], fill=(88, 82, 84, 255))
    return img.resize((w, h), Image.LANCZOS)


def _foso(t, cierre=0.0, dormidos=0.0, divina=0.0, alba=0.0, ojos=1.0):
    """Interior del foso visto de lado. cierre: 0 abierto – 1 sellado con la piedra."""
    img = fondo([(0, (24, 16, 14)), (0.45, (66, 44, 30)), (0.8, (96, 64, 42)), (1, (30, 20, 14))])
    cielo = fondo_mezcla(CIELO_FOSO, CIELO_ALBA, alba).crop((0, 0, W, 480))
    img.paste(cielo, (0, 0))
    if alba < 0.9:
        estrellas.dibujar(img, t, (1 - alba) * 0.8)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 395, W, 405], fill=(30, 22, 18))                          # suelo exterior
    rnd = random.Random(9)
    for x0, x1 in ((-20, 455), (625, W + 20)):                                # techo del foso
        pts = [(x0, 400), (x1, 400)]
        for x in range(int(x1), int(x0), -30):
            pts.append((x, 480 + rnd.randint(0, 40)))
        d.polygon(pts, fill=(18, 12, 10))
    for lado in (0, 1):                                                       # paredes de roca
        pts = []
        for y in range(400, 1700, 60):
            x = rnd.randint(30, 110)
            pts.append((x if lado == 0 else W - x, y))
        pts += [(0 if lado == 0 else W, 1700), (0 if lado == 0 else W, 400)]
        d.polygon(pts, fill=(16, 11, 9))
    d.rectangle([0, 1600, W, H], fill=(48, 32, 24))
    luz_luna = (1 - cierre) * (1 - alba)
    pegar(img, _haz((170, 190, 255), 70), 0, 0, luz_luna)
    pegar(img, _haz((255, 225, 150), 110), 0, 0, max(divina, alba))
    if divina > 0:
        pegar_centro(img, resplandor(520, (255, 220, 140), 0.9), 540, 1350, divina)
    # leones (de pie o echados)
    fondo_l = [(190, 1545, LEON, LEON_D, 0.3), (890, 1545, LEON_I, LEON_DI, 1.3)]
    frente_l = [(230, 1660, LEON_G, LEON_GD, 2.1), (850, 1680, LEON_GI, LEON_GDI, 0.8)]
    oscuro = 1.0

    def dibujar_leones(lista):
        for x, y, de_pie, echado, fase in lista:
            if dormidos < 1:
                pegar_leon(img, de_pie, x, y, oscuro * (1 - dormidos), ojos=ojos * (1 - dormidos) * cierre,
                           t=t, fase=fase)
            if dormidos > 0:
                pegar_figura(img, echado, x, y, oscuro * dormidos)

    dibujar_leones(fondo_l)
    return img, dibujar_leones, frente_l


def escena_foso(t):
    cae = salida(prog(t, 21.0, 22.0))
    cierre = suave(prog(t, 25.0, 26.5))
    img, leones, frente = _foso(t, cierre=cierre)
    pegar_figura(img, DANIEL, 540, mezcla(900, 1600, cae))
    leones(frente)
    x = mezcla(-200, 540, cierre)
    pegar_centro(img, _roca(), x, 435)
    polvo_cueva.dibujar(img, t)
    return img


def escena_angel(t):
    divina = suave(prog(t, 29.5, 31.0))
    dormidos = suave(prog(t, 31.5, 33.0))
    img, leones, frente = _foso(t, cierre=1.0, dormidos=dormidos, divina=divina)
    fig = DANIEL_ALABA if t > 31.0 else DANIEL
    pegar_figura(img, fig, 540, 1600)
    leones(frente)
    pegar_centro(img, _roca(), 540, 435)
    polvo_dorado.dibujar(img, t, divina * 0.8)
    return img


def escena_amanecer(t):
    abre = suave(prog(t, 37.0, 38.5))
    img, leones, frente = _foso(t, cierre=1 - abre, dormidos=1.0, divina=0.6 * (1 - abre), alba=abre)
    pegar_figura(img, DANIEL_ALABA, 540, 1600)
    leones(frente)
    pegar_centro(img, _roca(), mezcla(540, 1300, abre), 435)
    rayos(img, 540, 300, t, 0.6 * abre)
    polvo_dorado.dibujar(img, t, 0.5 + 0.5 * abre)
    return img


ESCENAS = [
    (0.0, escena_gancho),
    (5.5, escena_palacio),
    (13.0, escena_ventana),
    (21.0, escena_foso),
    (29.0, escena_angel),
    (36.8, escena_amanecer),
]


def post(img, t):
    img = destello(img, 0.5 * pulso(t, 31.0, 0.18), (255, 240, 200))
    sacudida = 0
    if t > 26.5:
        sacudida += 14 * math.exp(-(t - 26.5) * 6)
    return temblor(img, t, sacudida)


# ------------------------------------------------------------ textos
ARRIBA = 560
TEXTOS = [
    dict(txt="DANIEL  Y  LOS  LEONES", inicio=0.0, fin=DURACION, y=175, tam=44, color=DORADO,
         por_palabra=False, borde=4, desaparecer=0.01),
    dict(txt="Lo echaron a un foso de *leones*…", inicio=0.3, fin=3.0, y=980, tam=90),
    dict(txt="…por *orar*.", inicio=3.0, fin=5.6, y=980, tam=120),
    dict(txt="El rey firmó una ley: durante *30 días* solo se podía orar al rey.", inicio=5.8, fin=9.4,
         y=470, tam=74),
    dict(txt="El que desobedeciera… ¡a los *leones*!", inicio=9.4, fin=13.0, y=470, tam=84),
    dict(txt="Pero Daniel abrió su ventana y oró a Dios *3 veces al día*, como siempre.", inicio=13.3,
         fin=17.2, y=420, tam=72),
    dict(txt="Sus enemigos lo espiaban… y lo *acusaron*.", inicio=17.2, fin=21.0, y=420, tam=80),
    dict(txt="Lo arrojaron al *foso*…", inicio=21.3, fin=25.0, y=ARRIBA + 120, tam=88),
    dict(txt="…y sellaron la entrada con una *piedra*.", inicio=25.0, fin=29.0, y=ARRIBA + 120, tam=80),
    dict(txt="Pero Dios *no lo abandonó*…", inicio=29.2, fin=31.6, y=ARRIBA + 120, tam=88),
    dict(txt="«Mi Dios envió su ángel, el cual *cerró la boca de los leones*.»", inicio=31.6, fin=37.0,
         y=ARRIBA + 120, tam=74, estilo="verso", color=(255, 244, 228), max_ancho=900),
    dict(txt="Daniel 6:22", inicio=32.4, fin=37.0, y=ARRIBA + 340, tam=42, estilo="normal", color=DORADO,
         por_palabra=False, borde=4),
    dict(txt="Al amanecer, el rey corrió al foso… ¡Daniel estaba *vivo*!", inicio=37.3, fin=40.3,
         y=ARRIBA + 120, tam=80),
    dict(txt="Ninguna herida… porque *confió en su Dios*.", inicio=40.3, fin=43.2, y=ARRIBA + 120, tam=82),
    dict(txt="Si Dios cerró la boca de los leones, puede cuidarte *a ti*.", inicio=43.3, fin=46.0,
         y=ARRIBA + 120, tam=82),
    dict(txt="Escribe *AMÉN* si lo crees", inicio=46.0, fin=DURACION, y=ARRIBA + 80, tam=76,
         max_ancho=1020, desaparecer=0.01),
    dict(txt="Sígueme para más historias de la Biblia", inicio=46.5, fin=DURACION, y=ARRIBA + 270, tam=46,
         max_ancho=1020, estilo="normal", borde=5, desaparecer=0.01),
]


# ------------------------------------------------------------ música y sonido
def _rugido(m, t, vol=0.5, dur=1.6):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    rnd = np.random.default_rng(int(t * 100))
    ruido = rnd.standard_normal(n)
    grave = np.convolve(ruido, np.ones(60) / 60, mode="same") * 8
    mod = 1 + 0.6 * np.sin(2 * np.pi * 28 * tt)
    tono = np.sin(2 * np.pi * np.cumsum(75 + 20 * np.sin(tt * 3)) / SR) * 0.4
    env = np.minimum(1, tt / 0.25) * np.exp(-tt * 1.6)
    m.agregar(t, (grave * mod + tono) * env, vol)


def _retumbo(m, t, dur=1.5, vol=0.5):
    n = int(dur * SR)
    rnd = np.random.default_rng(int(t * 100) + 7)
    s = np.convolve(rnd.standard_normal(n), np.ones(150) / 150, mode="same") * 10
    tt = np.arange(n) / n
    m.agregar(t, s * np.sin(np.pi * tt), vol)


def audio():
    m = Mezcla(DURACION)
    acordes = [
        (0.0, 5.5, ["D2", "D3", "A3", "D4", "F4"]),
        (5.5, 9.4, ["G1", "G2", "D3", "G3", "Bb3"]),
        (9.4, 13.0, ["A1", "A2", "E3", "A3", "C#4"]),
        (13.0, 15.0, ["F2", "F3", "A3", "C4", "F4"]),
        (15.0, 17.0, ["C2", "C3", "G3", "C4", "E4"]),
        (17.0, 19.0, ["D2", "D3", "A3", "D4", "F4"]),
        (19.0, 21.0, ["A1", "A2", "E3", "A3", "C#4"]),
        (21.0, 25.0, ["D2", "D3", "A3", "D4", "F4"]),
        (25.0, 27.0, ["Bb1", "Bb2", "F3", "Bb3", "D4"]),
        (27.0, 29.5, ["A1", "A2", "E3", "A3", "C#4"]),
        (29.5, 31.0, ["D2", "D3", "A3", "D4"]),
        (31.0, 33.5, ["D2", "D3", "A3", "D4", "F#4", "A4"]),
        (33.5, 36.0, ["G1", "G2", "D3", "G3", "B3"]),
        (36.0, 38.5, ["D2", "D3", "A3", "D4", "F#4"]),
        (38.5, 41.0, ["A1", "A2", "E3", "A3", "C#4"]),
        (41.0, 43.5, ["B1", "B2", "F#3", "B3", "D4"]),
        (43.5, 46.0, ["G1", "G2", "D3", "G3", "B3"]),
        (46.0, 49.0, ["D2", "D3", "A3", "D4", "F#4"]),
    ]
    for ini, fin, notas in acordes:
        m.pad(ini, fin, notas, vol=0.07)
    m.arpegio(13.0, 15.0, ["F4", "A4", "C5", "A4"], 0.5)
    m.arpegio(15.0, 17.0, ["C4", "E4", "G4", "E4"], 0.5)
    m.arpegio(31.0, 33.5, ["D5", "A4", "F#5", "A4"], 0.42, 0.06)
    m.arpegio(33.5, 36.0, ["G4", "D5", "B4", "D5"], 0.42, 0.06)
    m.arpegio(36.0, 38.5, ["D5", "A4", "F#5", "A4"], 0.42, 0.06)
    m.arpegio(38.5, 41.0, ["C#5", "A4", "E5", "A4"], 0.42, 0.06)
    m.arpegio(41.0, 43.5, ["B4", "F#4", "D5", "F#4"], 0.42, 0.06)
    m.arpegio(43.5, 46.0, ["G4", "D5", "B4", "D5"], 0.42, 0.06)
    m.arpegio(46.0, 48.8, ["D5", "A4", "F#5", "A4"], 0.42, 0.06)
    # efectos
    m.golpe(0.2, 1.0)
    _rugido(m, 0.9, 0.55)
    _rugido(m, 3.0, 0.45)
    m.campana(8.4, "D5", 0.07)                    # sello del rey
    m.golpe(9.4, 0.5, grave=1.2)
    _rugido(m, 9.6, 0.4)
    m.golpe(21.0, 0.5)
    _retumbo(m, 25.0, 1.6, 0.45)
    m.golpe(26.5, 0.9, ruido=0.5)
    _rugido(m, 27.3, 0.45)
    for i, nota in enumerate(["A5", "D6", "F#6", "A6", "D7"]):
        m.campana(30.6 + i * 0.12, nota, 0.07, pan=-0.4 + i * 0.2)
    _retumbo(m, 37.0, 1.6, 0.35)
    m.campana(40.3, "A5", 0.1)
    m.campana(43.3, "D6", 0.08)
    m.campana(46.0, "F#6", 0.09)
    return m.final()
