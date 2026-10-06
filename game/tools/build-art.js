/* Cold Read: art generator.
   Builds game/art.js (window.ART = { map, intro, scenes, portraits }) from hand-written SVG.
   Run:  node game/tools/build-art.js
   One look everywhere: deep blue-grey night, sodium-lamp amber, muted teal, a restrained red,
   flat shapes with ink outlines. Every SVG gets its own id prefix so inline SVGs never clash. */
"use strict";
const fs = require("fs");
const path = require("path");

/* ------------------------------------------------------------ palette */
const K = {
  ink: "#07090c",
  n0: "#0a0f14", n1: "#0f171e", n2: "#152029", n3: "#1d2b36", n4: "#273947", n5: "#344a5a", n6: "#4a6273", n7: "#6a8492", n8: "#93a8b1",
  t0: "#16302f", t1: "#22484a", t2: "#33615f", t3: "#4d827c", t4: "#7aa79f",
  a0: "#3d2a12", a1: "#7a5222", a2: "#b9822f", a3: "#e2a648", a4: "#f6cd7d", a5: "#fff0c8",
  red: "#a3332b", redD: "#5c1d1a",
  paper: "#cdc2a6", paperD: "#958b74", paperL: "#e2d9c2",
  note: "#d8b53e", oil: "#d6a92c", oilD: "#8e6c17",
  wood: "#3a2c22", woodL: "#54402f", woodD: "#241a14",
  steel: "#5b6b75", steelD: "#36424a", steelL: "#8796a0"
};

/* ------------------------------------------------------------ helpers */
let P = "x";            // id prefix of the SVG being built
let W = 3;              // default ink width
const id = n => P + n;
const u = n => "url(#" + P + n + ")";
function at(o) {
  let s = "";
  for (const k in o) { const v = o[k]; if (v === undefined || v === null || v === false) continue; s += " " + k + "=\"" + v + "\""; }
  return s;
}
function st(f, o) {
  o = o || {};
  const r = { fill: f == null ? "none" : f };
  const s = o.s === undefined ? K.ink : o.s;
  if (s) { r.stroke = s; r["stroke-width"] = o.w == null ? W : o.w; }
  if (o.op != null) r.opacity = o.op;
  if (o.fop != null) r["fill-opacity"] = o.fop;
  if (o.dash) r["stroke-dasharray"] = o.dash;
  if (o.cl) r["clip-path"] = u(o.cl);
  if (o.flt) r.filter = u(o.flt);
  if (o.tf) r.transform = o.tf;
  if (o.cap) r["stroke-linecap"] = o.cap;
  return r;
}
const pa = (d, f, o) => "<path" + at(Object.assign({ d }, st(f, o))) + "/>";
const re = (x, y, w, h, f, o) => "<rect" + at(Object.assign({ x, y, width: w, height: h, rx: (o && o.rx) || null }, st(f, o))) + "/>";
const el = (cx, cy, rx, ry, f, o) => "<ellipse" + at(Object.assign({ cx, cy, rx, ry }, st(f, o))) + "/>";
const ci = (cx, cy, r, f, o) => "<circle" + at(Object.assign({ cx, cy, r }, st(f, o))) + "/>";
const li = (x1, y1, x2, y2, s, w, o) => "<line" + at(Object.assign({ x1, y1, x2, y2, stroke: s || K.ink, "stroke-width": w || W }, o || {})) + "/>";
const po = (pts, f, o) => "<polygon" + at(Object.assign({ points: pts }, st(f, o))) + "/>";
const g = (o, ...kids) => "<g" + at(o || {}) + ">" + kids.join("") + "</g>";
const tx = (x, y, s, o) => "<text" + at(Object.assign({ x, y, fill: K.n8, "font-family": "Georgia, 'Times New Roman', serif", "font-size": 16 }, o || {})) + ">" + s + "</text>";
const N = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
// shadow/light overlays without outlines
const sh = (d, op, c) => pa(d, c || K.ink, { s: null, op: op == null ? 0.35 : op });

// seeded random, so the build is stable
let seed = 7;
function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
function rr(a, b) { return a + (b - a) * rnd(); }

function baseDefs(w, h) {
  return "<radialGradient id='" + id("vig") + "' cx='50%' cy='48%' r='72%'><stop offset='55%' stop-color='#000' stop-opacity='0'/><stop offset='100%' stop-color='#000' stop-opacity='.62'/></radialGradient>" +
    "<pattern id='" + id("rain") + "' width='46' height='90' patternUnits='userSpaceOnUse' patternTransform='rotate(14)'>" +
    "<line x1='6' y1='0' x2='6' y2='26' stroke='" + K.n8 + "' stroke-width='1.1' opacity='.55'/><line x1='29' y1='44' x2='29' y2='62' stroke='" + K.n8 + "' stroke-width='1' opacity='.4'/><line x1='40' y1='14' x2='40' y2='30' stroke='" + K.n8 + "' stroke-width='.8' opacity='.35'/></pattern>" +
    "<pattern id='" + id("hatch") + "' width='7' height='7' patternUnits='userSpaceOnUse' patternTransform='rotate(38)'><line x1='0' y1='0' x2='0' y2='7' stroke='#000' stroke-width='1.6'/></pattern>" +
    "<filter id='" + id("blur") + "' x='-30%' y='-30%' width='160%' height='160%'><feGaussianBlur stdDeviation='16'/></filter>" +
    "<filter id='" + id("soft") + "' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='4'/></filter>" +
    "<radialGradient id='" + id("amb") + "'><stop offset='0' stop-color='" + K.a4 + "' stop-opacity='.75'/><stop offset='.35' stop-color='" + K.a3 + "' stop-opacity='.28'/><stop offset='1' stop-color='" + K.a2 + "' stop-opacity='0'/></radialGradient>" +
    "<radialGradient id='" + id("cool") + "'><stop offset='0' stop-color='" + K.t4 + "' stop-opacity='.45'/><stop offset='1' stop-color='" + K.t3 + "' stop-opacity='0'/></radialGradient>";
}
function svg(w, h, defs, body) {
  return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 " + w + " " + h + "'><defs>" + baseDefs(w, h) + (defs || "") + "</defs>" +
    "<g stroke-linejoin='round' stroke-linecap='round'>" + body + "</g>" +
    "<rect width='" + w + "' height='" + h + "' fill='" + u("vig") + "' pointer-events='none'/></svg>";
}
const hat = (d, op) => pa(d, u("hatch"), { s: null, op: op == null ? 0.35 : op });
const glow = (cx, cy, r, op, which) => el(cx, cy, r, r, u(which || "amb"), { s: null, op: op == null ? 1 : op });
const rain = (op, cl) => re(0, 0, 1000, 600, u("rain"), { s: null, op: op == null ? 0.5 : op, cl });
const fog = (cx, cy, rx, ry, op, c) => el(cx, cy, rx, ry, c || K.n7, { s: null, op: op == null ? 0.18 : op, flt: "blur" });
const lg = (n, x1, y1, x2, y2, stops) => "<linearGradient id='" + id(n) + "' x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "'>" +
  stops.map(s => "<stop offset='" + s[0] + "' stop-color='" + s[1] + "'" + (s[2] != null ? " stop-opacity='" + s[2] + "'" : "") + "/>").join("") + "</linearGradient>";
const clip = (n, inner) => "<clipPath id='" + id(n) + "'>" + inner + "</clipPath>";

