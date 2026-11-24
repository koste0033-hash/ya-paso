# Cortos bíblicos animados

Generador de cortos verticales (1080×1920, 9:16) de 40–60 segundos para
**YouTube Shorts**, **Facebook Reels** y **TikTok**. Todo se hace con código, gratis:
fondos animados, siluetas, rayos de luz, texto que aparece palabra por palabra,
música y efectos de sonido.

## Primer corto: David y Goliat

`salida/david_y_goliat.mp4` (46 s). Está listo para subir.

| Tiempo | Escena |
|---|---|
| 0–5 s | Gancho: el gigante aparece entre relámpagos |
| 5–13 s | 40 días desafiando a Israel, los soldados tiemblan |
| 13–21 s | David llega con sus ovejas y toma 5 piedras del río |
| 21–29 s | Versículo 1 Samuel 17:45 |
| 29–36 s | La honda, la piedra… ¡y el gigante cae! |
| 36–46 s | Lección + llamada a la acción («Escribe AMÉN») |

### Texto para publicar

**Título:** ¿Un niño contra un gigante de 3 metros? 😱 #DavidYGoliat #Biblia

**Descripción:**
> Goliat desafió a Israel durante 40 días y nadie se atrevía a enfrentarlo… hasta que llegó
> un joven pastor con una honda y 5 piedras. 🙌
> «Tú vienes a mí con espada y lanza y jabalina; mas yo vengo a ti en el nombre de Jehová
> de los ejércitos.» — 1 Samuel 17:45
> ¿Cuál es el gigante que estás enfrentando hoy? Escribe AMÉN si crees que Dios es más grande. 🙏

**Hashtags:** #Biblia #DavidYGoliat #Dios #Fe #HistoriasBiblicas #Cristianos #Shorts #Reels

## Segundo corto: Daniel en el foso de los leones

`salida/daniel_leones.mp4` (49 s), basado en Daniel 6.

**Título:** Lo echaron a los leones… ¡por orar! 🦁🙏 #Daniel #Biblia

**Descripción:**
> El rey prohibió orar a Dios durante 30 días. Daniel abrió su ventana y siguió orando 3 veces
> al día, como siempre… y lo arrojaron al foso de los leones. 😱
> «Mi Dios envió su ángel, el cual cerró la boca de los leones.» — Daniel 6:22
> Si Dios cerró la boca de los leones, puede cuidarte a ti. Escribe AMÉN si lo crees. 🙏

**Hashtags:** #Biblia #Daniel #FosoDeLosLeones #Fe #Oracion #HistoriasBiblicas #Shorts #Reels

## Tercer corto: Moisés y el mar Rojo (30 s)

`salida/moises_mar_rojo.mp4` (30 s), basado en Éxodo 14.

**Título:** Detrás, un ejército… delante, el mar 🌊🙏 #Moisés #Biblia

**Descripción:**
> El pueblo de Israel estaba atrapado: el ejército de Faraón detrás y el mar delante. Moisés alzó
> su vara, y Dios abrió el mar con un fuerte viento. ¡Cruzaron en seco! 🌊
> «Jehová peleará por vosotros, y vosotros estaréis tranquilos.» — Éxodo 14:14
> Cuando no veas salida, Dios abre un camino. Escribe AMÉN si lo crees. 🙏

**Hashtags:** #Biblia #Moises #MarRojo #Fe #Dios #HistoriasBiblicas #Shorts #Reels

## Cómo crear un video

Se necesita Python 3 con `numpy` y `Pillow`, y también `ffmpeg`.

```bash
cd cortos-biblicos
python3 motor.py cortos/david_y_goliat.py                    # crea salida/david_y_goliat.mp4 (~1–2 min)
python3 motor.py cortos/david_y_goliat.py --fotos 2,15,30    # solo fotos de prueba (rápido)
```

## Cómo hacer un corto nuevo

1. Copia `cortos/david_y_goliat.py` con otro nombre, por ejemplo `cortos/noe.py`.
2. Cambia `TITULO`, `DURACION` y los `TEXTOS`. Pon entre `*asteriscos*` las palabras que
   quieras en dorado.
3. Cambia las `ESCENAS`. Cada escena es una función que dibuja un cuadro. Puedes usar:
   - `fondo(...)`: cielo con degradado
   - `sol(...)` y `rayos(...)`: sol y luz divina
   - `colinas(...)`: montañas
   - `persona(alto, "pastor" | "guerrero", baston=, lanza=, escudo=, casco=, corona=, brazos_arriba=)`: siluetas de personas
   - `oveja(...)`: ovejas
   - `Polvo(...)`: partículas, estrellas o polvo dorado
   - `pegar_rotado(...)`: para que una figura gire o caiga
4. En `audio()` elige los acordes (menores = tensión, mayores = esperanza) y los efectos
   (`golpe`, `tambor`, `silbido`, `campana`).
5. Saca fotos de prueba con `--fotos` y, cuando te guste, genera el video.

O simplemente pídeme el siguiente corto y lo hago yo.

## Voz (opcional)

El video tiene música, pero no narración. Puedes:
- grabar tu voz leyendo los textos y ponerla encima en CapCut (con eso suele haber más retención), o
- pedirme una voz realista en español con ElevenLabs (gasta créditos de tu cuenta).

## Ideas para los siguientes cortos (cada uno con su gancho)

1. **Noé y el arca**: «Construyó un barco gigante… donde nunca había llovido.»
2. **Daniel en el foso de los leones**: «Lo echaron a los leones por orar…»
3. **Moisés y el mar Rojo**: «Detrás, un ejército. Delante, el mar.»
4. **Jonás y el gran pez**: «Huyó de Dios… y terminó dentro de un pez.»
5. **Sansón**: «El hombre más fuerte del mundo perdió todo por un secreto.»
6. **El hijo pródigo**: «Lo gastó todo… y su padre corrió a abrazarlo.»
7. **Jesús calma la tormenta**: «Los discípulos gritaban… y Jesús dormía.»
8. **Los 3 jóvenes en el horno de fuego**: «Lo calentaron 7 veces más… y vieron a un cuarto hombre.»
9. **La resurrección de Lázaro**: «Llevaba 4 días muerto.»
10. **Pedro camina sobre el agua**: «Mientras miró a Jesús, no se hundió.»

## Consejos para crecer

- Los **primeros 2 segundos** deciden si la gente se queda: empieza siempre con una pregunta o algo impactante.
- Duración ideal: **35–50 s**. Si se ve completo y se repite, al algoritmo le gusta.
- Publica a diario o cada dos días, a la misma hora.
- Termina con una pregunta o un «Escribe AMÉN» para que la gente comente.
- Sube el mismo video a YouTube Shorts, Facebook Reels, TikTok e Instagram.
