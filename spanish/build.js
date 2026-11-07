// Joins the shared engine + one lesson into a single self-contained HTML file per unit.
// Usage: node spanish/build.js [folder-for-artifact-copies]
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const read = (f) => fs.readFileSync(path.join(dir, 'src', f), 'utf8');
const css = read('engine.css');
const engine = read('engine.js');

const units = [
  { src: 'unidad-12.js', out: 'Unidad-12-Me-dejas-una-pintura.html', title: 'Unidad 12 · ¿Me dejas una pintura?' },
  { src: 'unidad-15.js', out: 'Unidad-15-Tiempo-libre.html', title: 'Unidad 15 · Mi tiempo libre' },
];
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Baloo+2:wght@600;700;800&display=swap">';

function inner(u) {
  return `<title>${u.title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
${fonts}
<style>
${css}
</style>
<div id="app"></div>
<noscript><p style="padding:24px">Este juego necesita JavaScript activado.</p></noscript>
<script>
${read(u.src)}
</script>
<script>
${engine}
</script>
`;
}

const artifactDir = process.argv[2];
for (const u of units) {
  const body = inner(u);
  const full = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${body.split('<div id="app">')[0]}</head>
<body>
<div id="app">${body.split('<div id="app">')[1]}</body>
</html>
`;
  fs.writeFileSync(path.join(dir, u.out), full);
  console.log('wrote', u.out, full.length, 'bytes');
  if (artifactDir) fs.writeFileSync(path.join(artifactDir, u.out), body);
}
