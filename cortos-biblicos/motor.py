#!/usr/bin/env python3
"""
Motor para crear cortos animados verticales (1080x1920, 9:16) para
YouTube Shorts, Facebook Reels y TikTok.

Uso:
    python3 motor.py cortos/david_y_goliat.py            # crea el video .mp4
    python3 motor.py cortos/david_y_goliat.py --fotos 2,10,30   # solo imágenes de prueba

Cada corto es un archivo .py dentro de "cortos/" que define:
    TITULO, DURACION, ESCENAS, TEXTOS, audio()  y opcionalmente post(img, t)
"""
import argparse
import functools
import importlib.util
import math
import multiprocessing as mp
import os
import random
import subprocess
import sys
import tempfile
import time
import wave

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30
SR = 44100

SILUETA = (14, 10, 18)
DORADO = (255, 204, 92)
BLANCO = (255, 255, 255)

CARPETA = os.path.dirname(os.path.abspath(__file__))

FUENTES = {
    "titulo": ["/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf",
               "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"],
    "normal": ["/usr/share/fonts/opentype/inter/Inter-SemiBold.otf",
               "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"],
    "verso": ["/usr/share/fonts/truetype/liberation/LiberationSerif-BoldItalic.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"],
}


@functools.lru_cache(None)
def fuente(estilo, tam):
    for ruta in FUENTES.get(estilo, [estilo]):
        if os.path.exists(ruta):
            return ImageFont.truetype(ruta, tam)
    return ImageFont.load_default()


