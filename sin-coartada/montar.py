"""Monta un Short vertical a partir de escenas, narración y tiempos por palabra.

Uso:  python3 montar.py <carpeta-del-short>
      p. ej. python3 montar.py short-02-torre-eiffel
Lee de la carpeta:
      escenas.json   {"fin": 59.0, "escenas": [{"img": "e1.png", "inicio": 0.0, "movimiento": "zoom_in"}, ...],
                      "cortes_rapidos": true, "whoosh": true}   (las dos últimas son opcionales)
                     movimientos: zoom_in_fuerte, zoom_in, zoom_out, pan_abajo, pan_arriba, sacudida
                     cortes_rapidos: parte cada escena larga en tomas de ~3 s con encuadres distintos
                     whoosh: añade un sonido suave en cada corte
                     outro: true pega al final el cierre "¡Suscríbete!" (identidad/v2/outro.mp4, ~4.3 s);
                            fin + cierre debe quedar en 60 s o menos
                     musica: "musica-suspenso.mp3" (de identidad/audio/), bajita y con sidechain bajo la voz
                     sfx: [{"archivo": "sfx-sello.mp3", "t": 47.8, "vol": 0.9}, ...] efectos en segundos exactos
                     una escena "img" que termine en .mp4 (p. ej. portada animada) se usa tal cual
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


EXPEDIENTE = None  # número de expediente que se muestra al inicio (opcional)


def cargar(carpeta):
    global AQUI, FIN, ESCENAS, EXPEDIENTE
    AQUI = Path(carpeta).resolve()
    cfg = json.loads((AQUI / "escenas.json").read_text(encoding="utf-8"))
    FIN = float(cfg["fin"])
    if FIN > 60:
        raise SystemExit("La duración pasa de 60 s: YouTube no lo tomaría como Short.")
    ESCENAS = [(e["img"], float(e["inicio"]), e["movimiento"]) for e in cfg["escenas"]]
    EXPEDIENTE = cfg.get("expediente")


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


# Encuadres para los cortes rápidos: (zoom inicial, zoom final, foco x, foco y), foco de 0 a 1
ENCUADRES = [
    (1.00, 1.10, 0.50, 0.45),   # plano general que se acerca
    (1.38, 1.48, 0.38, 0.40),   # acercamiento a la izquierda
    (1.32, 1.42, 0.62, 0.55),   # acercamiento a la derecha
    (1.18, 1.04, 0.50, 0.60),   # se aleja
]


def encuadre(z0, z1, fx, fy, frames):
    p = f"(on/{max(frames - 1, 1)})"
    return (f"{z0}+({z1 - z0})*{p}",
            f"max(0,min(iw-iw/zoom,{fx}*iw-iw/zoom/2))",
            f"max(0,min(ih-ih/zoom,{fy}*ih-ih/zoom/2))")


def tomas(cortes_rapidos):
    """Convierte las escenas en tomas. Con cortes_rapidos, las escenas largas se parten
    en tomas de ~3 s con encuadres distintos (más cambios = más retención)."""
    lista = []
    for i, (img, ini, tipo) in enumerate(ESCENAS):
        fin = ESCENAS[i + 1][1] if i + 1 < len(ESCENAS) else FIN
        dur = fin - ini
        es_video = img.lower().endswith(".mp4")
        n = max(1, round(dur / 3.0)) if (cortes_rapidos and tipo != "zoom_in_fuerte" and not es_video) else 1
        for k in range(n):
            t0 = ini + dur * k / n
            t1 = ini + dur * (k + 1) / n
            mov = tipo if k == 0 else ENCUADRES[(i + k) % len(ENCUADRES)]
            lista.append((img, t0, t1, mov))
    return lista


def tiempo_ass(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def subtitulos():
    """Subtítulos de 1 a 3 palabras; la palabra que se está diciendo va en amarillo."""
    datos = json.loads((AQUI / "palabras.json").read_text(encoding="utf-8"))
    palabras = [w for w in datos["words"]
                if w.get("type", "word") == "word" and "[" not in w["text"] and "]" not in w["text"]]
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
    if EXPEDIENTE:
        # sello del número de expediente arriba, los primeros 3 segundos (marca del canal)
        cabecera = cabecera.replace(
            "\n\n[Events]",
            "\nStyle: Exp,Inter Display Black,58,&H00FFFFFF,&H00FFFFFF,&H001E10C8,&H00000000,"
            "-1,0,0,0,100,100,4,0,3,14,0,2,70,70,300,1\n\n[Events]")
        lineas.insert(0, f"Dialogue: 1,{tiempo_ass(0)},{tiempo_ass(3.0)},Exp,,0,0,0,,"
                         r"{\fad(150,250)\frz4}" + f"EXPEDIENTE #{EXPEDIENTE}")
    (AQUI / "subtitulos.ass").write_text(cabecera + "\n".join(lineas) + "\n", encoding="utf-8")


AUDIO = Path(__file__).resolve().parent / "identidad" / "audio"


def montar(cortes_rapidos=False, whoosh=False, musica=None, sfx=None):
    """musica: archivo de identidad/audio (p. ej. "musica-suspenso.mp3"), va bajita y se
    agacha sola cuando habla el narrador. sfx: lista de {"archivo", "t", "vol"} con efectos
    de identidad/audio en segundos exactos. Una escena .mp4 (p. ej. portada animada) se usa
    tal cual, sin zoom."""
    subtitulos()
    entradas, filtros, etiquetas = [], [], []
    lista = tomas(cortes_rapidos)
    for i, (img, t0, t1, mov) in enumerate(lista):
        # frames exactos por toma para que la suma cuadre con la duración total
        frames = round(t1 * FPS) - round(t0 * FPS)
        dur = frames / FPS
        if img.lower().endswith(".mp4"):
            entradas += ["-i", str(AQUI / "escenas" / img)]
            filtros.append(
                f"[{i}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,"
                f"fps={FPS},tpad=stop_mode=clone:stop_duration={dur:.3f},"
                f"trim=end_frame={frames},setpts=PTS-STARTPTS,format=yuv420p[v{i}]")
            etiquetas.append(f"[v{i}]")
            continue
        entradas += ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.3f}",
                     "-i", str(AQUI / "escenas" / img)]
        z, x, y = encuadre(*mov, frames) if isinstance(mov, tuple) else movimiento(mov, frames)
        filtros.append(
            f"[{i}:v]scale={W * 2}:{H * 2}:flags=lanczos,setsar=1,"
            f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={W}x{H}:fps={FPS},"
            f"trim=end_frame={frames},setpts=PTS-STARTPTS,format=yuv420p[v{i}]"
        )
        etiquetas.append(f"[v{i}]")
    n = len(lista)
    filtros.append(f"{''.join(etiquetas)}concat=n={n}:v=1:a=0[base]")
    # barra de progreso amarilla abajo
    filtros.append(f"color=c=0xFFD700:s={W}x14:r={FPS}:d={FIN}[barra]")
    filtros.append(f"[base][barra]overlay=x='-W+W*t/{FIN}':y={H - 14}:shortest=1[conbarra]")
    ass = str(AQUI / "subtitulos.ass").replace(":", r"\:")
    filtros.append(f"[conbarra]ass='{ass}'[vout]")
    # audio: narración, colchón al final y volumen estándar de YouTube (-14 LUFS)
    filtros.append(f"[{n}:a]apad=pad_dur=1,atrim=0:{FIN},afade=t=out:st={FIN - 0.5}:d=0.5,"
                   f"aformat=sample_rates=48000:channel_layouts=stereo[narr0]")
    extra, capas = [], []
    sig = n + 1  # índice de la siguiente entrada de audio
    if musica:
        # música bajita que se agacha sola cuando habla el narrador (sidechain)
        extra += ["-stream_loop", "-1", "-i", str(AUDIO / musica)]
        filtros.append("[narr0]asplit=2[narr][narrsc]")
        filtros.append(f"[{sig}:a]atrim=0:{FIN},asetpts=PTS-STARTPTS,"
                       f"aformat=sample_rates=48000:channel_layouts=stereo,volume=0.30,"
                       f"afade=t=in:d=1,afade=t=out:st={FIN - 1.5}:d=1.5[mraw]")
        filtros.append("[mraw][narrsc]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=350[mus]")
        capas.append("[mus]")
        sig += 1
    else:
        filtros.append("[narr0]anull[narr]")
    cortes = [t0 for (_, t0, _, _) in lista[1:]]
    if whoosh and cortes:
        # "whoosh" suave en cada corte: ruido rosa filtrado con subida y caída rápidas
        extra += ["-f", "lavfi", "-t", "0.35", "-i", "anoisesrc=d=0.35:c=pink:a=0.5:r=48000"]
        k = len(cortes)
        filtros.append(f"[{sig}:a]highpass=f=400,lowpass=f=5000,afade=t=in:d=0.12,"
                       f"afade=t=out:st=0.12:d=0.23,volume=0.35,aformat=channel_layouts=stereo,"
                       f"asplit={k}" + "".join(f"[w{j}]" for j in range(k)))
        for j, t in enumerate(cortes):
            ms = max(0, int((t - 0.12) * 1000))
            filtros.append(f"[w{j}]adelay={ms}|{ms}[wd{j}]")
            capas.append(f"[wd{j}]")
        sig += 1
    for j, ef in enumerate(sfx or []):
        extra += ["-i", str(AUDIO / ef["archivo"])]
        ms = max(0, int(float(ef["t"]) * 1000))
        filtros.append(f"[{sig}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
                       f"volume={ef.get('vol', 0.8)},adelay={ms}|{ms}[sx{j}]")
        capas.append(f"[sx{j}]")
        sig += 1
    if capas:
        filtros.append("[narr]" + "".join(capas) +
                       f"amix=inputs={len(capas) + 1}:normalize=0:duration=first[mezcla]")
        filtros.append("[mezcla]loudnorm=I=-14:TP=-1.5:LRA=11[aout]")
    else:
        filtros.append("[narr]loudnorm=I=-14:TP=-1.5:LRA=11[aout]")

    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *entradas,
           "-i", str(AQUI / "narracion.mp3"), *extra,
           "-filter_complex", ";".join(filtros),
           "-map", "[vout]", "-map", "[aout]",
           "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
           "-t", str(FIN), "-movflags", "+faststart", str(AQUI / "short.mp4")]
    subprocess.run(cmd, check=True)
    print("Listo:", AQUI / "short.mp4")


OUTRO = Path(__file__).resolve().parent / "identidad" / "v2" / "outro.mp4"


def duracion(archivo):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                 "-of", "csv=p=0", str(archivo)],
                                capture_output=True, text=True, check=True).stdout)


def agregar_outro():
    """Pega el cierre fijo "¡Suscríbete!" (identidad/v2/outro.mp4) al final de short.mp4."""
    total = FIN + duracion(OUTRO)
    if total > 60:
        raise SystemExit(f"Con el cierre el Short dura {total:.1f} s (máximo 60): acorta 'fin'.")
    final = AQUI / "short.mp4"
    cuerpo = AQUI / "short-sin-outro.mp4"
    final.replace(cuerpo)
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-i", str(cuerpo), "-i", str(OUTRO),
                    "-filter_complex",
                    "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[ao];"
                    "[0:v][0:a][1:v][ao]concat=n=2:v=1:a=1[v][a]",
                    "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                    "-movflags", "+faststart", str(final)], check=True)
    cuerpo.unlink()
    print(f"Cierre agregado: {final} ({total:.1f} s)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python3 montar.py <carpeta-del-short>")
    cargar(sys.argv[1])
    cfg = json.loads((AQUI / "escenas.json").read_text(encoding="utf-8"))
    montar(cortes_rapidos=cfg.get("cortes_rapidos", False), whoosh=cfg.get("whoosh", False),
           musica=cfg.get("musica"), sfx=cfg.get("sfx"))
    if cfg.get("outro"):
        agregar_outro()
