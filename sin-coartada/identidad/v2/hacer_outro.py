"""Crea el cierre fijo "¡Suscríbete!" que se pega al final de cada Short.

Uso: python3 hacer_outro.py   (dentro de identidad/v2)
Entrada: logo-inspector.png, outro-original.mp3 (voz de Nacho, generada una vez)
Salida:  outro.png, outro.mp3 (voz recortada), outro.mp4 (clip listo para pegar)
"""
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

AQUI = Path(__file__).resolve().parent
W, H, FPS = 1080, 1920, 30
FUENTE = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"


def fuente(t):
    return ImageFont.truetype(FUENTE, t)


def texto_centrado(d, y, txt, f, relleno, borde=0, color_borde="black"):
    w = d.textlength(txt, font=f)
    d.text(((W - w) / 2, y), txt, font=f, fill=relleno,
           stroke_width=borde, stroke_fill=color_borde)


def tarjeta():
    img = Image.new("RGB", (W, H), "#FFC21A")
    d = ImageDraw.Draw(img)
    # rayos de sol desde el centro del Inspector
    cx, cy, n = W / 2, 820, 18
    for i in range(n):
        a0 = 2 * math.pi * i / n
        a1 = a0 + math.pi / n
        r = 3000
        d.polygon([(cx, cy), (cx + r * math.cos(a0), cy + r * math.sin(a0)),
                   (cx + r * math.cos(a1), cy + r * math.sin(a1))], fill="#FF9A1F")

    # Inspector en círculo con borde negro y sombra
    lado = 820
    insp = Image.open(AQUI / "logo-inspector.png").convert("RGB").resize((lado, lado), Image.LANCZOS)
    mascara = Image.new("L", (lado, lado), 0)
    ImageDraw.Draw(mascara).ellipse((0, 0, lado, lado), fill=255)
    x0, y0 = int(cx - lado / 2), int(cy - lado / 2)
    sombra = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sombra).ellipse((x0 + 18, y0 + 26, x0 + lado + 18, y0 + lado + 26), fill=140)
    sombra = sombra.filter(ImageFilter.GaussianBlur(18))
    img.paste(Image.new("RGB", (W, H), "black"), (0, 0), sombra)
    d = ImageDraw.Draw(img)
    d.ellipse((x0 - 16, y0 - 16, x0 + lado + 16, y0 + lado + 16), fill="black")
    img.paste(insp, (x0, y0), mascara)
    d = ImageDraw.Draw(img)

    texto_centrado(d, 190, "SIN COARTADA", fuente(118), "white", 12)

    # botón rojo de suscribirse
    bw, bh = 900, 190
    bx, by = (W - bw) // 2, 1330
    d.rounded_rectangle((bx + 10, by + 16, bx + bw + 10, by + bh + 16), 60, fill="black")
    d.rounded_rectangle((bx, by, bx + bw, by + bh), 60, fill="#E62117", outline="black", width=8)
    f = fuente(104)
    txt = "SUSCRÍBETE"
    tw = d.textlength(txt, font=f)
    campana = 120
    total = tw + 30 + campana
    tx = (W - total) / 2
    d.text((tx, by + (bh - 118) / 2), txt, font=f, fill="white")
    # campana dibujada (sin depender de fuentes con emoji)
    gx, gy = tx + tw + 30, by + 35
    d.pieslice((gx + 10, gy, gx + 110, gy + 110), 180, 360, fill="white")
    d.rectangle((gx + 10, gy + 55, gx + 110, gy + 100), fill="white")
    d.polygon([(gx, gy + 112), (gx + 120, gy + 112), (gx + 110, gy + 96), (gx + 10, gy + 96)], fill="white")
    d.ellipse((gx + 45, gy + 108, gx + 75, gy + 132), fill="white")
    d.ellipse((gx + 50, gy - 12, gx + 70, gy + 8), fill="white")

    texto_centrado(d, 1590, "El próximo expediente", fuente(78), "white", 9)
    texto_centrado(d, 1690, "ya viene…", fuente(78), "#FFE14D", 9)
    img.save(AQUI / "outro.png")


def audio():
    # quita los silencios largos entre frases y deja la voz más ágil
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-i", str(AQUI / "outro-original.mp3"),
                    "-af", "silenceremove=stop_periods=-1:stop_duration=0.2:stop_threshold=-40dB,"
                           "atempo=1.06,apad=pad_dur=0.35",
                    "-ar", "48000", str(AQUI / "outro.mp3")], check=True)


def clip():
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                "-of", "csv=p=0", str(AQUI / "outro.mp3")],
                               capture_output=True, text=True, check=True).stdout)
    frames = round(dur * FPS)
    # entrada con rebote: zoom de 1.12 a 1.0 en 0.3 s, luego respiración suave
    z = "if(lt(on,9),1.12-0.12*on/9,1+0.015*sin(on/8))"
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.3f}", "-i", str(AQUI / "outro.png"),
                    "-i", str(AQUI / "outro.mp3"),
                    "-filter_complex",
                    f"[0:v]scale={W * 2}:{H * 2},zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
                    f":d=1:s={W}x{H}:fps={FPS},trim=end_frame={frames},format=yuv420p[v]",
                    "-map", "[v]", "-map", "1:a", "-c:v", "libx264", "-crf", "19",
                    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{dur:.3f}",
                    str(AQUI / "outro.mp4")], check=True)
    print(f"outro.mp4 listo: {dur:.2f} s")


if __name__ == "__main__":
    tarjeta()
    audio()
    clip()