/* ============================================================ MAP */
function buildMap() {
  P = "mp"; W = 2.5; seed = 11;
  // Harbour: the old quay juts out in the west (The Anchor & Lamp); the water reaches up to the foot of the Saltmarket Stairs
  const coast = [[0, 548], [90, 542], [190, 530], [214, 470], [240, 412], [290, 400], [350, 420], [400, 462], [450, 520], [500, 556], [700, 566], [850, 556], [1000, 548]];
  const coastY = x => { for (let i = 1; i < coast.length; i++) if (x <= coast[i][0]) { const a = coast[i - 1], b = coast[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return 548; };
  const water = "M0 548 C40 546 120 540 190 530 C200 510 206 490 214 470 C222 450 230 425 244 412 C262 398 290 396 318 404 C350 414 380 436 400 462 C420 490 440 520 470 546 C520 568 640 572 700 566 C800 560 900 552 1000 548 L1000 600 L0 600 Z";
  // pins come from the case file so the clear marker areas always match the engine's pins
  let pins = [[430, 330], [230, 300], [780, 130], [560, 170], [170, 190], [120, 480], [650, 520]];
  try { global.window = global.window || {}; require(path.resolve(__dirname, "..", "case-001.js")); pins = window.CASE.locations.map(l => [l.map.x, l.map.y]); } catch (e) { /* keep defaults */ }
  const nearPin = (x, y, d) => pins.some(p => Math.hypot(p[0] - x, p[1] - y) < d);
  const labels = [[66, 440, 80, 20], [312, 452, 160, 22], [115, 258, 170, 26], [470, 80, 250, 26], [890, 205, 150, 26], [880, 400, 140, 26], [560, 455, 150, 26]];
  const nearLabel = (x, y) => labels.some(l => Math.abs(l[0] - x) < l[2] / 2 + 6 && Math.abs(l[1] - 8 - y) < 18);
  let blocks = "";
  for (let y = 10; y < 560; y += 22) {
    for (let x = 8; x < 1000; x += 26) {
      const cx = x + rr(-4, 4), cy = y + rr(-3, 3);
      const cy0 = coastY(cx);
      if (cy > cy0 - 34) continue;
      let w = rr(12, 20), h = rr(9, 15), f = K.n3, rot = 0;
      const docks = (cx > 400 && cy > cy0 - 140) || (cx < 214 && cy > 425);
      if (docks) { if ((Math.floor(x / 26) + Math.floor(y / 22)) % 2) continue; w = rr(30, 46); h = rr(10, 14); f = "#202f39"; }
      else if (cx < 340) { w = rr(9, 16); h = rr(8, 13); rot = rr(-14, 14); f = "#22303a"; if (rnd() < 0.1) continue; }
      else if (cx > 700 && cy < 250) { if (rnd() < 0.45) continue; w = rr(9, 13); h = rr(8, 11); f = "#1f2e37"; rot = rr(-30, 30); }
      else if (cx > 720) { w = 18; h = 13; f = "#1e2c35"; }
      else { w = rr(18, 24); h = rr(14, 19); f = "#243440"; if (rnd() < 0.15) continue; }
      if (nearPin(cx, cy, 30) || nearLabel(cx, cy)) continue;
      blocks += re((cx - w / 2).toFixed(1), (cy - h / 2).toFixed(1), w.toFixed(1), h.toFixed(1), f, { s: K.n0, w: 1.2, tf: rot ? "rotate(" + rot.toFixed(1) + " " + cx.toFixed(1) + " " + cy.toFixed(1) + ")" : null });
    }
  }
  const roads = [
    ["M262 384 C300 380 340 394 372 420 C400 444 426 490 456 518 C500 546 640 552 760 546 C860 540 940 532 1000 528", 9], // Quay Road (dead end for cars at the stairs)
    ["M60 232 C200 252 330 296 430 312 C560 332 700 344 1000 366", 8],    // Harbour Avenue
    ["M140 0 C150 100 165 175 182 228 C194 262 206 284 222 296", 6], // Mercer St to Saltmarket Lane
    ["M0 420 C60 418 120 424 160 432 C180 438 196 450 200 470", 5],      // Old Quay lane
    ["M545 0 C535 120 522 220 504 320 C490 400 474 470 462 548", 8],     // Tower Road
    ["M548 214 C650 196 720 152 800 122 C870 96 930 62 1000 40", 7],      // Hillcrest Road
    ["M640 336 C720 306 830 288 1000 262", 6],                             // Eastgate Road
    ["M760 0 C760 120 790 260 820 360 C840 430 860 480 880 545", 5],      // North Road
    ["M0 120 C120 110 220 130 320 150 C420 170 470 190 520 206", 5]       // Old Town Lane
  ];
  const roadsSvg = roads.map(r => pa(r[0], null, { s: K.n1, w: r[1] + 5 })).join("") + roads.map(r => pa(r[0], null, { s: "#3c5160", w: r[1] - 1 })).join("") +
    roads.map(r => pa(r[0], null, { s: "#51697a", w: 1, op: 0.6 })).join("");
  const tram = pa("M182 228 C300 206 420 176 548 190 C640 196 720 150 800 122", null, { s: K.a2, w: 2, dash: "2 7", op: 0.55 });
  let waves = "";
  for (let i = 0; i < 26; i++) { const x = rr(10, 960), y = rr(Math.max(coastY(x) + 10, 380), 594); if (y > 596) continue; waves += pa("M" + x.toFixed(0) + " " + y.toFixed(0) + " q8 -4 16 0 t16 0", null, { s: K.t2, w: 1.2, op: 0.5 }); }
  const contours = [60, 110, 160, 210].map((r, i) => el(900, 40, r * 1.5, r, null, { s: "#2a3d4a", w: 1.2, op: 0.7 - i * 0.12, dash: "6 5" })).join("");
  const piers = [[470, 18], [560, 22], [720, 22], [870, 18]].map(p => re(p[0], coastY(p[0]) - 4, p[1], 600 - coastY(p[0]) + 4, "#1b2731", { s: K.n0, w: 1.5 })).join("") +
    re(100, 532, 70, 68, "#1b2731", { s: K.n0, w: 1.5 }) + // the old quay
    pa("M250 562 L400 578 L398 588 L246 572 Z", "#1b2731", { s: K.n0, w: 1.5 }); // breakwater
  const cranes = [[600, 548], [780, 540], [905, 534]].map(c => g({ stroke: "#566f7e", "stroke-width": 2, fill: "none", opacity: 0.8 },
    pa("M" + c[0] + " " + c[1] + " l0 -34 l26 0 M" + c[0] + " " + (c[1] - 34) + " l-8 0 M" + (c[0] + 22) + " " + (c[1] - 34) + " l0 10"))).join("");
  const markers = pins.map(p => ci(p[0], p[1], 26, "#2b3e4c", { s: K.a2, w: 1.2, op: 0.55, dash: "3 5" }) + ci(p[0], p[1], 26, u("amb"), { s: null, op: 0.35 })).join("");
  const halo = { stroke: K.n0, "stroke-width": 5, "paint-order": "stroke", "stroke-linejoin": "round" };
  const dl = (x, y, s, size) => tx(x, y, s, Object.assign({ "text-anchor": "middle", "font-size": size || 19, "letter-spacing": 5, fill: "#9db0b8" }, halo));
  // footpath along the harbour wall from the stairs to the old quay; a bar where Quay Road ends
  const footpath = pa("M262 384 C246 396 232 420 222 452 C212 486 200 512 180 522 C150 530 120 520 110 504", null, { s: "#7d8f99", w: 1.6, dash: "3 4", op: 0.9 }) +
    li(256, 376, 266, 392, "#9db0b8", 3);
  const stairsHatch = g({ stroke: "#7d8f99", "stroke-width": 1.5, opacity: 0.8 }, [0, 1, 2, 3, 4, 5].map(i => li(222 + i * 5, 330 + i * 9, 236 + i * 5, 328 + i * 9)).join(""));
  const lighthouse = g({}, re(40, 548, 9, 26, "#cfc4ab", { s: K.ink, w: 1.5 }), re(38, 543, 13, 6, K.a3, { s: K.ink, w: 1.5 }),
    pa("M45 545 L-10 520 L-10 572 Z", K.a3, { s: null, op: 0.18 }), pa("M45 545 L140 528 L140 556 Z", K.a3, { s: null, op: 0.14 }));
  const compass = g({ transform: "translate(945 455)" }, ci(0, 0, 24, null, { s: "#5b7280", w: 1.2 }), po("0,-30 6,0 0,30 -6,0", "#3c5160", { s: "#7d8f99", w: 1.2 }), po("0,-30 6,0 -6,0", "#9db0b8", { s: null }),
    tx(0, -36, "N", { "text-anchor": "middle", "font-size": 13, fill: "#9db0b8" }));
  const title = g({}, tx(28, 46, "PORT HALDEN", Object.assign({ "font-size": 26, "letter-spacing": 8, fill: K.a3 }, halo)),
    tx(30, 68, "City map, Major Crimes copy", { "font-size": 12, "letter-spacing": 2, fill: "#7d8f99", "font-style": "italic" }));
  const quayLabel = "<path id='" + id("qr") + "' d='M872 538 C920 534 960 530 998 528' fill='none'/>" +
    "<text font-family='Georgia, serif' font-size='11' letter-spacing='3' fill='#7d8f99'><textPath href='#" + id("qr") + "'>QUAY ROAD</textPath></text>";
  const body = re(0, 0, 1000, 600, K.n2, { s: null }) +
    pa("M0 0 H340 V396 C260 400 120 410 0 412 Z", "#18252f", { s: null, op: 0.9 }) + // Old Town tint
    pa("M700 0 H1000 V250 C900 262 790 256 700 250 Z", "#162129", { s: null }) + contours +
    pa(water, "#0b161c", { s: K.ink, w: 3 }) + pa(water, u("wg"), { s: null }) + waves + piers + blocks + roadsSvg + tram + quayLabel + footpath + stairsHatch + cranes +
    pa("M20 120 C40 70 120 40 200 52 C280 64 330 120 340 190", null, { s: "#3a4c58", w: 3, dash: "1 6", op: 0.8 }) + // old town wall
    markers + lighthouse + compass + title +
    dl(115, 258, "OLD TOWN") + dl(470, 80, "FINANCIAL QUARTER", 17) + dl(890, 205, "HILLCREST") + dl(880, 400, "EASTGATE") + dl(560, 455, "THE DOCKS") + tx(66, 440, "Old Quay", Object.assign({ "text-anchor": "middle", "font-size": 13, "font-style": "italic", "letter-spacing": 2, fill: "#9db0b8" }, halo)) +
    tx(312, 452, "Halden Harbour", Object.assign({ "text-anchor": "middle", "font-size": 16, "font-style": "italic", "letter-spacing": 3, fill: K.t4 }, halo)) +
    fog(200, 560, 260, 40, 0.15) + fog(800, 590, 300, 30, 0.12);
  return svg(1000, 600, lg("wg", 0, 0, 0, 1, [[0, K.t1, 0.25], [1, K.n0, 0.4]]), body);
}

module.exports = { K, buildMap };
const BUILDERS = [];
function reg(group, key, fn) { BUILDERS.push([group, key, fn]); }

/* ============================================================ SCENES */
/* --- Major Crimes, HQ: Lena's desk (file 270,380), whiteboard sheet (720,170), Julian's desk (520,480) */
reg("scenes", "loc-hq", function () {
  P = "hq"; W = 3; seed = 21;
  const defs = lg("wall", 0, 0, 0, 1, [[0, K.n3], [1, K.n2]]) + lg("win", 0, 0, 0, 1, [[0, "#1f3640"], [1, "#0e1a21"]]) +
    clip("wc", re(800, 50, 170, 260, "#000", { s: null }));
  let b = "";
  b += re(0, 0, 1000, 600, u("wall"), { s: null });
  b += re(0, 330, 1000, 270, "#1a2229", { s: null }) + pa("M0 330 H1000", null, { w: 3 });
  // carpet texture
  for (let i = 0; i < 9; i++) b += pa("M0 " + (360 + i * 28) + " H1000", null, { s: K.n1, w: 1, op: 0.5 });
  // ceiling light strips
  b += re(120, 0, 260, 14, "#8fa3ad", { s: K.ink, op: 0.55 }) + re(560, 0, 200, 14, "#8fa3ad", { s: K.ink, op: 0.55 });
  b += pa("M120 14 L60 330 H440 L380 14 Z", "#8fa3ad", { s: null, op: 0.04 });
  // window with rain and harbour lights
  b += re(792, 42, 186, 276, K.n1, { w: 4 }) + re(800, 50, 170, 260, u("win"), { s: null });
  b += g({ "clip-path": u("wc") },
    pa("M800 230 L830 200 L845 210 L870 170 L890 190 L920 150 L940 175 L970 160 V310 H800 Z", "#0b1218", { s: null }),
    [810, 836, 862, 900, 930, 955].map((x, i) => ci(x, 248 + (i % 3) * 14, 2.4, K.a3, { s: null, op: 0.9 }) + glow(x, 248 + (i % 3) * 14, 16, 0.5)).join(""),
    re(800, 270, 170, 40, "#0d1a20", { s: null }), pa("M800 282 q20 -3 40 0 t40 0 t40 0 t50 0", null, { s: K.t2, w: 1.5, op: 0.6 }),
    rain(0.9),
    [818, 846, 873, 897, 921, 944, 962].map((x, i) => pa("M" + x + " " + (60 + i * 17 % 70) + " q-3 " + (40 + i * 9) + " 2 " + (90 + i * 11), null, { s: K.n7, w: 1.4, op: 0.55 })).join(""));
  b += li(885, 50, 885, 310, K.ink, 4) + li(800, 180, 970, 180, K.ink, 4) + re(785, 312, 200, 12, K.n4, { w: 3 });
  // whiteboard with Met Office printout
  b += re(590, 70, 190, 200, "#b8bcb6", { w: 4 }) + re(596, 76, 178, 188, "#c9ccc5", { s: null, op: 0.5 });
  b += pa("M606 100 l40 -8 M610 120 l55 0 M606 230 q20 -12 45 -2", null, { s: "#3a5d7a", w: 2, op: 0.7 });
  b += pa("M612 160 l26 22 m0 -22 l-26 22", null, { s: "#3a5d7a", w: 2, op: 0.6 });
  b += re(690, 120, 62, 86, K.paperL, { w: 2, tf: "rotate(3 721 163)" });
  b += g({ transform: "rotate(3 721 163)" }, tx(698, 134, "MET OFFICE", { "font-size": 7, fill: "#444", "font-family": "Arial, sans-serif" }),
    [144, 152, 160, 176, 184, 192, 198].map(y => li(698, y, 744, y, "#7b7a72", 1.6)).join(""),
    el(721, 168, 26, 7, null, { s: K.red, w: 2.4 }), li(700, 168, 742, 168, "#3d3c37", 2), ci(721, 122, 3.2, K.red, { w: 1.2 }));
  b += re(600, 266, 170, 8, K.steel, { w: 2 }) + re(620, 262, 20, 6, "#2f5f8a", { s: null }) + re(650, 262, 20, 6, K.redD, { s: null });
  // filing cabinets and broken coffee machine
  b += re(20, 170, 90, 165, K.steel, { w: 3 }) + [210, 250, 290].map(y => re(30, y - 30, 70, 34, "#53626c", { w: 2 }) + re(55, y - 18, 20, 5, K.steelD, { s: null })).join("");
  b += re(430, 210, 80, 122, "#2b333a", { w: 3 }) + re(442, 222, 56, 40, K.n1, { w: 2 }) + re(456, 272, 28, 30, K.n0, { w: 2 }) + re(448, 232, 44, 22, K.paperL, { w: 1.5, tf: "rotate(-6 470 243)" }) +
    tx(452, 247, "OUT OF ORDER", { "font-size": 6.5, fill: "#333", "font-family": "Arial, sans-serif", transform: "rotate(-6 470 243)" });
  // Lena's desk (left), tidy
  b += pa("M90 360 L450 360 L470 392 L70 392 Z", K.woodL, { w: 3 }) + re(70, 392, 400, 14, K.wood, { w: 3 }) + re(84, 406, 20, 100, K.woodD, { w: 3 }) + re(436, 406, 20, 100, K.woodD, { w: 3 }) + re(330, 406, 106, 80, K.wood, { w: 3 }) + li(340, 446, 426, 446, K.ink, 2);
  // monitor + lamp
  b += re(120, 270, 110, 76, K.n1, { w: 3 }) + re(127, 277, 96, 62, "#1f3a44", { s: null }) + re(165, 346, 20, 14, K.n4, { w: 2.5 }) + pa("M150 362 h50", null, { w: 3 });
  b += pa("M380 362 l18 -60 l-30 -28", null, { s: K.n5, w: 4 }) + pa("M350 262 l36 -6 l6 26 Z", K.n4, { w: 3 }) + glow(372, 300, 90, 0.8) + glow(270, 382, 70, 0.6);
  // manila folder squared to the edge, pen parallel, clipped notes
  b += po("226,370 316,370 322,388 220,388", "#c49a52", { w: 2.5 }) + po("232,366 274,366 276,370 228,370", "#b48a45", { w: 2 }) +
    po("240,364 300,364 303,380 237,380", K.paperL, { w: 1.6 }) + re(262, 361, 16, 5, K.steelL, { w: 1.2 }) + li(246, 370, 292, 370, "#777", 1.2) + li(245, 374, 285, 374, "#777", 1.2) +
    tx(280, 386, "MC-26-0412", { "font-size": 7, fill: K.redD, "font-family": "'Courier New', monospace" }) + li(228, 393, 316, 393, "#1d1a17", 3) + li(230, 393, 314, 393, "#6d7a84", 1.4);
  // Julian's desk (foreground), bare
  b += pa("M330 450 L720 450 L760 510 L290 510 Z", "#4a3a2c", { w: 3.5 }) + re(290, 510, 470, 18, K.woodD, { w: 3.5 }) + re(305, 528, 24, 72, K.woodD, { w: 3 }) + re(722, 528, 24, 72, K.woodD, { w: 3 });
  // dead plant
  b += pa("M436 470 L462 470 L458 498 L440 498 Z", "#5a4a3a", { w: 2.5 }) + pa("M449 470 q-4 -22 -18 -30 M449 470 q2 -26 14 -36 M449 470 q-12 -10 -24 -6 M463 434 q6 4 4 14", null, { s: "#6d5f3c", w: 2.2 }) +
    pa("M431 440 q-6 6 -2 12 M425 464 q-6 -2 -6 6", null, { s: "#6d5f3c", w: 1.6 });
  // empty in-tray
  b += po("560,462 640,462 650,480 552,480", "#596670", { w: 2.5 }) + po("552,480 650,480 650,488 552,488", "#3f4b54", { w: 2 });
  // nameplate face down
  b += po("488,486 552,486 560,498 482,498", "#2b2622", { w: 2.2 }) + po("482,498 560,498 560,503 482,503", "#1a1715", { w: 1.6 });
  b += glow(520, 480, 120, 0.25);
  // cool window light across floor + vignette shadows
  b += pa("M800 318 L970 318 L1000 600 L640 600 Z", K.t4, { s: null, op: 0.05 });
  b += sh("M0 0 H60 V600 H0 Z", 0.25);
  return svg(1000, 600, defs, b);
});

/* --- Saltmarket Stairs: kiosk (140,130), upper flight (330,250), pocket (470,360), body (590,420),
       boots (730,450), drag marks at the foot (860,540, after the twist) */
reg("scenes", "loc-stairs", function () {
  P = "st"; W = 3; seed = 31;
  const defs = lg("sky", 0, 0, 0, 1, [[0, "#1d313c"], [1, "#0d151b"]]) + lg("land", 0, 0, 1, 0, [[0, "#3f4b52"], [1, "#2c363c"]]) +
    "<radialGradient id='" + id("flood") + "' cx='0.5' cy='0.5' r='0.5'><stop offset='0' stop-color='#cfe0e0' stop-opacity='.32'/><stop offset='1' stop-color='#cfe0e0' stop-opacity='0'/></radialGradient>";
  // stair band: centreline A-B (upper flight), B-C (landing), C-D (lower steps); L = near edge, R = far edge
  const AL = [222, 228], AR = [318, 170], BL = [419, 370], BR = [485, 266], CL = [666, 499], CR = [730, 393], DL = [804, 597], DR = [876, 495];
  const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const pt = p => p[0].toFixed(1) + " " + p[1].toFixed(1);
  const quad = (a, b2, c, d, f, o) => po([a, b2, c, d].map(pt).join(" "), f, o);
  let b = "";
  b += re(0, 0, 1000, 600, u("sky"), { s: null });
  // far side: the town drops away to the harbour
  b += pa("M330 120 L360 96 L380 104 L410 70 L450 86 L470 50 L520 70 L560 40 L600 64 L640 30 L690 56 L720 20 L780 48 L820 10 L880 40 L930 18 L1000 30 V300 H330 Z", "#111c23", { w: 2 });
  [[420, 120], [480, 108], [560, 96], [655, 90], [745, 80], [850, 70], [930, 64], [610, 140], [800, 128]].forEach(p => { b += re(p[0], p[1], 8, 10, K.a3, { s: null, op: 0.75 }) + glow(p[0] + 4, p[1] + 5, 18, 0.45); });
  b += pa("M600 210 C700 196 860 190 1000 180 V420 C900 420 760 400 600 330 Z", "#0b161c", { w: 2 });
  b += pa("M640 236 q24 -4 48 0 t48 0 t48 0 t48 0 t48 0 t48 0 M700 270 q24 -4 48 0 t48 0 t48 0 t48 0 t48 0", null, { s: K.t2, w: 1.4, op: 0.5 });
  b += pa("M930 160 l0 -40 l8 0 l0 40 Z", K.paper, { w: 1.5 }) + glow(934, 120, 30, 0.6); // Halden Light far off
  b += fog(760, 230, 300, 70, 0.28) + fog(520, 160, 260, 50, 0.2);
  // far railing along the R edge
  b += pa("M" + pt(AR) + " L" + pt(BR) + " L" + pt(CR) + " L" + pt(DR) + " L1000 470", null, { s: "#151d22", w: 14 });
  for (let i = 0; i <= 26; i++) { const t = i / 26; const p = t < 0.33 ? lerp(AR, BR, t / 0.33) : t < 0.76 ? lerp(BR, CR, (t - 0.33) / 0.43) : lerp(CR, DR, (t - 0.76) / 0.24); b += li(p[0], p[1], p[0], p[1] - 34, K.ink, 3); }
  b += pa("M" + (AR[0]) + " " + (AR[1] - 34) + " L" + BR[0] + " " + (BR[1] - 34) + " L" + CR[0] + " " + (CR[1] - 34) + " L" + DR[0] + " " + (DR[1] - 34) + " L1000 436", null, { w: 4 });
  // Saltmarket Lane pavement and the late shop
  b += po("0,182 250,182 318,170 222,228 0,250", "#2e3940", { w: 3 });
  b += re(30, 0, 212, 182, "#26323a", { w: 3 }) + re(20, 0, 232, 22, "#33404a", { w: 3 });
  b += tx(136, 46, "LATE SHOP", { "text-anchor": "middle", "font-size": 18, "letter-spacing": 4, fill: K.a3, "font-family": "Arial, Helvetica, sans-serif" });
  b += re(62, 72, 156, 110, "#0b1015", { w: 3 }) + re(62, 72, 156, 52, "#5a6870", { w: 2.5 });
  for (let y = 78; y < 124; y += 8) b += li(64, y, 216, y, "#3e4b53", 1.6);
  b += re(64, 124, 152, 58, "#2a2010", { s: null }) + glow(140, 156, 96, 0.95) + re(76, 136, 36, 46, "#3b2c16", { w: 2 }) + re(140, 132, 64, 24, "#7a5a2a", { w: 2 });
  b += pa("M131 72 v-5 h18 v5", null, { w: 2.5 }) + pa("M131 72 q9 12 18 0 Z", "#151b20", { w: 2.5 }) + ci(140, 76, 2.6, K.red, { s: null }); // dome camera over the door
  b += pa("M140 78 L240 250 L330 240 Z", K.t4, { s: null, op: 0.05 });
  // street lamp at the top of the stairs
  b += li(262, 182, 262, 22, K.ink, 6) + li(262, 24, 292, 24, K.ink, 5) + pa("M282 24 h22 l-4 10 h-14 Z", K.a3, { w: 2 }) + glow(292, 40, 170, 0.85) + glow(292, 36, 34, 1);
  // near side: a stone wall drops away towards the roofs of Quay Road
  b += pa("M0 250 L" + pt(AL) + " L" + pt(BL) + " L" + pt(CL) + " L" + pt(DL) + " L790 600 L0 600 Z", "#1c252b", { w: 3 });
  for (let r = 0; r < 9; r++) for (let c = 0; c < 14; c++) { const x = c * 62 + (r % 2) * 31, y = 270 + r * 40; if (y < 250 + x * 0.6) continue; b += re(x, y, 58, 36, "#222c33", { s: "#11171b", w: 1.5 }); }
  b += pa("M0 250 L" + pt(AL) + " L" + pt(BL) + " L" + pt(CL) + " L" + pt(DL), null, { s: "#4f5c63", w: 10 });
  b += pa("M0 250 L" + pt(AL) + " L" + pt(BL) + " L" + pt(CL) + " L" + pt(DL), null, { w: 2 });
  b += pa("M60 600 L60 420 L180 360 L300 420 L300 600 Z", "#141b20", { w: 3 }) + pa("M330 600 L330 470 L440 418 L560 480 L560 600 Z", "#141b20", { w: 3 }) + re(380, 520, 26, 34, "#0b1014", { w: 2 }) + re(110, 470, 26, 34, "#0b1014", { w: 2 });
  // upper flight: muddy steps
  const nU = 9;
  for (let i = 0; i < nU; i++) {
    const l0 = lerp(AL, BL, i / nU), r0 = lerp(AR, BR, i / nU), l1 = lerp(AL, BL, (i + 1) / nU), r1 = lerp(AR, BR, (i + 1) / nU);
    const l1b = [l1[0], l1[1] - 6], r1b = [r1[0], r1[1] - 6];
    b += quad(l0, r0, r1b, l1b, "#4a575e", { w: 2 }) + quad(l1b, r1b, r1, l1, "#283238", { w: 1.6 });
    // mud tongue and leaf litter on every tread
    const m0 = lerp(l0, r0, rr(0.15, 0.3)), m1 = lerp(l0, r0, rr(0.65, 0.85));
    b += pa("M" + pt([m0[0] + 4, m0[1] + 4]) + " Q" + pt([(m0[0] + m1[0]) / 2 + 8, (m0[1] + m1[1]) / 2 + 9]) + " " + pt([m1[0] + 6, m1[1] + 6]), null, { s: "#4b3d27", w: rr(5, 8).toFixed(1) });
    for (let k = 0; k < 4; k++) { const q = lerp(lerp(l0, r0, rr(0.05, 0.95)), lerp(l1b, r1b, 0.5), rr(0.2, 0.6)); b += el(q[0].toFixed(0), q[1].toFixed(0), 4.5, 2, k % 2 ? "#6e5428" : "#54421f", { s: null, tf: "rotate(" + rr(-50, 50).toFixed(0) + " " + q[0].toFixed(0) + " " + q[1].toFixed(0) + ")" }); }
    if (i % 2 === 0) { const q = lerp(lerp(l0, r0, 0.45), lerp(l1b, r1b, 0.45), 0.5); b += el(q[0].toFixed(0), q[1].toFixed(0), 8, 3.4, "#231b12", { s: null, op: 0.85, tf: "rotate(-32 " + q[0].toFixed(0) + " " + q[1].toFixed(0) + ")" }); }
  }
  b += pa("M262 210 L300 186 M318 262 L362 236 M372 300 L420 272", null, { s: K.a4, w: 2, op: 0.4 }); // wet sheen
  // the lower landing, no lights, flagstones
  b += quad(BL, BR, CR, CL, "#3a454b", { w: 3 });
  for (let i = 1; i < 6; i++) b += pa("M" + pt(lerp(BL, CL, i / 6)) + " L" + pt(lerp(BR, CR, i / 6)), null, { s: "#262f34", w: 1.5 });
  b += pa("M" + pt(lerp(BL, BR, 0.5)) + " L" + pt(lerp(CL, CR, 0.5)), null, { s: "#262f34", w: 1.5 });
  b += quad(BL, BR, CR, CL, "#05080a", { s: null, op: 0.32 });
  b += el(585, 405, 190, 70, u("flood"), { s: null, tf: "rotate(27 585 405)" }); // the forensic lamp
  // lower steps to Quay Road (moss on the edges), with the later drag scuffs
  const nL = 4;
  for (let i = 0; i < nL; i++) {
    const l0 = lerp(CL, DL, i / nL), r0 = lerp(CR, DR, i / nL), l1 = lerp(CL, DL, (i + 1) / nL), r1 = lerp(CR, DR, (i + 1) / nL);
    const l1b = [l1[0], l1[1] - 6], r1b = [r1[0], r1[1] - 6];
    b += quad(l0, r0, r1b, l1b, "#38434a", { w: 2 }) + quad(l1b, r1b, r1, l1, "#222b30", { w: 1.6 });
    b += pa("M" + pt(lerp(l1b, r1b, 0.04)) + " L" + pt(lerp(l1b, r1b, 0.96)), null, { s: "#38573b", w: 4, op: 0.8 });
  }
  // two faint parallel scuffs up the bottom steps, ~30 cm apart
  const s1a = lerp(lerp(DL, DR, 0.42), lerp(CL, CR, 0.42), 0.0), s1b = lerp(lerp(DL, DR, 0.42), lerp(CL, CR, 0.42), 0.78);
  const s2a = lerp(lerp(DL, DR, 0.6), lerp(CL, CR, 0.6), 0.0), s2b = lerp(lerp(DL, DR, 0.6), lerp(CL, CR, 0.6), 0.78);
  b += pa("M" + pt(s1a) + " L" + pt(s1b) + " M" + pt(s2a) + " L" + pt(s2b), null, { s: "#7f8a86", w: 2.4, op: 0.55, dash: "16 6" });
  // Quay Road kerb and road
  b += pa("M" + pt(DL) + " L" + pt(DR) + " L1000 466 L1000 600 L790 600 Z", "#1b2126", { w: 3 }) + pa("M" + pt(DL) + " L" + pt(DR) + " L1000 466", null, { s: "#6a767c", w: 4 });
  b += pa("M836 600 L1000 520", null, { s: K.a2, w: 3, dash: "26 22", op: 0.45 });
  b += pa("M850 548 q8 -6 18 -2 q6 4 14 0", null, { s: "#4a3a24", w: 5 }); // curl of mud on the kerb
  // the victim: face down across the landing, head towards the lower steps, arms beneath her.
  // Drawn along a local axis (feet at 0, crown at 248) and rotated into place.
  b += el(566, 412, 132, 24, K.ink, { s: null, op: 0.5, tf: "rotate(22 566 412)" });
  b += g({ transform: "translate(440 344) rotate(21)" },
    // stockinged feet, toes down, and calves below an ankle-length coat
    pa("M0 -14 C-6 -14 -8 -6 -2 -4 L22 -4 L22 -15 Z", "#17181d", { w: 2.2 }), pa("M2 3 C-4 4 -5 12 0 13 L22 13 L22 3 Z", "#17181d", { w: 2.2 }),
    // coat: hem, waist, broad shoulders, elbows bulging where the arms are tucked under
    pa("M18 -26 C60 -30 100 -24 128 -22 C150 -24 168 -34 186 -36 C196 -34 202 -24 204 -14 L204 14 C202 26 194 36 184 36 C166 34 148 26 128 24 C100 26 60 30 18 28 C14 10 14 -10 18 -26 Z", "#2b3342", { w: 3 }),
    pa("M150 -30 C164 -42 182 -44 192 -36", null, { s: "#1a1f29", w: 2 }), pa("M150 30 C164 40 180 42 190 34", null, { s: "#1a1f29", w: 2 }),
    pa("M30 0 L196 0", null, { s: "#1d2330", w: 2 }), pa("M116 -20 L116 20", null, { s: "#1d2330", w: 1.6, op: 0.7 }),
    re(108, -21, 16, 5, "#232a37", { w: 1.4 }), // half belt
    pa("M40 -16 C80 -16 120 -12 176 -26", null, { s: "#4d5970", w: 1.8, op: 0.7 }), // light on the far shoulder
    // the left front of the coat turned up at the hem: lining, inner pocket, phone corner and café slip
    pa("M18 -26 L50 -20 L36 2 L16 -2 Z", "#4a3f3a", { w: 2.2 }),
    pa("M22 -16 L42 -12", null, { w: 2.2 }), re(26, -22, 10, 12, "#0b0e11", { s: "#7c8b93", w: 1.3, tf: "rotate(10 31 -16)" }),
    re(36, -21, 12, 7, K.paperL, { w: 1.2, tf: "rotate(-8 42 -17)" }),
    // collar buttoned to the throat
    pa("M196 -18 C206 -20 212 -10 212 0 C212 10 206 20 196 18 Z", "#363f50", { w: 2.4 }),
    // head: dark auburn hair spread over the collar, matted at the back
    pa("M204 -12 C212 -24 238 -24 250 -10 C256 0 252 14 240 19 C226 24 210 20 204 12 C201 4 201 -4 204 -12 Z", "#33241c", { w: 2.6 }),
    pa("M208 -9 C222 -5 236 -8 250 -4 M207 3 C222 6 238 3 252 6 M210 12 C222 15 234 15 244 13", null, { s: "#1a110c", w: 1.6 }),
    pa("M214 -16 C226 -18 238 -16 246 -10", null, { s: "#5e4332", w: 1.8 }),
    pa("M226 -5 C232 -10 241 -6 239 1 C236 5 229 3 226 -5 Z", "#190e0c", { s: null, op: 0.85 }));
  // one small dark stain on the stone, nothing more
  b += el(702, 452, 13, 5, K.redD, { s: null, op: 0.6, tf: "rotate(24 702 452)" });
  // her boots, side by side on the step below the landing, toes down
  b += g({}, pa("M716 440 l3 -22 l12 0 l2 16 l15 6 l-2 7 l-30 -2 Z", "#0f1115", { w: 2.4 }), pa("M736 450 l3 -22 l12 0 l2 16 l15 6 l-2 7 l-30 -2 Z", "#0f1115", { w: 2.4 }),
    li(720, 422, 730, 422, "#6b7880", 1.3) + li(740, 432, 750, 432, "#6b7880", 1.3) + pa("M718 458 l28 2", null, { s: "#7d8a90", w: 1.2, op: 0.7 }));
  // police tape at both ends
  const tape = d => pa(d, null, { s: K.a3, w: 5 }) + pa(d, null, { s: K.ink, w: 5, dash: "10 14" });
  b += tape("M206 214 Q262 236 330 150") + li(206, 214, 206, 168, K.ink, 4);
  b += tape("M820 470 Q870 520 950 470") + li(950, 470, 950, 420, K.ink, 5);
  b += fog(600, 420, 300, 90, 0.1, K.t4) + rain(0.1);
  return svg(1000, 600, defs, b);
});


/* --- Iris's flat: fridge note (130,250), counter (320,330), desk + planner (580,280), cat bowls (440,520),
       document box under the bottom shelf (830,430); Ledger the cat on top of the bookshelf */
reg("scenes", "loc-flat", function () {
  P = "fl"; W = 3; seed = 41;
  const defs = lg("wall", 0, 0, 0, 1, [[0, "#2a343c"], [1, "#222b32"]]) + lg("win", 0, 0, 0, 1, [[0, "#3a5560"], [1, "#1a2a32"]]) +
    lg("fr", 0, 0, 1, 0, [[0, "#8d9596"], [0.7, "#7a8384"], [1, "#5b6465"]]) + clip("wc", re(526, 76, 168, 154, "#000", { s: null }));
  let b = re(0, 0, 1000, 600, u("wall"), { s: null });
  b += re(0, 470, 1000, 130, "#2b221b", { s: null }) + pa("M0 470 H1000", null, { w: 3 });
  for (let i = 0; i < 6; i++) b += pa("M0 " + (488 + i * 22) + " H1000", null, { s: "#1c1611", w: 1.5 });
  b += re(0, 455, 1000, 15, "#1d252b", { w: 2 }); // skirting
  // ceiling lamp
  b += li(440, 0, 440, 40, K.ink, 2) + pa("M410 40 h60 l-12 22 h-36 Z", K.a2, { w: 2.5 }) + glow(440, 70, 260, 0.55);
  // fridge with the sticky note at eye level
  b += re(48, 108, 162, 362, u("fr"), { w: 3, rx: 6 }) + li(48, 210, 210, 210, K.ink, 2.5) + re(186, 130, 8, 60, "#c2c8c6", { w: 2 }) + re(186, 228, 8, 90, "#c2c8c6", { w: 2 });
  b += g({ transform: "rotate(-3 130 250)" }, re(114, 234, 32, 32, K.note, { w: 1.8 }), li(118, 243, 141, 243, "#4d3f12", 1.6), li(118, 250, 139, 250, "#4d3f12", 1.6), li(118, 257, 136, 257, "#4d3f12", 1.6));
  // shelf with three plates of four, gap where the fourth stood
  b += re(220, 206, 165, 8, K.woodL, { w: 2.5 });
  [240, 272, 304].forEach(x => { b += el(x + 12, 188, 14, 18, "#c9cec9", { w: 2.2 }) + el(x + 12, 188, 8, 11, "#b0b6b1", { s: null }); });
  b += el(348, 205, 13, 2.2, "#3a2c22", { s: null, op: 0.8 });
  // kitchen counter and cabinets
  b += po("214,318 392,318 398,336 208,336", "#59626a", { w: 3 }) + re(214, 336, 178, 134, "#33302c", { w: 3 });
  b += li(303, 340, 303, 466, K.ink, 2.5) + re(290, 380, 6, 30, K.steelL, { w: 1.5 }) + re(310, 380, 6, 30, K.steelL, { w: 1.5 });
  // drying rack with two wine glasses upside down
  b += pa("M248 318 V296 M300 318 V296 M248 300 H300", null, { s: K.steelL, w: 2 });
  [262, 286].forEach(x => { b += pa("M" + (x - 9) + " 318 h18 M" + x + " 318 v-12 M" + (x - 7) + " 306 C" + (x - 10) + " 292 " + (x + 10) + " 292 " + (x + 7) + " 306 Z", "#9fb5b8", { w: 1.8, fop: 0.35 }); });
  // cork and the printed boat listing with handwriting along the bottom
  b += re(318, 316, 10, 6, "#9a7a4e", { w: 1.5, tf: "rotate(-20 323 319)" });
  b += po("334,322 380,318 386,334 336,338", K.paperL, { w: 1.8 }) + li(340, 324, 372, 321, "#6b6a63", 1.4) + pa("M341 331 l12 -1 l2 2 l12 -1", null, { s: "#141414", w: 1.4 }) + pa("M346 335 l20 -2", null, { s: K.redD, w: 1.2 });
  // bin with white shards
  b += po("226,420 262,420 258,470 230,470", "#3c464d", { w: 2.5 }) + po("232,420 240,410 246,420", "#e3e5df", { w: 1.5 }) + po("244,420 252,413 255,420", "#e3e5df", { w: 1.5 });
  // front door, two locks and a chain
  b += re(396, 146, 96, 324, "#2c2620", { w: 3 }) + re(404, 154, 80, 316, "#3a3129", { w: 2.5 }) + re(414, 170, 60, 120, "#342c25", { w: 2 }) + re(414, 306, 60, 140, "#342c25", { w: 2 });
  b += ci(472, 316, 5, K.a2, { w: 1.5 }) + re(468, 286, 8, 10, K.a2, { w: 1.5 }) + re(468, 256, 8, 10, K.a2, { w: 1.5 }) + pa("M476 270 q-14 10 -4 22", null, { s: K.a2, w: 2 });
  // cat bowls by the door: one licked clean, one fresh
  b += el(424, 522, 20, 7, "#5d7473", { w: 2.2 }) + el(424, 519, 14, 3.5, "#2f3e3f", { s: null });
  b += el(462, 526, 20, 7, "#5d7473", { w: 2.2 }) + el(462, 522, 14, 4, "#6e5333", { s: null }) + ci(458, 521, 2, "#8a6b42", { s: null }) + ci(466, 522, 2, "#8a6b42", { s: null });
  b += el(444, 536, 60, 10, K.ink, { s: null, op: 0.25 });
  // window over the desk: Hillcrest roofs in the rain
  b += re(518, 68, 184, 170, "#1b2329", { w: 4 }) + re(526, 76, 168, 154, u("win"), { s: null });
  b += g({ "clip-path": u("wc") }, pa("M526 170 L560 150 L590 166 L620 138 L660 160 L694 140 V230 H526 Z", "#16232a", { s: null }),
    re(560, 176, 6, 8, K.a3, { s: null }), re(640, 182, 6, 8, K.a3, { s: null }), rain(0.9),
    pa("M540 84 q-2 40 2 80 M576 90 q-3 30 1 70 M622 80 q-2 50 2 96 M668 92 q-2 30 1 60", null, { s: K.n8, w: 1.4, op: 0.45 }));
  b += li(610, 76, 610, 230, K.ink, 4) + re(510, 236, 200, 10, "#3a454c", { w: 2.5 });
  // desk with the open week planner, mug of pens and a cable with no laptop
  b += po("496,272 704,272 716,292 484,292", K.woodL, { w: 3 }) + re(484, 292, 232, 12, K.wood, { w: 3 }) + re(494, 304, 16, 166, K.woodD, { w: 2.5 }) + re(690, 304, 16, 166, K.woodD, { w: 2.5 });
  b += po("548,270 580,266 612,270 616,284 580,280 544,284", "#d4ccb4", { w: 2 }) + li(580, 266, 580, 280, K.ink, 1.6);
  [272, 276, 280].forEach((y, i) => { b += li(552 + i, y, 576, y - 1, "#6e6a5e", 1.1) + li(584, y - 1, 608 - i, y, "#6e6a5e", 1.1); });
  b += li(586, 272, 600, 272, K.red, 1.6);
  b += re(642, 250, 18, 22, "#4d7a76", { w: 2 }) + li(646, 250, 642, 236, "#c8c2ae", 2) + li(652, 250, 654, 234, "#2d2d2d", 2) + li(656, 250, 664, 238, K.a2, 2);
  b += pa("M520 272 q-10 30 0 60 q6 30 -10 60 q-6 40 6 78", null, { s: "#111", w: 2.4 }) + re(512, 266, 12, 6, "#1a1a1a", { w: 1.2 });
  b += po("520,330 600,330 610,350 512,350", "#262019", { w: 2.5 }); // chair seat pushed in
  // bookshelf, Ledger on top, grey document box under the bottom shelf
  b += re(752, 92, 214, 378, "#2f2620", { w: 3 });
  [170, 250, 330, 404].forEach(y => { b += re(752, y, 214, 9, "#46382c", { w: 2.5 }); });
  [[100, 170], [179, 250], [259, 330], [339, 404]].forEach((r, ri) => {
    let x = 764;
    while (x < 950) { const w = rr(9, 18), h = rr(44, r[1] - r[0] - 4); if (rnd() < 0.08) { x += 22; continue; }
      b += re(x.toFixed(0), (r[1] - h).toFixed(0), w.toFixed(0), h.toFixed(0), [K.t1, "#4a3a2c", "#5b4b38", "#2f3c45", "#6a5a3c", K.redD][Math.floor(rnd() * 6)], { w: 1.6 }); x += w + 1; }
  });
  b += re(752, 413, 214, 57, "#1d1814", { w: 2.5 });
  b += re(790, 414, 82, 48, "#6b7478", { w: 2.5 }) + po("790,414 872,414 866,406 796,406", "#808a8e", { w: 2 }) + ci(831, 437, 11, "#3e474c", { w: 2 }) + ci(831, 437, 4, K.steelL, { w: 1.4 }) +
    [0, 45, 90, 135, 180, 225, 270, 315].map(a => li(831 + 8 * Math.cos(a * Math.PI / 180), 437 + 8 * Math.sin(a * Math.PI / 180), 831 + 11 * Math.cos(a * Math.PI / 180), 437 + 11 * Math.sin(a * Math.PI / 180), K.ink, 1.2)).join("") + re(850, 448, 14, 5, "#4a5257", { w: 1 });
  // the grey cat watching from the top
  b += g({}, pa("M842 92 C838 70 846 54 862 50 L864 38 L872 48 L882 48 L890 38 L892 52 C902 58 904 74 898 92 Z", "#5f6a6e", { w: 2.6 }),
    pa("M898 92 C918 90 930 78 926 64", null, { s: K.ink, w: 7 }) + pa("M898 92 C918 90 930 78 926 64", null, { s: "#5f6a6e", w: 3.5 }),
    el(870, 62, 3.2, 2.4, K.a4, { s: null }), el(884, 62, 3.2, 2.4, K.a4, { s: null }), li(870, 60, 870, 64, K.ink, 1.4), li(884, 60, 884, 64, K.ink, 1.4), glow(877, 62, 18, 0.4));
  // sofa arm, foreground right
  b += pa("M880 600 L880 520 C880 496 900 488 930 488 L1000 488 L1000 600 Z", "#3a2e2a", { w: 3 }) + pa("M890 520 C900 506 930 504 1000 504", null, { s: "#4b3c36", w: 2 });
  b += sh("M0 0 H1000 V40 H0 Z", 0.3) + sh("M0 470 H1000 V600 H0 Z", 0.15);
  return svg(1000, 600, defs, b);
});

/* --- Halden Mutual, 4th floor: Iris's desk (180,390), laptop (320,330), noticeboard by the lifts (500,170),
       Whitlock's shelf through the glass (760,190); archive inset panel: carpet aisle F (640,510), terminal (880,420) */
reg("scenes", "loc-office", function () {
  P = "of"; W = 3; seed = 51;
  const defs = lg("wall", 0, 0, 0, 1, [[0, "#26323b"], [1, "#1f2930"]]) + lg("glass", 0, 0, 1, 1, [[0, "#9fc4c8", 0.18], [0.5, "#9fc4c8", 0.06], [1, "#9fc4c8", 0.14]]) +
    lg("arch", 0, 0, 0, 1, [[0, "#1d2429"], [1, "#14191d"]]) + clip("ins", re(578, 338, 410, 252, "#000", { s: null }));
  let b = re(0, 0, 1000, 600, u("wall"), { s: null });
  b += re(0, 330, 1000, 270, "#2a3037", { s: null }) + pa("M0 330 H1000", null, { w: 3 });
  for (let i = 0; i < 8; i++) b += pa("M0 " + (346 + i * 32) + " H1000", null, { s: "#22282e", w: 1.2 });
  [[60, 240], [380, 220], [660, 300]].forEach(r => { b += re(r[0], 0, r[1], 12, "#a9b8bd", { s: K.ink, w: 2, op: 0.6 }); });
  // windows on the left: Financial Quarter towers in the rain
  b += re(24, 60, 316, 214, "#141c22", { w: 4 }) + re(30, 66, 304, 202, "#20323b", { s: null });
  b += pa("M30 268 V170 H70 V120 H110 V190 H150 V90 H200 V150 H240 V110 H290 V180 H334 V268 Z", "#121b21", { s: null });
  [[80, 140], [90, 160], [160, 110], [170, 130], [180, 150], [250, 130], [260, 150], [300, 200], [120, 210]].forEach(p => { b += re(p[0], p[1], 6, 8, K.a3, { s: null, op: 0.7 }); });
  b += re(30, 66, 304, 202, u("rain"), { s: null, op: 0.7 }) + [130, 232].map(x => li(x, 66, x, 268, "#141c22", 4)).join("");
  // lifts with the noticeboard between them
  [[372, 74], [554, 74]].forEach(r => { b += re(r[0], 112, r[1], 218, "#6d7a82", { w: 3 }) + li(r[0] + r[1] / 2, 112, r[0] + r[1] / 2, 330, K.ink, 2) + re(r[0] - 6, 104, r[1] + 12, 10, "#46525a", { w: 2.5 }); });
  b += re(452, 212, 8, 14, "#2b3339", { w: 1.5 }) + ci(456, 216, 2, K.a3, { s: null }) + ci(456, 222, 2, "#888", { s: null });
  b += re(454, 116, 92, 92, "#7a5c3c", { w: 3 }) + re(458, 120, 84, 84, "#8a6a45", { s: null });
  b += re(462, 126, 26, 34, K.paperL, { w: 1.4, tf: "rotate(-3 475 143)" }) + re(462, 126, 26, 7, K.red, { s: null, tf: "rotate(-3 475 143)" }) + ci(475, 125, 2.4, K.red, { w: 1 }); // fire drill
  b += po("516,124 538,126 536,154 514,152", "#aab9b0", { w: 1.4 }) + li(516, 139, 537, 140, "#5e6b62", 1.2); // leaving card
  b += re(486, 160, 40, 42, "#d8d2c0", { w: 1.4 }) + re(490, 164, 32, 6, "#2f4d66", { s: null }) + re(492, 174, 16, 18, "#5e7179", { w: 1 }) + ci(500, 181, 4, "#b8957c", { s: null }) + pa("M496 178 q4 -4 8 0", null, { s: "#ddd", w: 2 }) + pa("M497 184 q3 2 6 0", null, { s: "#3a2a22", w: 1 }) +
    [178, 184, 190].map(y => li(511, y, 522, y, "#6d6a60", 1.1)).join("") + li(492, 196, 520, 196, "#6d6a60", 1.1);
  // glass corner office of the head of claims
  b += re(640, 36, 360, 296, "#1e2830", { w: 3 }) + re(650, 46, 340, 230, "#2b3740", { s: null });
  b += re(690, 196, 150, 8, "#5a4634", { w: 2.5 });
  b += po("690,196 840,196 846,190 696,190", "#857a6a", { w: 1.8 }) + po("748,196 770,196 772,190 750,190", "#4a3222", { s: "#c9bca4", w: 1 }); // dust film, one clean square
  [[700, 156], [726, 150], [814, 158]].forEach(p => { b += po(p[0] + "," + (196) + " " + (p[0] + 18) + ",196 " + (p[0] + 16) + "," + p[1] + " " + (p[0] + 2) + "," + p[1], "#8fc3c0", { w: 1.8, fop: 0.5 }) + re(p[0] - 2, 190, 22, 6, "#2b3439", { w: 1.4 }); });
  b += re(777, 150, 30, 40, "#232b30", { w: 2 }) + re(781, 154, 22, 32, "#4f7581", { s: null }) + pa("M785 178 l14 0 l-2 4 l-10 0 Z M791 162 v15 l7 -2 Z", "#d8d2c0", { s: null }); // yacht photo
  b += po("700,262 940,262 952,284 690,284", "#4a3a2c", { w: 2.5 }) + re(690, 284, 262, 10, "#2f241c", { w: 2.5 }) + re(796, 214, 48, 50, "#1a1f23", { w: 2.5 }); // immaculate desk + chair
  b += re(640, 36, 360, 296, u("glass"), { s: null }) + [700, 820, 940].map(x => li(x, 36, x, 332, "#0d1215", 4)).join("") + li(640, 276, 1000, 276, "#0d1215", 3);
  b += pa("M660 60 L700 40 M668 120 L760 60 M860 70 L900 46 M860 120 L960 60", null, { s: "#d8eef0", w: 2, op: 0.18 });
  // Nico's desk mid-ground, covered in printouts
  b += po("330,350 450,350 458,362 322,362", "#4e5860", { w: 2.5 }) + re(322, 362, 136, 10, "#353d44", { w: 2 }) + re(330, 300, 128, 50, "#3e4a52", { w: 2.5 });
  [[334, 340], [356, 344], [380, 338], [404, 346], [426, 340]].forEach(p => { b += po(p[0] + "," + p[1] + " " + (p[0] + 22) + "," + (p[1] - 2) + " " + (p[0] + 24) + "," + (p[1] + 8) + " " + (p[0] + 2) + "," + (p[1] + 10), "#cfc8b4", { w: 1.2 }); });
  // Iris's desk: partition, one thick claim file squared in the middle, tabs down the edge
  b += re(30, 290, 290, 92, "#3d4a54", { w: 3 }) + pa("M40 300 H310", null, { s: "#4c5a65", w: 2 });
  b += po("40,380 300,380 318,410 22,410", "#56616a", { w: 3 }) + re(22, 410, 296, 16, "#3a434a", { w: 3 }) + re(32, 426, 18, 174, "#2b3238", { w: 2.5 }) + re(286, 426, 18, 174, "#2b3238", { w: 2.5 });
  b += po("142,384 214,384 222,402 136,402", "#b5904c", { w: 2.2 }) + po("136,402 222,402 222,410 136,410", "#8c6c36", { w: 1.8 }) + li(140, 405, 220, 405, "#d6caa8", 1.5);
  [[214, 386, K.note], [216, 391, K.t3], [218, 396, K.red], [219, 400, K.note]].forEach(t => { b += re(t[0], t[1], 9, 4, t[2], { w: 1 }); });
  b += pa("M152 390 l20 0 M152 394 l34 0", null, { s: "#5e4a24", w: 1.2 });
  b += re(60, 330, 64, 46, "#121a1f", { w: 2.5 }) + re(86, 376, 12, 6, "#2d353b", { w: 1.5 }); // monitor
  // docking stand beside the desk with the closed company laptop
  b += po("288,346 352,346 356,354 284,354", "#2f383f", { w: 2.5 }) + re(300, 354, 40, 56, "#262d33", { w: 2.5 });
  b += po("292,334 348,334 354,346 286,346", "#80909a", { w: 2.4 }) + re(310, 337, 12, 5, "#d9e0e3", { w: 1 }) + li(296, 344, 344, 344, "#2c353b", 1.4);
  b += pa("M320 410 q-10 30 4 60 q14 30 0 60", null, { s: "#111", w: 2 });
  // inset panel (graphic-novel style): the file archive, end of aisle F, terminal just inside the door
  b += re(570, 330, 426, 268, K.ink, { s: null }) + re(578, 338, 410, 252, u("arch"), { s: null });
  const VPx = 668, VPy = 432;
  const toVP = (x, y, t) => [(x + (VPx - x) * t).toFixed(1), (y + (VPy - y) * t).toFixed(1)].join(",");
  let arch = "";
  arch += po("578,338 988,338 988,600 578,600", "#262e34", { s: null });
  arch += po("636,404 702,404 702,462 636,462", "#1a2126", { w: 2 }); // far wall at the end of the aisle
  // left shelving run
  arch += po(["578,338", toVP(578, 338, 0.82), toVP(578, 600, 0.82), "578,600"].join(" "), "#3f4b53", { w: 2.5 });
  for (let i = 0; i < 6; i++) { const y = 352 + i * 46; arch += pa("M578 " + y + " L" + toVP(578, y, 0.82), null, { s: K.ink, w: 2 }); }
  for (let i = 0; i < 5; i++) for (let k = 0; k < 4; k++) { const y0 = 356 + i * 46, t0 = k * 0.19, t1 = t0 + 0.13; arch += po([toVP(578, y0 + 2, t0), toVP(578, y0 + 2, t1), toVP(578, y0 + 38, t1), toVP(578, y0 + 38, t0)].join(" "), k % 2 ? "#8a7b5e" : "#7a6c52", { w: 1.2 }); }
  // right shelving run
  arch += po(["790,338", toVP(790, 338, 0.82), toVP(790, 600, 0.82), "790,600"].join(" "), "#3a454c", { w: 2.5 });
  for (let i = 0; i < 6; i++) { const y = 352 + i * 46; arch += pa("M790 " + y + " L" + toVP(790, y, 0.82), null, { s: K.ink, w: 2 }); }
  for (let i = 0; i < 5; i++) for (let k = 0; k < 4; k++) { const y0 = 356 + i * 46, t0 = k * 0.19, t1 = t0 + 0.13; arch += po([toVP(790, y0 + 2, t0), toVP(790, y0 + 2, t1), toVP(790, y0 + 38, t1), toVP(790, y0 + 38, t0)].join(" "), k % 2 ? "#7a6c52" : "#6a5e48", { w: 1.2 }); }
  // grey loop-pile carpet down the aisle, one cleaner damp patch at the end
  arch += po([toVP(578, 600, 0.82), toVP(790, 600, 0.82), "790,600", "578,600"].join(" "), "#4c5054", { w: 2 });
  for (let i = 0; i < 6; i++) { const y = 476 + i * 22; arch += li(560, y, 820, y, "#43474b", 1.2); }
  arch += el(642, 514, 46, 13, "#626a6e", { s: "#80878a", w: 1.4 }) + el(642, 514, 32, 8, "#56656c", { s: null, op: 0.7 }) + pa("M610 512 q10 -4 20 0 M650 518 q10 -4 20 0", null, { s: "#8a9396", w: 1.2, op: 0.6 });
  // aisle sign and spill kit
  arch += li(669, 338, 669, 352, K.ink, 2) + re(656, 352, 26, 24, K.paperL, { w: 2 }) + tx(669, 371, "F", { "text-anchor": "middle", "font-size": 19, fill: K.ink, "font-family": "Arial, Helvetica, sans-serif", "font-weight": "bold" });
  arch += re(706, 440, 16, 20, K.red, { w: 1.6, op: 0.8 }) + li(706, 450, 722, 450, K.ink, 1.2);
  // the open archive door and the retrieval terminal on its steel stand
  arch += po("832,338 988,338 988,600 832,600", "#2f383e", { w: 3 }) + po("846,352 978,352 978,600 846,600", "#151b1f", { w: 2.5 }) + po("846,352 808,372 808,600 846,600", "#56636b", { w: 2.5 }) + ci(818, 470, 4, K.steelL, { w: 1.2 });
  arch += li(880, 446, 880, 560, K.steel, 6) + pa("M856 562 h48", null, { s: K.steel, w: 6 }) + po("854,396 906,396 906,446 854,446", "#2b3439", { w: 2.5 }) + re(860, 402, 40, 26, "#3d6a6c", { w: 1.5 }) + re(864, 434, 32, 7, "#4b5359", { w: 1.2 }) +
    re(908, 410, 15, 15, K.note, { w: 1.2, tf: "rotate(6 915 417)" }) + glow(880, 418, 80, 0.3, "cool");
  arch += hat("M578 338 L668 432 L578 600 Z", 0.25) + hat("M846 352 H978 V600 H846 Z", 0.3);
  b += g({ "clip-path": u("ins") }, arch);
  b += re(574, 334, 418, 260, null, { s: "#d3c7aa", w: 2, op: 0.5 });
  b += re(866, 344, 116, 22, K.paperL, { w: 2 }) + tx(924, 360, "THE ARCHIVE", { "text-anchor": "middle", "font-size": 12, "letter-spacing": 2, fill: K.ink, "font-family": "Arial, Helvetica, sans-serif", "font-weight": "bold" });
  b += hat("M0 426 H330 V600 H0 Z", 0.18);
  b += sh("M0 0 H1000 V30 H0 Z", 0.25);
  return svg(1000, 600, defs, b);
});

/* --- Tidewater Café: camera over the till (780,130), community board by the door (540,260),
       window table with the boat drawn in the fogged glass (260,410) */
reg("scenes", "loc-cafe", function () {
  P = "ca"; W = 3; seed = 61;
  const defs = lg("wall", 0, 0, 0, 1, [[0, "#2c2a27"], [1, "#221f1c"]]) + lg("out", 0, 0, 0, 1, [[0, "#2c4048"], [1, "#16232a"]]) + clip("wc", re(40, 70, 380, 300, "#000", { s: null }));
  let b = re(0, 0, 1000, 600, u("wall"), { s: null });
  b += re(0, 470, 1000, 130, "#1f1a16", { s: null }) + pa("M0 470 H1000", null, { w: 3 });
  for (let x = 0; x < 1000; x += 40) b += li(x, 470, x - 60, 600, "#171310", 1.4);
  b += re(0, 300, 1000, 8, "#3a3029", { s: null, op: 0.6 }); // dado rail
  // big window, fogged; the street outside in the rain
  b += re(32, 62, 396, 316, "#2a221c", { w: 4 }) + re(40, 70, 380, 300, u("out"), { s: null });
  b += g({ "clip-path": u("wc") }, pa("M40 220 L120 200 L120 140 L200 150 L210 220 L320 210 L330 160 L420 170 V370 H40 Z", "#121c22", { s: null }),
    li(330, 120, 330, 300, K.ink, 5), glow(330, 130, 80, 0.8), re(150, 230, 16, 22, K.a3, { s: null, op: 0.6 }), rain(0.8),
    re(40, 70, 380, 300, "#b9c6c6", { s: null, op: 0.36 }), fog(230, 230, 200, 140, 0.25, "#d8e2e2"),
    // small boat drawn in the condensation, half wiped out
    pa("M232 362 L292 362 L282 374 L242 374 Z M262 362 V326 L284 356 L262 356", null, { s: "#273840", w: 2.4, op: 0.85 }),
    pa("M282 350 C300 340 320 356 344 344", null, { s: "#273840", w: 10, op: 0.5 }));
  b += li(230, 70, 230, 370, "#2a221c", 6) + re(26, 372, 408, 12, "#3e3329", { w: 3 });
  // window table where she always sat: tea cup, no notebook
  b += el(262, 410, 96, 18, "#5a4636", { w: 3 }) + li(262, 428, 262, 520, K.ink, 6) + el(262, 524, 40, 8, "#2a221c", { w: 2.5 });
  b += el(232, 404, 14, 4, "#d5cdbb", { w: 1.8 }) + pa("M224 404 v-10 h16 v10", "#d5cdbb", { w: 1.8 }) + pa("M240 396 q6 2 0 6", null, { w: 1.6 }) + re(276, 400, 34, 10, "#7d6b55", { w: 1.5, tf: "rotate(-6 293 405)" });
  b += pa("M140 520 L150 400 L190 400 L180 520 Z", "#3a2d24", { w: 2.5 }) + pa("M380 520 L372 400 L334 400 L344 520 Z", "#3a2d24", { w: 2.5 }); // chairs
  // pendant lamps
  [262, 640, 860].forEach(x => { b += li(x, 0, x, 60, K.ink, 2) + pa("M" + (x - 22) + " 80 q22 -30 44 0 Z", K.a2, { w: 2.5 }) + glow(x, 92, 200, 0.6); });
  // community board by the door: guitar lessons, lost dog, room to let, co-op flyer
  b += re(486, 204, 92, 112, "#7a5c3c", { w: 3 }) + re(491, 209, 82, 102, "#8d6a45", { s: null });
  b += re(496, 214, 26, 30, "#d8d2c0", { w: 1.2, tf: "rotate(-4 509 229)" }) + [0, 1, 2, 3].map(i => li(498 + i * 6, 244, 498 + i * 6, 254, "#d8d2c0", 3)).join("");
  b += re(528, 214, 38, 32, "#c9c3b0", { w: 1.2 }) + re(534, 218, 14, 12, "#59524a", { s: null }) + li(531, 238, 562, 238, "#6d6a60", 1.2);
  b += re(498, 262, 24, 34, "#bfb8a4", { w: 1.2, tf: "rotate(3 510 279)" });
  b += re(528, 256, 40, 50, K.paperL, { w: 1.5 }) + re(531, 259, 34, 8, "#2f4d66", { s: null }) + pa("M536 286 q12 -10 24 0 Z M548 276 v10", "#2f4d66", { s: "#2f4d66", w: 1.2 }) + [292, 297, 302].map(y => li(533, y, 563, y, "#6d6a60", 1)).join("");
  [[509, 214], [547, 214], [510, 262], [548, 256]].forEach(p => { b += ci(p[0], p[1], 2.4, K.red, { w: 0.8 }); });
  // door with fogged glass
  b += re(590, 112, 112, 358, "#3a2d24", { w: 3 }) + re(602, 126, 88, 150, "#a9b7b6", { w: 2.5, op: 0.55 }) + re(602, 292, 88, 160, "#33281f", { w: 2 }) + ci(684, 300, 5, K.a2, { w: 1.5 }) + pa("M640 102 q6 -10 12 0 Z", K.a2, { w: 1.5 });
  // counter, till, camera bracketed above it, menu board and radio
  b += re(712, 300, 300, 22, "#5a4636", { w: 3 }) + re(712, 322, 300, 148, "#3a2d24", { w: 3 }) + [760, 840, 920].map(x => li(x, 330, x, 462, "#2b211a", 2)).join("");
  b += po("770,300 832,300 826,262 776,262", "#3b4247", { w: 2.5 }) + re(782, 268, 38, 14, "#4d7a76", { w: 1.5 }) + re(778, 290, 46, 8, "#22282c", { w: 1.2 });
  b += li(820, 82, 790, 112, K.ink, 5) + re(812, 74, 18, 14, "#2d3439", { w: 2 }) + g({ transform: "rotate(28 780 128)" }, re(756, 116, 46, 22, "#3b4449", { w: 2.5 }), ci(758, 127, 7, "#151b1f", { w: 2 }), ci(758, 127, 2.5, K.red, { s: null }));
  b += pa("M754 136 L700 300 L860 300 Z", K.t4, { s: null, op: 0.04 });
  b += re(856, 92, 128, 140, "#1c2422", { w: 4 }) + tx(920, 124, "TODAY", { "text-anchor": "middle", "font-size": 14, fill: "#d8d2c0", "letter-spacing": 3, "font-family": "Arial, sans-serif" }) +
    tx(920, 152, "Fish soup", { "text-anchor": "middle", "font-size": 17, fill: "#e0dccf", "font-style": "italic" }) + tx(920, 178, "Bread", { "text-anchor": "middle", "font-size": 14, fill: "#c9c3b0", "font-style": "italic" }) +
    tx(920, 202, "Pot of tea", { "text-anchor": "middle", "font-size": 14, fill: "#c9c3b0", "font-style": "italic" });
  b += re(856, 252, 128, 7, "#4a3a2c", { w: 2 }) + re(890, 226, 52, 26, "#5b4a3b", { w: 2.2 }) + ci(904, 239, 7, "#2a221c", { w: 1.5 }) + [918, 924, 930].map(x => li(x, 232, x, 246, "#2a221c", 1.6)).join("") + li(934, 226, 948, 206, K.ink, 1.6);
  b += el(950, 300, 20, 4, "#8a7a62", { s: null }) + pa("M936 300 q14 -26 28 0", "#c9c3b0", { w: 2 }); // soup tureen
  b += fog(240, 300, 220, 120, 0.12, "#d8e2e2");
  return svg(1000, 600, defs, b);
});

/* --- The Anchor & Lamp kitchen: punch clock + ticket spike (190,260), grill and ticket rail (470,450),
       back door propped with a fish crate, dummy camera (780,320) */
reg("scenes", "loc-restaurant", function () {
  P = "re"; W = 3; seed = 71;
  const defs = lg("wall", 0, 0, 0, 1, [[0, "#2b3437"], [1, "#222a2d"]]) + lg("dawn", 0, 0, 0, 1, [[0, "#5b6f78"], [1, "#2a3a42"]]) + clip("dc", re(725, 306, 112, 252, "#000", { s: null }));
  let b = re(0, 0, 1000, 600, u("wall"), { s: null });
  for (let y = 20; y < 470; y += 22) for (let x = (y / 22) % 2 ? 0 : 22; x < 1000; x += 44) b += re(x, y, 42, 20, "#323c40", { s: "#1e2528", w: 1.2 });
  b += re(0, 470, 1000, 130, "#1e2326", { s: null }) + pa("M0 470 H1000", null, { w: 3 });
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) b += re(i * 125 + (j % 2) * 62, 476 + j * 32, 120, 30, "#262c30", { s: "#181d20", w: 1.2 });
  // the pass: an opening onto the dining room, chairs upside down on tables
  b += re(236, 120, 132, 176, "#141a1d", { w: 3 });
  b += g({}, re(244, 250, 50, 8, "#3a2c22", { w: 2 }), pa("M252 250 l-2 -22 h20 l-2 22 M258 228 v-14 M272 228 v-14", null, { s: "#3a2c22", w: 3 }),
    re(306, 238, 54, 8, "#3a2c22", { w: 2 }), pa("M316 238 l-2 -22 h20 l-2 22 M322 216 v-14 M336 216 v-14", null, { s: "#3a2c22", w: 3 }), glow(300, 170, 80, 0.3, "cool"));
  b += re(130, 296, 250, 14, "#8796a0", { w: 3 }) + re(130, 310, 250, 8, "#4c5960", { w: 2 }) + glow(300, 120, 140, 0.35);
  // punch clock, rack of cards, the ticket spike on the pass
  b += re(146, 206, 54, 70, "#5d6a72", { w: 3 }) + ci(173, 230, 16, "#d6d0bf", { w: 2 }) + li(173, 230, 173, 218, K.ink, 2) + li(173, 230, 183, 234, K.ink, 2) + re(156, 254, 34, 14, "#2c3439", { w: 1.6 }) + re(162, 258, 22, 4, "#8a7b5e", { s: null });
  b += re(204, 196, 26, 96, "#4a565d", { w: 2.5 }) + [204, 216, 228, 240, 252, 264, 276].map(y => re(208, y, 18, 10, "#cfc8b4", { w: 1 })).join("");
  b += li(214, 296, 214, 250, K.steelL, 2.4) + el(214, 296, 10, 3, K.steelD, { w: 1.5 }) + [258, 266, 274, 282, 290].map((y, i) => po((205 + (i % 2) * 2) + "," + y + " " + (225 - (i % 2) * 2) + "," + (y - 2) + " " + (226) + "," + (y + 5) + " " + 204 + "," + (y + 6), "#e2dccb", { w: 1 })).join("");
  // grill station: hood, ticket rail, grill bars still warm
  b += po("360,170 580,170 610,260 330,260", "#5a676f", { w: 3 }) + re(330, 260, 280, 12, "#3e4a51", { w: 2.5 });
  b += re(380, 380, 180, 6, K.steelL, { w: 2 }) + [392, 418, 446, 474, 504, 530].map((x, i) => po(x + ",386 " + (x + 18) + ",386 " + (x + 18) + "," + (406 + (i % 3) * 4) + " " + x + "," + (406 + (i % 3) * 4), "#e2dccb", { w: 1.2 }) + li(x + 3, 394, x + 14, 394, "#6d6a60", 1)).join("");
  b += po("390,430 552,430 574,462 368,462", "#2a2f33", { w: 3 }) + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => li(380 + i * 22, 458, 392 + i * 19, 434, "#121518", 3)).join("") + el(470, 446, 90, 14, K.a3, { s: null, op: 0.12 }) + glow(470, 448, 90, 0.4);
  b += re(360, 462, 220, 46, "#5b6b75", { w: 3 }) + [400, 440, 480, 520].map(x => ci(x, 485, 6, "#2b3439", { w: 2 })).join("") + re(360, 508, 220, 92, "#3d4950", { w: 3 });
  b += pa("M420 420 q6 -14 0 -26 M470 420 q-6 -16 2 -30 M520 420 q6 -14 -2 -26", null, { s: K.n8, w: 2, op: 0.3 });
  // steel counter left foreground
  b += po("0,430 300,430 320,452 0,452", "#7b8a93", { w: 3 }) + re(0, 452, 320, 148, "#46535b", { w: 3 }) + li(160, 452, 160, 600, K.ink, 2) + re(150, 500, 6, 40, K.steelL, { w: 1.4 }) + re(164, 500, 6, 40, K.steelL, { w: 1.4 });
  // back door open onto the quay at dawn, dummy camera above
  b += re(712, 294, 138, 270, "#2d2722", { w: 3 }) + re(725, 306, 112, 252, u("dawn"), { s: null });
  b += g({ "clip-path": u("dc") }, re(725, 430, 112, 130, "#1e2d35", { s: null }), pa("M725 450 q14 -4 28 0 t28 0 t28 0 t28 0 M725 480 q14 -4 28 0 t28 0 t28 0 t28 0", null, { s: K.t3, w: 1.5, op: 0.6 }),
    re(725, 410, 112, 22, "#3c4a50", { s: null }), re(760, 382, 16, 30, "#20282c", { w: 2 }), el(768, 382, 10, 4, "#20282c", { w: 2 }), fog(780, 360, 80, 40, 0.3, "#c8d4d8"));
  b += po("837,306 900,290 900,580 837,558", "#3a3029", { w: 3 }) + li(892, 420, 892, 440, K.a2, 4);
  b += po("700,520 790,520 796,566 694,566", "#7a6a4e", { w: 2.5 }) + li(700, 536, 792, 536, "#4a3e2c", 2) + li(698, 550, 794, 550, "#4a3e2c", 2) + el(745, 518, 30, 5, "#a7b7ba", { w: 1.5 });
  b += li(780, 294, 780, 276, K.ink, 4) + po("762,256 806,256 806,276 762,276", "#566269", { w: 2.5 }) + re(752, 258, 10, 16, "#3a444a", { w: 2 }); // dummy camera: no lens, no cable
  // chef's towel, pans on the rail
  b += li(40, 120, 120, 120, K.steelL, 3) + ci(60, 150, 22, "#3a444a", { w: 2.5 }) + li(60, 128, 60, 120, K.ink, 2) + ci(104, 156, 26, "#2f383e", { w: 2.5 }) + li(104, 130, 104, 120, K.ink, 2);
  b += fog(780, 420, 160, 120, 0.1, "#c8d4d8");
  return svg(1000, 600, defs, b);
});

