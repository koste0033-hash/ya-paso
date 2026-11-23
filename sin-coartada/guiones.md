# Guiones · Sin Coartada

Guiones de los primeros videos del [plan del canal](plan-del-canal.md).
Entre corchetes van las indicaciones para la edición; no se narran.

---

## Cómo escribir ganchos que retienen

Sale de revisar los Shorts más vistos de canales del mismo formato (más de un millón de vistas). Todos repiten 4 reglas:

1. **Un hecho concreto y visual en la primera frase.** Quién hizo qué, sin introducción. Nada de "Hoy te voy a contar…".
2. **Los puntos suspensivos marcan el giro.** "Hicieron X… y pasó Y". El cerebro necesita oír la segunda mitad.
3. **Números exactos.** "507 años", "26 reinas", "76 castores". Un número concreto suena verdadero y se recuerda.
4. **El título del video es el mismo gancho**, y la portada lo resume en 2 o 3 palabras.

### Fórmulas

| Fórmula | Ejemplo para Sin Coartada |
|---|---|
| Hizo [algo normal]… y [consecuencia absurda] | Se untó la cara con limón… y robó dos bancos |
| [Número] + [acción]… y [giro] | Robaron 100 millones en diamantes… y los delató la basura |
| [Algo imposible] que sí pasó | Vendió la Torre Eiffel. Dos veces. |
| Nadie [hizo X]… hasta que [Y] | Nadie notó que faltaba la Mona Lisa… durante un día entero |
| [Objeto cotidiano] + crimen | Un sándwich resolvió el robo de diamantes más grande de la historia |
| Sigue sin resolverse | Secuestró un avión, saltó en paracaídas… y nunca lo encontraron |

### Lo que mata un gancho

- Empezar con el año o el lugar ("En 1995, en Pittsburgh…"). Eso va en la segunda frase.
- Anunciar en vez de contar ("Esta historia te va a sorprender").
- Gancho y portada que dicen cosas distintas.

## Identidad Sin Coartada

Lo que hace que el canal no se parezca a ningún otro. Lista de casos numerados: [expedientes.md](expedientes.md).

- **Expediente numerado:** cada Short es "Expediente #00X". El número aparece en pantalla los primeros 3 segundos (`"expediente": "005"` en `escenas.json`) y al final del título.
- **El Inspector narra**, con dos frases fijas:
  - Al abrir, después de la pregunta: *"Abran el expediente."*
  - Al cerrar, antes de la pregunta al público: *"Caso cerrado… ¿o no?"* (en los casos sin resolver: *"Este expediente… sigue abierto."*).
- **Serie principal, "El error que los delató":** el guion gira alrededor del detalle absurdo que hundió al culpable, y ese detalle es lo que queda pendiente hasta el final.
- **Pista del siguiente expediente:** última frase antes de la pregunta: *"Mañana: [objeto del próximo caso]…"* (por ejemplo, "Mañana: una lata de palomitas… con 50 mil bitcoins adentro"). Solo cuando ya esté producido el siguiente.
- **Comunidad, "¿Culpable o genio?":** encuesta en la pestaña de Comunidad y comentario fijado con esa pregunta en cada expediente.
- **Lo que no copiamos de otros canales:** su personaje, su forma de presentar ("respondido por un comandante…") ni sus temas. Lo que sí tomamos es lo que funciona en general: la pregunta en el título, la portada limpia y el ritmo rápido.

### Portada (primer cuadro del Short) · formato v2

Inspirado en Comandante Porqué. Primera versión: el Short #4 (Banco Río).

- **Un solo personaje, grande**, en primer plano, con una cara muy expresiva (guiño, sorpresa, culpa) y **el objeto clave junto a la cara** (la pistola de juguete, el limón, el frasco).
- **Fondo liso y brillante**: un color fuerte (rojo, amarillo, azul) con rayos simples. Nada más en el fondo.
- **La pregunta del título arriba**, en 2 renglones, en blanco con borde negro grueso y **la palabra clave en amarillo** ("¿POR QUÉ CON PISTOLAS DE **JUGUETE**?").
- **Sin sello ni texto extra.** El sello CASO CERRADO / SIN RESOLVER va en la escena final.
- Revisa que se entienda **en miniatura** (al 10% de su tamaño).

Prompt base (gpt-image-2, calidad low, con la portada anterior como referencia del personaje): *"Minimal, bold, very clean flat cartoon style… ONE single character as a huge close-up… plain bright high-contrast background… huge bold white lettering with thick black outline… with the word X in bright yellow. No other text."*

### Estructura del guion para retener (≈140 palabras, 55–65 s)

