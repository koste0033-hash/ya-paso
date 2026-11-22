# Plan del canal · Sin Coartada

**Concepto:** crímenes reales que parecen de película. Robos ingeniosos, estafas imposibles, criminales torpes y casos que nadie ha podido resolver, contados en un minuto, con ilustraciones y fuentes verificadas.

> Inspirado en el formato de los canales de "historias reales que parecen inventadas", pero con tema, nombre e identidad visual propios.

## 1. Identidad

| Elemento | Propuesta |
|---|---|
| Nombre | **Sin Coartada** |
| Handle | `@sincoartadamx` (estaba libre al revisarlo; resérvalo pronto) |
| Lema | "Crímenes reales que parecen de película." |
| Público | Hispanohablantes de 16 a 40 años, sobre todo de México y Latinoamérica, que ven series de crimen y documentales |
| Tono | Narrador de noticiero nocturno con humor seco. Asombra con lo ingenioso o lo absurdo del caso; nunca con la violencia. |
| Idioma | Español mexicano neutro |
| Estilo visual | Ilustración tipo cómic negro: fondo azul noche, rojo de "expediente" y amarillo de cinta policial. Sellos de "CASO CERRADO" o "SIN RESOLVER" en las miniaturas. |
| Comunidad | Llama a tus seguidores **"la brigada"** |

### Descripción del canal (para pegar)

La versión completa, con emojis y palabras clave, está en [descripcion-del-canal.md](descripcion-del-canal.md).

> Robos que parecen planeados por Hollywood, estafadores que vendieron la Torre Eiffel y ladrones que se delataron solos. En Sin Coartada te contamos crímenes reales que parecen de película, en un minuto.
> Shorts nuevos cada día y la historia completa en video largo dos veces por semana. Todos los casos están documentados: las fuentes van en la descripción de cada video.
> Únete a la brigada.

## 2. Temas fijos

1. **Golpes maestros.** Robos ingeniosos: el Banco Río de Argentina, los diamantes de Amberes, el Banco Central de Fortaleza.
2. **Estafas imposibles.** Victor Lustig y la Torre Eiffel, falsificadores de arte, impostores famosos.
3. **Criminales torpes.** Ladrones que se delataron solos, como el del jugo de limón o el que dejó su currículum.
4. **Sin resolver.** D. B. Cooper, el robo del Museo Gardner y otros casos abiertos.
5. **Hecho en México y Latinoamérica.** El robo del Museo Nacional de Antropología, estafas y fugas históricas de la región.
6. **¿Real o mito?** Historias famosas que resultaron exageradas, como la de Frank Abagnale (*Atrápame si puedes*).

## 3. Formatos

| Formato | Duración | Frecuencia | Uso |
|---|---|---|---|
| Short ilustrado | 45–60 s | 1 diario | Gancho en 2 segundos, giro final y pregunta para comentarios |
| Video largo | 8–15 min | Martes y viernes | La historia completa de los casos que mejor funcionaron como Short |
| Publicación de Comunidad | — | 2 por semana | Encuestas: "¿Qué caso quieres?", "¿Culpable o inocente?" |

**Regla de oro:** primero el Short. Si pasa de 50 mil vistas, ese caso gana su video largo. Así no gastas una semana en un video largo que nadie pidió.

## 4. Primeros 15 videos

| # | Formato | Título |
|---|---|---|
| 1 | Short | Robó dos bancos con la cara cubierta de jugo de limón… creía que era invisible |
| 2 | Short | Vendió la Torre Eiffel como chatarra… y lo intentó dos veces |
| 3 | Short | Robaron 100 millones en diamantes… y los delató la basura |
| 4 | Short | Se robaron más de 100 piezas del Museo de Antropología en Navidad… y eran dos estudiantes |
| 5 | Short | Se robaron la Mona Lisa… y nadie lo notó en un día entero |
| 6 | Short | Dejaron una nota en la bóveda: "sin armas ni rencores" |
| 7 | Short | Abrieron una tienda de pasto artificial… para cavar un túnel al banco |
| 8 | Short | Secuestró un avión, pidió 200 mil dólares y saltó en paracaídas. Nunca lo encontraron |
| 9 | Short | Los marcos vacíos siguen colgados en el museo desde 1990 |
| 10 | Short | El de *Atrápame si puedes*… probablemente inventó casi todo |
| 11 | Largo | El robo del Museo Nacional de Antropología: la Navidad de 1985 |
| 12 | Largo | El robo del siglo: el Banco Río y el túnel a las alcantarillas |
| 13 | Largo | Victor Lustig, el hombre que vendió la Torre Eiffel |
| 14 | Largo | Amberes 2003: el robo de diamantes más grande de la historia |
| 15 | Largo | D. B. Cooper: 50 años buscando a un hombre que saltó de un avión |

La lista ampliada de 50 títulos está en [50-titulos.md](50-titulos.md).

Ya están escritos en [guiones.md](guiones.md) el video largo #11 y los Shorts #1, #2 y #3.

## 5. Calendario de las primeras 2 semanas

| Día | Semana 1 | Semana 2 |
|---|---|---|
| Lunes | Short #1 (limón) | Short #8 (D. B. Cooper) |
| Martes | Short #4 + **Largo #11** | Short #9 + largo del Short que más vistas tenga |
| Miércoles | Short #2 (Torre Eiffel) | Short #10 |
| Jueves | Short #3 (diamantes) | Short nuevo |
| Viernes | Short #5 + Comunidad: "¿Qué caso sigue?" | Short nuevo + largo |
| Sábado | Short #6 | Short nuevo |
| Domingo | Short #7 | Short nuevo |

