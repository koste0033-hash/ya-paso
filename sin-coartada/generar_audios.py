"""Genera la narración por bloques con la API de ElevenLabs, sin volver a pagar lo ya generado.

Uso:
    export ELEVENLABS_API_KEY=tu_clave        # la clave NUNCA va en config.json
    python3 generar_audios.py                  # usa config.json y guion.txt de esta carpeta
    python3 generar_audios.py --simular        # muestra qué generaría y cuántos caracteres, sin gastar
    python3 generar_audios.py --forzar 3       # vuelve a generar solo el bloque 3 (lo sobrescribe)
    python3 generar_audios.py --config otra.json --guion short-04/guion.txt

Guion: texto plano; cada bloque (escena) va separado por una o más líneas en blanco.
       Las líneas que empiezan con # son comentarios y se ignoran.
       Se pueden usar etiquetas de voz como [whispering] si el modelo las admite.

Salida: <carpeta_salida>/bloque_01.mp3, bloque_02.mp3, ...
        Junto a cada audio se guarda bloque_NN.txt con el texto exacto que se usó.

Ahorro de créditos:
    - Si bloque_NN.mp3 ya existe y no está vacío, ese bloque se OMITE.
    - Si el texto del guion cambió respecto a bloque_NN.txt, se avisa pero NO se regenera
      (para eso está --forzar N).
    - Cada audio se escribe primero a un archivo temporal y se renombra al terminar,
      así un corte a la mitad nunca deja un .mp3 incompleto que luego se tome por bueno.

Solo usa la biblioteca estándar de Python (no hace falta instalar nada).
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

AQUI = Path(__file__).resolve().parent
API_BASE = "https://api.elevenlabs.io"
REINTENTOS = 4


def cargar_config(ruta):
    cfg = json.loads(Path(ruta).read_text(encoding="utf-8"))
    for clave in ("voice_id", "model_id", "voice_settings"):
        if clave not in cfg:
            raise SystemExit(f"Falta '{clave}' en {ruta}")
    vs = cfg["voice_settings"]
    for clave in ("stability", "similarity_boost"):
        if not 0.0 <= float(vs.get(clave, -1)) <= 1.0:
            raise SystemExit(f"voice_settings.{clave} debe estar entre 0 y 1 en {ruta}")
    cfg.setdefault("output_format", "mp3_44100_128")
    cfg.setdefault("archivo_guion", "guion.txt")
    cfg.setdefault("carpeta_salida", "audios_salida")
    return cfg


def leer_bloques(ruta):
    """Divide el guion en bloques separados por líneas en blanco; ignora comentarios (#)."""
    bloques, actual = [], []
    for linea in Path(ruta).read_text(encoding="utf-8").splitlines():
        if linea.strip().startswith("#"):
            continue
        if linea.strip():
            actual.append(linea.strip())
        elif actual:
            bloques.append(" ".join(actual))
            actual = []
    if actual:
        bloques.append(" ".join(actual))
    return bloques


def pedir_audio(texto, cfg, api_key, api_base):
    """Llama a text-to-speech y devuelve los bytes del audio. Reintenta en 429 y 5xx."""
    url = f"{api_base}/v1/text-to-speech/{cfg['voice_id']}?output_format={cfg['output_format']}"
    cuerpo = json.dumps({
        "text": texto,
        "model_id": cfg["model_id"],
        "voice_settings": cfg["voice_settings"],
    }).encode("utf-8")
    for intento in range(1, REINTENTOS + 1):
        req = urllib.request.Request(url, data=cuerpo, method="POST", headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        })
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            detalle = e.read().decode("utf-8", "replace")[:300]
            if e.code in (429, 500, 502, 503, 504) and intento < REINTENTOS:
                espera = 2 ** intento
                print(f"    error {e.code}, reintento {intento}/{REINTENTOS - 1} en {espera} s")
                time.sleep(espera)
                continue
            raise SystemExit(f"    La API respondió {e.code}: {detalle}")
        except urllib.error.URLError as e:
            if intento < REINTENTOS:
                espera = 2 ** intento
                print(f"    sin conexión ({e.reason}), reintento en {espera} s")
                time.sleep(espera)
                continue
            raise SystemExit(f"    No se pudo conectar con la API: {e.reason}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", default=str(AQUI / "config.json"))
    ap.add_argument("--guion", help="sobrescribe archivo_guion de config.json")
    ap.add_argument("--salida", help="sobrescribe carpeta_salida de config.json")
    ap.add_argument("--simular", action="store_true", help="no llama a la API; solo muestra qué haría")
    ap.add_argument("--forzar", type=int, action="append", default=[], metavar="N",
                    help="regenera el bloque N aunque ya exista (se puede repetir)")
    args = ap.parse_args()

    config_path = Path(args.config).resolve()
    cfg = cargar_config(config_path)
    base = config_path.parent  # las rutas relativas del config cuentan desde su carpeta
    guion = Path(args.guion) if args.guion else base / cfg["archivo_guion"]
    salida = Path(args.salida) if args.salida else base / cfg["carpeta_salida"]
    if not guion.exists():
        raise SystemExit(f"No encuentro el guion: {guion}")

    bloques = leer_bloques(guion)
    if not bloques:
        raise SystemExit(f"El guion {guion} no tiene bloques de texto.")
    for n in args.forzar:
        if not 1 <= n <= len(bloques):
            raise SystemExit(f"--forzar {n}: el guion solo tiene {len(bloques)} bloques.")

    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key and not args.simular:
        raise SystemExit("Falta la variable de entorno ELEVENLABS_API_KEY (o usa --simular).")
    api_base = os.environ.get("ELEVENLABS_API_BASE", API_BASE)  # solo para pruebas

    salida.mkdir(parents=True, exist_ok=True)
    print(f"Guion: {guion}  ({len(bloques)} bloques)")
    print(f"Voz: {cfg['voice_id']} · modelo: {cfg['model_id']} · "
          f"stability {cfg['voice_settings']['stability']} · "
          f"similarity_boost {cfg['voice_settings']['similarity_boost']}")
    print(f"Salida: {salida}\n")

    generados = omitidos = caracteres = 0
    for i, texto in enumerate(bloques, start=1):
        mp3 = salida / f"bloque_{i:02d}.mp3"
        txt = salida / f"bloque_{i:02d}.txt"
        existe = mp3.exists() and mp3.stat().st_size > 0
        if existe and i not in args.forzar:
            omitidos += 1
            aviso = ""
            if txt.exists() and txt.read_text(encoding="utf-8").strip() != texto:
                aviso = "  ⚠ el texto cambió; usa --forzar %d si quieres regenerarlo" % i
            print(f"[{i:02d}] omitido (ya existe){aviso}")
            continue

        caracteres += len(texto)
        if args.simular:
            print(f"[{i:02d}] se generaría · {len(texto)} caracteres · {texto[:60]}…")
            continue

        print(f"[{i:02d}] generando · {len(texto)} caracteres…")
        audio = pedir_audio(texto, cfg, api_key, api_base)
        tmp = mp3.with_suffix(".mp3.parcial")
        tmp.write_bytes(audio)
        tmp.replace(mp3)
        txt.write_text(texto + "\n", encoding="utf-8")
        generados += 1

    print()
    if args.simular:
        print(f"Simulación: {len(bloques) - omitidos} bloques por generar, {omitidos} omitidos, "
              f"≈ {caracteres} caracteres (los créditos dependen de tu plan y del modelo).")
    else:
        print(f"Listo: {generados} generados, {omitidos} omitidos, {caracteres} caracteres enviados.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("\nCancelado. Los bloques ya terminados se conservan.")