| Segundos | Qué pasa | Ejemplo (Banco Río) |
|---|---|---|
| 0–6 | **La pregunta del título, palabra por palabra.** Coincide con la portada. | "¿Por qué unos ladrones asaltaron un banco con pistolas de juguete… y aun así se salieron con la suya?" |
| 6–16 | **Contexto en una línea + primera contradicción.** | "Parecen empresarios. Pero sus armas… son de plástico." |
| 16–30 | **Giro cada 5 o 6 s.** Frases cortas; "pero", "porque", "mientras". | "Pide tiempo… y la policía se lo da. Porque mientras él hablaba…" |
| 30–45 | **La sorpresa grande.** | "Los comandos entran. Y no hay nadie." |
| 45–55 | **Cerrar lo que quedó pendiente** (algo que se mencionó al inicio y no se explicó). | "Pero antes de irse, dejaron su firma. La nota decía…" |
| 55–60 | **Pregunta para comentar.** | "¿Tú los habrías atrapado?" |

Reglas:
- **Dejar algo pendiente desde el principio** y resolverlo al final (la nota, el error, el nombre del culpable). Es lo que hace que la gente no deslice.
- **Nunca decir el final en los primeros 10 segundos.**
- **Un cambio de imagen cada 2 o 3 s:** en `escenas.json` pon `"cortes_rapidos": true` y `"whoosh": true`. `montar.py` parte cada escena en tomas con encuadres distintos, sin gastar créditos.
- **Etiquetas de voz** para cambiar el ritmo: `[whispering]` antes del secreto y `[serious]` antes de la sorpresa.

---

## Short #1 · El ladrón del jugo de limón

**Portada:** hombre con la cara chorreando limón frente a una cámara de seguridad. Texto: "¡JUGO DE LIMÓN!". Sello: CASO CERRADO.

**[0:00 · Gancho]**
Este hombre robó dos bancos a cara descubierta… porque creía que el jugo de limón lo hacía invisible.

**[0:04 · El caso]**
Pittsburgh, Estados Unidos, 1995. McArthur Wheeler entra a un banco a plena luz del día. Sin máscara, sin gorra. Solo con la cara embarrada de jugo de limón.
Su lógica: el limón sirve como tinta invisible… entonces también debería volver invisible su cara ante las cámaras.
Hasta lo había probado: se tomó una foto con una Polaroid y no salió. Probablemente apuntó mal.
Roba el primer banco. Roba el segundo. Sonríe a las cámaras.

**[0:35 · El giro]**
Esa misma noche, su cara sale en el noticiero de las once. En menos de una hora ya lo tenían.
Cuando le enseñaron el video, solo dijo: "Pero si me puse el jugo".

**[0:48 · Remate]**
Su caso inspiró a dos psicólogos a estudiar por qué la gente que menos sabe es la que más segura se siente. Hoy se llama el efecto Dunning-Kruger.

**[0:56 · Pregunta]**
¿Cuál es el criminal más torpe del que hayas oído? Te leo en los comentarios.

**Fuentes:** Kruger y Dunning (1999), *Journal of Personality and Social Psychology*; *Pittsburgh Post-Gazette* (1996).

---

## Short #2 · Vendió la Torre Eiffel

**Portada:** hombre elegante con bigote entregando un recibo, con la Torre Eiffel atrás. Texto: "¡LA VENDIÓ!". Sello: CASO CERRADO.

**[0:00 · Gancho]**
Este hombre vendió la Torre Eiffel… y como le salió tan bien, la volvió a vender.

**[0:04 · El caso]**
París, 1925. La torre necesitaba reparaciones carísimas, y los periódicos se preguntaban si valía la pena mantenerla.
Victor Lustig, un estafador con traje fino, lo leyó y tuvo una idea.
Se hizo pasar por funcionario del gobierno, citó a varios comerciantes de chatarra en un hotel de lujo y les dijo, en secreto, que la torre iba a ser desmantelada y vendida como fierro viejo.
Uno de ellos, André Poisson, le creyó. Le pagó la torre… y además le dio un soborno para asegurar el trato.

**[0:38 · El giro]**
Lustig huyó con el dinero. Poisson nunca lo denunció: le daba demasiada vergüenza.
Así que, poco después, Lustig regresó a París e intentó venderla otra vez. Esa vez el comprador sí fue a la policía, y Lustig escapó a Estados Unidos.

**[0:52 · Remate y pregunta]**
Años después lo atraparon por falsificar dinero y terminó en Alcatraz.
¿Tú le habrías comprado la torre?

**Fuentes:** J. F. Johnson y F. Miller, *The Man Who Sold the Eiffel Tower* (1961); archivos del Servicio Secreto de EE. UU.

---

## Short #3 · Los diamantes de Amberes y la basura

**Portada:** bolsa de basura en un bosque con diamantes saliendo. Texto: "¡LOS DELATÓ LA BASURA!". Sello: CASO CERRADO.

**[0:00 · Gancho]**
Robaron unos 100 millones de dólares en diamantes de la bóveda más segura del mundo… y los delató una bolsa de basura.

**[0:05 · El caso]**
Amberes, Bélgica, 2003. La bóveda del Centro de Diamantes tenía sensores de calor, de movimiento, de vibración y un campo magnético. Se decía que era imposible de robar.
Leonardo Notarbartolo pasó más de dos años rentando una oficina en el edificio, haciéndose pasar por comerciante de diamantes. Mientras tanto, estudiaba cada detalle de la seguridad.
Un fin de semana de febrero, su banda entró a la bóveda y vació más de 120 cajas de seguridad.