/* --- Fishermen's Co-operative Hall: secretary's table (240,300), wall of boats with GREY PETREL (560,170),
       oilskin hooks by the door, yellow oilskin P. LUND (820,420) */
reg("scenes", "loc-coop", function () {
  P = "co"; W = 3; seed = 81;
  const defs = lg("wall", 0, 0, 0, 1, [[0, "#26333a"], [1, "#1d282e"]]);
  let b = re(0, 0, 1000, 600, u("wall"), { s: null });
  for (let x = 0; x < 1000; x += 14) b += li(x, 40, x, 340, x % 28 ? "#22303a" : "#2c3b45", 2);
  b += pa("M0 0 H1000 V50 L500 18 L0 50 Z", "#141c21", { w: 3 }) + pa("M0 50 L500 18 L1000 50", null, { s: "#3c4a52", w: 6 }) + [120, 300, 700, 880].map(x => li(x, 50 - (x < 500 ? x : 1000 - x) * 0.064, x, 0, K.ink, 5)).join("");
  b += re(0, 340, 1000, 260, "#2a2723", { s: null }) + pa("M0 340 H1000", null, { w: 3 });
  for (let i = 0; i < 7; i++) b += pa("M0 " + (360 + i * 34) + " H1000", null, { s: "#211e1b", w: 1.4 });
  // fluorescent tubes
  [[200, 70], [560, 60], [840, 70]].forEach(p => { b += re(p[0] - 60, p[1], 120, 8, "#cfe0e0", { w: 2, op: 0.7 }) + glow(p[0], p[1] + 30, 160, 0.3, "cool"); });
  // wall of boats: framed photographs, GREY PETREL in the centre with a black ribbon
  const photo = (x, y, w, h, hull) => re(x, y, w, h, "#1a1714", { w: 2.4 }) + re(x + 4, y + 4, w - 8, h - 8, "#7e8a88", { s: null }) +
    re(x + 4, y + h * 0.62, w - 8, h * 0.38 - 4, "#4d5f62", { s: null }) + po((x + w * 0.2) + "," + (y + h * 0.6) + " " + (x + w * 0.8) + "," + (y + h * 0.6) + " " + (x + w * 0.72) + "," + (y + h * 0.72) + " " + (x + w * 0.28) + "," + (y + h * 0.72), hull, { w: 1.2 }) +
    re(x + w * 0.42, y + h * 0.38, w * 0.14, h * 0.22, "#d8d2c0", { w: 1 });
  [[392, 86, "#3b2a22"], [452, 92, "#5a2a24"], [392, 196, "#2e3a2e"], [452, 200, "#4a4030"], [660, 86, "#3b4a52"], [700, 190, "#5a2a24"], [640, 196, "#2e2e30"], [400, 140, "#4a4030"]].forEach((p, i) => { b += photo(p[0], p[1], i % 2 ? 50 : 56, i % 2 ? 40 : 46, p[2]); });
  b += photo(510, 120, 104, 82, "#2e5a7a") + re(510, 204, 104, 16, "#d8d2c0", { w: 1.5 }) + [210, 215].map(y => li(516, y, 606, y, "#6d6a60", 1.2)).join("");
  b += tx(562, 136, "GREY PETREL", { "text-anchor": "middle", "font-size": 8, fill: K.ink, "font-family": "Arial, sans-serif", "letter-spacing": 1 });
  b += pa("M602 120 L614 120 L614 134 Z", K.ink, { w: 1.5 }) + pa("M606 126 L612 142 M610 124 L620 138", null, { s: K.ink, w: 3 });
  b += po("150,236 180,236 184,292 146,292", "#2a2622", { w: 2.5 }) + li(154, 250, 176, 250, "#3a342e", 2); // chair behind the table
  // secretary's trestle table: minute book open, attendance sheet clipped inside the cover
  b += po("120,292 360,292 372,308 108,308", "#4a3a2c", { w: 3 }) + re(108, 308, 264, 8, "#2f241c", { w: 2.5 }) + pa("M130 316 L170 410 M170 316 L130 410 M310 316 L350 410 M350 316 L310 410", null, { s: K.woodD, w: 5 });
  b += po("200,290 236,284 272,290 274,300 236,296 196,300", "#d4ccb4", { w: 2 }) + li(236, 284, 236, 296, K.ink, 1.6) + [288, 292].map(y => li(204, y, 230, y - 2, "#6e6a5e", 1) + li(242, y - 2, 268, y, "#6e6a5e", 1)).join("");
  b += po("280,286 316,286 320,300 278,300", "#c9c3b0", { w: 1.6 }) + re(292, 282, 12, 6, K.steelL, { w: 1.2 }) + [290, 294, 297].map(y => li(284, y, 314, y, "#6e6a5e", 1)).join("");
  b += re(150, 270, 26, 22, "#3a5d5a", { w: 2 }) + pa("M176 276 q8 2 0 10", null, { w: 2 }); // mug
  // tea urn on a side table
  b += re(392, 300, 70, 8, "#4a3a2c", { w: 2.5 }) + pa("M398 300 L398 260 Q427 240 456 260 L456 300 Z", "#8796a0", { w: 2.5 }) + re(420, 286, 14, 6, K.ink, { s: null }) + li(398, 308, 398, 360, K.woodD, 4) + li(456, 308, 456, 360, K.woodD, 4);
  // folding chairs in rows
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const x = 330 + c * 78 + r * 12, y = 400 + r * 58, s = 1 + r * 0.12;
    b += g({ transform: "translate(" + x + " " + y + ") scale(" + s + ")" }, re(0, 0, 40, 36, "#4a5860", { w: 2.4 }), po("-2,36 42,36 46,44 -6,44", "#5b6b75", { w: 2.4 }), li(2, 44, -2, 76, K.ink, 3), li(38, 44, 42, 76, K.ink, 3));
  }
  // door and the row of oilskin hooks
  b += re(912, 140, 88, 330, "#2c2620", { w: 3 }) + re(922, 152, 68, 120, "#5b6f78", { w: 2, op: 0.6 }) + ci(926, 330, 5, K.a2, { w: 1.5 });
  b += re(724, 318, 180, 10, K.woodL, { w: 2.5 }) + [744, 790, 836, 880].map(x => li(x, 328, x, 340, K.steelL, 3)).join("");
  b += pa("M732 338 C724 380 722 440 728 492 L766 492 C770 440 768 380 756 338 Z", "#2b3a3a", { w: 2.5 }) + pa("M866 338 C858 380 856 440 860 488 L900 488 C904 440 902 380 892 338 Z", "#3a3230", { w: 2.5 });
  b += pa("M806 338 C790 350 782 400 780 450 C778 480 784 500 790 506 L852 506 C858 500 862 480 860 450 C858 400 850 350 834 338 Z", K.oil, { w: 3 });
  b += pa("M806 338 C812 350 828 350 834 338 L828 362 C822 368 816 368 812 362 Z", K.oilD, { w: 2.2 }) + re(810, 348, 20, 8, "#e8e0c8", { w: 1.2 });
  b += pa("M820 368 V500 M796 400 C800 440 800 470 796 500 M846 400 C842 440 842 470 846 500", null, { s: K.oilD, w: 2 }) + pa("M792 380 C786 420 786 460 790 490", null, { s: "#f2d27a", w: 2, op: 0.7 });
  b += sh("M0 470 H1000 V600 H0 Z", 0.12);
  return svg(1000, 600, defs, b);
});


