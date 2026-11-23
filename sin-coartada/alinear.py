"""Calcula tiempos aproximados por palabra sin gastar créditos de transcripción.

Uso: python3 alinear.py <carpeta-del-short>
Lee guion.txt (el texto exacto que se narró, sin etiquetas de voz) y narracion.mp3.
Escribe palabras.json con el mismo formato que la transcripción de ElevenLabs:
{"words": [{"text", "start", "end", "type": "word"}]}

Cómo funciona: detecta las pausas del audio con ffmpeg y reparte las palabras
solo en los tramos con voz, en proporción a lo largo que es cada palabra al decirla.
"""
import json
import re
import subprocess
import sys
from pathlib import Path


def pausas(audio):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(audio), "-af",
                          "silencedetect=n=-38dB:d=0.18", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    fin = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                "-of", "csv=p=0", str(audio)], capture_output=True, text=True).stdout)
    return list(zip(ini, fin + [dur] * (len(ini) - len(fin)))), dur


def peso(palabra):
    limpia = re.sub(r"[^\wáéíóúüñ]", "", palabra.lower())
    if limpia.isdigit():
        return 4.0 * len(limpia)          # "2009" se dice "dos mil nueve"
    return max(len(limpia), 1) + 1.5


def alinear(carpeta):
    aqui = Path(carpeta)
    palabras = (aqui / "guion.txt").read_text(encoding="utf-8").split()
    silencios, dur = pausas(aqui / "narracion.mp3")
    tramos, t = [], 0.0               # tramos con voz
    for a, b in silencios:
        if a > t:
            tramos.append((t, a))
        t = b
    if t < dur:
        tramos.append((t, dur))
    total_voz = sum(b - a for a, b in tramos)
    total_peso = sum(peso(p) for p in palabras)

    def tiempo_real(x):               # segundos de voz acumulada -> tiempo del audio
        for a, b in tramos:
            if x <= b - a:
                return a + x
            x -= b - a
        return tramos[-1][1]

    salida, acum = [], 0.0
    for p in palabras:
        d = peso(p) / total_peso * total_voz
        salida.append({"text": p, "type": "word",
                       "start": tiempo_real(acum), "end": tiempo_real(acum + d * 0.92)})
        acum += d

    # anclaje: la palabra que cierra una frase termina justo donde empieza la pausa más cercana
    anclas, ultimo = [(0.0, 0.0)], 0.0
    inicios = [a for a, _ in silencios]
    for w in salida:
        if re.search(r"[.…?!]\"?$", w["text"]):
            cerca = [a for a in inicios if a > ultimo + 0.2 and abs(a - w["end"]) < 1.5]
            if cerca:
                a = min(cerca, key=lambda x: abs(x - w["end"]))
                anclas.append((w["end"], a))
                ultimo = a
    anclas.append((salida[-1]["end"], tramos[-1][1]))

    def corregir(t):                  # interpolación lineal entre anclas
        for (x0, y0), (x1, y1) in zip(anclas, anclas[1:]):
            if t <= x1:
                return y0 + (t - x0) * (y1 - y0) / max(x1 - x0, 1e-6)
        return t

    for w in salida:
        w["start"], w["end"] = round(corregir(w["start"]), 3), round(corregir(w["end"]), 3)
    (aqui / "palabras.json").write_text(json.dumps({"words": salida}, ensure_ascii=False), encoding="utf-8")
    return salida


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python3 alinear.py <carpeta-del-short>")
    for w in alinear(sys.argv[1]):
        if re.search(r"[.?…]$", w["text"]):
            print(f'{w["start"]:6.2f}  {w["text"]}')
