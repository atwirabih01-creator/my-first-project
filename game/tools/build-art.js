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
const glow = (cx, cy, r, op, which) => el(cx, cy, r, r, u(which || "amb"), { s: null, op: op == null ? 1 : op });
const rain = (op, cl) => re(0, 0, 1000, 600, u("rain"), { s: null, op: op == null ? 0.5 : op, cl });
const fog = (cx, cy, rx, ry, op, c) => el(cx, cy, rx, ry, c || K.n7, { s: null, op: op == null ? 0.18 : op, flt: "blur" });
const lg = (n, x1, y1, x2, y2, stops) => "<linearGradient id='" + id(n) + "' x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "'>" +
  stops.map(s => "<stop offset='" + s[0] + "' stop-color='" + s[1] + "'" + (s[2] != null ? " stop-opacity='" + s[2] + "'" : "") + "/>").join("") + "</linearGradient>";
const clip = (n, inner) => "<clipPath id='" + id(n) + "'>" + inner + "</clipPath>";

/* ============================================================ MAP */
function buildMap() {
  P = "mp"; W = 2.5; seed = 11;
  const coast = [[0, 362], [100, 356], [205, 392], [262, 432], [302, 476], [334, 520], [372, 554], [500, 568], [700, 566], [850, 556], [1000, 548]];
  const coastY = x => { for (let i = 1; i < coast.length; i++) if (x <= coast[i][0]) { const a = coast[i - 1], b = coast[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return 548; };
  const water = "M0 362 C70 352 150 360 205 392 C255 422 290 470 330 520 C360 556 420 566 500 568 C640 572 800 560 1000 548 L1000 600 L0 600 Z";
  const pins = [[430, 330], [230, 300], [780, 130], [560, 170], [170, 190], [420, 500], [650, 520]];
  const nearPin = (x, y, d) => pins.some(p => Math.hypot(p[0] - x, p[1] - y) < d);
  const labels = [[115, 258, 170, 26], [470, 80, 250, 26], [890, 205, 150, 26], [880, 400, 140, 26], [560, 455, 150, 26]];
  const nearLabel = (x, y) => labels.some(l => Math.abs(l[0] - x) < l[2] / 2 + 6 && Math.abs(l[1] - 8 - y) < 18);
  let blocks = "";
  for (let y = 10; y < 560; y += 22) {
    for (let x = 8; x < 1000; x += 26) {
      const cx = x + rr(-4, 4), cy = y + rr(-3, 3);
      const cy0 = coastY(cx);
      if (cy > cy0 - 34) continue;
      let w = rr(12, 20), h = rr(9, 15), f = K.n3, rot = 0;
      const docks = cx > 330 && cy > cy0 - 140;
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
    ["M0 340 C80 334 160 346 215 374 C265 401 300 446 340 496 C372 534 430 546 510 548 C650 550 800 538 1000 526", 9], // Quay Road
    ["M60 232 C200 252 330 296 430 312 C560 332 700 344 1000 366", 8],    // Harbour Avenue
    ["M140 0 C150 100 165 175 182 228 C198 276 214 300 236 332 C250 352 262 368 275 392", 6], // Mercer St
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
    pa("M20 470 L140 452 L150 460 L34 480 Z", "#1b2731", { s: K.n0, w: 1.5 }); // breakwater
  const cranes = [[600, 548], [780, 540], [905, 534]].map(c => g({ stroke: "#566f7e", "stroke-width": 2, fill: "none", opacity: 0.8 },
    pa("M" + c[0] + " " + c[1] + " l0 -34 l26 0 M" + c[0] + " " + (c[1] - 34) + " l-8 0 M" + (c[0] + 22) + " " + (c[1] - 34) + " l0 10"))).join("");
  const markers = pins.map(p => ci(p[0], p[1], 26, "#2b3e4c", { s: K.a2, w: 1.2, op: 0.55, dash: "3 5" }) + ci(p[0], p[1], 26, u("amb"), { s: null, op: 0.35 })).join("");
  const halo = { stroke: K.n0, "stroke-width": 5, "paint-order": "stroke", "stroke-linejoin": "round" };
  const dl = (x, y, s, size) => tx(x, y, s, Object.assign({ "text-anchor": "middle", "font-size": size || 19, "letter-spacing": 5, fill: "#9db0b8" }, halo));
  const stairsHatch = g({ stroke: "#7d8f99", "stroke-width": 1.5, opacity: 0.8 }, [0, 1, 2, 3, 4, 5].map(i => li(222 + i * 5, 330 + i * 9, 236 + i * 5, 328 + i * 9)).join(""));
  const lighthouse = g({}, re(40, 548, 9, 26, "#cfc4ab", { s: K.ink, w: 1.5 }), re(38, 543, 13, 6, K.a3, { s: K.ink, w: 1.5 }),
    pa("M45 545 L-10 520 L-10 572 Z", K.a3, { s: null, op: 0.18 }), pa("M45 545 L140 528 L140 556 Z", K.a3, { s: null, op: 0.14 }));
  const compass = g({ transform: "translate(945 455)" }, ci(0, 0, 24, null, { s: "#5b7280", w: 1.2 }), po("0,-30 6,0 0,30 -6,0", "#3c5160", { s: "#7d8f99", w: 1.2 }), po("0,-30 6,0 -6,0", "#9db0b8", { s: null }),
    tx(0, -36, "N", { "text-anchor": "middle", "font-size": 13, fill: "#9db0b8" }));
  const title = g({}, tx(28, 46, "PORT HALDEN", Object.assign({ "font-size": 26, "letter-spacing": 8, fill: K.a3 }, halo)),
    tx(30, 68, "City map, Major Crimes copy", { "font-size": 12, "letter-spacing": 2, fill: "#7d8f99", "font-style": "italic" }));
  const quayLabel = "<path id='" + id("qr") + "' d='M10 330 C80 324 140 330 190 350' fill='none'/>" +
    "<text font-family='Georgia, serif' font-size='11' letter-spacing='3' fill='#7d8f99'><textPath href='#" + id("qr") + "'>QUAY ROAD</textPath></text>";
  const body = re(0, 0, 1000, 600, K.n2, { s: null }) +
    pa("M0 0 H340 V380 C250 360 150 350 0 362 Z", "#18252f", { s: null, op: 0.9 }) + // Old Town tint
    pa("M700 0 H1000 V250 C900 262 790 256 700 250 Z", "#162129", { s: null }) + contours +
    pa(water, "#0b161c", { s: K.ink, w: 3 }) + pa(water, u("wg"), { s: null }) + waves + piers + blocks + roadsSvg + tram + quayLabel + stairsHatch + cranes +
    pa("M20 120 C40 70 120 40 200 52 C280 64 330 120 340 190", null, { s: "#3a4c58", w: 3, dash: "1 6", op: 0.8 }) + // old town wall
    markers + lighthouse + compass + title +
    dl(115, 258, "OLD TOWN") + dl(470, 80, "FINANCIAL QUARTER", 17) + dl(890, 205, "HILLCREST") + dl(880, 400, "EASTGATE") + dl(560, 455, "THE DOCKS") +
    tx(205, 520, "Halden Harbour", Object.assign({ "text-anchor": "middle", "font-size": 18, "font-style": "italic", "letter-spacing": 3, fill: K.t4 }, halo)) +
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
    // head: dark hair, matted at the back
    el(228, 0, 22, 18, "#30231c", { w: 2.6 }),
    pa("M214 -8 C222 -14 236 -14 244 -6 M214 6 C224 12 238 12 246 4", null, { s: "#170f0b", w: 2 }),
    pa("M222 -4 C228 -8 236 -6 240 0", null, { s: "#5a4031", w: 1.8 }),
    el(232, 2, 7, 5, "#1a0f0d", { s: null, op: 0.9 }));
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