/* ============================================================ PORTRAITS (300 x 360) */
const F = n => (+n).toFixed(1);
function headPath(cx, cy, w, jaw, chin) {
  chin = chin || 78;
  return "M" + F(cx - w) + " " + F(cy - 10) + " C" + F(cx - w) + " " + F(cy - 62) + " " + F(cx - w * 0.7) + " " + F(cy - 82) + " " + F(cx) + " " + F(cy - 84) +
    " C" + F(cx + w * 0.7) + " " + F(cy - 82) + " " + F(cx + w) + " " + F(cy - 62) + " " + F(cx + w) + " " + F(cy - 10) +
    " C" + F(cx + w) + " " + F(cy + 26) + " " + F(cx + w * jaw) + " " + F(cy + 56) + " " + F(cx + w * 0.36) + " " + F(cy + chin - 8) +
    " C" + F(cx + w * 0.16) + " " + F(cy + chin) + " " + F(cx - w * 0.16) + " " + F(cy + chin) + " " + F(cx - w * 0.36) + " " + F(cy + chin - 8) +
    " C" + F(cx - w * jaw) + " " + F(cy + 56) + " " + F(cx - w) + " " + F(cy + 26) + " " + F(cx - w) + " " + F(cy - 10) + " Z";
}
/* o: cx, cy, w, jaw, chin, skin, shade, eyeGap, look (pupil dx), lookY, brow (tilt), browW, browC, mouth, age (0..3),
      stubble, beard, red (red-rimmed eyes), lids (heavy lids 0..1), neck (half width) */
