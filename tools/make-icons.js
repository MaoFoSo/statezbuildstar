const { chromium } = require('playwright');
// Erzeugt die PNG-Icons aus icons/icon.svg: node tools/make-icons.js (im Repo-Hauptverzeichnis)
const fs = require('fs');
const svg = fs.readFileSync('icons/icon.svg', 'utf8');
const square = svg.replace('rx="112"', 'rx="0"');
const bg = 'linear-gradient(#9fd3ee, #cdeaf6 55%, #5fb0dc)';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const shot = async (html, size, out, transparent) => {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<html><body style="margin:0;background:transparent">${html}</body></html>`);
    await p.screenshot({ path: out, omitBackground: transparent });
  };
  const img = (s, size) => s.replace('<svg ', `<svg width="${size}" height="${size}" style="display:block" `);
  await shot(img(svg, 192), 192, 'icons/icon-192.png', true);
  await shot(img(svg, 512), 512, 'icons/icon-512.png', true);
  await shot(img(square, 180), 180, 'icons/apple-touch-icon.png', false);
  // maskable: Inhalt in der sicheren Zone (80 %), Hintergrund randlos
  const mask = square.replace('<g id="fg">', '<g id="fg" transform="translate(256 290) scale(0.8) translate(-256 -290)">');
  await shot(img(mask, 512), 512, 'icons/icon-maskable-512.png', false);
  await b.close();
})();
