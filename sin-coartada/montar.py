"""Monta un Short vertical a partir de escenas, narración y tiempos por palabra.

Uso:  python3 montar.py <carpeta-del-short>
      p. ej. python3 montar.py short-02-torre-eiffel
Lee de la carpeta:
      escenas.json   {"fin": 59.0, "escenas": [{"img": "e1.png", "inicio": 0.0, "movimiento": "zoom_in"}, ...]}
                     movimientos: zoom_in_fuerte, zoom_in, zoom_out, pan_abajo, pan_arriba, sacudida
      escenas/*.png  ilustraciones verticales 9:16
      narracion.mp3  voz
      palabras.json  tiempos por palabra de la transcripción de ElevenLabs ({"words": [{"text", "start", "end", "type"}]})
Crea: short.mp4 (1080x1920, 30 fps) y subtitulos.ass
"""
import json
import subprocess
import sys
from pathlib import Path

W, H, FPS = 1080, 1920, 30
AQUI = None    # carpeta del Short; se define en cargar()
FIN = None     # duración total en segundos (YouTube Shorts admite hasta 60)
ESCENAS = []   # (imagen, inicio en segundos, movimiento); cada corte cae donde empieza una frase


def cargar(carpeta):
    global AQUI, FIN, ESCENAS
    AQUI = Path(carpeta).resolve()
    cfg = json.loads((AQUI / "escenas.json").read_text(encoding="utf-8"))
    FIN = float(cfg["fin"])
    if FIN > 60:
        raise SystemExit("La duración pasa de 60 s: YouTube no lo tomaría como Short.")
    ESCENAS = [(e["img"], float(e["inicio"]), e["movimiento"]) for e in cfg["escenas"]]


def movimiento(tipo, frames):
    """Expresiones de zoompan (z, x, y) para cada tipo de movimiento."""
    n = max(frames - 1, 1)
    p = f"(on/{n})"  # progreso de 0 a 1
    cx = "iw/2-(iw/zoom/2)"
    cy = "ih/2-(ih/zoom/2)"
    if tipo == "zoom_in_fuerte":
        return f"1.0+0.22*{p}", cx, cy
    if tipo == "zoom_in":
        return f"1.04+0.12*{p}", cx, cy
    if tipo == "zoom_out":
        return f"1.18-0.13*{p}", cx, cy
    if tipo == "pan_abajo":
        return "1.15", cx, f"(ih-ih/zoom)*{p}"
    if tipo == "pan_arriba":
        return "1.15", cx, f"(ih-ih/zoom)*(1-{p})"
    if tipo == "sacudida":
        # zoom rápido y temblor que se calma: el momento "¡pero si me puse el jugo!"
        return ("1.08+0.10*min(1,on/6)",
                f"{cx}+14*sin(on*2.1)*exp(-on/25)",
                f"{cy}+10*cos(on*2.7)*exp(-on/25)")
    raise ValueError(tipo)


def tiempo_ass(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def subtitulos():
    """Subtítulos de 1 a 3 palabras; la palabra que se está diciendo va en amarillo."""
    datos = json.loads((AQUI / "palabras.json").read_text(encoding="utf-8"))
    palabras = [w for w in datos["words"]
                if w.get("type", "word") == "word" and not w["text"].startswith("[")]
    grupos, actual = [], []
    for w in palabras:
        actual.append(w)
        if len(actual) == 3 or w["text"][-1] in ".,:;?!…»":
            grupos.append(actual)
            actual = []
    if actual:
        grupos.append(actual)

    cabecera = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter Display Black,96,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,9,4,2,70,70,520,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lineas = []
    for i, g in enumerate(grupos):
        fin_grupo = grupos[i + 1][0]["start"] if i + 1 < len(grupos) else min(g[-1]["end"] + 0.4, FIN)
        for j, w in enumerate(g):
            ini = w["start"]
            fin = g[j + 1]["start"] if j + 1 < len(g) else fin_grupo
            if fin - ini < 0.05:
                continue
            partes = []
            for k, x in enumerate(g):
                txt = x["text"].upper().replace("«", "").replace("»", "")
                if k == j:
                    txt = r"{\c&H00D7FF&\fscx112\fscy112}" + txt + r"{\c&HFFFFFF&\fscx100\fscy100}"
                partes.append(txt)
            pop = r"{\fscx85\fscy85\t(0,90,\fscx100\fscy100)}" if j == 0 else ""
            lineas.append(f"Dialogue: 0,{tiempo_ass(ini)},{tiempo_ass(fin)},Sub,,0,0,0,,{pop}{' '.join(partes)}")
    (AQUI / "subtitulos.ass").write_text(cabecera + "\n".join(lineas) + "\n", encoding="utf-8")


def montar():
    subtitulos()
    entradas, filtros, etiquetas = [], [], []
    for i, (img, ini, tipo) in enumerate(ESCENAS):
        fin = ESCENAS[i + 1][1] if i + 1 < len(ESCENAS) else FIN
        dur = fin - ini
        frames = round(dur * FPS)
        entradas += ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.3f}",
                     "-i", str(AQUI / "escenas" / img)]
        z, x, y = movimiento(tipo, frames)
        filtros.append(
            f"[{i}:v]scale={W * 2}:{H * 2}:flags=lanczos,setsar=1,"
            f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={W}x{H}:fps={FPS},"
            f"trim=end_frame={frames},setpts=PTS-STARTPTS,format=yuv420p[v{i}]"
        )
        etiquetas.append(f"[v{i}]")
    n = len(ESCENAS)
    filtros.append(f"{''.join(etiquetas)}concat=n={n}:v=1:a=0[base]")
    # barra de progreso amarilla abajo
    filtros.append(f"color=c=0xFFD700:s={W}x14:r={FPS}:d={FIN}[barra]")
    filtros.append(f"[base][barra]overlay=x='-W+W*t/{FIN}':y={H - 14}:shortest=1[conbarra]")
    ass = str(AQUI / "subtitulos.ass").replace(":", r"\:")
    filtros.append(f"[conbarra]ass='{ass}'[vout]")
    # audio: narración, colchón al final y volumen estándar de YouTube (-14 LUFS)
    filtros.append(f"[{n}:a]apad=pad_dur=1,atrim=0:{FIN},afade=t=out:st={FIN - 0.5}:d=0.5,"
                   f"loudnorm=I=-14:TP=-1.5:LRA=11[aout]")

    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *entradas,
           "-i", str(AQUI / "narracion.mp3"),
           "-filter_complex", ";".join(filtros),
           "-map", "[vout]", "-map", "[aout]",
           "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
           "-t", str(FIN), "-movflags", "+faststart", str(AQUI / "short.mp4")]
    subprocess.run(cmd, check=True)
    print("Listo:", AQUI / "short.mp4")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python3 montar.py <carpeta-del-short>")
    cargar(sys.argv[1])
    montar()