function face(o) {
  const cx = o.cx || 150, cy = o.cy || 150, w = o.w || 50, jaw = o.jaw == null ? 0.8 : o.jaw, chin = o.chin || 78;
  const sk = o.skin, sd = o.shade, hp = headPath(cx, cy, w, jaw, chin);
  let s = "";
  // neck
  const nw = o.neck || w * 0.56;
  const nb = cy + (o.neckLen || 100);
  s += pa("M" + F(cx - nw) + " " + F(cy + 40) + " L" + F(cx - nw - 3) + " " + F(nb) + " L" + F(cx + nw + 3) + " " + F(nb) + " L" + F(cx + nw) + " " + F(cy + 40) + " Z", sk, { w: 2.4 });
  s += pa("M" + F(cx - nw) + " " + F(cy + 54) + " C" + F(cx - 10) + " " + F(cy + 86) + " " + F(cx + 10) + " " + F(cy + 86) + " " + F(cx + nw + 2) + " " + F(cy + 50) + " L" + F(cx + nw + 3) + " " + F(nb) + " L" + F(cx + nw * 0.2) + " " + F(nb) + " Z", sd, { s: null, op: 0.9 });
  // ears
  s += el(cx - w + 2, cy + 4, 9, 17, sk, { w: 2.4 }) + el(cx + w - 2, cy + 4, 9, 17, sd, { w: 2.4 }) + pa("M" + F(cx - w - 1) + " " + F(cy - 4) + " q-4 8 1 16", null, { s: K.ink, w: 1.4, op: 0.6 });
  // head
  s += "<clipPath id='" + id("hc") + "'><path d='" + hp + "'/></clipPath>";
  s += pa(hp, sk, { s: null });
  s += g({ "clip-path": u("hc") },
    // shadow side (key light from the left)
    pa("M" + F(cx + w * 0.18) + " " + F(cy - 90) + " C" + F(cx + w * 0.4) + " " + F(cy - 50) + " " + F(cx + w * 0.26) + " " + F(cy - 14) + " " + F(cx + w * 0.46) + " " + F(cy + 14) +
      " C" + F(cx + w * 0.42) + " " + F(cy + 44) + " " + F(cx + w * 0.2) + " " + F(cy + 62) + " " + F(cx + w * 0.02) + " " + F(cy + 90) + " L" + F(cx + w + 30) + " " + F(cy + 90) + " L" + F(cx + w + 30) + " " + F(cy - 90) + " Z", sd, { s: null }),
    // jaw shadow and cheekbone
    pa("M" + F(cx - w) + " " + F(cy + 30) + " C" + F(cx - w * 0.7) + " " + F(cy + 60) + " " + F(cx - w * 0.3) + " " + F(cy + 74) + " " + F(cx) + " " + F(cy + 76) + " L" + F(cx) + " " + F(cy + 100) + " L" + F(cx - w - 10) + " " + F(cy + 100) + " Z", sd, { s: null, op: 0.45 }),
    o.stubble ? pa("M" + F(cx - w) + " " + F(cy + 22) + " C" + F(cx - w * 0.8) + " " + F(cy + 64) + " " + F(cx - w * 0.3) + " " + F(cy + 80) + " " + F(cx) + " " + F(cy + 80) + " C" + F(cx + w * 0.3) + " " + F(cy + 80) + " " + F(cx + w * 0.8) + " " + F(cy + 64) + " " + F(cx + w) + " " + F(cy + 22) +
      " L" + F(cx + w * 0.5) + " " + F(cy + 34) + " C" + F(cx + w * 0.3) + " " + F(cy + 40) + " " + F(cx - w * 0.3) + " " + F(cy + 40) + " " + F(cx - w * 0.5) + " " + F(cy + 34) + " Z", o.stubble, { s: null, op: 0.5 }) : "",
    // rim light on the shadow edge
    pa("M" + F(cx + w - 3) + " " + F(cy - 40) + " C" + F(cx + w + 1) + " " + F(cy) + " " + F(cx + w - 6) + " " + F(cy + 40) + " " + F(cx + w * 0.5) + " " + F(cy + 66), null, { s: K.t4, w: 2.4, op: 0.45 }));
  s += pa(hp, null, { w: 2.8 });
  // eyes
  const eg = o.eyeGap || w * 0.42, ey = cy - 4, lk = o.look || 0, lky = o.lookY || 0;
  [-1, 1].forEach(sgn => {
    const x = cx + sgn * eg;
    const eye = "M" + F(x - 11) + " " + F(ey) + " C" + F(x - 6) + " " + F(ey - 6.5) + " " + F(x + 6) + " " + F(ey - 6.5) + " " + F(x + 11) + " " + F(ey) + " C" + F(x + 6) + " " + F(ey + 5) + " " + F(x - 6) + " " + F(ey + 5) + " " + F(x - 11) + " " + F(ey) + " Z";
    s += pa(eye, sgn < 0 ? "#d6cfc0" : "#b5ae9f", { s: null });
    s += "<clipPath id='" + id("e" + (sgn + 1)) + "'><path d='" + eye + "'/></clipPath>";
    s += g({ "clip-path": u("e" + (sgn + 1)) }, ci(x + lk, ey + lky, 4.8, o.iris || "#3a3128", { s: null }), ci(x + lk, ey + lky, 2.1, K.ink, { s: null }), ci(x + lk - 1.5, ey + lky - 1.6, 1.1, "#fff", { s: null, op: 0.8 }),
      pa("M" + F(x - 12) + " " + F(ey - 7) + " H" + F(x + 12) + " V" + F(ey - 7 + 6 * (o.lids || 0.3)) + " H" + F(x - 12) + " Z", sk, { s: null }));
    if (o.red) s += pa("M" + F(x - 10) + " " + F(ey + 3) + " C" + F(x - 4) + " " + F(ey + 7) + " " + F(x + 4) + " " + F(ey + 7) + " " + F(x + 10) + " " + F(ey + 3), null, { s: "#9a4a42", w: 2, op: 0.85 });
    s += pa("M" + F(x - 12) + " " + F(ey + 1) + " C" + F(x - 6) + " " + F(ey - 7.5 + 6 * (o.lids || 0.3) * 0.5) + " " + F(x + 6) + " " + F(ey - 7.5 + 6 * (o.lids || 0.3) * 0.5) + " " + F(x + 12) + " " + F(ey), null, { w: 2.8 });
    s += pa("M" + F(x - 9) + " " + F(ey + 4) + " C" + F(x - 3) + " " + F(ey + 6) + " " + F(x + 3) + " " + F(ey + 6) + " " + F(x + 9) + " " + F(ey + 3.5), null, { w: 1.2, op: 0.7 });
    if (o.age) for (let k = 0; k < Math.min(o.age, 2); k++) s += pa("M" + F(x - 8 + sgn * 2) + " " + F(ey + 9 + k * 4) + " q" + F(8) + " 4 " + F(16) + " 0", null, { s: sd, w: 1.3, op: 0.9 });
    if (o.age > 1) s += pa("M" + F(x + sgn * 13) + " " + F(ey - 2) + " l" + F(sgn * 6) + " -3 M" + F(x + sgn * 13) + " " + F(ey + 2) + " l" + F(sgn * 7) + " 1", null, { s: sd, w: 1.2 });
    // brows
    const bt = (o.brow || 0) * sgn, by = ey - 14 - (o.browUp || 0);
    s += pa("M" + F(x - 13) + " " + F(by + 2 - bt * (sgn < 0 ? -1 : 1) * 0 + (sgn < 0 ? bt : -bt)) + " Q" + F(x) + " " + F(by - 4) + " " + F(x + 13) + " " + F(by + (sgn < 0 ? -bt : bt) + 1), null, { s: o.browC || K.ink, w: o.browW || 4.2 });
  });
  // nose
  s += pa("M" + F(cx + 3) + " " + F(cy + 2) + " C" + F(cx + 5) + " " + F(cy + 16) + " " + F(cx + 11) + " " + F(cy + 26) + " " + F(cx + 7) + " " + F(cy + 31) + " C" + F(cx + 3) + " " + F(cy + 35) + " " + F(cx - 4) + " " + F(cy + 34) + " " + F(cx - 9) + " " + F(cy + 31), null, { w: 2.2 });
  s += pa("M" + F(cx + 4) + " " + F(cy + 6) + " C" + F(cx + 8) + " " + F(cy + 18) + " " + F(cx + 14) + " " + F(cy + 26) + " " + F(cx + 8) + " " + F(cy + 33) + " L" + F(cx + 4) + " " + F(cy + 33) + " C" + F(cx + 8) + " " + F(cy + 24) + " " + F(cx + 4) + " " + F(cy + 14) + " " + F(cx + 4) + " " + F(cy + 6) + " Z", sd, { s: null });
  s += el(cx - 4, cy + 32, 3, 1.6, K.ink, { s: null, op: 0.7 }) + el(cx + 6, cy + 32, 3, 1.6, K.ink, { s: null, op: 0.7 });
  if (o.age > 1) s += pa("M" + F(cx - 14) + " " + F(cy + 30) + " C" + F(cx - 20) + " " + F(cy + 40) + " " + F(cx - 20) + " " + F(cy + 48) + " " + F(cx - 18) + " " + F(cy + 54) + " M" + F(cx + 18) + " " + F(cy + 30) + " C" + F(cx + 24) + " " + F(cy + 40) + " " + F(cx + 24) + " " + F(cy + 48) + " " + F(cx + 22) + " " + F(cy + 54), null, { s: sd, w: 1.8 });
  // mouth
  const my = cy + 50, m = o.mouth || "neutral";
  const lip = o.lip || "#8a5a4e";
  if (m === "smile") {
    s += pa("M" + F(cx - 19) + " " + F(my - 3) + " C" + F(cx - 8) + " " + F(my + 6) + " " + F(cx + 8) + " " + F(my + 6) + " " + F(cx + 19) + " " + F(my - 3), null, { w: 2.6 });
    s += pa("M" + F(cx - 21) + " " + F(my - 6) + " l3 4 M" + F(cx + 21) + " " + F(my - 6) + " l-3 4", null, { w: 1.6 }) + pa("M" + F(cx - 8) + " " + F(my + 9) + " q8 3 16 0", null, { s: sd, w: 2 });
  } else if (m === "tight") {
    s += pa("M" + F(cx - 15) + " " + F(my) + " L" + F(cx + 15) + " " + F(my - 1), null, { w: 2.8 }) + pa("M" + F(cx - 7) + " " + F(my + 6) + " q7 2 14 0", null, { s: sd, w: 2 });
  } else if (m === "down") {
    s += pa("M" + F(cx - 16) + " " + F(my + 3) + " C" + F(cx - 8) + " " + F(my - 2) + " " + F(cx + 8) + " " + F(my - 2) + " " + F(cx + 16) + " " + F(my + 3), null, { w: 2.6 }) + pa("M" + F(cx - 7) + " " + F(my + 8) + " q7 2 14 0", null, { s: sd, w: 2 });
  } else if (m === "wry") {
    s += pa("M" + F(cx - 16) + " " + F(my + 1) + " C" + F(cx - 6) + " " + F(my + 3) + " " + F(cx + 6) + " " + F(my + 1) + " " + F(cx + 17) + " " + F(my - 4), null, { w: 2.6 }) + pa("M" + F(cx - 7) + " " + F(my + 8) + " q7 2 14 0", null, { s: sd, w: 2 });
  } else {
    s += pa("M" + F(cx - 9) + " " + F(my - 4) + " q9 -3 18 0", lip, { s: null, op: 0.6 }) + pa("M" + F(cx - 16) + " " + F(my) + " C" + F(cx - 6) + " " + F(my + 2) + " " + F(cx + 6) + " " + F(my + 2) + " " + F(cx + 16) + " " + F(my), null, { w: 2.5 }) +
      pa("M" + F(cx - 8) + " " + F(my + 7) + " q8 3 16 0", null, { s: sd, w: 2.2 });
  }
  return s;
}
function pBg(top, bottom, extra) {
  return lg("bg", 0, 0, 0, 1, [[0, top], [1, bottom]]) + (extra || "");
}
const pBack = () => re(0, 0, 300, 360, u("bg"), { s: null });
const SK = { // skin tones: base, shadow
  fair: ["#c39b80", "#8c6553"], warm: ["#b98a6c", "#7f5a47"], ruddy: ["#b8816a", "#7a5143"], olive: ["#ad8b6b", "#735a45"], pale: ["#c8a790", "#8f6f5f"], weathered: ["#a87a5e", "#6e4c3b"]
};

