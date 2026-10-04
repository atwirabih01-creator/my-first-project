#!/usr/bin/env node
/* Cold Read case validator.
 * Usage: node game/tools/validate-case.js [path/to/case.js]   (default: game/case-001.js)
 * Loads the case with a fake `window`, checks ids and references against game/SCHEMA.md,
 * then simulates a player who does everything (normal run and reopened run) and reports
 * anything that can never be reached. Exit code 1 if there are errors.
 */
"use strict";
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var file = path.resolve(process.argv[2] || path.join(__dirname, "..", "case-001.js"));
var sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
var RAW = sandbox.window.CASE;

var errors = [], warnings = [], notes = [];
var REOPEN_INFO = {};
function note(m) { notes.push(m); }
function err(m) { errors.push(m); }
function warn(m) { warnings.push(m); }
function arr(a) { return Array.isArray(a) ? a : []; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function words(s) { return String(s || "").trim().split(/\s+/).filter(Boolean).length; }

if (!RAW) { console.error("window.CASE was not set by " + file); process.exit(1); }

/* ------------------------------------------------------------ build (mirrors engine reopen rules) */
function mergeInto(t, o) {
  for (var k in o) {
    if (k === "doc" && o.doc && typeof o.doc === "object" && t.doc && typeof t.doc === "object") {
      for (var d in o.doc) t.doc[d] = o.doc[d];
    } else t[k] = o[k];
  }
}
function upsert(list, item) {
  for (var i = 0; i < list.length; i++) if (list[i].id === item.id) { list[i] = item; return; }
  list.push(item);
}
function build(reopened) {
  var c = clone(RAW);
  ["intro", "locations", "people", "evidence", "facts", "deductions", "requests", "puzzles", "hints", "hintTokensFrom", "debrief"].forEach(function (k) { c[k] = arr(c[k]); });
  c.solution = c.solution || {};
  if (reopened && c.reopen) {
    var r = c.reopen;
    c.evidence.forEach(function (e) { if (r.evidence && r.evidence[e.id]) mergeInto(e, r.evidence[e.id]); });
    c.locations.forEach(function (l) { arr(l.hotspots).forEach(function (h) { if (r.hotspots && r.hotspots[h.id]) mergeInto(h, r.hotspots[h.id]); }); });
    c.people.forEach(function (p) { arr(p.questions).forEach(function (q) { if (r.questions && r.questions[q.id]) mergeInto(q, r.questions[q.id]); }); });
    arr(r.addEvidence).forEach(function (e) { upsert(c.evidence, e); });
    var rm = arr(r.removeDeductions);
    c.deductions = c.deductions.filter(function (d) { return rm.indexOf(d.id) === -1; });
    arr(r.addDeductions).forEach(function (d) { upsert(c.deductions, d); });   // same id replaces in place
    if (typeof r.briefing === "string" && r.briefing) c.briefing = r.briefing;
    var pp = r.people || {};
    c.people.forEach(function (p) { if (pp[p.id]) mergeInto(p, pp[p.id]); });
    if (r.twist && c.twist) mergeInto(c.twist, r.twist);
    if (r.solution) mergeInto(c.solution, r.solution);
    if (Array.isArray(r.proofs) && r.proofs.length) c.solution.proofs = r.proofs.slice();
    // added hints go first (engine picks the first relevant hint); same id replaces
    var added = arr(r.addHints), addedIds = added.map(function (h) { return h.id; });
    c.hints = added.concat(c.hints.filter(function (h) { return addedIds.indexOf(h.id) === -1; }));
    if (Array.isArray(r.hintTokensFrom)) c.hintTokensFrom = r.hintTokensFrom.slice();
  }
  return c;
}

/* ------------------------------------------------------------ static checks for one build */
var ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
var TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
var DISTRICTS = ["Old Town", "The Docks", "Hillcrest", "Eastgate", "Financial Quarter", "HQ"];
var DOC_KINDS = ["photo", "object", "report", "statement", "receipt", "phone-log", "messages", "bank", "camera", "note", "letter", "autopsy", "map"];

function collect(c, label) {
  var ids = {}, kinds = {};
  function add(id, kind, where) {
    if (typeof id !== "string" || !id) { err(label + ": missing id in " + where); return; }
    if (!ID_RE.test(id)) err(label + ": id '" + id + "' is not lowercase-with-hyphens (" + where + ")");
    if (ids[id]) err(label + ": duplicate id '" + id + "' (" + where + " and " + ids[id] + ")");
    else { ids[id] = where; kinds[id] = kind; }
  }
  add(c.victim && c.victim.id, "person", "victim");
  c.locations.forEach(function (l) {
    add(l.id, "location", "locations");
    arr(l.hotspots).forEach(function (h) { add(h.id, "hotspot", "hotspot in " + l.id); });
  });
  c.people.forEach(function (p) {
    add(p.id, "person", "people");
    arr(p.questions).forEach(function (q) { add(q.id, "question", "question of " + p.id); });
  });
  c.evidence.forEach(function (e) { add(e.id, "evidence", "evidence"); });
  c.facts.forEach(function (f) { add(f.id, "fact", "facts"); });
  c.deductions.forEach(function (d) { add(d.id, "deduction", "deductions"); });
  c.requests.forEach(function (r) { add(r.id, "request", "requests"); });
  c.puzzles.forEach(function (z) { add(z.id, "puzzle", "puzzles"); });
  if (c.twist) add(c.twist.id, "twist", "twist");
  c.hints.forEach(function (h) { add(h.id, "hint", "hints"); });
  arr(c.solution.motives).forEach(function (m) { add(m.id, "motive", "motives"); });
  arr(c.solution.methods).forEach(function (m) { add(m.id, "method", "methods"); });
  return { ids: ids, kinds: kinds };
}

function checkBuild(c, label) {
  var col = collect(c, label), ids = col.ids, kinds = col.kinds;
  function ref(id, where, allowed) {
    if (!ids[id]) { err(label + ": " + where + " refers to unknown id '" + id + "'"); return; }
    if (allowed && allowed.indexOf(kinds[id]) === -1) err(label + ": " + where + " refers to '" + id + "' (" + kinds[id] + "), expected " + allowed.join("/"));
  }
  function refs(list, where, allowed) { arr(list).forEach(function (id) { ref(id, where, allowed); }); }
  var GRANTABLE = ["evidence", "fact"];

  // start
  if (!c.start || !ids[c.start.locationId]) err(label + ": start.locationId missing or unknown");
  else if (kinds[c.start.locationId] !== "location") err(label + ": start.locationId is not a location");
  var hq = c.locations.filter(function (l) { return l.district === "HQ"; });
  if (hq.length !== 1) err(label + ": expected exactly one HQ location, found " + hq.length);
  else if (c.start && c.start.locationId !== hq[0].id) err(label + ": start.locationId is not the HQ location");
  if (c.start && !TIME_RE.test(c.start.time)) err(label + ": start.time is not HH:MM");

  // locations + hotspots
  c.locations.forEach(function (l) {
    if (DISTRICTS.indexOf(l.district) === -1) err(label + ": " + l.id + " has unknown district '" + l.district + "'");
    if (!l.art) err(label + ": " + l.id + " has no art key");
    if (!l.map || l.map.x < 0 || l.map.x > 1000 || l.map.y < 0 || l.map.y > 600) err(label + ": " + l.id + " map position outside 1000x600");
    refs(l.requires, l.id + ".requires");
    var hs = arr(l.hotspots);
    hs.forEach(function (h, i) {
      var w = l.id + "/" + h.id;
      if (!(h.r >= 30 && h.r <= 60)) err(label + ": " + w + " radius " + h.r + " not in 30-60");
      if (h.x - h.r < 0 || h.x + h.r > 1000 || h.y - h.r < 0 || h.y + h.r > 600) err(label + ": " + w + " circle leaves the 1000x600 scene");
      if (!h.text) err(label + ": " + w + " has no text");
      refs(h.grants, w + ".grants", GRANTABLE);
      refs(h.requires, w + ".requires");
      if (h.puzzle) ref(h.puzzle, w + ".puzzle", ["puzzle"]);
      for (var j = i + 1; j < hs.length; j++) {
        var o = hs[j], dist = Math.hypot(h.x - o.x, h.y - o.y);
        if (dist < h.r + o.r) err(label + ": hotspots " + h.id + " and " + o.id + " overlap");
      }
    });
  });

  // people
  c.people.forEach(function (p) {
    ref(p.locationId, p.id + ".locationId", ["location"]);
    refs(p.requires, p.id + ".requires");
    if (p.available) {
      if (!TIME_RE.test(p.available.from) || !TIME_RE.test(p.available.to)) err(label + ": " + p.id + ".available times are not HH:MM");
    }
    arr(p.questions).forEach(function (q) {
      refs(q.requires, q.id + ".requires");
      refs(q.grants, q.id + ".grants", GRANTABLE);
      if (!q.q || !q.a) err(label + ": " + q.id + " missing q or a");
    });
    arr(p.presentations).forEach(function (pr, i) {
      ref(pr.item, p.id + ".presentations[" + i + "].item", GRANTABLE);
      refs(pr.requires, p.id + ".presentations[" + i + "].requires");
      refs(pr.grants, p.id + ".presentations[" + i + "].grants", GRANTABLE);
    });
  });

  // evidence docs
  c.evidence.forEach(function (e) {
    if (!e.doc || DOC_KINDS.indexOf(e.doc.kind) === -1) err(label + ": " + e.id + " has a missing or unknown doc.kind");
    if (e.doc && e.doc.table) {
      var n = arr(e.doc.table.cols).length;
      arr(e.doc.table.rows).forEach(function (r, i) { if (r.length !== n) err(label + ": " + e.id + " table row " + i + " has " + r.length + " cells, expected " + n); });
    }
  });

  // deductions
  c.deductions.forEach(function (d) {
    if (arr(d.items).length !== 2) err(label + ": " + d.id + " must have exactly 2 items");
    if (d.items && d.items[0] === d.items[1]) err(label + ": " + d.id + " connects an item to itself");
    refs(d.items, d.id + ".items", GRANTABLE);
    refs(d.requires, d.id + ".requires");
    refs(d.grants, d.id + ".grants", GRANTABLE);
  });
  // two deductions on the same pair would shadow each other
  var pairs = {};
  c.deductions.forEach(function (d) { var k = arr(d.items).slice().sort().join("+"); if (pairs[k]) err(label + ": " + d.id + " and " + pairs[k] + " use the same pair"); pairs[k] = d.id; });

  c.requests.forEach(function (r) {
    refs(r.requires, r.id + ".requires"); refs(r.grants, r.id + ".grants", GRANTABLE);
    if (typeof r.delayMinutes !== "number") warn(label + ": " + r.id + " has no delayMinutes");
  });
  c.puzzles.forEach(function (z) {
    refs(z.grants, z.id + ".grants", GRANTABLE);
    var used = c.locations.some(function (l) { return arr(l.hotspots).some(function (h) { return h.puzzle === z.id; }); });
    if (!used) err(label + ": puzzle " + z.id + " is not attached to any hotspot");
    if (!z.answer) err(label + ": puzzle " + z.id + " has no answer");
  });
  if (c.twist) {
    refs(c.twist.requires, "twist.requires"); refs(c.twist.grants, "twist.grants", GRANTABLE);
    refs(c.twist.unlocks, "twist.unlocks", ["location", "person"]);
    if (!c.twist.orAfter || !TIME_RE.test(c.twist.orAfter.time)) err(label + ": twist.orAfter missing or bad time");
  } else err(label + ": no twist");
  refs(c.hintTokensFrom, "hintTokensFrom");
  c.hints.forEach(function (h) { refs(h.requires, h.id + ".requires"); refs(h.until, h.id + ".until"); });

  // solution
  var s = c.solution;
  refs(s.suspects, "solution.suspects", ["person"]);
  ref(s.killer, "solution.killer", ["person"]);
  if (arr(s.suspects).indexOf(s.killer) === -1) err(label + ": killer is not among suspects");
  if (arr(s.suspects).length < 3 || arr(s.suspects).length > 5) err(label + ": suspects should number 3-5");
  ref(s.motive, "solution.motive", ["motive"]); ref(s.method, "solution.method", ["method"]);
  if (arr(s.motives).length !== 4) warn(label + ": expected 4 motives");
  if (arr(s.methods).length !== 4) warn(label + ": expected 4 methods");
  refs(s.proofs, "solution.proofs", ["evidence", "fact", "deduction"]);
  if (arr(s.proofs).length < (s.proofsNeeded || 2)) err(label + ": fewer proofs than proofsNeeded");

  c.debrief.forEach(function (d, i) { ref(d.flag, "debrief[" + i + "].flag"); });
  return col;
}

/* ------------------------------------------------------------ reachability simulation */
function simulate(c, opts) {
  opts = opts || {};
  var F = {}, order = [];
  function has(id) { return !!F[id]; }
  function set(id, why) { if (id && !F[id]) { F[id] = why; order.push(id); return true; } return false; }
  function met(req) { return arr(req).every(has); }
  function grantAll(list, why) { var ch = false; arr(list).forEach(function (g) { if (set(g, why)) ch = true; }); return ch; }
  var changed = true, rounds = 0;
  while (changed && rounds++ < 500) {
    changed = false;
    c.locations.forEach(function (l) {
      if (!has(l.id) && met(l.requires)) changed = set(l.id, "location") || changed;
      if (!has(l.id)) return;
      arr(l.hotspots).forEach(function (h) {
        if (!met(h.requires)) return;
        if (set(h.id, "hotspot")) changed = true;
        if (grantAll(h.grants, h.id)) changed = true;
        if (h.puzzle) {
          var z = c.puzzles.filter(function (p) { return p.id === h.puzzle; })[0];
          if (z && set(z.id, "puzzle via " + h.id)) changed = true;
          if (z && grantAll(z.grants, z.id)) changed = true;
        }
      });
    });
    c.people.forEach(function (p) {
      if (!has(p.locationId) || !met(p.requires)) return;
      if (set(p.id, "person")) changed = true;
      arr(p.questions).forEach(function (q) {
        if (!met(q.requires)) return;
        if (set(q.id, "asked")) changed = true;
        if (grantAll(q.grants, q.id)) changed = true;
      });
      arr(p.presentations).forEach(function (pr) {
        if (!has(pr.item) || !met(pr.requires)) return;
        if (grantAll(pr.grants, "shown " + pr.item + " to " + p.id)) changed = true;
      });
    });
    c.deductions.forEach(function (d) {
      if (arr(d.items).every(has) && met(d.requires)) {
        if (set(d.id, "deduction")) changed = true;
        if (grantAll(d.grants, d.id)) changed = true;
      }
    });
    c.requests.forEach(function (r) {
      if (met(r.requires)) {
        if (set(r.id, "request")) changed = true;
        if (grantAll(r.grants, r.id)) changed = true;
      }
    });
    var tw = c.twist;
    if (tw && !has(tw.id) && !opts.noTwist) {
      var byReq = arr(tw.requires).length > 0 && met(tw.requires);
      if (byReq || opts.timePasses) {
        set(tw.id, byReq ? "twist (by flags)" : "twist (by time)");
        grantAll(tw.grants, tw.id); grantAll(tw.unlocks, tw.id);
        changed = true;
      }
    }
  }
  return { F: F, order: order };
}

/* Items the normal build grants but the reopened build no longer grants, because a reopen
 * override replaced the hotspot/question that gave them. These are expected to go dark. */
function grantedSet(c) {
  var g = {};
  function add(list) { arr(list).forEach(function (x) { g[x] = true; }); }
  c.locations.forEach(function (l) { arr(l.hotspots).forEach(function (h) { add(h.grants); }); });
  c.people.forEach(function (p) { arr(p.questions).forEach(function (q) { add(q.grants); }); arr(p.presentations).forEach(function (pr) { add(pr.grants); }); });
  c.deductions.forEach(function (d) { add(d.grants); }); c.requests.forEach(function (r) { add(r.grants); });
  c.puzzles.forEach(function (z) { add(z.grants); }); add(c.twist && c.twist.grants);
  return g;
}
var RETIRED = [];
(function () {
  var a = grantedSet(build(false)), b = grantedSet(build(true));
  RETIRED = Object.keys(a).filter(function (k) { return !b[k]; });
})();
function retired(label, id) { return label === "reopen" && RETIRED.indexOf(id) !== -1; }

function reachReport(c, label) {
  var col = checkBuild(c, label);
  var noTime = simulate(c, { timePasses: false });
  var full = simulate(c, { timePasses: true });
  var F = full.F;
  var out = { label: label };

  // twist
  out.twistByFlags = !!noTime.F[c.twist.id];
  if (!out.twistByFlags) err(label + ": twist cannot be triggered by its flags (only by time). Missing: " + arr(c.twist.requires).filter(function (x) { return !noTime.F[x]; }).join(", "));
  // the twist's own requirements must not depend on the twist
  arr(c.twist.requires).forEach(function (x) { if (!noTime.F[x]) err(label + ": twist requirement '" + x + "' is unreachable before the twist"); });

  // proofs
  var s = c.solution;
  out.proofs = arr(s.proofs).map(function (p) { return { id: p, ok: !!F[p] }; });
  out.proofs.forEach(function (p) { if (!p.ok) err(label + ": proof '" + p.id + "' is unreachable"); });
  var reachableProofs = out.proofs.filter(function (p) { return p.ok; }).length;
  if (reachableProofs < Math.max(3, s.proofsNeeded || 2)) err(label + ": only " + reachableProofs + " proofs reachable; the player must be able to pick 3");

  // killer key evidence: key evidence and key deductions
  var keyItems = c.evidence.filter(function (e) { return e.key; }).map(function (e) { return e.id; })
    .concat(c.deductions.filter(function (d) { return d.key; }).map(function (d) { return d.id; }))
    .concat(c.facts.filter(function (f) { return f.key; }).map(function (f) { return f.id; }));
  out.keyUnreachable = keyItems.filter(function (id) { return !F[id] && !retired(label, id); });
  out.keyUnreachable.forEach(function (id) { err(label + ": key item '" + id + "' is unreachable"); });

  // everything else
  var all = [];
  c.locations.forEach(function (l) { all.push(l.id); arr(l.hotspots).forEach(function (h) { all.push(h.id); }); });
  c.people.forEach(function (p) { all.push(p.id); arr(p.questions).forEach(function (q) { all.push(q.id); }); });
  c.evidence.forEach(function (e) { all.push(e.id); });
  c.facts.forEach(function (f) { all.push(f.id); });
  c.deductions.forEach(function (d) { all.push(d.id); });
  c.requests.forEach(function (r) { all.push(r.id); });
  c.puzzles.forEach(function (z) { all.push(z.id); });
  out.unreachable = all.filter(function (id) { return !F[id] && !retired(label, id); });
  out.unreachable.forEach(function (id) {
    if (out.keyUnreachable.indexOf(id) === -1) {
      (label === "normal" ? err : warn)(label + ": '" + id + "' is never reachable");
    }
  });
  // grantable items that nothing grants
  var granted = {};
  function g(list) { arr(list).forEach(function (x) { granted[x] = true; }); }
  c.locations.forEach(function (l) { arr(l.hotspots).forEach(function (h) { g(h.grants); }); });
  c.people.forEach(function (p) { arr(p.questions).forEach(function (q) { g(q.grants); }); arr(p.presentations).forEach(function (pr) { g(pr.grants); }); });
  c.deductions.forEach(function (d) { g(d.grants); }); c.requests.forEach(function (r) { g(r.grants); });
  c.puzzles.forEach(function (z) { g(z.grants); }); g(c.twist && c.twist.grants);
  c.evidence.concat(c.facts).forEach(function (x) { if (!granted[x.id] && !retired(label, x.id)) err(label + ": '" + x.id + "' is never granted by anything"); });

  // debrief flags (warning only in reopen, where some routes change)
  c.debrief.forEach(function (d) { if (!F[d.flag]) (label === "normal" ? err : warn)(label + ": debrief flag '" + d.flag + "' is unreachable"); });
  // hints whose `until` can never complete would never retire
  c.hints.forEach(function (h) { if (arr(h.until).length && !arr(h.until).every(function (u) { return F[u]; })) err(label + ": hint " + h.id + " can never retire (until unreachable)"); });

  // The case must not be chargeable before the twist: with the twist blocked (no flags, no time),
  // fewer than proofsNeeded valid proofs may be reachable.
  var preTwist = simulate(c, { timePasses: false, noTwist: true }).F;
  out.preTwistProofs = arr(s.proofs).filter(function (p) { return preTwist[p]; });
  if (out.preTwistProofs.length >= (s.proofsNeeded || 2)) err(label + ": " + out.preTwistProofs.length + " valid proofs reachable before the twist (" + out.preTwistProofs.join(", ") + "); proofsNeeded is " + s.proofsNeeded + ", so the case can be charged early");

  // map points should not collide (artist draws a marker at each)
  for (var i = 0; i < c.locations.length; i++) for (var j = i + 1; j < c.locations.length; j++) {
    var a = c.locations[i].map, b = c.locations[j].map;
    if (a && b && Math.hypot(a.x - b.x, a.y - b.y) < 80) err(label + ": map points of " + c.locations[i].id + " and " + c.locations[j].id + " are closer than 80");
  }

  out.counts = {
    locations: c.locations.length, people: c.people.length, evidence: c.evidence.length, facts: c.facts.length,
    deductions: c.deductions.length, requests: c.requests.length, puzzles: c.puzzles.length, hints: c.hints.length,
    debrief: c.debrief.length, hotspots: c.locations.reduce(function (n, l) { return n + arr(l.hotspots).length; }, 0),
    questions: c.people.reduce(function (n, p) { return n + arr(p.questions).length; }, 0)
  };
  out.reachedCount = Object.keys(F).length;
  out.proofsNeeded = s.proofsNeeded;
  return out;
}

/* ------------------------------------------------------------ reopen key checks */
function checkReopenKeys() {
  var r = RAW.reopen;
  if (!r) { err("reopen: missing"); return; }
  var base = build(false);
  var evIds = {}, hsIds = {}, qIds = {}, dIds = {};
  base.evidence.forEach(function (e) { evIds[e.id] = 1; });
  base.locations.forEach(function (l) { arr(l.hotspots).forEach(function (h) { hsIds[h.id] = 1; }); });
  base.people.forEach(function (p) { arr(p.questions).forEach(function (q) { qIds[q.id] = 1; }); });
  base.deductions.forEach(function (d) { dIds[d.id] = 1; });
  Object.keys(r.evidence || {}).forEach(function (k) { if (!evIds[k]) err("reopen.evidence key '" + k + "' is not an evidence id"); });
  Object.keys(r.hotspots || {}).forEach(function (k) { if (!hsIds[k]) err("reopen.hotspots key '" + k + "' is not a hotspot id"); });
  Object.keys(r.questions || {}).forEach(function (k) { if (!qIds[k]) err("reopen.questions key '" + k + "' is not a question id"); });
  arr(r.removeDeductions).forEach(function (k) { if (!dIds[k]) err("reopen.removeDeductions '" + k + "' is not a deduction id"); });
  var pIds = {}; base.people.forEach(function (p) { pIds[p.id] = 1; });
  Object.keys(r.people || {}).forEach(function (k) {
    if (!pIds[k]) err("reopen.people key '" + k + "' is not a person id");
    if (r.people[k] && r.people[k].questions) warn("reopen.people." + k + " overrides the whole questions list; prefer reopen.questions");
    if (r.people[k] && r.people[k].id) err("reopen.people." + k + " must not change the id");
  });
  if (r.twist) {
    if (r.twist.id) err("reopen.twist must not change the twist id");
    Object.keys(r.twist).forEach(function (k) { if (!(k in base.twist) && k !== "art") warn("reopen.twist sets '" + k + "', which the base twist does not have"); });
  }
  if (r.solution) {
    ["killer", "suspects"].forEach(function (k) { if (r.solution[k]) err("reopen.solution must keep the same " + k); });
    if (r.solution.proofs && r.proofs) warn("reopen sets proofs in both reopen.proofs and reopen.solution.proofs");
  }
  if (r.briefing) { var bw = words(r.briefing); if (bw < 80 || bw > 150) warn("reopen.briefing is " + bw + " words (80-150)"); }
  var hIds = {}; base.hints.forEach(function (h) { hIds[h.id] = 1; });
  arr(r.addHints).forEach(function (h) { if (hIds[h.id]) note("reopen.addHints replaces existing hint " + h.id); });
  var replaced = arr(r.addDeductions).filter(function (d) { return dIds[d.id]; }).map(function (d) { return d.id; });
  replaced.forEach(function (id) { if (arr(r.removeDeductions).indexOf(id) !== -1) err("reopen both removes and replaces deduction " + id); });
  REOPEN_INFO.replacedDeductions = replaced;
  REOPEN_INFO.addedDeductions = arr(r.addDeductions).filter(function (d) { return !dIds[d.id]; }).map(function (d) { return d.id; });

  // Trail overrides change what the player can obtain; framing overrides only change wording.
  var trail = [], framing = [];
  function classify(map, kind) {
    Object.keys(map || {}).forEach(function (k) {
      var o = map[k];
      ("grants" in o || "requires" in o || "puzzle" in o) ? trail.push(kind + ":" + k) : framing.push(kind + ":" + k);
    });
  }
  classify(r.hotspots, "hotspot"); classify(r.questions, "question");
  // evidence content overrides that change the route to the truth count as trail (listed explicitly by key flag)
  Object.keys(r.evidence || {}).forEach(function (k) {
    var e = base.evidence.filter(function (x) { return x.id === k; })[0];
    (e && e.key && r.evidence[k].doc && (r.evidence[k].doc.text || r.evidence[k].doc.table !== undefined)) ? trail.push("evidence:" + k) : framing.push("evidence:" + k);
  });
  REOPEN_INFO.trail = trail; REOPEN_INFO.framing = framing;
  if (trail.length < 3 || trail.length > 6) warn("reopen changes " + trail.length + " trail items (brief asks for 3-5)");
  if (!r.intro) err("reopen.intro missing");
}

/* ------------------------------------------------------------ text-length checks */
function checkTexts() {
  var b = words(RAW.briefing); if (b < 80 || b > 150) warn("briefing is " + b + " words (80-150)");
  var v = words(RAW.victim && RAW.victim.bio); if (v < 60 || v > 120) warn("victim bio is " + v + " words (60-120)");
  var n = arr(RAW.intro).length; if (n < 3 || n > 6) warn("intro has " + n + " slides (3-6)");
}

/* ------------------------------------------------------------ run */
checkTexts();
checkReopenKeys();
var normal = reachReport(build(false), "normal");
var reopened = reachReport(build(true), "reopen");

function show(o) {
  console.log("\n[" + o.label + "] reachable flags: " + o.reachedCount);
  console.log("  counts: " + Object.keys(o.counts).map(function (k) { return k + " " + o.counts[k]; }).join(", "));
  console.log("  twist reachable by its flags: " + (o.twistByFlags ? "yes" : "NO") + " (time fallback also set)");
  console.log("  proofs: " + o.proofs.map(function (p) { return p.id + (p.ok ? " ok" : " UNREACHABLE"); }).join(", "));
  console.log("  valid proofs reachable before the twist: " + o.preTwistProofs.length + (o.preTwistProofs.length ? " (" + o.preTwistProofs.join(", ") + ")" : "") + "; proofsNeeded " + o.proofsNeeded);
  console.log("  key items unreachable: " + (o.keyUnreachable.length ? o.keyUnreachable.join(", ") : "none"));
  console.log("  anything unreachable: " + (o.unreachable.length ? o.unreachable.join(", ") : "none"));
}
console.log("Cold Read case validator: " + path.relative(process.cwd(), file) + " (" + RAW.id + ", \"" + RAW.title + "\")");
show(normal); show(reopened);
console.log("  retired by reopen overrides (expected, replaced by the new trail): " + (RETIRED.length ? RETIRED.join(", ") : "none"));
console.log("  reopen trail changes: " + REOPEN_INFO.trail.join(", "));
console.log("  reopen framing-only changes: " + REOPEN_INFO.framing.join(", "));
console.log("  reopen deductions replaced: " + (REOPEN_INFO.replacedDeductions.join(", ") || "none") + "; added: " + (REOPEN_INFO.addedDeductions.join(", ") || "none"));
notes.forEach(function (n) { console.log("  note: " + n); });
console.log("\nWarnings (" + warnings.length + "):"); warnings.forEach(function (w) { console.log("  - " + w); });
console.log("Errors (" + errors.length + "):"); errors.forEach(function (e) { console.log("  - " + e); });
console.log(errors.length ? "\nRESULT: FAIL" : "\nRESULT: OK");
process.exit(errors.length ? 1 : 0);