**Hora:** entre las 19:00 y las 21:00 (hora del centro de México).

## 6. Producción

- **Narración (voz oficial del canal):** siempre la misma voz, para que la gente reconozca el canal.
  - Voz: **Nacho** de ElevenLabs (mexicana, clara, tono de narrador de YouTube)
  - `voice_id`: `yfzNQS2e99Cx6312hlQF`
  - Modelo: `eleven_v4`, que admite etiquetas como `[whispering]`, `[chuckles]`, `[serious]` o `[playful]` dentro del guion
  - Ajustes: `stability` 0.5 · `similarity_boost` 0.75
  - Todo esto está guardado en [config.json](config.json), que usa `generar_audios.py`. No cambies la voz ahí salvo que quieras cambiarla para todo el canal.
  - Guion de unas 130 palabras: así la narración queda en menos de 60 segundos sin acelerarla.
  - Es voz de IA: márcalo como contenido sintético en YouTube Studio.
  - En ElevenLabs también está guardada en el **Brand Kit "Sin Coartada"** (id `u2hc06Fn1eWnrAdo5wfA`), junto con el logo, la paleta de colores y las reglas de estilo.
- **Cómo producir barato** (Short #4 en adelante, unos 3,000 créditos en vez de 8,000):
  - Imágenes con `gpt-image-2` en calidad **low**: 34 créditos sin referencia, unos 250 con la portada como referencia (contra 420 a 700 en medium o high). Se ve casi igual.
  - **Una sola** portada y **una sola** toma de narración; repetir solo si algo sale mal.
  - Si una escena sale con espacio vacío, se arregla gratis recortándola, sin volver a generarla.
  - La transcripción para los subtítulos no cuesta créditos.
- **Imágenes:** ilustraciones tipo cómic generadas con IA, en el mismo estilo siempre. No uses fotos reales de víctimas ni de escenas del crimen.
- **Plantilla de Short (60 s):**
  1. **0–2 s, gancho:** el dato más absurdo ("Se cubrió la cara con jugo de limón para robar un banco").
  2. **2–40 s, el caso:** quién, dónde, cuándo y cómo, con 3 o 4 imágenes.
  3. **40–55 s, el giro:** cómo los atraparon, o por qué nunca los atraparon.
  4. **55–60 s, pregunta:** "¿Tú qué habrías hecho?" o "¿Culpable o víctima?".
- **Miniaturas y portadas de Shorts:** título de 2 a 4 palabras en amarillo con borde negro ("¡JUGO DE LIMÓN!"), ilustración del momento clave y un sello rojo de "CASO CERRADO" o "SIN RESOLVER".
- **Música:** Biblioteca de audio de YouTube, en las categorías suspenso y jazz noir.

## 7. Reglas del canal (para no tener problemas con YouTube)

- **Sin violencia gráfica.** El crimen se cuenta, no se muestra. Elige casos de ingenio, no de sangre: es lo que YouTube monetiza sin restricciones.
- **Respeto a las víctimas.** Nada de chistes sobre ellas. El humor va solo sobre lo absurdo del criminal.
- **No glorificar.** Cada historia termina mostrando cómo los atraparon o qué les costó.
- **Solo casos documentados y cerrados**, o casos abiertos muy conocidos. No acuses a nadie que no haya sido condenado; usa "sospechoso" y "presunto".
- **Fuentes en cada descripción:** notas de prensa, expedientes judiciales y libros.
- **Nada de narcotráfico ni casos recientes con familias vivas en duelo.** Son riesgosos para el canal y para ti.

## 8. Crecimiento

El análisis completo con datos de un canal similar está en [ideas-crecimiento.md](ideas-crecimiento.md).

- **Listas de reproducción:** *Golpes maestros*, *Estafas imposibles*, *Criminales torpes*, *Sin resolver*, *Hecho en México*, *Historias completas*.
- Responde a los comentarios de la primera hora; ayuda a que YouTube muestre el Short a más gente.
- Cuando tengas 3 o 4 Shorts con más de 100 mil vistas, haz un **video recopilatorio** de 10 minutos con esos casos.
- **A partir de los 10 mil suscriptores:** un producto propio, como un libro digital de casos o un pódcast.

## 9. Metas

| Plazo | Meta |
|---|---|
| Mes 1 | 30 Shorts y 4 videos largos; 500 suscriptores |
| Mes 3 | Un Short con más de 500 mil vistas; 5,000 suscriptores |
| Mes 6 | 10 mil suscriptores; requisitos del Programa de Socios cumplidos (1,000 suscriptores + 10 millones de vistas en Shorts en 90 días, o 4,000 horas de video largo) |

## 10. Checklist de arranque

- [ ] Crear el canal y reservar `@sincoartadamx`
- [ ] Logo y banner (siguiente paso)
- [ ] Pegar la descripción del canal
- [ ] Producir los Shorts #1 al #7 antes de publicar el primero, para tener una semana de colchón
- [ ] Producir el video largo #11
- [ ] Crear las 6 listas de reproducción
- [ ] Publicar la semana 1