reg("portraits", "p-victim", function () {
  P = "pv"; W = 2.6;
  const defs = pBg("#3a4954", "#1b252d");
  let b = pBack() + re(20, 20, 260, 320, null, { s: "#4f606b", w: 1.5, op: 0.6 }); // plain ID-photo backdrop
  b += "<g transform='translate(150 236) scale(1.08) translate(-150 -236)'>";
  b += pa("M126 120 C120 170 118 230 128 260 L172 260 C182 230 180 170 174 120 Z", "#3a2620", { w: 2.4 }); // hair behind
  b += pa("M84 240 C92 200 120 186 150 186 C180 186 208 200 216 240 L216 260 L84 260 Z", "#4a2f25", { w: 2.4 }); // bob, back
  b += pa("M30 360 C34 296 66 260 112 248 L188 248 C234 260 266 296 270 360 Z", "#262d3a", { w: 3 }); // dark wool coat
  b += face({ cx: 150, cy: 158, w: 46, jaw: 0.72, skin: SK.fair[0], shade: SK.fair[1], mouth: "neutral", brow: 0.5, browW: 3.4, browC: "#2a1a14", iris: "#4a3a2a", lids: 0.4, lip: "#94604f" });
  b += pa("M108 262 L150 300 L192 262 L178 252 L150 280 L122 252 Z", "#323a4a", { w: 2.6 }) + pa("M150 300 V360", null, { w: 2.4 }) + [318, 344].map(y => ci(156, y, 4, "#151a22", { w: 1.6 })).join(""); // collar buttoned to the throat
  b += pa("M100 158 C96 108 120 74 150 72 C186 72 208 100 204 160 C204 186 200 214 196 236 C190 214 190 186 188 152 C178 132 160 116 138 108 C124 120 110 140 108 170 C108 196 108 220 104 236 C100 214 100 186 100 158 Z", "#4a2f25", { w: 2.6 });
  b += pa("M138 108 C150 124 172 136 188 152", null, { s: "#2a1a14", w: 1.6 }) + pa("M124 86 C140 78 168 78 186 92", null, { s: "#6e4a38", w: 2, op: 0.8 });
  b += "</g>";
  b += sh("M190 0 H300 V360 H190 Z", 0.18);
  return svg(300, 360, defs, b);
});

reg("portraits", "p-hanna", function () {
  P = "ph"; W = 2.6;
  const defs = pBg("#2b3a40", "#141d22");
  let b = pBack() + glow(70, 90, 120, 0.35);
  b += pa("M30 360 C36 294 68 260 112 248 L188 248 C232 260 264 294 270 360 Z", "#3a3a3f", { w: 3 }); // coat
  b += pa("M112 260 L150 312 L188 260 L176 254 L150 290 L124 254 Z", "#3d6e78", { w: 2.4 }) + pa("M150 312 V360", null, { s: "#2b5058", w: 2 }) + pa("M118 270 L136 360 M182 270 L164 360", null, { s: "#2b5058", w: 2 }); // physio tunic
  b += pa("M112 260 L96 360 M188 260 L204 360", null, { s: K.ink, w: 2.4 });
  b += "<g transform='translate(150 232) scale(1.08) translate(-150 -232)'>";
  b += pa("M186 96 C214 100 222 140 214 190 C210 220 200 240 190 250 C194 226 196 200 192 176 C190 150 186 126 180 110 Z", "#3e271e", { w: 2.4 }) + pa("M200 140 C206 170 204 200 196 230", null, { s: "#5e4030", w: 1.6 }); // ponytail
  b += face({ cx: 150, cy: 156, w: 44, jaw: 0.7, chin: 76, skin: SK.fair[0], shade: SK.fair[1], mouth: "down", brow: -2.4, browUp: 2, browW: 3.4, browC: "#3a2418", iris: "#4a3a2a", lids: 0.2, lip: "#94604f" });
  b += pa("M104 150 C98 96 124 70 152 70 C186 70 206 98 200 150 C196 128 186 112 170 104 C150 112 124 116 108 126 Z", "#4e3226", { w: 2.6 }) + pa("M120 100 C138 92 160 94 178 104", null, { s: "#2e1d16", w: 1.4 }); // hair pulled back
  b += pa("M118 92 C138 82 166 82 184 96", null, { s: "#7a5440", w: 2, op: 0.8 });
  b += "</g>";
  // phone held close, screen down, thumb on the edge
  b += pa("M70 360 C70 330 82 306 100 300 L118 304 L120 360 Z", SK.fair[0], { w: 2.6 }) + re(94, 286, 30, 52, "#15191c", { w: 2.4, rx: 4, tf: "rotate(-12 109 312)" }) + pa("M98 300 q10 -6 16 2", SK.fair[0], { w: 2 }) + li(100, 296, 118, 292, "#4d5960", 1.2);
  b += sh("M196 0 H300 V360 H196 Z", 0.2);
  return svg(300, 360, defs, b);
});

reg("portraits", "p-dolores", function () {
  P = "pd"; W = 2.6;
  const defs = pBg("#2e353a", "#171c20");
  let b = pBack() + re(220, 0, 80, 360, "#3a3029", { s: null, op: 0.6 }) + li(222, 0, 222, 360, K.ink, 3); // doorframe behind
  b += pa("M26 360 C30 294 64 260 110 248 L190 248 C236 260 270 294 274 360 Z", "#5b4a3e", { w: 3 }); // cardigan
  b += pa("M122 262 L150 300 L178 262", "#d0cbbd", { w: 2.4 }) + pa("M150 300 C146 320 146 340 150 360", null, { w: 2.4 });
  b += [312, 334].map((y, i) => ci(144, y + i * 4, 3.4, "#2a221c", { w: 1.2 }) + ci(160, y - 6 + i * 4, 3.4, "#2a221c", { w: 1.2 })).join("") + pa("M156 306 l-6 6 l10 22", null, { w: 1.6 }); // buttoned wrong
  b += "<g transform='translate(150 230) scale(1.08) translate(-150 -230)'>";
  b += face({ cx: 150, cy: 154, w: 45, jaw: 0.74, chin: 76, skin: SK.pale[0], shade: SK.pale[1], mouth: "wry", brow: 0.8, browW: 3, browC: "#bdb8ae", age: 3, lids: 0.5, iris: "#5a6a6a", lip: "#8a5a50" });
  b += pa("M100 150 C88 146 86 128 96 120 C88 106 98 90 110 90 C110 74 128 64 142 70 C150 58 172 60 178 72 C192 68 206 82 202 96 C214 102 214 120 206 128 C214 138 210 152 200 154 C200 136 196 120 186 110 C168 102 134 102 116 112 C106 122 102 136 100 150 Z", "#d9d6cc", { w: 2.6 }) +
    pa("M104 118 q8 -6 16 -2 M118 92 q10 -6 18 0 M150 78 q12 -6 22 2 M182 92 q10 0 14 10 M192 122 q6 4 6 12", null, { s: "#9d998f", w: 1.6 }); // white curls
  b += g({}, el(128, 96, 16, 9, null, { s: "#5f4a2c", w: 3 }), el(172, 96, 16, 9, null, { s: "#5f4a2c", w: 3 }), li(144, 96, 156, 96, "#5f4a2c", 3), el(128, 96, 14, 7, "#cfe0e0", { s: null, op: 0.25 }), el(172, 96, 14, 7, "#cfe0e0", { s: null, op: 0.25 })); // reading glasses up in the hair
  b += "</g>";
  // arms folded across the cardigan
  b += pa("M44 360 C60 330 100 312 150 314 C190 316 224 326 246 340 L240 360 Z", "#5f4e41", { w: 3 }); // lower arm
  b += pa("M70 350 C100 328 150 322 200 326 C220 328 240 332 256 340 L262 360 L64 360 Z", "#6a5748", { w: 3 }) + pa("M90 346 C130 334 180 332 236 342", null, { s: "#4a3c31", w: 2 }); // upper arm
  b += pa("M58 344 C70 334 86 330 100 334 C96 344 84 350 66 352 Z", SK.pale[0], { w: 2.4 }) + pa("M72 336 l2 12 M82 334 l2 12", null, { s: SK.pale[1], w: 1.4 }); // hand tucked
  b += pa("M226 330 C238 322 254 322 264 330 C258 340 244 344 230 342 Z", SK.pale[0], { w: 2.4 }) + pa("M238 326 l3 10 M248 324 l2 10", null, { s: SK.pale[1], w: 1.4 });
  b += sh("M196 0 H300 V360 H196 Z", 0.18);
  return svg(300, 360, defs, b);
});

reg("portraits", "p-marcus", function () {
  P = "pm"; W = 2.6;
  const defs = pBg("#33302c", "#16130f");
  let b = pBack() + glow(250, 60, 140, 0.4) + li(0, 300, 300, 286, "#5b6b75", 6);
  b += pa("M0 360 C4 284 50 252 104 246 L196 246 C250 252 296 284 300 360 Z", "#2c3034", { w: 3 }); // big shoulders, dark tee
  b += pa("M86 254 L104 360 M214 254 L196 360", null, { s: "#c9c3b0", w: 7 }) + pa("M86 254 L104 360 M214 254 L196 360", null, { s: K.ink, w: 1.6, op: 0.5 }); // apron straps
  b += pa("M104 330 H196 V360 H104 Z", "#c9c3b0", { w: 2.4 }) + pa("M104 340 H196", null, { s: "#8a8473", w: 3 }); // apron tied twice round
  b += "<g transform='translate(150 230) scale(1.08) translate(-150 -230)'>";
  b += face({ cx: 150, cy: 150, w: 54, jaw: 0.92, chin: 80, neck: 34, skin: SK.ruddy[0], shade: SK.ruddy[1], mouth: "tight", brow: 1.6, browW: 5.4, browC: "#1d1611", red: true, lids: 0.55, stubble: "#3a2a22", iris: "#3a3128", lip: "#7a4a40" });
  b += pa("M98 120 C92 82 120 62 152 62 C186 62 210 82 204 122 C196 102 184 92 168 90 C150 96 124 96 108 100 Z", "#251a14", { w: 2.6 }) + pa("M114 84 l6 8 M134 76 l4 9 M156 74 l2 10 M178 78 l-2 10", null, { s: "#4a3a2e", w: 1.6 }); // close-cropped
  // forearm wiping: burn scars catching the light
  b += "</g>";
  b += pa("M180 360 C190 330 214 312 250 306 L290 304 L300 340 L300 360 Z", SK.ruddy[0], { w: 2.6 }) + pa("M226 318 q10 -4 18 2 q-6 8 -16 4 Z M258 314 q8 -2 12 4 q-6 4 -12 0 Z", "#c99a86", { w: 1.2 }) + pa("M230 340 q12 -6 24 -2", null, { s: SK.ruddy[1], w: 2 });
  b += pa("M248 300 L300 296 L300 326 L252 330 Z", "#d8d2c0", { w: 2.4 }); // cloth
  b += sh("M200 0 H300 V300 H200 Z", 0.2);
  return svg(300, 360, defs, b);
});

