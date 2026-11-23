# Cómo renderizar «La Batalla de Puebla» en tu computadora con Windows

## 1. Revisa tu tarjeta gráfica (1 minuto)
1. Presiona **Ctrl + Shift + Esc** para abrir el **Administrador de tareas**.
2. Ve a la pestaña **Rendimiento**.
3. Busca la sección **GPU** en la columna izquierda. Ahí aparece el nombre, por ejemplo *NVIDIA GeForce RTX 3060*,
   *AMD Radeon RX 6600* o *Intel UHD Graphics*.
4. Si hay **GPU 0** y **GPU 1**, anota las dos.

Mándale a Claude el nombre que aparece. Como referencia:
- **NVIDIA RTX / GTX o AMD Radeon RX**: el render debería ser rápido.
- **Intel UHD / Iris**: funciona, pero más lento.

## 2. Instala Node.js (solo la primera vez)
1. Entra a https://nodejs.org
2. Descarga la versión **LTS** y ábrela.
3. Instálala con las opciones que vienen marcadas (siguiente, siguiente, instalar).

## 3. Descarga el proyecto
1. Abre el repositorio en GitHub, en la rama `ccr-03416ab7-dwtbzm`.
2. Pulsa el botón verde **Code** y luego **Download ZIP**.
3. Haz clic derecho en el ZIP y elige **Extraer todo**. Guárdalo, por ejemplo, en una carpeta de tu Escritorio.

## 4. Renderiza
1. Abre la carpeta extraída y entra a `batalla-puebla\motor`.
2. Haz doble clic en **RENDERIZAR.bat**.
   - La primera vez instala lo necesario y descarga un navegador. Tarda varios minutos y necesita internet.
   - Si Windows muestra «Windows protegió su PC», pulsa **Más información** y luego **Ejecutar de todas formas**.
3. Al terminar se abre la carpeta `salida` con tu video MP4.

Si el render falla con un error de GPU, usa **RENDERIZAR-SIN-GPU.bat**. Funciona igual, pero es más lento.

## 5. Tu voz
Graba el guion de `batalla-puebla/GUION.md` y guárdalo como `batalla-puebla\motor\public\voz\voz.wav`.
El lanzador lo detecta y lo pone en el video. Después hay que ajustar los tiempos de cada toma a tu voz; mándale
el audio a Claude para eso.

## Qué incluye este avance (versión 1, unos 10 segundos)
1. Lorencez a caballo, confiado, y sus soldados alzando los fusiles. La cámara sube: «6,000 soldados franceses».
2. El cerro con el Fuerte de Loreto: la cámara sube hasta Zaragoza en el muro, con los voluntarios de la sierra.
3. Tormenta: los franceses suben la ladera de lodo y uno resbala en cámara lenta.