**[0:38 · El giro]**
El golpe fue perfecto. La huida, no.
Uno de ellos tiró una bolsa de basura en un bosque junto a la carretera. El dueño del terreno la encontró y llamó a la policía. Dentro había un sándwich a medio comer, recibos y papeles con pistas que llevaron directo a la banda.

**[0:52 · Remate y pregunta]**
Notarbartolo fue condenado a 10 años. Los diamantes nunca aparecieron.
¿Dónde crees que están?

**Fuentes:** Joshua Davis, "The Untold Story of the World's Biggest Diamond Heist", *Wired* (2009); S. Selby y G. Campbell, *Flawless* (2010).

---

## Video #11 (largo, unos 10 min) · El robo del Museo Nacional de Antropología

**Título:** Se robaron el Museo de Antropología en Navidad… y eran dos estudiantes
**Miniatura:** máscara de jade de Pakal dentro de una mochila, con la silueta de un vocho de noche. Texto: "NAVIDAD 1985". Sello: CASO CERRADO.

**[0:00 · Gancho]**
La mañana del 25 de diciembre de 1985, los guardias del Museo Nacional de Antropología abrieron las salas… y encontraron las vitrinas vacías.
Faltaban más de cien piezas prehispánicas, entre ellas la máscara funeraria de jade del rey maya Pakal.
Fue uno de los mayores robos de arte de la historia de México.
Y lo hicieron dos estudiantes.

**[0:30 · Presentación]**
Esto es Sin Coartada: crímenes reales que parecen de película. Si te gustan estas historias, suscríbete y únete a la brigada.

**[0:40 · Contexto]**
México, 1985. El país todavía se recuperaba del terremoto de septiembre.
El Museo Nacional de Antropología, en Chapultepec, guardaba algunas de las piezas más valiosas del mundo prehispánico: oro mixteco, obsidiana mexica y jade maya.
Pero su seguridad no estaba a la altura. Las vitrinas no tenían alarmas modernas, y esa noche era Nochebuena.

**[1:30 · Los ladrones]**
Carlos Perches y Ramón Sardina eran dos jóvenes de clase media que habían dejado la carrera de veterinaria.
No eran una banda internacional. No tenían contactos en el mercado negro.
Según las crónicas, visitaron el museo decenas de veces durante meses. Tomaban notas, contaban pasos y observaban a qué hora cambiaban los turnos los guardias.

**[2:45 · La noche del robo]**
La noche del 24 de diciembre, mientras medio país cenaba, los dos entraron al museo.
De acuerdo con las investigaciones, se metieron por los ductos de ventilación hasta llegar a las salas.
Durante horas abrieron vitrinas, escogieron piezas pequeñas pero valiosísimas y las metieron en una bolsa.
Nadie los vio. Nadie oyó nada.
Salieron antes del amanecer, subieron todo a un auto y se fueron.

**[4:00 · El escándalo]**
Cuando se descubrió el robo, la noticia le dio la vuelta al mundo.
La policía sospechó de todos: de los guardias, de coleccionistas extranjeros, de una red internacional de tráfico de arte.
Durante meses no hubo ninguna pista.
Y las piezas, que la policía buscaba en aeropuertos y fronteras, estaban guardadas en un clóset, en una casa de las afueras de la ciudad.

**[5:30 · El problema de robar algo famoso]**
Ahí está la ironía: robaron piezas tan famosas que eran imposibles de vender.
Cualquier comprador serio sabía de dónde venían. Nadie quería tocarlas.
Durante años, las piezas más valiosas de la historia de México estuvieron arrumbadas en un clóset, sin que nadie pudiera disfrutarlas.

**[6:30 · La caída]**
Según las investigaciones, Perches intentó usar algunas piezas como moneda de cambio con gente peligrosa, en Acapulco.
Ese fue su error. Alguien habló.
En junio de 1989, tres años y medio después del robo, la policía llegó a la casa y encontró las piezas.
Se recuperó casi todo, incluida la máscara de Pakal.

**[7:45 · Lo que quedó]**
Las piezas volvieron al museo, que reforzó toda su seguridad.
En 2018 la historia llegó al cine con la película *Museo*, protagonizada por Gael García Bernal.
Y la pregunta sigue en el aire: ¿lo hicieron por dinero… o solo para demostrar que podían?

**[8:30 · Cierre]**
Si fueras uno de ellos, ¿cuándo te habrías arrepentido? Déjamelo en los comentarios.
Y si quieres otro golpe que parece de película, aquí te dejo la historia del robo del siglo en Argentina. Nos vemos en el próximo expediente.

**Fuentes para la descripción:**
- Archivo de prensa: *Proceso*, *La Jornada* y *El Universal* (diciembre de 1985 y junio de 1989)
- Instituto Nacional de Antropología e Historia (INAH)
- Película *Museo* (2018), dirigida por Alonso Ruizpalacios

> **Antes de grabar:** confirma en la hemeroteca el número exacto de piezas robadas y recuperadas, y qué pasó con cada uno de los dos detenidos. Las cifras varían según la fuente.