reg("portraits", "p-petra", function () {
  P = "pp"; W = 2.6;
  const defs = pBg("#26323a", "#121a1f");
  let b = pBack() + [40, 80, 120].map(x => li(x, 0, x, 360, "#1d2830", 6)).join("");
  b += pa("M28 360 C34 294 68 260 112 248 L188 248 C232 260 266 294 272 360 Z", "#2a3446", { w: 3 }); // navy gansey
  for (let y = 276; y < 360; y += 10) b += pa("M50 " + y + " q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0", null, { s: "#1e2636", w: 1.6, op: 0.8 });
  b += pa("M118 258 C130 272 170 272 182 258 L184 270 C170 286 130 286 116 270 Z", "#2a3446", { w: 2.4 });
  b += "<g transform='translate(150 230) scale(1.08) translate(-150 -230)'>";
  b += face({ cx: 150, cy: 154, w: 45, jaw: 0.8, chin: 76, skin: SK.weathered[0], shade: SK.weathered[1], mouth: "tight", brow: 1.2, browW: 3.4, browC: "#5a4a38", age: 2, lids: 0.6, iris: "#4a5a5e", lip: "#7a4c40" });
  b += pa("M102 156 C94 104 118 70 150 70 C186 70 210 102 200 158 C198 132 188 112 172 104 C150 100 128 104 114 116 C106 128 104 142 102 156 Z", "#9a8a6c", { w: 2.6 }) + pa("M114 92 C130 80 160 78 186 92 M110 120 q4 -14 14 -20", null, { s: "#c9b98e", w: 1.6 }) + pa("M196 130 C212 140 214 170 206 190", "#9a8a6c", { w: 2.2 });
  b += pa("M118 124 l12 -2 M170 122 l12 2", null, { s: SK.weathered[1], w: 1.3, op: 0.7 }); // frown lines
  b += "</g>";
  // mug of tea held in both hands
  b += re(124, 292, 52, 60, "#4d7a76", { w: 2.6 }) + el(150, 292, 26, 6, "#3a2c20", { w: 2.4 }) + pa("M176 304 q16 4 0 30", null, { w: 4 });
  b += pa("M86 360 C90 330 104 312 128 306 C134 320 132 340 126 360 Z", SK.weathered[0], { w: 2.6 }) + pa("M214 360 C210 330 196 312 172 306 C166 320 168 340 174 360 Z", SK.weathered[0], { w: 2.6 });
  b += pa("M120 316 h12 M120 326 h12 M168 316 h12 M168 326 h12", null, { s: SK.weathered[1], w: 1.6 });
  b += sh("M196 0 H300 V360 H196 Z", 0.2);
  return svg(300, 360, defs, b);
});

reg("portraits", "p-whitlock", function () {
  P = "pw"; W = 2.6;
  const defs = pBg("#34404a", "#1a2229");
  let b = pBack() + glow(80, 80, 160, 0.4) + re(210, 40, 70, 90, "#2a333b", { w: 2, op: 0.7 }) + re(216, 46, 58, 78, "#4f7581", { s: null, op: 0.5 }); // a framed yacht print behind
  b += pa("M22 360 C28 292 64 258 112 246 L188 246 C236 258 272 292 278 360 Z", "#2a2f38", { w: 3 }); // good charcoal suit
  b += pa("M120 258 L150 330 L180 258 Z", "#e0dccf", { w: 2.4 }) + pa("M144 270 L156 270 L160 340 L150 352 L140 340 Z", "#38475e", { w: 2.2 }) + pa("M144 270 L150 280 L156 270", "#2f3c50", { w: 1.6 }); // shirt and tie
  b += pa("M112 256 L150 340 L128 360 L100 300 Z M188 256 L150 340 L172 360 L200 300 Z", "#323844", { w: 2.4 }); // lapels
  b += pa("M222 306 C238 296 254 290 262 292 L272 320 C262 320 246 326 232 336 Z", "#0d0f12", { w: 2.4 }) + pa("M228 318 C242 308 256 304 266 304", null, { s: "#2a2e34", w: 1.4 }); // black armband on his sleeve
  b += "<g transform='translate(150 228) scale(1.08) translate(-150 -228)'>";
  b += face({ cx: 150, cy: 150, w: 47, jaw: 0.78, chin: 78, skin: SK.warm[0], shade: SK.warm[1], mouth: "smile", brow: -0.6, browUp: 1, browW: 3.4, browC: "#9a958c", age: 2, lids: 0.35, iris: "#4a5a66", lip: "#8a5a4e" });
  b += pa("M103 146 C96 104 114 70 150 66 C188 64 206 92 199 144 C197 128 194 116 189 108 C180 112 168 112 158 106 C146 100 132 96 124 88 C120 104 112 116 108 128 C106 134 104 140 103 146 Z", "#c4c3bd", { w: 2.6 }) +
    pa("M124 88 C140 100 160 106 186 104 M130 80 C150 84 170 86 192 96 M140 72 C160 74 180 80 196 92", null, { s: "#8f8d86", w: 1.5 }) + pa("M124 88 L118 74", null, { s: "#6f6d66", w: 1.6 }) + pa("M110 108 q4 -16 12 -26", null, { s: "#eceae2", w: 2, op: 0.7 }); // silver hair, side parting
  b += "</g>";
  // forearms resting on the immaculate desk, hands open
  b += po("0,330 300,330 300,360 0,360", "#3a2c22", { w: 3 }) + li(0, 330, 300, 330, "#5a4634", 2);
  b += pa("M40 334 C60 316 96 310 120 318 L124 334 Z", "#2a2f38", { w: 2.4 }) + pa("M260 334 C240 316 204 310 180 318 L176 334 Z", "#2a2f38", { w: 2.4 });
  b += pa("M118 320 C128 312 146 314 150 324 C146 332 132 336 120 334 Z", SK.warm[0], { w: 2.2 }) + pa("M182 320 C172 312 154 314 150 324 C154 332 168 336 180 334 Z", SK.warm[1], { w: 2.2 }) +
    pa("M128 318 l8 6 M140 316 l6 8 M172 318 l-8 6 M160 316 l-6 8", null, { s: SK.warm[1], w: 1.2 }) + re(112, 318, 8, 6, "#c9c3b0", { w: 1 }) + re(180, 318, 8, 6, "#c9c3b0", { w: 1 });
  b += sh("M196 0 H300 V250 H196 Z", 0.15);
  return svg(300, 360, defs, b);
});

reg("portraits", "p-nico", function () {
  P = "pn"; W = 2.6;
  const defs = pBg("#2c3a42", "#151d22");
  let b = pBack() + re(0, 40, 90, 140, "#9fc4c8", { s: null, op: 0.08 }) + li(90, 40, 90, 180, "#0d1215", 3); // glass office over his shoulder
  b += pa("M44 360 C50 296 80 262 122 252 L186 252 C226 262 252 296 258 360 Z", "#6d7e8a", { w: 3 }); // shirt, sleeves rolled
  b += pa("M124 266 L150 296 L176 266", "#5d6e7a", { w: 2.4 }) + pa("M150 296 V360", null, { w: 2 }) + ci(150, 316, 2.6, "#e0dccf", { w: 1 }) + ci(150, 340, 2.6, "#e0dccf", { w: 1 });
  b += pa("M128 268 L120 360 M132 268 L128 360", null, { s: K.a2, w: 2.4 }) + re(110, 330, 22, 28, "#d8d2c0", { w: 1.6 }); // lanyard and pass
  b += "<g transform='translate(154 232) scale(1.08) translate(-154 -232)'>";
  b += face({ cx: 154, cy: 156, w: 40, jaw: 0.66, chin: 76, neck: 18, skin: SK.olive[0], shade: SK.olive[1], mouth: "tight", brow: -1.4, browW: 3.4, browC: "#1d1611", look: -5.5, lids: 0.3, stubble: "#2a2018", iris: "#3a3128", lip: "#7a4c40" });
  b += pa("M112 144 C104 96 126 70 158 70 C190 70 206 100 196 146 C194 124 184 108 170 102 C162 112 150 108 140 102 C130 112 120 120 114 140 Z", "#1d1611", { w: 2.6 }) + pa("M132 80 l-10 -8 M152 74 l2 -10 M176 80 l10 -8 M146 102 l-4 10", null, { s: "#1d1611", w: 3 }); // untidy dark hair
  b += "</g>";
  b += pa("M160 268 C180 266 196 278 200 300 L190 300 C186 288 176 280 162 280 Z", "#4a5a66", { w: 2 }); // bag strap
  b += sh("M196 0 H300 V360 H196 Z", 0.2);
  return svg(300, 360, defs, b);
});


/* ============================================================ INTRO */
// Julian and Lena heads, reused at any size via a transform (drawn in a 300x360 portrait frame)
function julianHead() {
  return face({ cx: 150, cy: 150, w: 47, jaw: 0.84, chin: 78, skin: SK.warm[0], shade: SK.warm[1], mouth: "wry", brow: 0.6, browW: 4, browC: "#1d1611", lids: 0.45, stubble: "#3a2c22", iris: "#5a6a6a", lip: "#7a4c40", age: 1 }) +
    pa("M100 140 C92 92 120 64 154 64 C190 64 212 92 202 142 C198 118 190 102 172 96 C160 104 136 104 118 98 C108 110 102 124 100 140 Z", "#1f1915", { w: 2.6 }) +
    pa("M101 136 C100 124 102 114 106 106 L110 132 Z M201 138 C202 124 200 114 196 106 L192 132 Z", "#8f8d86", { s: null }) + pa("M126 80 C146 70 172 72 190 86", null, { s: "#4a3c32", w: 1.8 });
}
function lenaHead() {
  return face({ cx: 150, cy: 152, w: 43, jaw: 0.7, chin: 76, skin: SK.olive[0], shade: SK.olive[1], mouth: "tight", brow: 1.2, browW: 3.6, browC: "#140f0c", lids: 0.4, iris: "#3a2a20", lip: "#7a4a40" }) +
    pa("M106 146 C98 96 124 70 152 70 C184 70 206 96 198 146 C194 120 186 104 166 98 C146 100 124 108 110 124 Z", "#15100d", { w: 2.6 }) +
    pa("M180 86 C206 84 214 104 204 116 C196 124 188 116 190 104", "#15100d", { w: 2.4 }) + pa("M120 96 C134 86 160 82 182 90", null, { s: "#3e3029", w: 1.6 });
}

reg("intro", "intro-1", function () {
  P = "i1"; W = 3; seed = 101;
  const defs = lg("sky", 0, 0, 0, 1, [[0, "#0f1a22"], [0.6, "#1f3440"], [1, "#2b4450"]]);
  let b = re(0, 0, 1000, 600, u("sky"), { s: null });
  // the harbour and the city beyond, in fog
  b += pa("M0 300 L60 280 L60 230 L110 230 L110 270 L170 250 L200 180 L230 250 L300 240 L320 200 L360 200 L360 250 L440 240 L470 150 L480 150 L490 240 L560 250 L600 220 L660 230 L700 190 L760 220 L820 210 L860 240 L940 230 L1000 250 V340 H0 Z", "#16242d", { w: 2 });
  [[80, 250], [130, 262], [215, 230], [330, 225], [470, 200], [610, 236], [720, 214], [870, 236], [950, 244]].forEach(p => { b += re(p[0], p[1], 6, 8, K.a3, { s: null, op: 0.8 }) + glow(p[0] + 3, p[1] + 4, 20, 0.5); });
  b += pa("M780 210 l0 -70 l60 0 M780 140 l-20 0 M832 140 l0 20", null, { s: "#16242d", w: 5 }); // crane
  b += re(0, 320, 1000, 120, "#0e1a21", { s: null }) + [340, 360, 384, 410].map((y, i) => pa("M" + (i * 40) + " " + y + " q30 -5 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0", null, { s: K.t2, w: 1.4, op: 0.5 })).join("");
  b += re(900, 210, 10, 60, K.paper, { w: 2 }) + glow(905, 210, 60, 0.7) + pa("M905 212 L640 160 L640 240 Z", K.a4, { s: null, op: 0.06 }); // Halden Light
  b += fog(500, 300, 520, 70, 0.35) + fog(300, 340, 300, 40, 0.25);
  // Old Town walls either side of the stairs
  b += pa("M0 160 L180 200 L330 600 L0 600 Z", "#121b21", { w: 3 }) + pa("M1000 140 L780 200 L640 600 L1000 600 Z", "#0f171c", { w: 3 });
  for (let i = 0; i < 6; i++) b += re(40 + i * 18, 250 + i * 50, 30, 40, i % 2 ? "#0a0f13" : "#2a2214", { w: 2 });
  b += re(860, 300, 40, 60, K.a1, { w: 2 }) + glow(880, 330, 60, 0.5) + re(820, 420, 36, 54, "#0a0f13", { w: 2 });
  // the stairs dropping away, wet and shining
  for (let i = 0; i < 14; i++) {
    const t = i / 14, t2 = (i + 1) / 14;
    const y1 = 600 - t * 360, y2 = 600 - t2 * 360, xl1 = 330 - t * 150, xr1 = 640 + t * 140, xl2 = 330 - t2 * 150, xr2 = 640 + t2 * 140;
    const L1 = 330 - (1 - t) * 0 - t * 0, h = (y1 - y2);
    const yl = 600 - Math.pow(t, 0.75) * 380, yl2 = 600 - Math.pow(t2, 0.75) * 380;
    const wl = 310 * (1 - Math.pow(t, 0.75) * 0.72), wl2 = 310 * (1 - Math.pow(t2, 0.75) * 0.72);
    b += po([500 - wl / 2, yl, 500 + wl / 2, yl, 500 + wl2 / 2, yl2 + (yl - yl2) * 0.35, 500 - wl2 / 2, yl2 + (yl - yl2) * 0.35].map(v => v.toFixed(1)).join(" "), "#3a4950", { w: 2 });
    b += po([500 - wl2 / 2, yl2 + (yl - yl2) * 0.35, 500 + wl2 / 2, yl2 + (yl - yl2) * 0.35, 500 + wl2 / 2, yl2, 500 - wl2 / 2, yl2].map(v => v.toFixed(1)).join(" "), "#1f292e", { w: 1.6 });
    b += pa("M" + (500 - wl * 0.3).toFixed(0) + " " + (yl - 4).toFixed(0) + " h" + (wl * 0.25).toFixed(0), null, { s: K.a4, w: 2, op: 0.45 - t * 0.25 });
  }
  // lamp at the top of the stairs
  b += li(700, 600, 700, 120, K.ink, 8) + li(700, 122, 650, 122, K.ink, 6) + pa("M632 120 h36 l-6 14 h-24 Z", K.a3, { w: 2.5 }) + glow(650, 136, 260, 0.85) + glow(650, 132, 50, 1);
  b += el(520, 560, 120, 18, K.a3, { s: null, op: 0.15 }) + el(520, 560, 60, 8, K.a4, { s: null, op: 0.25 }); // puddle reflection
  b += fog(500, 470, 260, 90, 0.18) + sh("M0 0 H1000 V80 H0 Z", 0.3);
  return svg(1000, 600, defs, b);
});

reg("intro", "intro-2", function () {
  P = "i2"; W = 3; seed = 102;
  const defs = lg("sky", 0, 0, 0, 1, [[0, "#13202a"], [1, "#24363f"]]);
  let b = re(0, 0, 1000, 600, u("sky"), { s: null });
  b += pa("M0 220 L120 200 L160 120 L240 130 L260 200 L1000 190 V600 H0 Z", "#151f26", { w: 3 });
  b += pa("M0 380 H1000 V600 H0 Z", "#2a343a", { w: 3 }); // Saltmarket Lane
  for (let x = 0; x < 1000; x += 46) b += li(x, 380, x - 80, 600, "#20292e", 1.6);
  // the top of the stairs on the right, falling away into darkness
  b += po("640,380 900,380 1000,450 1000,600 560,600", "#0b1014", { w: 3 });
  for (let i = 0; i < 6; i++) b += pa("M" + (650 + i * 14) + " " + (400 + i * 34) + " L" + (900 + i * 22) + " " + (400 + i * 34), null, { s: "#3a464c", w: 3, op: 1 - i * 0.15 });
  b += el(860, 590, 30, 6, "#1a1e24", { s: null, op: 0.9 }); // far below, a dark shape on the landing
  b += pa("M640 380 L560 600", null, { s: "#4f5c63", w: 8 }) + pa("M900 380 L1000 450", null, { s: "#4f5c63", w: 8 });
  // the late shop light and the lamp
  b += re(60, 230, 180, 150, "#26323a", { w: 3 }) + re(80, 300, 140, 80, "#3a2c16", { w: 2 }) + glow(150, 340, 140, 0.8);
  b += li(560, 380, 560, 80, K.ink, 7) + li(560, 82, 600, 82, K.ink, 5) + pa("M590 80 h28 l-5 12 h-18 Z", K.a3, { w: 2 }) + glow(604, 100, 240, 0.85);
  // the sweeper's cart
  b += re(250, 310, 120, 66, "#4d6a5a", { w: 3 }) + ci(270, 382, 14, "#1a1f23", { w: 3 }) + ci(350, 382, 14, "#1a1f23", { w: 3 }) + li(370, 320, 420, 270, K.ink, 5) + li(300, 310, 290, 220, "#6a5a3a", 5) + pa("M280 220 h20 l6 -40 h-32 Z", "#3a3022", { w: 2.4 });
  b += re(250, 336, 120, 8, K.a4, { s: null, op: 0.6 });
  // the sweeper: cap off and held to his chest, phone at his ear, looking down the stairs
  b += g({},
    pa("M470 380 L476 300 L520 300 L526 380 Z", "#1c242a", { w: 3 }), // legs
    pa("M454 306 C452 250 470 214 498 210 C530 214 548 250 544 306 Z", "#4a5a4c", { w: 3 }), // jacket
    pa("M456 270 H542 M458 290 H540", null, { s: K.a4, w: 5 }), // reflective bands
    el(500, 184, 24, 28, SK.ruddy[0], { w: 3 }), pa("M500 156 C520 156 528 172 524 186 L512 180 Z", SK.ruddy[1], { s: null }),
    pa("M478 176 C478 156 494 150 506 152 C520 154 526 164 524 178 C516 166 500 162 478 176 Z", "#8e8a80", { w: 2.4 }), // grey hair
    pa("M524 176 C540 180 548 196 546 214 L532 216 C532 204 528 194 520 190 Z", SK.ruddy[0], { w: 2.6 }), re(522, 168, 10, 20, K.ink, { w: 1.5, rx: 2 }), // arm up, phone
    pa("M462 246 C474 240 490 244 496 254 C488 262 472 264 462 258 Z", "#2a3c48", { w: 2.4 }), pa("M470 252 C480 258 496 260 506 256", null, { s: "#1c2a33", w: 3 }), // cap held to chest
    glow(500, 250, 120, 0.3));
  b += rain(0.06) + fog(780, 520, 240, 80, 0.2);
  return svg(1000, 600, defs, b);
});

