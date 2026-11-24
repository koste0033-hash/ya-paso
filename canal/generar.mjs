import { createRequire } from 'module'; const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const INK = '#1b1b2f';
const stars = (n, w, h, seed = 1) => Array.from({length: n}, (_, i) => `<circle cx="${(i * 263 * seed) % w}" cy="${(i * 151 * seed) % h}" r="${2 + (i % 3) * 1.5}" fill="#fff" opacity="${0.35 + (i % 5) * 0.12}"/>`).join('');
const ovni = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">
  <ellipse cx="0" cy="30" rx="210" ry="64" fill="#b6fff0" opacity="0.2"/>
  <path d="M -70 -10 Q -60 -90 0 -92 Q 60 -90 70 -10 Z" fill="#a9e7ff" stroke="${INK}" stroke-width="8"/>
  <ellipse cx="0" cy="0" rx="170" ry="42" fill="#c3cad3" stroke="${INK}" stroke-width="9"/>
  ${[-110, -55, 0, 55, 110].map((lx, i) => `<circle cx="${lx}" cy="4" r="11" fill="${i % 2 ? '#ffd23f' : '#7dffb2'}" stroke="${INK}" stroke-width="4"/>`).join('')}
</g>`;
// el monito: cabeza con gorra roja, ojos de sorpresa, cuerpo de palito
const monito = (x, y, s, susto = true) => `<g transform="translate(${x},${y}) scale(${s})">
  <path d="M -22 -60 L -60 80 M 22 -60 L 60 80" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M 0 -200 L 0 -60" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M 0 -180 L -95 -260 M 0 -180 L 95 -260" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <g transform="translate(0,-280)">
    <circle r="78" fill="#fff" stroke="${INK}" stroke-width="10"/>
    ${susto
      ? `<circle cx="-26" cy="-6" r="19" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="30" cy="-6" r="19" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="-26" cy="-6" r="7" fill="${INK}"/><circle cx="30" cy="-6" r="7" fill="${INK}"/><ellipse cx="3" cy="38" rx="13" ry="17" fill="#7a1f1f" stroke="${INK}" stroke-width="4"/>`
      : `<circle cx="-24" cy="-6" r="9" fill="${INK}"/><circle cx="28" cy="-6" r="9" fill="${INK}"/><path d="M -16 28 Q 4 44 24 28" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`}
    <path d="M -74 -24 A 76 76 0 0 1 74 -24 Z" fill="#e63946" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M 58 -28 L 136 -19 L 132 -6 L 60 -13 Z" fill="#a4161a" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="0" cy="-78" r="9" fill="#a4161a" stroke="${INK}" stroke-width="4"/>
  </g>
</g>`;
const fondo = (w, h) => `<defs><radialGradient id="cielo" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#2c3e70"/><stop offset="0.6" stop-color="#16204a"/><stop offset="1" stop-color="#0b1030"/></radialGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#cielo)"/>${stars(70, w, h)}`;

const perfil = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  ${fondo(800, 800)}
  <path d="M 330 270 L 170 720 L 630 720 L 470 270 Z" fill="#b6fff0" opacity="0.22"/>
  ${ovni(400, 220, 1.25)}
  ${monito(400, 690, 0.95)}
  <circle cx="400" cy="400" r="392" fill="none" stroke="#7dffb2" stroke-width="16"/>
</svg>`;

// banner 2560x1440; zona segura (se ve en todos los dispositivos): 1546x423 centrada
const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1440" viewBox="0 0 2560 1440">
  ${fondo(2560, 1440)}
  <path d="M 0 1000 Q 640 930 1280 990 Q 1920 1050 2560 980 L 2560 1440 L 0 1440 Z" fill="#14213f"/>
  <path d="M 700 600 L 600 860 L 860 860 L 780 600 Z" fill="#b6fff0" opacity="0.2"/>
  ${ovni(740, 560, 0.55)}
  ${monito(730, 860, 0.62)}
  ${ovni(2020, 520, 0.35)}
  ${ovni(380, 470, 0.25)}
  <text x="1380" y="690" font-family="DejaVu Sans" font-weight="900" font-size="104" fill="#ffffff" stroke="${INK}" stroke-width="14" paint-order="stroke" text-anchor="middle">EXPEDIENTE</text>
  <text x="1380" y="800" font-family="DejaVu Sans" font-weight="900" font-size="104" fill="#7dffb2" stroke="${INK}" stroke-width="14" paint-order="stroke" text-anchor="middle">OVNI MONITO</text>
  <text x="1380" y="868" font-family="DejaVu Sans" font-weight="700" font-size="42" fill="#ffd23f" stroke="${INK}" stroke-width="8" paint-order="stroke" text-anchor="middle">Casos OVNI de Latinoamérica en 1 minuto 👽</text>
</svg>`;

const browser = await chromium.launch();
const page = await browser.newPage({deviceScaleFactor: 1});
for (const [name, svg, w, h] of [['perfil', perfil, 800, 800], ['banner', banner, 2560, 1440]]) {
  await page.setViewportSize({width: w, height: h});
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({path: `${process.argv[2]}/${name}.png`, clip: {x: 0, y: 0, width: w, height: h}});
}
await browser.close();