# ----------------------------------------------------------------- tiempo
def lim(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def prog(t, a, b):
    """0 antes de a, 1 después de b, lineal entre ambos."""
    if b <= a:
        return 1.0 if t >= a else 0.0
    return lim((t - a) / (b - a))


def suave(x):
    x = lim(x)
    return x * x * (3 - 2 * x)


def salida(x):
    x = lim(x)
    return 1 - (1 - x) ** 3


def entrada(x):
    x = lim(x)
    return x ** 3


def mezcla(a, b, p):
    return a + (b - a) * p


def mezcla_color(c1, c2, p):
    return tuple(int(mezcla(a, b, p)) for a, b in zip(c1, c2))


# ----------------------------------------------------------------- fondos
@functools.lru_cache(64)
def _degradado(paradas):
    ys = np.linspace(0, 1, H)
    pos = [p for p, _ in paradas]
    cols = np.array([c for _, c in paradas], dtype=float)
    fila = np.stack([np.interp(ys, pos, cols[:, i]) for i in range(3)], axis=1)
    arr = np.repeat(fila[:, None, :], W, axis=1).astype(np.uint8)
    return Image.fromarray(arr, "RGB")


def fondo(paradas):
    """Degradado vertical. paradas = [(0.0, (r,g,b)), (0.5, ...), (1.0, ...)]"""
    return _degradado(tuple((float(p), tuple(c)) for p, c in paradas)).copy()


def fondo_mezcla(paradas_a, paradas_b, p):
    return Image.blend(fondo(paradas_a), fondo(paradas_b), lim(p))


def con_opacidad(sprite, op):
    if op >= 0.999:
        return sprite
    s = sprite.copy()
    s.putalpha(s.getchannel("A").point(lambda v: int(v * lim(op))))
    return s


def pegar(img, sprite, x, y, opacidad=1.0):
    """Pega un sprite RGBA con su esquina superior izquierda en (x, y)."""
    if opacidad <= 0.001:
        return
    s = con_opacidad(sprite, opacidad)
    img.paste(s, (int(round(x)), int(round(y))), s)


def pegar_centro(img, sprite, cx, cy, opacidad=1.0):
    pegar(img, sprite, cx - sprite.width / 2, cy - sprite.height / 2, opacidad)


@functools.lru_cache(32)
def resplandor(radio, color, fuerza=1.0):
    """Círculo de luz suave (sol, halo, brillo)."""
    s = radio * 2
    y, x = np.mgrid[0:s, 0:s]
    d = np.hypot(x - radio + 0.5, y - radio + 0.5) / radio
    a = np.clip(1 - d, 0, 1) ** 2.2 * 255 * fuerza
    arr = np.zeros((s, s, 4), np.uint8)
    arr[..., :3] = color
    arr[..., 3] = np.clip(a, 0, 255)
    return Image.fromarray(arr, "RGBA")


@functools.lru_cache(16)
def disco(radio, color):
    S = 2
    img = Image.new("RGBA", (radio * 2 * S, radio * 2 * S))
    ImageDraw.Draw(img).ellipse([0, 0, radio * 2 * S - 1, radio * 2 * S - 1], fill=color + (255,))
    return img.resize((radio * 2, radio * 2), Image.LANCZOS)


def sol(img, cx, cy, radio, color=(255, 236, 190), halo=(255, 170, 80), fuerza_halo=0.9):
    pegar_centro(img, resplandor(int(radio * 6), halo, fuerza_halo), cx, cy)
    pegar_centro(img, resplandor(int(radio * 2.2), color, 1.0), cx, cy)
    pegar_centro(img, disco(radio, color), cx, cy)


@functools.lru_cache(8)
def capa_rayos(cx, cy, n, color, semilla, largo=2600):
    """Rayos de luz (estilo 'luz divina') que salen de un punto."""
    capa = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(capa)
    rnd = random.Random(semilla)
    for _ in range(n):
        ang = rnd.uniform(0, 2 * math.pi)
        ancho = rnd.uniform(0.015, 0.06)
        a = rnd.randint(30, 75)
        p1 = (cx + math.cos(ang - ancho) * largo, cy + math.sin(ang - ancho) * largo)
        p2 = (cx + math.cos(ang + ancho) * largo, cy + math.sin(ang + ancho) * largo)
        d.polygon([(cx, cy), p1, p2], fill=color + (a,))
    return capa.filter(ImageFilter.GaussianBlur(16))


def rayos(img, cx, cy, t, opacidad=1.0, color=(255, 210, 140), n=24):
    """Dos capas de rayos que 'respiran' alternándose."""
    o1 = opacidad * (0.55 + 0.25 * math.sin(t * 1.3))
    o2 = opacidad * (0.55 + 0.25 * math.cos(t * 1.1))
    pegar(img, capa_rayos(int(cx), int(cy), n, color, 7), 0, 0, o1)
    pegar(img, capa_rayos(int(cx), int(cy), n, color, 13), 0, 0, o2)


@functools.lru_cache(1)
def _vineta():
    y, x = np.mgrid[0:H, 0:W]
    d = np.hypot((x - W / 2) / (W * 0.72), (y - H / 2) / (H * 0.66))
    a = np.clip((d - 0.55) / 0.65, 0, 1) ** 1.6 * 190
    arr = np.zeros((H, W, 4), np.uint8)
    arr[..., 3] = a.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def colinas(img, y_base, amp, color, semilla, desplazar=0.0):
    rnd = random.Random(semilla)
    ondas = [(rnd.uniform(0.002, 0.009), rnd.uniform(0, 6.28), rnd.uniform(0.3, 1.0)) for _ in range(3)]
    tot = sum(o[2] for o in ondas)
    pts = []
    for x in range(-40, W + 41, 12):
        xx = x - desplazar
        y = y_base - amp * sum(a * math.sin(xx * f + ph) for f, ph, a in ondas) / tot
        pts.append((x, y))
    pts += [(W + 40, H + 10), (-40, H + 10)]
    ImageDraw.Draw(img).polygon(pts, fill=color)


class Polvo:
    """Partículas flotantes: polvo dorado, chispas, estrellas, ceniza."""

    def __init__(self, n, semilla, color, tam=(2, 6), vel=(15, 50), area=(0, 0, W, H),
                 alfa=(70, 200), vaiven=25, parpadeo=0.0):
        rnd = random.Random(semilla)
        x0, y0, x1, y1 = area
        self.area = area
        self.color = color
        self.p = [dict(x=rnd.uniform(x0, x1), y=rnd.uniform(y0, y1), r=rnd.uniform(*tam),
                       v=rnd.uniform(*vel), a=rnd.uniform(*alfa), f=rnd.uniform(0.3, 1.2),
                       ph=rnd.uniform(0, 6.28), amp=rnd.uniform(0, vaiven)) for _ in range(n)]
        self.parpadeo = parpadeo

    def dibujar(self, img, t, opacidad=1.0):
        if opacidad <= 0.01:
            return
        x0, y0, x1, y1 = self.area
        alto = y1 - y0
        capa = Image.new("RGBA", (W, H))
        d = ImageDraw.Draw(capa)
        for q in self.p:
            x = q["x"] + math.sin(t * q["f"] + q["ph"]) * q["amp"]
            y = y0 + ((q["y"] - y0 - q["v"] * t) % alto)
            brillo = 1 - self.parpadeo * (0.5 + 0.5 * math.sin(t * q["f"] * 4 + q["ph"]))
            a = int(q["a"] * opacidad * brillo)
            r = q["r"]
            d.ellipse([x - r, y - r, x + r, y + r], fill=self.color + (a,))
        img.paste(capa, (0, 0), capa)


# ----------------------------------------------------------------- figuras
@functools.lru_cache(64)
def persona(alto, tipo="pastor", color=SILUETA, baston=False, lanza=False, escudo=False,
            casco=False, brazo_arriba=False, corona=False, brazos_arriba=False):
    """
    Silueta de persona. tipo: "pastor" (túnica) o "guerrero" (armadura).
    Devuelve (sprite RGBA, anclas) — los pies quedan en el centro inferior del sprite.
    """
    S = 2
    m = 0.22  # margen superior para lanza / brazo levantado
    u = alto * S
    cw, ch = int(alto * 1.0) * S, int(alto * (1 + m)) * S
    img = Image.new("RGBA", (cw, ch))
    d = ImageDraw.Draw(img)
    c = tuple(color) + (255,)
    cx = cw / 2

    def Y(v):
        return (m + v) * u

    def P(dx, v):
        return (cx + dx * u, Y(v))

    hw = 0.12 if tipo == "pastor" else 0.16
    r = 0.062
    d.ellipse([cx - r * u, Y(0.03), cx + r * u, Y(0.03 + 2 * r)], fill=c)            # cabeza
    d.rectangle([cx - 0.03 * u, Y(0.13), cx + 0.03 * u, Y(0.2)], fill=c)            # cuello
    if tipo == "pastor":
        d.polygon([P(-hw, 0.2), P(hw, 0.2), P(0.17, 0.9), P(-0.17, 0.9)], fill=c)     # túnica
        d.ellipse([cx - hw * u, Y(0.17), cx + hw * u, Y(0.26)], fill=c)
        for s in (-1, 1):
            d.rectangle([cx + (s * 0.07 - 0.03) * u, Y(0.86), cx + (s * 0.07 + 0.03) * u, Y(0.97)], fill=c)
            d.ellipse([cx + (s * 0.09 - 0.05) * u, Y(0.95), cx + (s * 0.09 + 0.05) * u, Y(1.0)], fill=c)
    else:
        d.polygon([P(-hw, 0.2), P(hw, 0.2), P(0.11, 0.5), P(-0.11, 0.5)], fill=c)    # torso
        d.ellipse([cx - hw * u, Y(0.17), cx + hw * u, Y(0.27)], fill=c)
        d.polygon([P(-0.12, 0.48), P(0.12, 0.48), P(0.16, 0.63), P(-0.16, 0.63)], fill=c)
        for s in (-1, 1):
            d.polygon([P(s * 0.025, 0.6), P(s * 0.115, 0.6), P(s * 0.1, 0.97), P(s * 0.05, 0.97)], fill=c)
            a, b = sorted((s * 0.03, s * 0.15))
            d.ellipse([cx + a * u, Y(0.945), cx + b * u, Y(1.0)], fill=c)

    grosor = int(0.055 * u)
    rm = 0.034 * u

    def brazo(hombro, mano):
        d.line([hombro, mano], fill=c, width=grosor, joint="curve")
        d.ellipse([hombro[0] - grosor / 2, hombro[1] - grosor / 2, hombro[0] + grosor / 2, hombro[1] + grosor / 2], fill=c)
        d.ellipse([mano[0] - rm, mano[1] - rm, mano[0] + rm, mano[1] + rm], fill=c)

    hombro_i, hombro_d = P(-hw + 0.03, 0.22), P(hw - 0.03, 0.22)
    mano_i = P(-hw - 0.15, 0.0) if brazos_arriba else P(-hw - 0.05, 0.52)
    if brazo_arriba or brazos_arriba:
        mano_d = P(hw + 0.15, 0.0)
    else:
        mano_d = P(hw + 0.05, 0.52)
    brazo(hombro_i, mano_i)
    brazo(hombro_d, mano_d)

    if casco:
        d.chord([cx - 0.078 * u, Y(0.012), cx + 0.078 * u, Y(0.16)], 180, 360, fill=c)
        d.polygon([P(-0.02, 0.03), P(0.03, 0.02), P(0.07, -0.07), P(-0.09, -0.05)], fill=c)
    if corona:
        pts = [P(-0.07, 0.05)]
        for i in range(5):
            pts += [P(-0.07 + i * 0.035, -0.03), P(-0.0525 + i * 0.035, 0.02)]
        pts += [P(0.07, -0.03), P(0.07, 0.05)]
        d.polygon(pts, fill=c)
    if lanza:
        x = mano_d[0]
        d.line([(x, Y(1.0)), (x, Y(-0.16))], fill=c, width=int(0.022 * u))
        d.polygon([(x, Y(-0.21)), (x - 0.03 * u, Y(-0.12)), (x + 0.03 * u, Y(-0.12))], fill=c)
    if escudo:
        mx, my = mano_i
        d.ellipse([mx - 0.12 * u, my - 0.2 * u, mx + 0.1 * u, my + 0.12 * u], fill=c)
    if baston and not (brazo_arriba or brazos_arriba):
        x = mano_d[0]
        d.line([(x, Y(1.0)), (x, Y(0.04))], fill=c, width=int(0.022 * u))
        d.arc([x, Y(-0.05), x + 0.12 * u, Y(0.07)], 180, 360, fill=c, width=int(0.022 * u))
        d.line([(x + 0.12 * u, Y(0.01)), (x + 0.12 * u, Y(0.07))], fill=c, width=int(0.022 * u))

    sprite = img.resize((cw // S, ch // S), Image.LANCZOS)
    anclas = {
        "mano_der": (mano_d[0] / S, mano_d[1] / S),
        "mano_izq": (mano_i[0] / S, mano_i[1] / S),
        "frente": (cx / S, Y(0.08) / S),
        "pies": (cw / 2 / S, ch / S),
    }
    return sprite, anclas


@functools.lru_cache(16)
def oveja(alto, color=(238, 230, 212), patas=(40, 32, 30)):
    S = 2
    w, h = int(alto * 1.6) * S, int(alto) * S
    img = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(img)
    c = tuple(color) + (255,)
    p = tuple(patas) + (255,)
    for fx in (0.22, 0.42, 0.6):
        d.rectangle([w * fx, h * 0.55, w * (fx + 0.05), h], fill=p)
    for i in range(7):
        bx = w * (0.08 + i * 0.09)
        d.ellipse([bx, h * 0.12 + (i % 2) * h * 0.06, bx + w * 0.2, h * 0.5 + (i % 2) * h * 0.06], fill=c)
    d.ellipse([w * 0.1, h * 0.2, w * 0.75, h * 0.7], fill=c)
    d.ellipse([w * 0.7, h * 0.18, w * 0.95, h * 0.5], fill=p)       # cabeza
    d.ellipse([w * 0.68, h * 0.2, w * 0.78, h * 0.3], fill=p)       # oreja
    return img.resize((w // S, h // S), Image.LANCZOS)


def pegar_figura(img, figura, x_pies, y_pies, opacidad=1.0):
    sprite = figura[0] if isinstance(figura, tuple) else figura
    pegar(img, sprite, x_pies - sprite.width / 2, y_pies - sprite.height, opacidad)


def ancla(figura, nombre, x_pies, y_pies):
    """Posición en pantalla de un ancla (mano, frente...) de una figura pegada en (x_pies, y_pies)."""
    sprite, anclas = figura
    ax, ay = anclas[nombre]
    return x_pies - sprite.width / 2 + ax, y_pies - sprite.height + ay


def pegar_rotado(img, figura, x_pies, y_pies, angulo):
    """Pega la figura girada sobre sus pies (positivo = cae hacia la izquierda)."""
    sprite = figura[0] if isinstance(figura, tuple) else figura
    w, h = sprite.size
    lienzo = Image.new("RGBA", (2 * h, 2 * h))
    lienzo.paste(sprite, (h - w // 2, 0))
    rot = lienzo.rotate(angulo, resample=Image.BICUBIC, center=(h, h))
    img.paste(rot, (int(x_pies - h), int(y_pies - h)), rot)


# ----------------------------------------------------------------- efectos
def destello(img, fuerza, color=(255, 255, 255)):
    if fuerza <= 0.002:
        return img
    return Image.blend(img, Image.new("RGB", img.size, color), lim(fuerza))


def temblor(img, t, fuerza):
    if fuerza < 0.5:
        return img
    dx = int(fuerza * math.sin(t * 91))
    dy = int(fuerza * math.cos(t * 77))
    return ImageChops.offset(img, dx, dy)


def pulso(t, t0, ancho=0.06):
    return math.exp(-((t - t0) / ancho) ** 2)


# ----------------------------------------------------------------- texto
def _palabras(txt):
    """Las palabras entre *asteriscos* se pintan en color de énfasis."""
    out, activo = [], False
    for tok in txt.split():
        enf = activo or "*" in tok
        if tok.count("*") % 2 == 1:
            activo = not activo
        out.append((tok.replace("*", ""), enf))
    return out


def texto(img, txt, t, inicio, fin, y=960, tam=78, estilo="titulo", color=BLANCO, enfasis=DORADO,
          borde=7, max_ancho=940, por_palabra=True, aparecer=0.25, desaparecer=0.3, interlineado=1.2,
          sombra=True):
    """Texto centrado en y, con aparición palabra por palabra estilo 'shorts'."""
    if t < inicio or t > fin:
        return
    f = fuente(estilo, tam)
    esp = f.getlength(" ")
    lineas, linea, ancho = [], [], 0
    for pal, enf in _palabras(txt):
        w = f.getlength(pal)
        if linea and ancho + esp + w > max_ancho:
            lineas.append((linea, ancho))
            linea, ancho = [], 0
        ancho = ancho + (esp if linea else 0) + w
        linea.append((pal, enf, w))
    if linea:
        lineas.append((linea, ancho))

    lh = tam * interlineado
    pad = 50
    alto = int(len(lineas) * lh + pad * 2)
    y0 = int(y - alto / 2)
    capa = Image.new("RGBA", (W, alto))
    cs = Image.new("RGBA", (W, alto)) if sombra else None
    d = ImageDraw.Draw(capa)
    ds = ImageDraw.Draw(cs) if sombra else None

    n = sum(len(l) for l, _ in lineas)
    paso = min(0.16, max(0.04, (fin - inicio) * 0.45 / max(n, 1))) if por_palabra else 0
    a_glob = salida(prog(t, inicio, inicio + aparecer)) * (1 - prog(t, fin - desaparecer, fin))
    i = 0
    for k, (linea, ancho) in enumerate(lineas):
        x = (W - ancho) / 2
        yy = pad + k * lh
        for pal, enf, w in linea:
            e = salida(prog(t, inicio + i * paso, inicio + i * paso + 0.22)) if por_palabra else 1
            a = int(255 * a_glob * e)
            dy = (1 - e) * 24
            if a > 0:
                col = enfasis if enf else color
                if sombra:
                    ds.text((x + 4, yy + dy + 6), pal, font=f, fill=(0, 0, 0, int(a * 0.7)),
                            stroke_width=borde + 3, stroke_fill=(0, 0, 0, int(a * 0.7)))
                d.text((x, yy + dy), pal, font=f, fill=tuple(col) + (a,),
                       stroke_width=borde, stroke_fill=(0, 0, 0, a))
            x += w + esp
            i += 1
    if sombra:
        cs = cs.filter(ImageFilter.GaussianBlur(9))
        img.paste(cs, (0, y0), cs)
    img.paste(capa, (0, y0), capa)


# ----------------------------------------------------------------- audio
NOTAS = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6,
         "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}


def hz(nota):
    """'A4' -> 440.0"""
    nombre, octava = nota[:-1], int(nota[-1])
    midi = 12 * (octava + 1) + NOTAS[nombre]
    return 440.0 * 2 ** ((midi - 69) / 12)


class Mezcla:
    """Pequeño sintetizador: música de fondo y efectos de sonido."""

    def __init__(self, duracion):
        self.n = int((duracion + 0.2) * SR)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)

    def agregar(self, t, senal, vol=1.0, pan=0.0):
        i = int(t * SR)
        if i >= self.n:
            return
        seg = senal[: self.n - i] * vol
        self.L[i:i + len(seg)] += seg * math.cos((pan + 1) * math.pi / 4)
        self.R[i:i + len(seg)] += seg * math.sin((pan + 1) * math.pi / 4)

    def pad(self, inicio, fin, notas, vol=0.1, liberar=1.6):
        """Acorde suave sostenido (colchón de cuerdas/sintetizador)."""
        dur = fin - inicio
        tt = np.arange(int((dur + liberar) * SR)) / SR
        ataque = min(0.9, dur * 0.4)
        env = np.minimum(1, tt / ataque) * np.clip(1 - (tt - dur) / liberar, 0, 1)
        trem = 1 + 0.06 * np.sin(2 * np.pi * 0.25 * tt)
        for k, nota in enumerate(notas):
            f = hz(nota)
            s = np.zeros_like(tt)
            for det in (-0.7, 0.0, 0.7):
                s += np.sin(2 * np.pi * (f + det) * tt) + 0.3 * np.sin(2 * np.pi * 2 * (f + det) * tt) \
                    + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
            peso = 1.4 if k == 0 else 1.0
            self.agregar(inicio, s * env * trem / 3, vol * peso, pan=(-0.5 if k % 2 else 0.5) * (k > 0))

    def pulsar(self, t, nota, vol=0.12, pan=0.0, decaer=2.5):
        """Nota corta tipo piano/arpa."""
        f = hz(nota)
        tt = np.arange(int(2.5 * SR)) / SR
        s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 3)
             + 0.15 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt * 6))
        env = np.exp(-tt * decaer) * np.minimum(1, tt / 0.005)
        self.agregar(t, s * env, vol, pan)

    def arpegio(self, inicio, fin, notas, paso=0.5, vol=0.07):
        k, t = 0, inicio
        while t < fin - 0.05:
            self.pulsar(t, notas[k % len(notas)], vol, pan=0.4 * math.sin(k))
            t += paso
            k += 1

    def golpe(self, t, vol=0.9, grave=1.0, ruido=0.3):
        """Impacto grave cinematográfico (boom)."""
        tt = np.arange(int(2.2 * SR)) / SR
        f = (38 + 90 * np.exp(-tt * 9)) * grave
        fase = 2 * np.pi * np.cumsum(f) / SR
        s = np.sin(fase) * np.exp(-tt * 2.2)
        rnd = np.random.default_rng(int(t * 1000))
        s += ruido * rnd.standard_normal(len(tt)) * np.exp(-tt * 30)
        self.agregar(t, s, vol)

    def tambor(self, t, vol=0.4):
        tt = np.arange(int(0.8 * SR)) / SR
        f = 55 + 60 * np.exp(-tt * 25)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)
        self.agregar(t, s, vol)

    def silbido(self, t, dur=1.2, vol=0.35):
        """Whoosh (algo que vuela rápido)."""
        n = int(dur * SR)
        rnd = np.random.default_rng(int(t * 1000) + 1)
        r = rnd.standard_normal(n)
        bajo = np.convolve(r, np.ones(25) / 25, mode="same")
        s = np.convolve(r - bajo, np.ones(3) / 3, mode="same")
        tt = np.arange(n) / n
        env = np.sin(np.pi * tt ** 1.6) ** 2
        self.agregar(t, s * env, vol, pan=-0.3)

    def campana(self, t, nota="A5", vol=0.12, pan=0.0):
        f = hz(nota)
        tt = np.arange(int(3.5 * SR)) / SR
        s = (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 1.2)
             + 0.5 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt * 2.5)
             + 0.25 * np.sin(2 * np.pi * 5.4 * f * tt) * np.exp(-tt * 4))
        self.agregar(t, s * np.minimum(1, tt / 0.003), vol, pan)

    def final(self, reverb=0.28):
        rnd = np.random.default_rng(3)
        largo = int(2.2 * SR)
        tt = np.arange(largo) / SR
        canales = []
        for canal in (self.L, self.R):
            ir = rnd.standard_normal(largo) * np.exp(-tt / 0.45)
            ir /= np.sqrt(np.sum(ir ** 2))
            nfft = 1 << int(np.ceil(np.log2(len(canal) + largo)))
            wet = np.fft.irfft(np.fft.rfft(canal, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(canal)]
            canales.append(canal + reverb * wet)
        est = np.stack(canales, axis=1)
        return np.tanh(est / (np.max(np.abs(est)) + 1e-9) * 1.2) * 0.9


def guardar_wav(ruta, estereo):
    datos = (np.clip(estereo, -1, 1) * 32767).astype("<i2")
    with wave.open(ruta, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(datos.tobytes())


# ----------------------------------------------------------------- render
CORTO = None


def cargar(ruta):
    sys.modules["motor"] = sys.modules[__name__]
    spec = importlib.util.spec_from_file_location("corto", ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def cuadro(corto, t):
    escenas = corto.ESCENAS
    k = 0
    for i, (ini, _fn) in enumerate(escenas):
        if t >= ini:
            k = i
    ini, fn = escenas[k]
    img = fn(t)
    trans = getattr(corto, "TRANSICION", 0.4)
    if k > 0 and t - ini < trans:
        anterior = escenas[k - 1][1](t)
        img = Image.blend(anterior, img, suave((t - ini) / trans))
    if hasattr(corto, "post"):
        img = corto.post(img, t)
    v = _vineta()
    img.paste(v, (0, 0), v)
    for d in corto.TEXTOS:
        texto(img, t=t, **d)
    return img


def _render_i(i):
    return cuadro(CORTO, i / FPS).tobytes()


def renderizar(ruta_corto, salida_mp4, hilos=None):
    global CORTO
    CORTO = cargar(ruta_corto)
    n = int(CORTO.DURACION * FPS)
    os.makedirs(os.path.dirname(os.path.abspath(salida_mp4)), exist_ok=True)
    print(f"Generando audio de «{CORTO.TITULO}»…")
    tmp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    guardar_wav(tmp_wav, CORTO.audio())
    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-i", tmp_wav,
           "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", salida_mp4]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    inicio = time.time()
    with mp.get_context("fork").Pool(hilos or os.cpu_count()) as pool:
        for i, datos in enumerate(pool.imap(_render_i, range(n), chunksize=6)):
            proc.stdin.write(datos)
            if i % (FPS * 5) == 0:
                print(f"  {i / FPS:5.1f}s / {CORTO.DURACION}s   ({time.time() - inicio:.0f}s transcurridos)")
    proc.stdin.close()
    proc.wait()
    os.unlink(tmp_wav)
    print(f"Listo: {salida_mp4}")


def fotos(ruta_corto, tiempos, carpeta):
    global CORTO
    CORTO = cargar(ruta_corto)
    os.makedirs(carpeta, exist_ok=True)
    for t in tiempos:
        ruta = os.path.join(carpeta, f"foto_{t:05.1f}s.png")
        cuadro(CORTO, t).save(ruta)
        print(ruta)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Crea un corto animado vertical")
    ap.add_argument("corto", help="archivo del corto, p. ej. cortos/david_y_goliat.py")
    ap.add_argument("--salida", help="ruta del .mp4 (por defecto salida/<nombre>.mp4)")
    ap.add_argument("--fotos", help="solo guardar imágenes en estos segundos, p. ej. 2,10,30")
    ap.add_argument("--carpeta-fotos", help="dónde guardar las fotos de prueba")
    a = ap.parse_args()
    nombre = os.path.splitext(os.path.basename(a.corto))[0]
    if a.fotos:
        carpeta = a.carpeta_fotos or os.path.join(CARPETA, "salida", "fotos_" + nombre)
        fotos(a.corto, [float(x) for x in a.fotos.split(",")], carpeta)
    else:
        renderizar(a.corto, a.salida or os.path.join(CARPETA, "salida", nombre + ".mp4"))