reg("intro", "intro-3", function () {
  P = "i3"; W = 3; seed = 103;
  const defs = "<radialGradient id='" + id("spot") + "' cx='0.5' cy='0' r='1'><stop offset='0' stop-color='" + K.a5 + "' stop-opacity='.55'/><stop offset='1' stop-color='" + K.a3 + "' stop-opacity='0'/></radialGradient>";
  let b = re(0, 0, 1000, 600, "#07090c", { s: null });
  // stage, curtain, the show's light rig
  b += pa("M0 0 H1000 V60 C900 90 820 60 760 90 C700 60 600 90 500 70 C400 90 300 60 240 90 C180 60 100 90 0 60 Z", "#1c1414", { w: 3 });
  for (let x = 40; x < 1000; x += 80) b += ci(x, 30, 8, "#2a2d30", { w: 2 }) + glow(x, 36, 26, 0.4);
  b += po("400,0 600,0 760,470 240,470", u("spot"), { s: null });
  b += el(500, 470, 270, 34, K.a4, { s: null, op: 0.18 }) + pa("M0 430 H1000 V600 H0 Z", "#0f1013", { s: null }) + pa("M0 430 H1000", null, { s: "#3a2e22", w: 4 });
  // Julian on stage, three-quarter back view, one hand reaching towards the audience
  b += g({},
    pa("M462 470 L470 370 L534 370 L540 470 Z", "#121418", { w: 3 }), // trousers
    pa("M444 380 C440 300 460 250 500 246 C540 250 562 300 556 380 Z", "#181b22", { w: 3 }), // jacket
    pa("M552 290 C590 300 640 320 690 338 L686 352 C640 340 590 326 546 316 Z", "#181b22", { w: 3 }), pa("M686 336 C700 334 712 340 714 348 C706 354 694 356 686 352 Z", SK.warm[0], { w: 2.4 }), // reaching arm
    el(500, 218, 26, 30, SK.warm[1], { w: 3 }), pa("M474 214 C470 188 488 176 504 178 C522 180 530 196 526 214 C516 200 494 198 474 214 Z", "#1f1915", { w: 2.4 }),
    pa("M524 222 C530 230 528 244 520 250", null, { s: "#c8c2b0", w: 1.4, op: 0.9 }), ci(523, 220, 3, "#d8d2c0", { w: 1.2 }), // the earpiece: someone was feeding him
    pa("M520 250 C516 270 506 290 504 320", null, { s: "#c8c2b0", w: 1, op: 0.5 }),
    pa("M456 300 C460 280 470 266 486 260", null, { s: "#5a4a3a", w: 2, op: 0.6 }));
  // the audience in silhouette; one woman picked out by a second, smaller light
  for (let r = 0; r < 3; r++) for (let c = 0; c < 14; c++) {
    const x = 20 + c * 74 + (r % 2) * 36, y = 520 + r * 36;
    if (r === 0 && c === 11) continue;
    b += el(x, y, 18, 22, "#050608", { s: "#1b1d20", w: 2 }) + pa("M" + (x - 32) + " " + (y + 60) + " C" + (x - 30) + " " + (y + 20) + " " + (x + 30) + " " + (y + 20) + " " + (x + 32) + " " + (y + 60) + " Z", "#050608", { s: "#1b1d20", w: 2 });
  }
  b += po("830,0 880,0 870,540 790,540", K.a4, { s: null, op: 0.08 }) + el(834, 512, 20, 24, "#4a3a30", { w: 2.4 }) + pa("M812 504 C812 482 856 482 856 504 L860 530 L808 530 Z", "#6a4a38", { w: 2 }) + pa("M800 570 C802 534 866 534 868 570 Z", "#3a3040", { w: 2.4 }) + glow(834, 520, 70, 0.5);
  // studio camera with its red tally light
  b += g({}, re(70, 300, 130, 70, "#25292e", { w: 3 }), re(200, 316, 40, 38, "#1a1d21", { w: 3 }), ci(240, 335, 16, "#0d0f12", { w: 3 }), li(130, 370, 100, 470, K.ink, 6), li(130, 370, 160, 470, K.ink, 6), ci(88, 312, 5, K.red, { s: null }), glow(88, 312, 26, 0.6), tx(96, 352, "LIVE", { "font-size": 14, fill: K.red, "font-family": "Arial, sans-serif", "letter-spacing": 2 }));
  return svg(1000, 600, defs, b);
});

reg("intro", "intro-4", function () {
  P = "i4"; W = 3; seed = 104;
  const defs = lg("wall", 0, 0, 0, 1, [[0, "#22303a"], [1, "#18222a"]]) + lg("win", 0, 0, 0, 1, [[0, "#2a4450"], [1, "#132028"]]) + clip("wc", re(640, 50, 320, 300, "#000", { s: null }));
  let b = re(0, 0, 1000, 600, u("wall"), { s: null });
  b += re(632, 42, 336, 316, "#121a20", { w: 4 }) + re(640, 50, 320, 300, u("win"), { s: null });
  b += g({ "clip-path": u("wc") }, pa("M640 260 L700 230 L740 250 L800 200 L860 230 L960 210 V350 H640 Z", "#101a20", { s: null }), [690, 760, 830, 900].map((x, i) => re(x, 262 + (i % 2) * 14, 6, 8, K.a3, { s: null })).join(""), rain(0.9));
  b += li(800, 50, 800, 350, "#121a20", 5) + li(640, 200, 960, 200, "#121a20", 5);
  b += re(0, 420, 1000, 180, "#1a2229", { s: null }) + pa("M0 420 H1000", null, { w: 3 });
  // Julian's bare desk
  b += po("140,430 640,430 690,500 90,500", "#4a3a2c", { w: 3.5 }) + re(90, 500, 600, 20, K.woodD, { w: 3.5 }) + re(110, 520, 26, 80, K.woodD, { w: 3 }) + re(644, 520, 26, 80, K.woodD, { w: 3 });
  b += pa("M560 452 L586 452 L582 480 L564 480 Z", "#5a4a3a", { w: 2.5 }) + pa("M573 452 q-4 -22 -18 -30 M573 452 q2 -26 14 -36", null, { s: "#6d5f3c", w: 2.2 }); // dead plant
  // Julian, seated, visitor's badge on his lapel
  b += pa("M200 430 C196 352 236 312 300 306 C364 312 404 352 400 430 Z", "#22262e", { w: 3 }); // jacket
  b += pa("M270 310 L300 380 L330 310 Z", "#c9c3b0", { w: 2.4 });
  b += re(338, 344, 30, 40, "#e0dccf", { w: 2 }) + re(338, 344, 30, 10, K.a2, { s: null }) + li(353, 344, 353, 330, K.a2, 2) + tx(353, 376, "VISITOR", { "font-size": 6, "text-anchor": "middle", fill: K.ink, "font-family": "Arial, sans-serif" });
  b += pa("M230 430 C240 410 270 404 300 410 L300 436 Z M370 430 C360 410 330 404 300 410 L300 436 Z", "#22262e", { w: 2.6 }) + el(280, 436, 26, 10, SK.warm[0], { w: 2.4 }) + el(322, 436, 26, 10, SK.warm[1], { w: 2.4 }); // hands on the desk
  b += g({ transform: "translate(300 246) scale(0.62) translate(-150 -152)" }, julianHead());
  // Lena, standing, arms folded, did not ask for him
  b += pa("M640 600 L652 470 L740 470 L752 600 Z", "#1c1f26", { w: 3 });
  b += pa("M620 480 C612 380 640 300 696 292 C752 300 780 380 772 480 Z", "#2c3542", { w: 3 }); // blazer
  b += pa("M672 296 L696 360 L720 296 Z", "#cfc8b4", { w: 2.4 });
  b += pa("M630 400 C660 380 730 380 764 400 C740 420 660 424 630 400 Z", "#2c3542", { w: 3 }) + pa("M636 404 C670 396 720 396 758 404", null, { s: "#1e2530", w: 2 }) +
    el(744, 398, 14, 8, SK.olive[0], { w: 2 }) + el(648, 402, 14, 8, SK.olive[1], { w: 2 }); // folded arms
  b += re(678, 452, 22, 16, K.a2, { w: 2 }) + li(640, 460, 760, 460, K.ink, 4); // badge on her belt
  b += g({ transform: "translate(696 222) scale(0.8) translate(-150 -154)" }, lenaHead());
  b += pa("M640 50 L960 50 L1000 600 L560 600 Z", K.t4, { s: null, op: 0.04 }) + hat("M780 290 L1000 290 L1000 600 L800 600 Z", 0.2);
  return svg(1000, 600, defs, b);
});

reg("intro", "intro-5", function () {
  P = "i5"; W = 3; seed = 105;
  let b = re(0, 0, 1000, 600, "#2a2119", { s: null });
  for (let y = 0; y < 600; y += 60) b += li(0, y + rr(-6, 6), 1000, y + rr(-6, 6), "#221a14", 3); // desk grain
  b += glow(520, 300, 420, 0.5);
  // the wall clock, from above the desk
  b += ci(860, 110, 70, "#d6d0bf", { w: 5 }) + ci(860, 110, 60, null, { s: "#7d7768", w: 1.5 });
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; b += li(860 + 52 * Math.sin(a), 110 - 52 * Math.cos(a), 860 + 58 * Math.sin(a), 110 - 58 * Math.cos(a), K.ink, i % 3 ? 2 : 4); }
  const hA = (6 + 40 / 60) * Math.PI / 6, mA = 40 * Math.PI / 30;
  b += li(860, 110, 860 + 30 * Math.sin(hA), 110 - 30 * Math.cos(hA), K.ink, 6) + li(860, 110, 860 + 48 * Math.sin(mA), 110 - 48 * Math.cos(mA), K.ink, 4) + ci(860, 110, 5, K.red, { w: 1.5 });
  // the thin file landing, Lena's hand letting go
  b += g({ transform: "rotate(-6 500 330)" }, re(330, 210, 340, 240, "#c49a52", { w: 4 }), re(330, 200, 120, 18, "#b48a45", { w: 3 }), re(356, 236, 290, 190, K.paperL, { w: 2, op: 0.3 }),
    tx(380, 270, "MC-26-0412", { "font-size": 26, fill: K.redD, "font-family": "'Courier New', monospace", "letter-spacing": 2 }),
    re(370, 290, 120, 6, "#7a5a2a", { s: null, op: 0.6 }), re(370, 304, 90, 6, "#7a5a2a", { s: null, op: 0.6 }), re(560, 230, 80, 100, "#2a2a2a", { w: 2, op: 0.15 }));
  b += pa("M300 200 l-30 -20 M310 240 l-40 -8 M690 220 l40 -14", null, { s: K.paperL, w: 3, op: 0.35 }); // motion
  b += pa("M560 0 C560 60 580 110 600 140 L700 170 C720 130 720 60 700 0 Z", "#2c3542", { w: 3 }) + pa("M596 140 C590 170 610 200 640 206 C666 210 690 196 700 170 C680 160 640 150 596 140 Z", SK.olive[0], { w: 3 }) +
    pa("M620 196 l-6 22 M640 204 l-2 24 M660 202 l2 22", null, { w: 3 }) + pa("M640 160 C656 166 676 168 690 166", null, { s: SK.olive[1], w: 2 });
  // Julian's coffee and his hands, waiting
  b += el(180, 470, 60, 60, "#e0dccf", { w: 4 }) + el(180, 470, 46, 46, "#2a1a10", { s: null }) + el(166, 456, 12, 6, "#5a3a20", { s: null, op: 0.8 }) + pa("M236 470 q30 0 26 -26", null, { w: 6 });
  b += pa("M380 600 C380 560 400 530 440 520 L520 540 L520 600 Z", SK.warm[0], { w: 3 }) + pa("M440 520 l10 30 M470 526 l6 28", null, { s: SK.warm[1], w: 2 }) + pa("M380 600 C376 586 372 600 372 600", "#22262e", { w: 3 });
  b += sh("M0 0 H1000 V600 H0 Z", 0.0);
  return svg(1000, 600, "", b);
});

reg("intro", "intro-twist", function () {
  P = "it"; W = 3; seed = 106;
  const defs = lg("wall", 0, 0, 0, 1, [[0, "#1d2a33"], [1, "#141d23"]]) + lg("win", 0, 0, 0, 1, [[0, "#3a5560"], [1, "#1e3038"]]) + clip("wc", re(48, 60, 200, 300, "#000", { s: null }));
  let b = re(0, 0, 1000, 600, u("wall"), { s: null });
  // window: the rain has stopped, last drops on the glass
  b += re(40, 52, 216, 316, "#121a20", { w: 4 }) + re(48, 60, 200, 300, u("win"), { s: null });
  b += g({ "clip-path": u("wc") }, pa("M48 260 L90 240 L130 250 L170 220 L248 236 V360 H48 Z", "#16242c", { s: null }), [[70, 120], [110, 180], [160, 100], [200, 160], [90, 300], [220, 280], [140, 320]].map(p => ci(p[0], p[1], 3, "#b8cfd4", { s: null, op: 0.6 }) + pa("M" + p[0] + " " + (p[1] + 3) + " v10", null, { s: "#b8cfd4", w: 1.4, op: 0.4 })).join(""));
  b += li(148, 60, 148, 360, "#121a20", 5);
  // the evidence board
  b += re(300, 50, 660, 360, "#7a5c3c", { w: 4 }) + re(308, 58, 644, 344, "#8a6a45", { s: null });
  const pin = (x, y) => ci(x, y, 4, K.red, { w: 1.2 });
  const card = (x, y, w, h, inner, rot) => g({ transform: "rotate(" + (rot || 0) + " " + (x + w / 2) + " " + (y + h / 2) + ")" }, re(x, y, w, h, "#d8d2c0", { w: 2 }), inner || "", pin(x + w / 2, y + 6));
  b += card(340, 80, 120, 90, re(348, 90, 104, 72, "#3a454b", { s: null }) + pa("M350 160 L380 120 L420 140 L450 100", null, { s: "#9aa6ac", w: 4 }), -3); // stairs photo
  b += card(500, 90, 100, 76, re(508, 100, 84, 58, "#2b3342", { s: null }) + pa("M520 140 l10 -24 l12 0 l2 18 l14 6 Z", "#101216", { w: 1.5 }), 4); // the boots
  b += card(640, 76, 130, 96, re(648, 86, 114, 80, "#1d2b36", { s: null }) + pa("M650 150 C690 140 720 150 760 130", null, { s: "#3c5160", w: 4 }) + ci(700, 120, 5, K.a3, { s: null }), -2); // map
  b += card(810, 96, 110, 80, [104, 114, 124, 134, 144, 154].map(y => li(820, y + 4, 908, y + 4, "#6d6a60", 1.4)).join(""), 3); // weather sheet
  b += card(380, 230, 110, 80, [0, 1, 2, 3, 4].map(i => li(390, 252 + i * 10, 478, 252 + i * 10, "#6d6a60", 1.4)).join(""), 2); // messages
  b += card(560, 220, 70, 70, tx(595, 262, "?", { "text-anchor": "middle", "font-size": 30, fill: K.ink }), -5);
  b += g({ transform: "rotate(-4 755 270)" }, re(700, 240, 110, 60, K.note, { w: 2 }), tx(755, 278, "19:30 - 21:30", { "text-anchor": "middle", "font-size": 15, fill: K.ink, "font-family": "'Courier New', monospace", "font-weight": "bold" }), pin(755, 246));
  b += pa("M400 86 L550 96 L705 82 M550 96 L435 236 M705 82 L755 246 M865 102 L755 246 M595 226 L755 246", null, { s: K.red, w: 2, op: 0.85 });
  // desk phone on speaker, its light on
  b += po("380,520 620,520 660,600 340,600", "#3a2c22", { w: 3 }) + po("440,470 560,470 590,540 410,540", "#1f2428", { w: 3 }) + pa("M430 470 C430 444 570 444 570 470", "#2a3035", { w: 3 }) + ci(560, 500, 6, K.a3, { w: 1.5 }) + glow(560, 500, 40, 0.8) +
    [0, 1, 2, 3].map(i => li(450 + i * 18, 500, 450 + i * 18, 520, "#4a5258", 4)).join("") + pa("M600 470 q14 -14 0 -28 M616 476 q24 -22 0 -48", null, { s: K.a3, w: 2.4, op: 0.6 });
  // Lena from behind, looking at the board for a long time
  b += pa("M720 600 C716 520 740 470 790 462 C840 470 864 520 860 600 Z", "#2c3542", { w: 3 }) + el(790, 430, 32, 38, "#15100d", { w: 3 }) + pa("M816 412 C834 412 840 430 832 442 C824 448 816 440 818 430", "#15100d", { w: 2.4 }) + pa("M770 466 L790 452 L810 466", SK.olive[1], { w: 2 });
  b += hat("M0 420 H1000 V600 H0 Z", 0.2) + glow(560, 500, 240, 0.25);
  return svg(1000, 600, defs, b);
});

/* ============================================================ OUTPUT */
function build() {
  const ART = { map: buildMap(), intro: {}, scenes: {}, portraits: {} };
  for (const [grp, key, fn] of BUILDERS) ART[grp][key] = fn();
  const js = "/* Cold Read: art for case-001 \"The Long Way Home\". Generated by game/tools/build-art.js, do not edit by hand. */\n" +
    "window.ART = {\n  map: " + JSON.stringify(ART.map) + ",\n" +
    ["intro", "scenes", "portraits"].map(gname => "  " + gname + ": {\n" + Object.keys(ART[gname]).map(k => "    " + JSON.stringify(k) + ": " + JSON.stringify(ART[gname][k])).join(",\n") + "\n  }").join(",\n") +
    "\n};\n";
  const out = path.resolve(__dirname, "..", "art.js");
  fs.writeFileSync(out, js);
  console.log("wrote " + out + " (" + (Buffer.byteLength(js) / 1024).toFixed(1) + " KB)");
}
if (require.main === module) build();
