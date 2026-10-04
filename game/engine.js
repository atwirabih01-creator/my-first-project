/* Cold Read game engine.
   Reads window.CASE (see SCHEMA.md) and window.ART. Plain browser JavaScript, no build step.
   All case text goes into the page through textContent; only ART SVG strings are inserted as markup. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ basics */
  var RAW = window.CASE;
  var ART = window.ART || {};
  var app = document.getElementById("app");
  if (!app) { app = document.createElement("div"); app.id = "app"; document.body.appendChild(app); }

  var COST = { travel: 20, examine: 5, ask: 10, present: 10, connect: 5, wait: 30 };
  var SAVE_VERSION = 1;
  var MOBILE_QUERY = "(max-width: 860px)";
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* ignore */ }

  if (!RAW || typeof RAW !== "object") {
    app.innerHTML = "";
    app.appendChild(el("div", { class: "screen fatal" }, [
      el("h1", { class: "display" }, "Cold Read"),
      el("p", null, "The case file could not be loaded. Check that the case script sits next to index.html.")
    ]));
    return;
  }
  if (RAW.timeCosts) { for (var ck in RAW.timeCosts) { if (typeof RAW.timeCosts[ck] === "number") COST[ck] = RAW.timeCosts[ck]; } }

  var SAVE_KEY = "coldread:" + (RAW.id || "case");

  function arr(x) { return Array.isArray(x) ? x : []; }
  function str(x, d) { return (typeof x === "string" && x.length) ? x : (d || ""); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* el(tag, props, children): builds DOM safely. Strings become text nodes. */
  function el(tag, props, children) {
    var n = document.createElement(tag);
    if (props) {
      for (var k in props) {
        var v = props[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") n.className = v;
        else if (k === "text") n.textContent = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") n.addEventListener(k.slice(2), v);
        else if (k === "k") n.setAttribute("data-k", v);
        else if (v === true) n.setAttribute(k, "");
        else n.setAttribute(k, String(v));
      }
    }
    append(n, children);
    return n;
  }
  function append(n, children) {
    if (children === null || children === undefined || children === false) return n;
    if (!Array.isArray(children)) children = [children];
    children.forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) { append(n, c); return; }
      n.appendChild(typeof c === "object" ? c : document.createTextNode(String(c)));
    });
    return n;
  }
  function btn(label, k, onClick, cls, extra) {
    var p = { class: "btn " + (cls || ""), type: "button", k: k, onclick: onClick };
    if (extra) for (var e in extra) p[e] = extra[e];
    return el("button", p, label);
  }

  /* ------------------------------------------------------------------ art */
  var PLACEHOLDER_WIDE = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600' role='img' aria-label='Image not available'><defs><pattern id='phh' width='24' height='24' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'><rect width='24' height='24' fill='#13171b'/><rect width='2' height='24' fill='#1b2026'/></pattern></defs><rect width='1000' height='600' fill='url(#phh)'/><rect x='1' y='1' width='998' height='598' fill='none' stroke='#2a3139' stroke-width='2'/><g fill='none' stroke='#3a434c' stroke-width='3'><circle cx='500' cy='280' r='46'/><path d='M533 313 L580 360'/></g><text x='500' y='420' fill='#59626b' font-family='Georgia,serif' font-size='26' text-anchor='middle' letter-spacing='6'>NO IMAGE ON FILE</text></svg>";
  var PLACEHOLDER_PORTRAIT = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 360' role='img' aria-label='Portrait not available'><rect width='300' height='360' fill='#14181c'/><rect x='1' y='1' width='298' height='358' fill='none' stroke='#2a3139' stroke-width='2'/><ellipse cx='150' cy='140' rx='58' ry='70' fill='#1d2328'/><path d='M50 360 Q150 220 250 360Z' fill='#1d2328'/><text x='150' y='335' fill='#59626b' font-family='Georgia,serif' font-size='16' text-anchor='middle' letter-spacing='4'>NO PHOTO</text></svg>";

  function artString(group, key) {
    if (!key) return null;
    var g = group ? ART[group] : null;
    if (g && typeof g === "object" && typeof g[key] === "string" && g[key].indexOf("<svg") !== -1) return g[key];
    return null;
  }
  function artBox(svg, cls, portrait, label) {
    var d = el("div", { class: "art " + (cls || "") + (svg ? "" : " art--placeholder") });
    d.innerHTML = svg || (portrait ? PLACEHOLDER_PORTRAIT : PLACEHOLDER_WIDE); /* trusted ART markup */
    var s = d.querySelector("svg");
    if (s) {
      s.setAttribute("preserveAspectRatio", "xMidYMid slice");
      if (label) { s.setAttribute("role", "img"); s.setAttribute("aria-label", label); }
      else if (svg) s.setAttribute("aria-hidden", "true");
    }
    return d;
  }
  function anyArt(key) { return artString("intro", key) || artString("scenes", key) || artString("evidence", key); }

  /* ------------------------------------------------------------------ time */
  function hm(s) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "").trim());
    return m ? (parseInt(m[1], 10) * 60 + parseInt(m[2], 10)) : 0;
  }
  function absT(day, time) { return ((day || 1) - 1) * 1440 + hm(time); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function clockOf(t) { var m = ((t % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function dayOf(t) { return Math.floor(t / 1440) + 1; }
  function fmtT(t) { return "Day " + dayOf(t) + ", " + clockOf(t); }

  /* ------------------------------------------------------------------ case build (with reopen overrides) */
  var C, IDX;

  function buildCase(reopened) {
    var c = clone(RAW);
    c.intro = arr(c.intro); c.locations = arr(c.locations); c.people = arr(c.people);
    c.evidence = arr(c.evidence); c.facts = arr(c.facts); c.deductions = arr(c.deductions);
    c.requests = arr(c.requests); c.puzzles = arr(c.puzzles); c.hints = arr(c.hints);
    c.hintTokensFrom = arr(c.hintTokensFrom); c.debrief = arr(c.debrief);
    c.victim = c.victim || {}; c.solution = c.solution || {};
    c.start = c.start || {};
    if (reopened && c.reopen) {
      var r = c.reopen;
      var ev = r.evidence || {};
      c.evidence.forEach(function (e) { if (ev[e.id]) mergeInto(e, ev[e.id]); });
      var hs = r.hotspots || {};
      c.locations.forEach(function (l) { arr(l.hotspots).forEach(function (h) { if (hs[h.id]) mergeInto(h, hs[h.id]); }); });
      var qs = r.questions || {};
      c.people.forEach(function (p) { arr(p.questions).forEach(function (q) { if (qs[q.id]) mergeInto(q, qs[q.id]); }); });
      arr(r.addEvidence).forEach(function (e) { upsert(c.evidence, e); });
      var rm = arr(r.removeDeductions);
      c.deductions = c.deductions.filter(function (d) { return rm.indexOf(d.id) === -1; });
      arr(r.addDeductions).forEach(function (d) { upsert(c.deductions, d); });   // same id replaces in place
      if (typeof r.briefing === "string" && r.briefing) c.briefing = r.briefing;
      var po = r.people || {};
      c.people.forEach(function (p) { if (po[p.id]) { for (var pk in po[p.id]) p[pk] = po[p.id][pk]; } });
      if (r.twist && typeof r.twist === "object") { c.twist = c.twist || {}; for (var tk in r.twist) c.twist[tk] = r.twist[tk]; }
      if (r.solution && typeof r.solution === "object") { for (var sk in r.solution) c.solution[sk] = r.solution[sk]; }
      if (Array.isArray(r.proofs) && r.proofs.length) c.solution.proofs = r.proofs.slice();
      if (Array.isArray(r.hintTokensFrom)) c.hintTokensFrom = r.hintTokensFrom.slice();
      /* addHints go first, so reopen-specific hints win; a hint with an existing id replaces it. */
      var added = arr(r.addHints);
      var addedIds = added.map(function (h) { return h.id; });
      c.hints = added.concat(c.hints.filter(function (h) { return addedIds.indexOf(h.id) === -1; }));
    }
    c.solution.suspects = arr(c.solution.suspects); c.solution.motives = arr(c.solution.motives);
    c.solution.methods = arr(c.solution.methods); c.solution.proofs = arr(c.solution.proofs);
    if (typeof c.solution.proofsNeeded !== "number") c.solution.proofsNeeded = 2;
    return c;
  }
  function upsert(list, item) {
    for (var i = 0; i < list.length; i++) if (list[i].id === item.id) { list[i] = item; return; }
    list.push(item);
  }
  /* Overrides replace fields; a nested `doc` object is merged one level deep. */
  function mergeInto(target, over) {
    for (var k in over) {
      if (k === "doc" && over.doc && typeof over.doc === "object" && target.doc && typeof target.doc === "object") {
        for (var d in over.doc) target.doc[d] = over.doc[d];
      } else target[k] = over[k];
    }
  }

  function buildIndex() {
    IDX = { ev: {}, fact: {}, ded: {}, person: {}, loc: {}, hs: {}, hsLoc: {}, q: {}, qPerson: {}, rq: {}, pz: {}, motive: {}, method: {} };
    C.evidence.forEach(function (e) { IDX.ev[e.id] = e; });
    C.facts.forEach(function (f) { IDX.fact[f.id] = f; });
    C.deductions.forEach(function (d) { IDX.ded[d.id] = d; });
    C.people.forEach(function (p) {
      IDX.person[p.id] = p;
      p.questions = arr(p.questions); p.presentations = arr(p.presentations);
      p.questions.forEach(function (q) { IDX.q[q.id] = q; IDX.qPerson[q.id] = p; });
      p.presentations.forEach(function (pr, i) { if (!pr.id) pr.id = "pr-" + p.id + "-" + (pr.item || "item") + "-" + i; });
    });
    C.locations.forEach(function (l) {
      IDX.loc[l.id] = l; l.hotspots = arr(l.hotspots);
      l.hotspots.forEach(function (h) { IDX.hs[h.id] = h; IDX.hsLoc[h.id] = l; });
    });
    C.requests.forEach(function (r) { IDX.rq[r.id] = r; });
    C.puzzles.forEach(function (z) { IDX.pz[z.id] = z; });
    C.solution.motives.forEach(function (m) { IDX.motive[m.id] = m; });
    C.solution.methods.forEach(function (m) { IDX.method[m.id] = m; });
  }

  function hqId() {
    for (var i = 0; i < C.locations.length; i++) if (C.locations[i].district === "HQ") return C.locations[i].id;
    return startLoc();
  }
  function startLoc() { return (C.start.locationId && IDX.loc[C.start.locationId]) ? C.start.locationId : (C.locations[0] ? C.locations[0].id : null); }

  /* ------------------------------------------------------------------ state */
  var S = null;

  function freshState(reopened, keepNotes) {
    C = buildCase(reopened > 0); buildIndex();
    return {
      v: SAVE_VERSION, caseId: RAW.id, status: "intro", reopened: reopened || 0,
      introIdx: 0, t: absT(C.start.day || 1, C.start.time || "08:00"), startT: absT(C.start.day || 1, C.start.time || "08:00"),
      loc: startLoc(), flags: {}, newItems: {}, log: [], notes: keepNotes || "",
      requested: {}, pending: [], theo: [], theoUnread: 0,
      hintsSpent: 0, hintsShown: [], tokenSeen: 0,
      seenHs: {}, visited: {}, announced: {}, presented: {}, history: {}, tried: {},
      event: null, failures: 0, solve: { suspect: null, motive: null, method: null, proofs: [], review: false },
      ui: { stage: "map", panel: "people", mobile: "map", person: null, nb: "log", boardSel: [], boardResult: null }
    };
  }

  function save() {
    try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: keep playing */ }
  }
  function loadSave() {
    try {
      var raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || s.v !== SAVE_VERSION || s.caseId !== RAW.id || !s.flags) return null;
      return s;
    } catch (e) { return null; }
  }
  function clearSave() { try { window.localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }

  function has(id) { return !!(S && S.flags && Object.prototype.hasOwnProperty.call(S.flags, id)); }
  function reqMet(r) { r = arr(r); for (var i = 0; i < r.length; i++) if (!has(r[i])) return false; return true; }
  function setFlag(id) { if (!has(id)) { S.flags[id] = S.t; return true; } return false; }

  function locUnlocked(l) { return has(l.id) || reqMet(l.requires); }
  function personAppeared(p) { return has(p.id) || reqMet(p.requires); }
  function personAvailable(p) {
    if (!p.available || !p.available.from || !p.available.to) return true;
    var m = ((S.t % 1440) + 1440) % 1440, f = hm(p.available.from), to = hm(p.available.to);
    return f <= to ? (m >= f && m < to) : (m >= f || m < to);
  }
  function hsVisible(h) { return reqMet(h.requires); }

  function itemLabel(id) {
    if (IDX.ev[id]) return str(IDX.ev[id].name, id);
    if (IDX.fact[id]) return str(IDX.fact[id].text, id);
    if (IDX.ded[id]) return str(IDX.ded[id].title, id);
    if (IDX.person[id]) return str(IDX.person[id].name, id);
    if (C.victim && C.victim.id === id) return str(C.victim.name, "The victim");
    if (IDX.loc[id]) return str(IDX.loc[id].name, id);
    return id;
  }
  function itemKind(id) {
    if (IDX.ev[id]) return "evidence"; if (IDX.fact[id]) return "fact"; if (IDX.ded[id]) return "deduction";
    if (IDX.person[id] || (C.victim && C.victim.id === id)) return "person"; return "other";
  }

  function keyItems() {
    var list = [];
    C.evidence.forEach(function (e) { if (e.key) list.push(e.id); });
    C.deductions.forEach(function (d) { if (d.key) list.push(d.id); });
    return list;
  }
  function tokenSources() {
    var src = C.hintTokensFrom.slice();
    C.puzzles.forEach(function (z) { if (z.hintToken && src.indexOf(z.id) === -1) src.push(z.id); });
    return src;
  }
  function tokensEarned() { return tokenSources().filter(has).length; }
  function tokensLeft() { return Math.max(0, tokensEarned() - S.hintsSpent); }

  /* ------------------------------------------------------------------ effects: toasts, stamps */
  var fxQueue = [];
  function toast(text, kind) {
    var root = document.getElementById("toasts");
    if (!root) return;
    var t = el("div", { class: "toast " + (kind ? "toast--" + kind : ""), role: "status" }, text);
    root.appendChild(t);
    while (root.children.length > 3) root.removeChild(root.firstChild);
    setTimeout(function () { t.classList.add("toast--out"); }, 3600);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 4200);
  }
  function stamp(sub) { fxQueue.push({ type: "stamp", sub: sub }); }
  var stampBusy = false;
  function playFx() {
    if (stampBusy || !fxQueue.length || (S && S.event && S.status === "play")) return;
    var fx = fxQueue.shift();
    var layer = document.getElementById("stamp-layer");
    if (!layer) return;
    stampBusy = true;
    layer.innerHTML = "";
    var card = el("div", { class: "stamp", role: "status", "aria-live": "assertive" }, [
      el("div", { class: "stamp__main" }, "Lead confirmed"),
      el("div", { class: "stamp__sub" }, fx.sub)
    ]);
    layer.appendChild(card);
    layer.classList.add("is-on");
    var done = function () {
      layer.classList.remove("is-on"); layer.innerHTML = ""; stampBusy = false;
      layer.removeEventListener("click", done);
      playFx();
    };
    layer.addEventListener("click", done);
    setTimeout(done, reduceMotion ? 1500 : 1900);
  }

  /* ------------------------------------------------------------------ logging & granting */
  function logEntry(kind, title, text, cue) {
    S.log.push({ t: S.t, kind: kind, title: title || "", text: text || "", cue: cue || "" });
  }

  function grant(ids, quiet) {
    arr(ids).forEach(function (id) {
      if (!id || has(id)) return;
      setFlag(id);
      if (IDX.ev[id]) {
        S.newItems[id] = true;
        logEntry("evidence", "Evidence added", IDX.ev[id].name);
        if (!quiet) toast("Added to evidence: " + str(IDX.ev[id].name, id));
        if (IDX.ev[id].key) stamp(str(IDX.ev[id].name, id));
      } else if (IDX.fact[id]) {
        logEntry("fact", "Fact", IDX.fact[id].text);
        if (!quiet) toast("Noted: " + str(IDX.fact[id].text, id), "fact");
      } else if (IDX.ded[id]) {
        logEntry("deduction", IDX.ded[id].title, IDX.ded[id].text);
        if (IDX.ded[id].key) stamp(str(IDX.ded[id].title, id));
      }
    });
  }

  /* After every action: deliver Theo results, fire the twist, announce unlocks, earn tokens. */
  function settle(initial) {
    var guard = 0, changed = true;
    while (changed && guard++ < 10) {
      changed = false;
      // Theo
      S.pending.sort(function (a, b) { return a.due - b.due; });
      while (S.pending.length && S.pending[0].due <= S.t) {
        var p = S.pending.shift(), rq = IDX.rq[p.id];
        if (!rq) continue;
        S.theo.push({ t: p.due, from: "theo", text: str(rq.result, "Done. Sending it over.") });
        S.theoUnread++;
        setFlag(rq.id);
        logEntry("theo", "Theo: " + str(rq.label, rq.id), rq.result);
        grant(rq.grants, true);
        arr(rq.grants).forEach(function (g) { if (IDX.ev[g]) S.newItems[g] = true; });
        if (!initial) toast("New message from Theo", "theo");
        changed = true;
      }
      // Twist
      var tw = C.twist;
      if (tw && tw.id && !has(tw.id)) {
        var byReq = arr(tw.requires).length > 0 && reqMet(tw.requires);
        var byTime = tw.orAfter && tw.orAfter.time && S.t >= absT(tw.orAfter.day || 1, tw.orAfter.time);
        if (byReq || byTime) {
          setFlag(tw.id);
          logEntry("event", str(tw.title, "A turn in the case"), tw.text);
          grant(tw.grants, true);
          arr(tw.unlocks).forEach(function (u) { setFlag(u); });
          S.event = { title: str(tw.title, "A turn in the case"), text: str(tw.text), art: tw.art || null, kind: "twist", t: S.t };
          changed = true;
        }
      }
      // Unlocks
      C.locations.forEach(function (l) {
        if (!S.announced[l.id] && locUnlocked(l)) {
          S.announced[l.id] = true; setFlag(l.id);
          if (!initial && l.id !== S.loc) { toast("New location: " + str(l.name, l.id), "unlock"); logEntry("event", "New location", l.name); }
          changed = true;
        }
      });
      C.people.forEach(function (pp) {
        if (!S.announced[pp.id] && personAppeared(pp)) {
          S.announced[pp.id] = true; setFlag(pp.id);
          if (!initial) { toast("New person of interest: " + str(pp.name, pp.id), "unlock"); logEntry("event", "New person of interest", pp.name); }
          changed = true;
        }
      });
    }
    // Hotspots revealed at places already visited
    S.hsNew = S.hsNew || {};
    C.locations.forEach(function (l) {
      if (!S.visited[l.id]) return;
      var seen = S.seenHs[l.id] || [];
      var vis = l.hotspots.filter(hsVisible).map(function (h) { return h.id; });
      vis.forEach(function (id) {
        if (seen.indexOf(id) === -1 && !has(id)) {
          (S.hsNew[l.id] = S.hsNew[l.id] || []).push(id);
          if (!initial && l.id === S.loc) toast("Something here looks different now.", "unlock");
        }
      });
      S.seenHs[l.id] = vis;
    });
    var earned = tokensEarned();
    if (earned > S.tokenSeen) {
      if (!initial) toast(earned - S.tokenSeen > 1 ? "Hint tokens earned" : "Hint token earned. Lena owes you one.", "token");
      S.tokenSeen = earned;
    }
  }

  function spend(min) { S.t += Math.max(0, min || 0); }

  function commit() { settle(false); save(); render(); playFx(); }

  /* ------------------------------------------------------------------ actions */
  function travel(locId) {
    var l = IDX.loc[locId];
    if (!l || !locUnlocked(l)) return;
    closeModal();
    if (locId !== S.loc) {
      spend(typeof l.travelMinutes === "number" ? l.travelMinutes : COST.travel);
      S.loc = locId;
      logEntry("event", "Travelled", "Arrived at " + str(l.name, l.id));
    }
    S.ui.stage = "scene"; S.ui.mobile = "scene"; S.ui.person = null;
    commit();
    focusKey("scene-title");
  }

  function examine(hsId) {
    var h = IDX.hs[hsId]; if (!h) return;
    var first = !has(h.id);
    var before = {};
    arr(h.grants).forEach(function (g) { before[g] = has(g); });
    if (first) {
      spend(typeof h.minutes === "number" ? h.minutes : COST.examine);
      setFlag(h.id);
      logEntry("observation", str(h.label, "Observation"), h.text);
      grant(h.grants, true);
      commit();
    }
    var got = arr(h.grants).filter(function (g) { return first && !before[g]; });
    var body = el("div", { class: "obs" }, [
      el("p", { class: "obs__lead" }, "Julian notices"),
      el("p", { class: "obs__text prose" }, str(h.text, "Nothing more here."))
    ]);
    if (got.length) {
      body.appendChild(el("ul", { class: "obs__got" }, got.map(function (g) {
        return el("li", null, [el("span", { class: "tag" }, kindLabel(itemKind(g))), " ", itemLabel(g)]);
      })));
    }
    var actions = [];
    var z = h.puzzle && IDX.pz[h.puzzle];
    if (z && !has(z.id)) actions.push({ label: "Work it out", k: "open-puzzle", primary: true, fn: function () { openPuzzle(z.id); } });
    got.forEach(function (g) { if (IDX.ev[g]) actions.push({ label: "Read " + itemLabel(g), k: "obs-read-" + g, fn: function () { openDoc(g); } }); });
    actions.push({ label: "Close", k: "modal-ok", fn: closeModal, primary: !actions.length });
    openModal({ title: str(h.label, "A closer look"), body: body, actions: actions });
  }

  function openPuzzle(pzId) {
    var z = IDX.pz[pzId]; if (!z) return;
    var input = el("input", { class: "input", type: "text", id: "puzzle-input", k: "puzzle-input", autocomplete: "off", autocapitalize: "off", spellcheck: "false" });
    var msg = el("p", { class: "puzzle__msg", "aria-live": "polite" });
    var submit = function (e) {
      if (e) e.preventDefault();
      var norm = function (s) { return String(s || "").toLowerCase().replace(/\s+/g, ""); };
      if (!norm(input.value)) { msg.textContent = "Enter an answer first."; return; }
      if (norm(input.value) === norm(z.answer)) {
        setFlag(z.id);
        logEntry("event", "Puzzle solved", z.prompt);
        grant(z.grants, true);
        closeModal();
        toast("Solved.", "unlock");
        commit();
        var got = arr(z.grants).filter(function (g) { return IDX.ev[g]; });
        if (got.length) setTimeout(function () { if (!S.event) openDoc(got[0]); }, 50);
      } else {
        msg.textContent = "That doesn't open it. No time lost; look again at what you've found.";
        input.select();
      }
    };
    var form = el("form", { class: "puzzle", onsubmit: submit }, [
      el("p", { class: "prose" }, str(z.prompt, "Work it out.")),
      el("label", { class: "label", for: "puzzle-input" }, "Your answer"),
      input, msg
    ]);
    openModal({ title: "Puzzle", body: form, actions: [
      { label: "Try it", k: "puzzle-submit", primary: true, fn: submit },
      { label: "Not now", k: "modal-ok", fn: closeModal }
    ] });
    setTimeout(function () { input.focus(); }, 30);
  }

  function ask(qId) {
    var q = IDX.q[qId], p = IDX.qPerson[qId];
    if (!q || !p || has(q.id) || !personAvailable(p) || p.locationId !== S.loc) return;
    spend(typeof q.minutes === "number" ? q.minutes : COST.ask);
    setFlag(q.id);
    (S.history[p.id] = S.history[p.id] || []).push({ t: S.t, q: q.q, a: q.a, cue: q.cue || "" });
    logEntry("statement", p.name, "Q: " + str(q.q) + "\nA: " + str(q.a), q.cue);
    grant(q.grants);
    commit();
    focusKey("conv-last");
  }

  function present(personId, itemId) {
    var p = IDX.person[personId]; if (!p) return;
    closeModal();
    var keyP = personId + "|" + itemId;
    var pr = null;
    p.presentations.forEach(function (x) { if (x.item === itemId && reqMet(x.requires)) pr = x; }); // last match wins
    var which = pr ? pr.id : "default";
    var again = S.presented[keyP] === which;
    if (!again) spend(typeof (pr && pr.minutes) === "number" ? pr.minutes : COST.present);
    S.presented[keyP] = which;
    var a = pr ? str(pr.a) : str(p.defaultPresentation, "Nothing. A shrug.");
    var cue = pr ? str(pr.cue) : "";
    (S.history[p.id] = S.history[p.id] || []).push({ t: S.t, q: "You show: " + itemLabel(itemId) + (again ? " (again)" : ""), a: a, cue: cue, shown: true });
    if (!again) logEntry("statement", p.name, "Shown: " + itemLabel(itemId) + "\nA: " + a, cue);
    if (pr) { setFlag(pr.id); grant(pr.grants); }
    commit();
    focusKey("conv-last");
  }

  function connect() {
    var sel = S.ui.boardSel;
    if (sel.length !== 2) return;
    var a = sel[0], b = sel[1];
    var pairKey = [a, b].sort().join("+");
    var d = null;
    C.deductions.forEach(function (x) {
      var it = arr(x.items);
      if (!d && it.length === 2 && ((it[0] === a && it[1] === b) || (it[0] === b && it[1] === a)) && reqMet(x.requires)) d = x;
    });
    if (d && has(d.id)) {
      S.ui.boardResult = { ok: true, id: d.id, again: true };
    } else if (d) {
      spend(COST.connect);
      setFlag(d.id);
      logEntry("deduction", str(d.title, "Deduction"), d.text);
      grant(d.grants);
      if (d.key) stamp(str(d.title, d.id));
      S.ui.boardResult = { ok: true, id: d.id };
    } else {
      var again = !!S.tried[pairKey];
      if (!again) spend(COST.connect);
      S.tried[pairKey] = true;
      S.ui.boardResult = { ok: false, again: again, a: a, b: b };
    }
    S.ui.boardSel = [];
    commit();
    focusKey("board-result");
  }

  function sendRequest(rqId) {
    var r = IDX.rq[rqId];
    if (!r || S.requested[rqId] || !reqMet(r.requires)) return;
    S.requested[rqId] = S.t;
    var delay = typeof r.delayMinutes === "number" ? r.delayMinutes : 60;
    S.pending.push({ id: rqId, due: S.t + delay });
    S.theo.push({ t: S.t, from: "julian", text: str(r.label, rqId) });
    S.theo.push({ t: S.t, from: "theo", text: "On it. Give me about " + durationText(delay) + "." });
    logEntry("event", "Request to Theo", r.label);
    commit();
  }
  function durationText(m) {
    if (m < 60) return m + " minutes";
    var h = Math.floor(m / 60), r = m % 60;
    return (h === 1 ? "an hour" : h + " hours") + (r ? " and " + r + " minutes" : "");
  }

  function waitButtons(k) {
    return el("div", { class: "scene__wait" }, [
      btn("Wait 30 minutes", "wait" + k, wait, "btn--sm"),
      btn("Wait until morning", "wait-morning" + k, waitMorning, "btn--sm btn--ghost"),
      k ? null : el("span", { class: "muted" }, "Let the clock run while Theo works or someone arrives.")
    ]);
  }
  function wait() {
    if (S.loc !== hqId()) return;
    spend(COST.wait);
    logEntry("event", "Waited", "Thirty minutes at headquarters.");
    commit();
  }

  /* 07:00 the next day; in the small hours (before 05:00) that means 07:00 the same calendar day. */
  function nextMorning(t) {
    var seven = (dayOf(t) - 1) * 1440 + 7 * 60;
    return (t % 1440) < 5 * 60 ? seven : seven + 1440;
  }
  /* Jump to the next 07:00, stopping at each Theo result and the twist time on the way, in order. */
  function waitMorning() {
    if (S.loc !== hqId()) return;
    var target = nextMorning(S.t);
    var stops = S.pending.map(function (p) { return p.due; });
    var tw = C.twist;
    if (tw && tw.id && !has(tw.id) && tw.orAfter && tw.orAfter.time) stops.push(absT(tw.orAfter.day || 1, tw.orAfter.time));
    stops = stops.filter(function (x) { return x > S.t && x < target; }).sort(function (a, b) { return a - b; });
    stops.forEach(function (x) { S.t = x; settle(false); });
    S.t = target;
    logEntry("event", "Waited", "Overnight at headquarters, until " + fmtT(target) + ".");
    commit();
  }

  function askHint() {
    if (tokensLeft() <= 0) return;
    var relevant = C.hints.filter(function (h) {
      var until = arr(h.until);
      var retired = until.length > 0 && until.every(function (u) { return has(u) || !!S.requested[u]; });
      return reqMet(h.requires) && !retired;
    });
    var fresh = relevant.filter(function (h) { return S.hintsShown.indexOf(h.id) === -1; });
    var pick = fresh[0];
    if (!pick) {
      var again = relevant[0];
      showHintModal(again ? "Lena repeats herself, for free: “" + again.text + "”" : "Lena shrugs. “Nothing to add. Read your notebook again; it's all there.” (No token spent.)");
      return;
    }
    S.hintsSpent++;
    S.hintsShown.push(pick.id);
    logEntry("event", "Hint from Lena", pick.text);
    commit();
    showHintModal("“" + str(pick.text) + "”");
  }

  /* ------------------------------------------------------------------ solving */
  function proofOptions() {
    var out = [];
    C.evidence.forEach(function (e) { if (has(e.id)) out.push(e.id); });
    C.deductions.forEach(function (d) { if (has(d.id)) out.push(d.id); });
    return out;
  }
  function proofsRequired() { return Math.min(3, Math.max(1, proofOptions().length)); }
  function fileCharge() {
    var s = S.solve, sol = C.solution;
    var picks = s.proofs.filter(function (p) { return has(p); });
    var hits = picks.filter(function (p) { return sol.proofs.indexOf(p) !== -1; }).length;
    var ok = s.suspect === sol.killer && s.motive === sol.motive && s.method === sol.method && hits >= sol.proofsNeeded;
    logEntry("event", "Charge filed", itemLabel(s.suspect));
    S.solve.review = false;
    if (ok) { S.status = "confession"; S.solvedT = S.t; }
    else { S.status = "consequence"; S.failures++; }
    save(); render();
    window.scrollTo(0, 0);
  }
  function reopenCase() {
    var notes = S.notes, n = (S.reopened || 0) + 1, fails = S.failures;
    S = freshState(n, notes);
    S.failures = fails;
    S.status = "reopen";
    settle(true); save(); render();
  }

  /* ------------------------------------------------------------------ modal */
  var modalOpener = null;
  function openModal(o) {
    closeModal(true);
    var root = document.getElementById("modal-root");
    if (!root) return;
    modalOpener = document.activeElement;
    var titleId = "modal-title";
    var dlg = el("div", { class: "modal" + (o.wide ? " modal--wide" : ""), role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, tabindex: "-1" }, [
      el("div", { class: "modal__head" }, [
        el("h2", { class: "modal__title display", id: titleId }, o.title || ""),
        el("button", { class: "icon-btn", type: "button", "aria-label": "Close", k: "modal-close", onclick: function () { closeModal(); } }, "×")
      ]),
      el("div", { class: "modal__body" }, o.body),
      o.actions && o.actions.length ? el("div", { class: "modal__actions" }, o.actions.map(function (a, i) {
        return btn(a.label, a.k || ("modal-act-" + i), a.fn, a.primary ? "btn--primary" : "", a.disabled ? { disabled: true } : null);
      })) : null
    ]);
    var back = el("div", { class: "modal-back", onclick: function (e) { if (e.target === back) closeModal(); } }, dlg);
    root.appendChild(back);
    document.body.classList.add("has-modal");
    setTimeout(function () {
      var f = dlg.querySelector("input, textarea, .modal__actions .btn--primary, .modal__actions button, button");
      (f || dlg).focus();
    }, 10);
  }
  function closeModal(silent) {
    var root = document.getElementById("modal-root");
    if (!root || !root.firstChild) return;
    root.innerHTML = "";
    document.body.classList.remove("has-modal");
    if (!silent && modalOpener && document.body.contains(modalOpener)) { try { modalOpener.focus(); } catch (e) { /* ignore */ } }
    modalOpener = null;
  }
  function trapFocus(e, container) {
    var f = container.querySelectorAll("button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex='-1'])");
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener("keydown", function (e) {
    var ev = document.querySelector(".event-card");
    var m = document.querySelector("#modal-root .modal");
    if (e.key === "Escape" && m && !ev) { closeModal(); return; }
    if (e.key === "Tab") { if (ev) trapFocus(e, ev); else if (m) trapFocus(e, m); }
    if (S && screenOverride !== "title" && S.status === "intro" && !m && (e.key === "ArrowRight")) { nextSlide(); }
  });

  function focusKey(k, noScroll) {
    setTimeout(function () {
      if (document.querySelector("#modal-root .modal") || document.querySelector(".event-card")) return;
      var n = document.querySelector("[data-k='" + k + "']");
      if (n) { try { n.focus({ preventScroll: !!noScroll }); } catch (e) { n.focus(); } }
    }, 20);
  }

  /* ------------------------------------------------------------------ documents */
  var KIND_LABEL = {
    photo: "Photo", object: "Object", report: "Report", statement: "Statement", receipt: "Receipt",
    "phone-log": "Phone log", messages: "Messages", bank: "Bank", camera: "Camera log", note: "Note",
    letter: "Letter", autopsy: "Autopsy", map: "Map", fact: "Fact", deduction: "Deduction", person: "Person", evidence: "Evidence", other: "Item"
  };
  function kindLabel(k) { return KIND_LABEL[k] || "Document"; }

  function metaBlock(meta, cls) {
    meta = arr(meta).filter(function (m) { return Array.isArray(m) && m.length; });
    if (!meta.length) return null;
    return el("dl", { class: "doc__meta " + (cls || "") }, meta.map(function (m) {
      return el("div", { class: "doc__metarow" }, [el("dt", null, String(m[0])), el("dd", null, m.length > 1 ? String(m[1]) : "")]);
    }));
  }
  function tableBlock(tb, cls) {
    if (!tb || !arr(tb.rows).length) return null;
    var cols = arr(tb.cols);
    return el("div", { class: "doc__tablewrap" }, el("table", { class: "doc__table " + (cls || "") }, [
      cols.length ? el("thead", null, el("tr", null, cols.map(function (c) { return el("th", { scope: "col" }, String(c)); }))) : null,
      el("tbody", null, arr(tb.rows).map(function (r) { return el("tr", null, arr(r).map(function (c) { return el("td", null, String(c)); })); }))
    ]));
  }
  function textBlock(t, cls) { return t ? el("div", { class: "doc__text " + (cls || "") }, String(t)) : null; }

  function renderDoc(ev) {
    var d = ev.doc || {};
    var kind = d.kind || "object";
    var title = str(d.title, str(ev.name, "Untitled"));
    var wrap = el("article", { class: "doc doc--" + kind, "aria-label": title });
    var police = el("div", { class: "doc__letterhead" }, [el("span", { class: "doc__crest", "aria-hidden": "true" }, "★"), "Port Halden Police Department · Major Crimes Unit"]);
    switch (kind) {
      case "report": case "statement": case "autopsy":
        append(wrap, [
          kind === "autopsy" ? el("div", { class: "doc__letterhead" }, "Port Halden Office of the Coroner") : police,
          el("h3", { class: "doc__title" }, title),
          el("div", { class: "doc__formline" }, kind === "statement" ? "WITNESS STATEMENT — FORM MCU-11" : kind === "autopsy" ? "POST-MORTEM EXAMINATION — PRELIMINARY" : "INCIDENT / OCCURRENCE REPORT"),
          metaBlock(d.meta), tableBlock(d.table), textBlock(d.text),
          kind === "statement" ? el("div", { class: "doc__sign" }, "Signed: ______________________") : null,
          el("div", { class: "doc__footer" }, "CONFIDENTIAL · " + ev.id.toUpperCase())
        ]);
        break;
      case "receipt": {
        var rows = d.table ? arr(d.table.rows) : [];
        append(wrap, el("div", { class: "receipt" }, [
          el("div", { class: "receipt__shop" }, title),
          el("div", { class: "receipt__rule" }, "- - - - - - - - - - - - - - - -"),
          metaBlock(d.meta, "receipt__meta"),
          rows.length ? el("div", { class: "receipt__rule" }, "- - - - - - - - - - - - - - - -") : null,
          rows.length ? el("div", { class: "receipt__items" }, rows.map(function (r) {
            r = arr(r);
            var total = /total/i.test(String(r[0] || ""));
            return el("div", { class: "receipt__line" + (total ? " receipt__line--total" : "") }, [
              el("span", null, String(r[0] || "")), el("span", null, r.length > 1 ? String(r[r.length - 1]) : "")]);
          })) : null,
          textBlock(d.text, "receipt__text"),
          el("div", { class: "receipt__rule" }, "- - - - - - - - - - - - - - - -"),
          el("div", { class: "receipt__thanks" }, "THANK YOU · PLEASE COME AGAIN")
        ]));
        break;
      }
      case "messages": {
        var tb = d.table || {}, cols = arr(tb.cols).map(function (c) { return String(c).toLowerCase(); });
        var ci = function (names, fb) { for (var i = 0; i < cols.length; i++) if (names.indexOf(cols[i]) !== -1) return i; return fb; };
        var iT = ci(["time", "date", "sent"], 0), iF = ci(["from", "sender", "who", "name"], 1), iM = ci(["message", "text", "body"], -1);
        var msgs = arr(tb.rows).map(function (r) { r = arr(r); return { time: r[iT], from: r[iF], text: iM >= 0 ? r[iM] : r[r.length - 1] }; });
        if (!msgs.length && d.text) {
          msgs = String(d.text).split("\n").filter(Boolean).map(function (line) {
            var m = /^\s*([^:]{1,40}?)(?:\s*\(([^)]*)\))?\s*:\s*(.*)$/.exec(line);
            return m ? { from: m[1], time: m[2] || "", text: m[3] } : { from: "", time: "", text: line };
          });
        }
        /* Whose phone is it? doc.me if given; else a sender named as "<Name>'s" in the title or meta; else the first sender. */
        var me = d.me;
        if (!me) {
          var hay = (str(d.title) + " " + arr(d.meta).map(function (m) { return arr(m).join(" "); }).join(" ")).toLowerCase();
          var senders = [];
          msgs.forEach(function (m) { if (m.from && senders.indexOf(String(m.from)) === -1) senders.push(String(m.from)); });
          senders.forEach(function (n) {
            if (me) return;
            var first = n.toLowerCase().split(/\s+/)[0];
            if (hay.indexOf(n.toLowerCase() + "'s") !== -1 || new RegExp("\\b" + first.replace(/[^a-z0-9]/g, "") + "\\b[^,;:]*'s (phone|mobile|messages)").test(hay)) me = n;
          });
          if (!me) me = msgs[0] && msgs[0].from;
        }
        append(wrap, [
          el("div", { class: "phone" }, [
            el("div", { class: "phone__bar" }, [el("span", { class: "phone__dot", "aria-hidden": "true" }), title]),
            metaBlock(d.meta, "phone__meta"),
            el("ol", { class: "chat" }, msgs.map(function (m) {
              var mine = m.from && me && String(m.from) === String(me);
              return el("li", { class: "bubble " + (mine ? "bubble--me" : "bubble--them") }, [
                el("span", { class: "bubble__from" }, String(m.from || "")),
                el("span", { class: "bubble__text" }, String(m.text || "")),
                m.time ? el("span", { class: "bubble__time" }, String(m.time)) : null
              ]);
            })),
            msgs.length && d.table && d.text ? textBlock(d.text, "phone__note") : null
          ])
        ]);
        break;
      }
      case "phone-log": case "bank": case "camera":
        append(wrap, [
          el("div", { class: "doc__printhead" }, kind === "bank" ? "STATEMENT OF ACCOUNT" : kind === "camera" ? "CCTV EXPORT · MOTION EVENTS" : "SUBSCRIBER CALL DETAIL RECORD"),
          el("h3", { class: "doc__title" }, title),
          metaBlock(d.meta), tableBlock(d.table, "doc__table--print"), textBlock(d.text),
          el("div", { class: "doc__footer" }, kind === "camera" ? "Exported by T. Park, MCU Digital" : kind === "bank" ? "Obtained under production order" : "Provided by network operator under warrant")
        ]);
        break;
      case "note":
        append(wrap, el("div", { class: "note" }, [
          d.title ? el("div", { class: "note__title" }, title) : null,
          textBlock(d.text, "note__text"), metaBlock(d.meta), tableBlock(d.table)
        ]));
        break;
      case "letter":
        append(wrap, el("div", { class: "letter" }, [
          el("h3", { class: "letter__title" }, title), metaBlock(d.meta), textBlock(d.text, "letter__text"), tableBlock(d.table)
        ]));
        break;
      default: { /* photo, object, map, unknown */
        var art = d.art ? anyArt(d.art) : null;
        append(wrap, el("div", { class: "evcard evcard--" + kind }, [
          el("div", { class: "evcard__frame" }, art ? artBox(art, "evcard__art", false, title) : el("div", { class: "evcard__blank", "aria-hidden": "true" }, [
            el("span", { class: "evcard__icon" }, kind === "photo" ? "▣" : kind === "map" ? "⌖" : "◈")
          ])),
          el("div", { class: "evcard__tag" }, [el("span", null, kind === "photo" ? "PHOTOGRAPH" : kind === "map" ? "MAP" : "EVIDENCE"), el("span", null, ev.id.toUpperCase())]),
          el("h3", { class: "evcard__title" }, title),
          metaBlock(d.meta), tableBlock(d.table), textBlock(d.text, "evcard__text")
        ]));
      }
    }
    return wrap;
  }

  function openDoc(id) {
    var ev = IDX.ev[id]; if (!ev) return;
    if (S.newItems[id]) { delete S.newItems[id]; save(); render(); }
    var list = C.evidence.filter(function (e) { return has(e.id); });
    var i = list.indexOf(ev);
    var actions = [];
    if (i > 0) actions.push({ label: "← Previous", k: "doc-prev", fn: function () { openDoc(list[i - 1].id); } });
    if (i >= 0 && i < list.length - 1) actions.push({ label: "Next →", k: "doc-next", fn: function () { openDoc(list[i + 1].id); } });
    actions.push({ label: "Close", k: "modal-ok", primary: true, fn: closeModal });
    openModal({ title: str(ev.name, id), wide: true, body: el("div", { class: "docview" }, [
      ev.key ? el("p", { class: "docview__key" }, "Key lead") : null,
      el("p", { class: "docview__summary" }, str(ev.summary)),
      renderDoc(ev)
    ]), actions: actions });
  }

  function caseFileNode() {
    var v = C.victim || {};
    var fields = [["Name", v.name], ["Age", v.age], ["Occupation", v.occupation], ["Found at", v.foundAt], ["Found by", v.foundBy], ["Time of death", v.timeOfDeath], ["Cause of death", v.causeOfDeath]]
      .filter(function (f) { return f[1] !== undefined && f[1] !== null && f[1] !== ""; });
    return el("div", { class: "casefile" }, [
      el("section", { class: "casefile__brief doc doc--report" }, [
        el("div", { class: "doc__letterhead" }, "Port Halden Police Department · Major Crimes Unit"),
        el("h3", { class: "doc__title" }, "Briefing"),
        textBlock(str(C.briefing, "No briefing on file.")),
        el("div", { class: "doc__sign" }, "— DS Lena Cruz")
      ]),
      el("section", { class: "casefile__victim" }, [
        el("div", { class: "casefile__photo" }, artBox(artString("portraits", v.portrait || v.id), "portrait", true, v.name ? "Photo of " + v.name : null)),
        el("div", { class: "casefile__vinfo" }, [
          el("h3", { class: "casefile__vhead" }, "Victim profile"),
          el("p", { class: "casefile__vname" }, str(v.name, "Unknown")),
          el("p", { class: "casefile__vsub" }, [v.age ? String(v.age) : "", v.age && v.occupation ? " \u00b7 " : "", str(v.occupation)])
        ]),
        el("dl", { class: "doc__meta casefile__vmeta" }, fields.filter(function (f) { return ["Name", "Age", "Occupation"].indexOf(f[0]) === -1; }).map(function (f) { return el("div", { class: "doc__metarow" }, [el("dt", null, f[0]), el("dd", null, String(f[1]))]); })),
        v.bio ? el("p", { class: "prose casefile__bio" }, v.bio) : null
      ])
    ]);
  }

  /* ------------------------------------------------------------------ screens */
  function render() {
    var keepScroll = {};
    document.querySelectorAll("[data-scroll]").forEach(function (n) { keepScroll[n.getAttribute("data-scroll")] = n.scrollTop; });
    var active = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute("data-k");
    app.innerHTML = "";
    var st = S ? S.status : "title";
    var screenKey = screenOverride === "title" || !S ? "title" : st;
    if (render.last !== screenKey) { render.last = screenKey; keepScroll = {}; try { window.scrollTo(0, 0); } catch (e) { /* ignore */ } }
    document.body.setAttribute("data-screen", st);
    if (screenOverride === "title" || !S) renderTitle();
    else if (st === "intro") renderIntro();
    else if (st === "casefile") renderCaseFile();
    else if (st === "reopen") renderReopen();
    else if (st === "play") renderMain();
    else if (st === "confession" || st === "consequence") renderEnding();
    else if (st === "solved") renderDebrief();
    else if (st === "failed") renderFailed();
    else renderTitle();
    renderEvent();
    document.querySelectorAll("[data-scroll]").forEach(function (n) { var k = n.getAttribute("data-scroll"); if (keepScroll[k]) n.scrollTop = keepScroll[k]; });
    if (active && !document.querySelector("#modal-root .modal")) {
      var n = document.querySelector("[data-k='" + active + "']");
      if (n) { try { n.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }
  }
  var screenOverride = "title";

  function renderTitle() {
    document.body.setAttribute("data-screen", "title");
    var saved = loadSave();
    var confirmRestart = renderTitle.confirm;
    var buttons;
    if (confirmRestart) {
      buttons = el("div", { class: "title__confirm", role: "group", "aria-label": "Confirm restart" }, [
        el("p", null, "Erase your saved progress and start the case again?"),
        el("div", { class: "row" }, [
          btn("Yes, start over", "restart-yes", function () { renderTitle.confirm = false; clearSave(); startNew(); }, "btn--danger"),
          btn("Keep my case", "restart-no", function () { renderTitle.confirm = false; render(); focusKey("continue"); })
        ])
      ]);
    } else if (saved) {
      buttons = el("div", { class: "title__buttons" }, [
        btn("Continue", "continue", function () { S = saved; C = buildCase(S.reopened > 0); buildIndex(); settle(true); screenOverride = null; save(); render(); }, "btn--primary btn--lg"),
        btn("Restart", "restart", function () { renderTitle.confirm = true; render(); focusKey("restart-no"); }, "btn--lg")
      ]);
    } else {
      buttons = el("div", { class: "title__buttons" }, [btn("Start", "start", startNew, "btn--primary btn--lg")]);
    }
    var label = RAW.chapter || RAW.number ? "Chapter " + (RAW.chapter || 1) + " · Case " + (RAW.number || 1) : "";
    app.appendChild(el("main", { class: "screen title" }, [
      el("div", { class: "title__fog", "aria-hidden": "true" }),
      el("div", { class: "title__inner" }, [
        el("p", { class: "title__kicker" }, "Port Halden Police Department · Consultant files"),
        el("h1", { class: "title__game display" }, "Cold Read"),
        el("div", { class: "title__rule", "aria-hidden": "true" }),
        label ? el("p", { class: "title__label" }, label) : null,
        el("h2", { class: "title__case display" }, str(RAW.title, "Untitled case")),
        RAW.tagline ? el("p", { class: "title__tagline" }, RAW.tagline) : null,
        saved && !confirmRestart ? el("p", { class: "title__save" }, saveSummary(saved)) : null,
        buttons,
        el("p", { class: "title__rating" }, "Rated 16+. Contains depictions of death.")
      ])
    ]));
  }
  function saveSummary(s) {
    var st = { intro: "Opening", casefile: "Case file", reopen: "Case reopened", play: "Investigating", confession: "Charged", consequence: "Charged", solved: "Case closed", failed: "Case failed" }[s.status] || "In progress";
    return "Saved: " + st + " · " + fmtT(s.t) + (s.reopened ? " · Reopened" : "");
  }
  function startNew() {
    S = freshState(0, "");
    settle(true);
    screenOverride = null;
    if (!C.intro.length) S.status = "casefile";
    save(); render();
  }

  function nextSlide() {
    if (S.introIdx < C.intro.length - 1) { S.introIdx++; save(); render(); focusKey("intro-next"); }
    else { S.status = "casefile"; save(); render(); focusKey("begin", true); }
  }
  function renderIntro() {
    var i = Math.min(S.introIdx, Math.max(0, C.intro.length - 1));
    var sl = C.intro[i] || {};
    var last = i >= C.intro.length - 1;
    app.appendChild(el("main", { class: "screen intro" }, [
      el("div", { class: "intro__stage", onclick: function (e) { if (!e.target.closest("button")) nextSlide(); } }, [
        el("div", { class: "intro__art" + (reduceMotion ? "" : " kenburns") }, artBox(artString("intro", sl.art), "intro__svg", false, null)),
        el("div", { class: "intro__caption", "aria-live": "polite" }, [
          el("p", { class: "intro__text" }, str(sl.caption)),
          el("div", { class: "intro__controls" }, [
            el("div", { class: "dots", "aria-label": "Slide " + (i + 1) + " of " + C.intro.length }, C.intro.map(function (_, j) { return el("span", { class: "dot" + (j === i ? " is-on" : "") }); })),
            btn(last ? "Open the case file" : "Next", "intro-next", nextSlide, "btn--primary")
          ])
        ])
      ]),
      btn("Skip intro", "intro-skip", function () { S.status = "casefile"; save(); render(); focusKey("begin", true); }, "btn--ghost intro__skip")
    ]));
  }

  function renderCaseFile() {
    app.appendChild(el("main", { class: "screen cf" }, [
      el("div", { class: "cf__folder" }, [
        el("div", { class: "cf__tab" }, "Case file " + str(RAW.id).toUpperCase()),
        el("h1", { class: "cf__title display" }, str(C.title, "Untitled case")),
        C.tagline ? el("p", { class: "cf__tagline" }, C.tagline) : null,
        caseFileNode(),
        el("div", { class: "cf__actions" }, [btn("Begin the investigation", "begin", function () { S.status = "play"; S.ui.stage = "scene"; S.ui.mobile = "scene"; logEntry("event", "Investigation opened", str(C.title)); commit(); }, "btn--primary btn--lg")])
      ])
    ]));
  }

  function renderReopen() {
    app.appendChild(el("main", { class: "screen reopen" }, [
      el("div", { class: "reopen__card" }, [
        el("div", { class: "big-stamp big-stamp--amber", "aria-hidden": "true" }, "Reopened"),
        el("h1", { class: "display" }, str(C.title)),
        el("p", { class: "prose reopen__text" }, str(C.reopen && C.reopen.intro, "The case is open again. Same victim. Look harder.")),
        btn("Read the case file", "reopen-continue", function () { S.status = "casefile"; save(); render(); focusKey("begin", true); }, "btn--primary btn--lg")
      ])
    ]));
  }

  /* ---------- main case screen */
  var SECTIONS = [
    { id: "map", label: "Map", where: "stage", icon: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15" },
    { id: "scene", label: "Scene", where: "stage", icon: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M16 16l5 5" },
    { id: "people", label: "People", where: "panel", icon: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-4 3-6 7-6s7 2 7 6 M17 11a3 3 0 1 0 0-6 M22 20c0-3-2-5-5-5" },
    { id: "evidence", label: "Evidence", short: "Files", where: "panel", icon: "M3 7h7l2 2h9v11H3z M3 7V4h7l2 3" },
    { id: "board", label: "Board", where: "panel", icon: "M3 3h18v18H3z M7 8h4 M7 15h3 M14 7l3 9" },
    { id: "notebook", label: "Notebook", short: "Notes", where: "panel", icon: "M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4 M4 6h2 M4 11h2 M4 16h2" },
    { id: "theo", label: "Theo", where: "panel", icon: "M7 2h10v20H7z M11 18h2" },
    { id: "solve", label: "Solve", where: "panel", icon: "M5 21V4 M5 4h12l-2 4 2 4H5" }
  ];
  function icon(d) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true"); s.setAttribute("class", "ico");
    var p = document.createElementNS(ns, "path"); p.setAttribute("d", d); s.appendChild(p);
    return s;
  }
  function badgeFor(id) {
    if (id === "evidence") { var n = Object.keys(S.newItems).filter(function (k) { return has(k); }).length; return n || 0; }
    if (id === "theo") return S.theoUnread || 0;
    return 0;
  }
  function goSection(id) {
    var sec = SECTIONS.filter(function (s) { return s.id === id; })[0]; if (!sec) return;
    if (sec.where === "stage") S.ui.stage = id; else S.ui.panel = id;
    S.ui.mobile = id;
    if (id === "theo") S.theoUnread = 0;
    save(); render();
    var isMobile = false; try { isMobile = window.matchMedia(MOBILE_QUERY).matches; } catch (e) { /* ignore */ }
    if (isMobile) window.scrollTo(0, 0);
  }

  function renderMain() {
    var loc = IDX.loc[S.loc] || {};
    var keys = keyItems(), found = keys.filter(has).length;
    var pct = keys.length ? Math.round(found / keys.length * 100) : 0;
    var tokens = tokensLeft();
    var mobileSec = SECTIONS.filter(function (s) { return s.id === S.ui.mobile; })[0] || SECTIONS[0];

    var top = el("header", { class: "topbar" }, [
      el("button", { class: "topbar__brand display", type: "button", k: "to-title", "aria-label": "Cold Read: back to title screen", onclick: function () { screenOverride = "title"; renderTitle.confirm = false; render(); } }, "Cold Read"),
      el("div", { class: "topbar__stats" }, [
        el("div", { class: "stat stat--clock", title: "In-game time" }, [el("span", { class: "stat__label" }, "Time"), el("span", { class: "stat__val mono", "aria-live": "polite" }, fmtT(S.t))]),
        el("div", { class: "stat stat--loc" }, [el("span", { class: "stat__label" }, "Location"), el("span", { class: "stat__val" }, str(loc.name, "Unknown"))]),
        el("div", { class: "stat stat--prog" }, [
          el("span", { class: "stat__label" }, "Case"),
          el("span", { class: "meter", role: "progressbar", "aria-label": "Case progress: key leads found", "aria-valuemin": "0", "aria-valuemax": String(keys.length), "aria-valuenow": String(found), "aria-valuetext": found + " of " + keys.length + " key leads" }, el("span", { class: "meter__fill", style: "width:" + pct + "%" })),
          el("span", { class: "stat__val mono" }, found + "/" + keys.length)
        ]),
        el("button", { class: "stat stat--hint", type: "button", k: "hint-open", onclick: function () { showHintModal(null); }, "aria-label": "Hints: " + tokens + " token" + (tokens === 1 ? "" : "s") }, [
          el("span", { class: "stat__label" }, "Hints"),
          el("span", { class: "tokens", "aria-hidden": "true" }, tokens ? Array.apply(null, Array(Math.min(tokens, 5))).map(function () { return el("span", { class: "token" }); }) : el("span", { class: "token token--empty" })),
          el("span", { class: "stat__val mono" }, String(tokens))
        ])
      ])
    ]);

    var stageBody = S.ui.stage === "scene" ? renderScene() : renderMap();
    var panelBody = ({ people: renderPeople, evidence: renderEvidence, board: renderBoard, notebook: renderNotebook, theo: renderTheo, solve: renderSolve }[S.ui.panel] || renderPeople)();
    var stageTabs = el("div", { class: "tabs tabs--stage", role: "tablist", "aria-label": "Investigation view" }, SECTIONS.filter(function (s) { return s.where === "stage"; }).map(tabBtn("stage")));
    var panelTabs = el("div", { class: "tabs tabs--panel", role: "tablist", "aria-label": "Case tools" }, SECTIONS.filter(function (s) { return s.where === "panel"; }).map(tabBtn("panel")));

    var main = el("div", { class: "main", "data-mobile": mobileSec.where }, [
      top,
      el("div", { class: "layout" }, [
        el("section", { class: "stage", "aria-label": "Map and scene" }, [stageTabs, el("div", { class: "stage__body", "data-scroll": "stage" }, stageBody)]),
        el("aside", { class: "panel", "aria-label": "Case tools" }, [panelTabs, el("div", { class: "panel__body", "data-scroll": "panel", id: "panel-body" }, panelBody)])
      ]),
      el("nav", { class: "tabbar", "aria-label": "Sections" }, SECTIONS.map(function (s) {
        var on = S.ui.mobile === s.id, b = badgeFor(s.id);
        return el("button", { class: "tabbar__btn" + (on ? " is-on" : ""), type: "button", k: "mtab-" + s.id, "aria-current": on ? "page" : null, onclick: function () { goSection(s.id); } }, [
          icon(s.icon), el("span", { class: "tabbar__label" }, s.short || s.label), b ? el("span", { class: "badge", "aria-label": b + " new" }, String(b)) : null
        ]);
      }))
    ]);
    app.appendChild(main);
  }
  function tabBtn(where) {
    return function (s) {
      var on = S.ui[where] === s.id, b = badgeFor(s.id);
      return el("button", { class: "tab" + (on ? " is-on" : ""), role: "tab", type: "button", "aria-selected": on ? "true" : "false", k: "tab-" + s.id, onclick: function () { goSection(s.id); } }, [
        icon(s.icon), el("span", null, s.label), b ? el("span", { class: "badge", "aria-label": b + " new" }, String(b)) : null
      ]);
    };
  }
  function sectionHead(title, sub) {
    return el("div", { class: "sec-head" }, [el("h2", { class: "sec-head__title display", tabindex: "-1", k: "sec-" + title.toLowerCase() }, title), sub ? el("p", { class: "sec-head__sub" }, sub) : null]);
  }

  /* ---------- map */
  function renderMap() {
    var locs = C.locations.filter(locUnlocked);
    var wrap = el("div", { class: "map" }, [
      sectionHead("Map", "Port Halden. Travelling takes time."),
      el("div", { class: "map__frame" }, [
        artBox(typeof ART.map === "string" && ART.map.indexOf("<svg") !== -1 ? ART.map : null, "map__art", false, "Map of Port Halden"),
        el("div", { class: "map__pins" }, locs.map(function (l) {
          var here = l.id === S.loc, m = l.map || { x: 500, y: 300 };
          var lx = Math.max(0, Math.min(1000, m.x || 0)), ly = Math.max(0, Math.min(600, m.y || 0));
          return el("button", { class: "pin" + (here ? " pin--here" : "") + (lx > 760 ? " pin--left" : ""), type: "button", k: "pin-" + l.id, style: "left:" + (lx / 10) + "%;top:" + (ly / 6) + "%",
            "aria-label": here ? str(l.name) + " (you are here)" : "Travel to " + str(l.name) + ", " + travelCost(l) + " minutes",
            onclick: function () { if (here) goSection("scene"); else travel(l.id); } }, [
            el("span", { class: "pin__dot", "aria-hidden": "true" }), el("span", { class: "pin__label" }, str(l.name))
          ]);
        }))
      ]),
      el("ul", { class: "loclist" }, locs.map(function (l) {
        var here = l.id === S.loc;
        return el("li", { class: "loc" + (here ? " loc--here" : "") }, [
          el("div", { class: "loc__info" }, [el("span", { class: "loc__name" }, str(l.name)), el("span", { class: "loc__district" }, str(l.district, ""))]),
          here ? btn("You are here", "travel-" + l.id, function () { goSection("scene"); }, "btn--ghost btn--sm")
               : btn("Travel · " + travelCost(l) + " min", "travel-" + l.id, function () { travel(l.id); }, "btn--sm")
        ]);
      }))
    ]);
    return wrap;
  }
  function travelCost(l) { return typeof l.travelMinutes === "number" ? l.travelMinutes : COST.travel; }

  /* ---------- scene */
  function renderScene() {
    var l = IDX.loc[S.loc];
    if (!l) return el("p", null, "Nowhere to look.");
    var visible = l.hotspots.filter(hsVisible);
    if (!S.visited[l.id]) { S.visited[l.id] = true; S.seenHs[l.id] = visible.map(function (h) { return h.id; }); save(); }
    var newIds = (S.hsNew && S.hsNew[l.id]) || [];
    var newOnes = visible.filter(function (h) { return newIds.indexOf(h.id) !== -1 && !has(h.id); });
    var here = C.people.filter(function (p) { return p.locationId === l.id && personAppeared(p); });
    var isHQ = l.id === hqId();
    var done = visible.filter(function (h) { return has(h.id); });

    return el("div", { class: "scene" }, [
      el("div", { class: "scene__head" }, [
        el("h2", { class: "scene__title display", tabindex: "-1", k: "scene-title" }, str(l.name)),
        el("span", { class: "scene__district" }, str(l.district))
      ]),
      el("p", { class: "scene__desc prose" }, str(l.description)),
      newOnes.length ? el("p", { class: "notice", role: "status" }, newOnes.length === 1 ? "Something here looks different now." : "A few things here look different now.") : null,
      el("div", { class: "scene__frame" }, [
        artBox(artString("scenes", l.art), "scene__art", false, str(l.name)),
        el("div", { class: "scene__hotspots" }, visible.map(function (h) {
          var ex = has(h.id), r = h.r || 40;
          var hx = Math.max(0, Math.min(1000, h.x || 0)), hy = Math.max(0, Math.min(600, h.y || 0));
          var pz = h.puzzle && IDX.pz[h.puzzle] && !has(h.puzzle);
          return el("button", {
            class: "hs" + (ex ? " hs--done" : "") + (pz && ex ? " hs--puzzle" : "") + (newOnes.indexOf(h) !== -1 ? " hs--new" : ""),
            type: "button", k: "hs-" + h.id,
            style: "left:" + (hx / 10) + "%;top:" + (hy / 6) + "%;width:" + (2 * r / 10) + "%;height:" + (2 * r / 6) + "%",
            "aria-label": ex ? str(h.label, "Examined") + (pz ? " (unsolved)" : "") : "Something worth a closer look",
            onclick: function () { examine(h.id); }
          }, [el("span", { class: "hs__ring", "aria-hidden": "true" }), ex ? el("span", { class: "hs__label" + (hx > 780 ? " hs__label--left" : "") }, str(h.label)) : null]);
        }))
      ]),
      el("p", { class: "scene__help" }, visible.length ? (done.length + " of " + visible.length + " things examined here. Look for faint marks and tap anything that seems worth a closer look.") : "Nothing here to examine."),
      done.length ? el("div", { class: "scene__found" }, [
        el("h3", { class: "minihead" }, "Examined"),
        el("ul", { class: "chips" }, done.map(function (h) { return el("li", null, btn(str(h.label, "Observation") + (h.puzzle && !has(h.puzzle) ? " · unsolved" : ""), "found-" + h.id, function () { examine(h.id); }, "chip")); }))
      ]) : null,
      here.length ? el("div", { class: "scene__people" }, [
        el("h3", { class: "minihead" }, "People here"),
        el("ul", { class: "chips" }, here.map(function (p) {
          var av = personAvailable(p);
          return el("li", null, btn(str(p.name) + (av ? "" : " · from " + p.available.from), "here-" + p.id, function () { S.ui.person = p.id; goSection("people"); }, "chip"));
        }))
      ]) : null,
      isHQ ? waitButtons("") : null
    ]);
  }

  /* ---------- people */
  function availText(p) {
    if (!p.available || !p.available.from) return "";
    return "Available " + p.available.from + "–" + p.available.to;
  }
  function renderPeople() {
    if (S.ui.person && IDX.person[S.ui.person] && personAppeared(IDX.person[S.ui.person])) return renderPerson(IDX.person[S.ui.person]);
    var list = C.people.filter(personAppeared);
    var here = list.filter(function (p) { return p.locationId === S.loc; });
    var away = list.filter(function (p) { return p.locationId !== S.loc; });
    var card = function (p, mode) {
      var av = personAvailable(p);
      var open = mode === "here" && av;
      var pending = p.questions.filter(function (q) { return !has(q.id) && reqMet(q.requires); }).length;
      var status = mode === "here" ? (av ? (pending ? pending + " question" + (pending === 1 ? "" : "s") + " to ask" : "Nothing new to ask") : "Not available now. Back at " + p.available.from + ".")
        : "At " + str((IDX.loc[p.locationId] || {}).name, "an unknown place") + (availText(p) ? " · " + availText(p) : "");
      return el("li", null, el("button", { class: "pcard" + (open ? "" : " pcard--off"), type: "button", k: "person-" + p.id, onclick: function () { S.ui.person = p.id; save(); render(); focusKey("person-back"); } }, [
        el("div", { class: "pcard__img" }, artBox(artString("portraits", p.portrait || p.id), "portrait", true, null)),
        el("div", { class: "pcard__info" }, [el("span", { class: "pcard__name" }, str(p.name)), el("span", { class: "pcard__role" }, str(p.role)), el("span", { class: "pcard__status" + (open && pending ? " is-live" : "") }, status)])
      ]));
    };
    return el("div", { class: "people" }, [
      sectionHead("People", "Question people where you find them. Their manner matters as much as their words."),
      el("h3", { class: "minihead" }, "Here at " + str((IDX.loc[S.loc] || {}).name, "this location")),
      here.length ? el("ul", { class: "plist" }, here.map(function (p) { return card(p, "here"); })) : el("p", { class: "muted" }, "Nobody to question here."),
      away.length ? el("h3", { class: "minihead" }, "Elsewhere") : null,
      away.length ? el("ul", { class: "plist" }, away.map(function (p) { return card(p, "away"); })) : null
    ]);
  }
  function renderPerson(p) {
    var hereNow = p.locationId === S.loc, av = personAvailable(p), can = hereNow && av;
    var qs = p.questions.filter(function (q) { return !has(q.id) && reqMet(q.requires); });
    var hist = S.history[p.id] || [];
    var reason = !hereNow ? "To question " + str(p.name) + ", travel to " + str((IDX.loc[p.locationId] || {}).name, "their location") + "." + (availText(p) ? " " + availText(p) + "." : "")
      : !av ? str(p.name) + " is not available right now. Back at " + p.available.from + "." : "";
    return el("div", { class: "person" }, [
      btn("← All people", "person-back", function () { S.ui.person = null; save(); render(); focusKey("person-" + p.id); }, "btn--ghost btn--sm"),
      el("div", { class: "person__head" }, [
        el("div", { class: "person__img" }, artBox(artString("portraits", p.portrait || p.id), "portrait", true, "Portrait of " + str(p.name))),
        el("div", { class: "person__info" }, [
          el("h2", { class: "person__name display" }, str(p.name)),
          el("p", { class: "person__role" }, str(p.role) + (p.age ? " · " + p.age : "")),
          el("p", { class: "cue" }, str(p.description))
        ])
      ]),
      reason ? el("p", { class: "notice" }, reason) : null,
      hist.length ? el("ol", { class: "conv", "aria-label": "Conversation" }, hist.map(function (h, i) {
        return el("li", { class: "conv__item" + (h.shown ? " conv__item--shown" : ""), tabindex: i === hist.length - 1 ? "-1" : null, k: i === hist.length - 1 ? "conv-last" : null }, [
          el("p", { class: "conv__q" }, [el("span", { class: "conv__who" }, "Julian"), str(h.q)]),
          el("p", { class: "conv__a" }, [el("span", { class: "conv__who" }, str(p.name).split(" ")[0]), str(h.a)]),
          h.cue ? el("p", { class: "cue cue--obs" }, h.cue) : null,
          el("span", { class: "conv__t mono" }, clockOf(h.t))
        ]);
      })) : null,
      can ? el("div", { class: "person__ask" }, [
        el("h3", { class: "minihead" }, "Ask"),
        qs.length ? el("ul", { class: "qlist" }, qs.map(function (q) {
          return el("li", null, btn(str(q.q), "ask-" + q.id, function () { ask(q.id); }, "qbtn", { "aria-label": str(q.q) + " (" + (typeof q.minutes === "number" ? q.minutes : COST.ask) + " minutes)" }));
        })) : el("p", { class: "muted" }, "Nothing new to ask. New findings may open new questions."),
        btn("Show evidence…", "show-evidence", function () { openPresent(p.id); }, "btn--primary")
      ]) : null
    ]);
  }
  function openPresent(personId) {
    var p = IDX.person[personId];
    var evs = C.evidence.filter(function (e) { return has(e.id); });
    var facts = C.facts.filter(function (f) { return has(f.id); });
    var item = function (id, label, sub) {
      var shown = !!S.presented[personId + "|" + id];
      return el("li", null, el("button", { class: "pick", type: "button", k: "present-" + id, onclick: function () { present(personId, id); } }, [
        el("span", { class: "pick__label" }, label), sub ? el("span", { class: "pick__sub" }, sub) : null, shown ? el("span", { class: "tag" }, "shown") : null
      ]));
    };
    var body = el("div", { class: "present" }, [
      el("p", { class: "muted" }, "Showing something takes about " + COST.present + " minutes. Watch how they react."),
      evs.length ? el("h3", { class: "minihead" }, "Evidence") : null,
      evs.length ? el("ul", { class: "picklist" }, evs.map(function (e) { return item(e.id, str(e.name), str(e.summary)); })) : null,
      facts.length ? el("h3", { class: "minihead" }, "Facts") : null,
      facts.length ? el("ul", { class: "picklist" }, facts.map(function (f) { return item(f.id, str(f.text), null); })) : null,
      !evs.length && !facts.length ? el("p", null, "You have nothing to show yet.") : null
    ]);
    openModal({ title: "Show " + str(p.name).split(" ")[0] + "…", body: body, actions: [{ label: "Cancel", k: "modal-ok", fn: closeModal }] });
  }

  /* ---------- evidence */
  function renderEvidence() {
    var evs = C.evidence.filter(function (e) { return has(e.id); });
    return el("div", { class: "evidence" }, [
      sectionHead("Evidence", evs.length + " item" + (evs.length === 1 ? "" : "s") + " on file."),
      el("button", { class: "file file--case", type: "button", k: "casefile-open", onclick: function () { openModal({ title: "Case file", wide: true, body: caseFileNode(), actions: [{ label: "Close", k: "modal-ok", primary: true, fn: closeModal }] }); } }, [
        el("span", { class: "file__kind" }, "Case file"), el("span", { class: "file__name" }, "Briefing and victim profile"), el("span", { class: "file__sum" }, str(C.victim.name, "The victim"))
      ]),
      evs.length ? el("ul", { class: "files" }, evs.map(function (e) {
        var k = (e.doc && e.doc.kind) || "object";
        return el("li", null, el("button", { class: "file file--" + k, type: "button", k: "ev-open-" + e.id, onclick: function () { openDoc(e.id); } }, [
          el("span", { class: "file__kind" }, kindLabel(k)),
          el("span", { class: "file__name" }, str(e.name, e.id)),
          el("span", { class: "file__sum" }, str(e.summary)),
          S.newItems[e.id] ? el("span", { class: "file__new" }, "New") : null,
          e.key ? el("span", { class: "file__key", title: "Key lead" }, "Key") : null
        ]));
      })) : el("p", { class: "muted" }, "No evidence yet. Examine the scene.")
    ]);
  }

  /* ---------- board */
  function boardItems() {
    var groups = [];
    groups.push({ title: "Evidence", items: C.evidence.filter(function (e) { return has(e.id); }).map(function (e) { return { id: e.id, label: str(e.name, e.id), sub: str(e.summary) }; }) });
    groups.push({ title: "Facts", items: C.facts.filter(function (f) { return has(f.id); }).map(function (f) { return { id: f.id, label: str(f.text, f.id) }; }) });
    var ppl = [];
    if (C.victim && C.victim.id) ppl.push({ id: C.victim.id, label: str(C.victim.name, "The victim"), sub: "Victim" });
    C.people.filter(personAppeared).forEach(function (p) { ppl.push({ id: p.id, label: str(p.name), sub: str(p.role) }); });
    groups.push({ title: "People", items: ppl });
    return groups;
  }
  function renderBoard() {
    var sel = S.ui.boardSel = S.ui.boardSel.filter(function (id) { return has(id) || (C.victim && C.victim.id === id) || IDX.person[id]; });
    var res = S.ui.boardResult;
    var found = C.deductions.filter(function (d) { return has(d.id); });
    var toggle = function (id) {
      var i = sel.indexOf(id);
      if (i !== -1) sel.splice(i, 1); else { if (sel.length >= 2) sel.shift(); sel.push(id); }
      S.ui.boardResult = null; save(); render();
    };
    var resNode = null;
    if (res) {
      if (res.ok && IDX.ded[res.id]) {
        var d = IDX.ded[res.id];
        resNode = el("div", { class: "board__result board__result--ok", tabindex: "-1", k: "board-result", role: "status" }, [
          d.key ? el("span", { class: "mini-stamp" }, "Lead confirmed") : el("span", { class: "tag" }, "Link"),
          el("h3", { class: "board__rtitle display" }, str(d.title)), el("p", { class: "prose" }, str(d.text)),
          res.again ? el("p", { class: "muted" }, "You've already made this connection.") : null
        ]);
      } else {
        resNode = el("div", { class: "board__result", tabindex: "-1", k: "board-result", role: "status" }, [
          el("h3", { class: "board__rtitle display" }, "No clear link."),
          el("p", { class: "muted" }, res.again ? "You've tried this pair before." : "Those two don't tell you anything together. Yet.")
        ]);
      }
    }
    return el("div", { class: "board" }, [
      sectionHead("Board", "Pick two items and connect them. A wrong guess costs a few minutes."),
      el("div", { class: "board__slots", "aria-live": "polite" }, [
        el("div", { class: "slot" + (sel[0] ? " is-full" : "") }, sel[0] ? itemLabel(sel[0]) : "First item"),
        el("span", { class: "board__plus", "aria-hidden": "true" }, "+"),
        el("div", { class: "slot" + (sel[1] ? " is-full" : "") }, sel[1] ? itemLabel(sel[1]) : "Second item"),
        btn("Connect", "connect", connect, "btn--primary", sel.length === 2 ? null : { disabled: true })
      ]),
      resNode,
      boardItems().map(function (g) {
        if (!g.items.length) return null;
        return el("div", { class: "board__group" }, [
          el("h3", { class: "minihead" }, g.title),
          el("ul", { class: "cards" }, g.items.map(function (it) {
            var on = sel.indexOf(it.id) !== -1;
            return el("li", null, el("button", { class: "bcard" + (on ? " is-on" : ""), type: "button", k: "chip-" + it.id, "aria-pressed": on ? "true" : "false", onclick: function () { toggle(it.id); } }, [
              el("span", { class: "bcard__label" }, it.label), it.sub ? el("span", { class: "bcard__sub" }, it.sub) : null
            ]));
          }))
        ]);
      }),
      el("div", { class: "board__links" }, [
        el("h3", { class: "minihead" }, "Connections made (" + found.length + ")"),
        found.length ? el("ul", { class: "links" }, found.map(function (d) {
          return el("li", { class: "link" + (d.key ? " link--key" : "") }, [
            el("div", { class: "link__pair" }, [el("span", null, itemLabel(d.items[0])), el("span", { class: "link__line", "aria-hidden": "true" }), el("span", null, itemLabel(d.items[1]))]),
            el("p", { class: "link__title" }, str(d.title)), el("p", { class: "link__text" }, str(d.text))
          ]);
        })) : el("p", { class: "muted" }, "No connections yet.")
      ])
    ]);
  }

  /* ---------- notebook */
  var LOG_KIND = { statement: "Statements", fact: "Facts", deduction: "Deductions", observation: "Observations", evidence: "Evidence", theo: "From Theo", event: "Events" };
  function logItem(e) {
    return el("li", { class: "entry entry--" + e.kind }, [
      el("span", { class: "entry__t mono" }, fmtT(e.t)),
      el("div", { class: "entry__body" }, [
        el("span", { class: "entry__title" }, str(e.title)),
        e.text ? el("p", { class: "entry__text" }, e.text) : null,
        e.cue ? el("p", { class: "cue cue--obs" }, e.cue) : null
      ])
    ]);
  }
  function renderNotebook() {
    var mode = S.ui.nb || "log";
    var sub = el("div", { class: "seg", role: "tablist", "aria-label": "Notebook view" }, [["log", "Log"], ["timeline", "Timeline"], ["notes", "My notes"]].map(function (m) {
      return el("button", { class: "seg__btn" + (mode === m[0] ? " is-on" : ""), role: "tab", "aria-selected": mode === m[0] ? "true" : "false", type: "button", k: "nb-" + m[0], onclick: function () { S.ui.nb = m[0]; save(); render(); } }, m[1]);
    }));
    var content;
    if (mode === "notes") {
      var ta = el("textarea", { class: "notes", k: "notes", id: "notes", rows: "12", "aria-label": "Your notes", placeholder: "Theories, contradictions, things to check…" });
      ta.value = S.notes || "";
      var timer = null;
      ta.addEventListener("input", function () { S.notes = ta.value; clearTimeout(timer); timer = setTimeout(save, 250); });
      ta.addEventListener("blur", function () { S.notes = ta.value; save(); });
      content = el("div", null, [ta, el("p", { class: "muted" }, "Saved with your game.")]);
    } else if (mode === "timeline") {
      var sorted = S.log.slice().sort(function (a, b) { return a.t - b.t; });
      var days = {};
      sorted.forEach(function (e) { (days[dayOf(e.t)] = days[dayOf(e.t)] || []).push(e); });
      content = Object.keys(days).length ? el("div", { class: "timeline" }, Object.keys(days).map(function (d) {
        return el("section", null, [el("h3", { class: "minihead" }, "Day " + d), el("ol", { class: "tl" }, days[d].map(function (e) {
          return el("li", { class: "tl__item tl__item--" + e.kind }, [el("span", { class: "tl__t mono" }, clockOf(e.t)), el("div", null, [el("span", { class: "tag" }, (LOG_KIND[e.kind] || "Note").replace(/s$/, "")), " ", el("span", { class: "entry__title" }, str(e.title)), e.text ? el("p", { class: "entry__text" }, e.text) : null])]);
        }))]);
      })) : el("p", { class: "muted" }, "Nothing logged yet.");
    } else {
      var order = ["statement", "fact", "deduction", "observation", "theo", "event"];
      content = el("div", null, order.map(function (k) {
        var items = S.log.filter(function (e) { return e.kind === k; });
        if (!items.length) return null;
        return el("section", { class: "logsec" }, [el("h3", { class: "minihead" }, LOG_KIND[k] + " (" + items.length + ")"), el("ol", { class: "entries" }, items.slice().reverse().map(logItem))]);
      }));
      if (!S.log.filter(function (e) { return e.kind !== "evidence"; }).length) content = el("p", { class: "muted" }, "Nothing logged yet.");
    }
    return el("div", { class: "notebook" }, [sectionHead("Notebook", "Everything you hear and learn, with the time you learned it."), sub, content]);
  }

  /* ---------- theo */
  function renderTheo() {
    if (S.theoUnread) { S.theoUnread = 0; save(); }
    var avail = C.requests.filter(function (r) { return !S.requested[r.id] && reqMet(r.requires); });
    var pend = S.pending.slice().sort(function (a, b) { return a.due - b.due; });
    var atHQ = S.loc === hqId();
    return el("div", { class: "theo" }, [
      sectionHead("Theo", "Theo Park, digital forensics. Requests take time; results arrive here."),
      el("div", { class: "phone phone--theo" }, [
        el("div", { class: "phone__bar" }, [el("span", { class: "phone__dot", "aria-hidden": "true" }), "Theo Park"]),
        S.theo.length ? el("ol", { class: "chat" }, S.theo.map(function (m) {
          return el("li", { class: "bubble " + (m.from === "julian" ? "bubble--me" : "bubble--them") }, [
            el("span", { class: "bubble__from" }, m.from === "julian" ? "You" : "Theo"), el("span", { class: "bubble__text" }, m.text), el("span", { class: "bubble__time" }, fmtT(m.t))
          ]);
        })) : el("p", { class: "phone__empty" }, "No messages yet."),
        pend.length ? el("p", { class: "typing", "aria-live": "polite" }, "Theo is working on " + pend.length + " request" + (pend.length === 1 ? "" : "s") + ". Next result around " + clockOf(pend[0].due) + ".") : null
      ]),
      el("h3", { class: "minihead" }, "Ask Theo to…"),
      avail.length ? el("ul", { class: "qlist" }, avail.map(function (r) {
        return el("li", null, btn(str(r.label, r.id), "rq-" + r.id, function () { sendRequest(r.id); }, "qbtn", { "aria-label": str(r.label) + " (takes about " + durationText(typeof r.delayMinutes === "number" ? r.delayMinutes : 60) + ")" }));
      })) : el("p", { class: "muted" }, "Nothing to ask for right now. New leads open new requests."),
      atHQ ? waitButtons("-theo") : el("p", { class: "muted" }, "You can wait for results at headquarters.")
    ]);
  }

  /* ---------- hints */
  function showHintModal(message) {
    var n = tokensLeft();
    var body = el("div", { class: "hint" }, [
      message ? el("blockquote", { class: "hint__text" }, [message, el("footer", null, "— Lena Cruz")]) : null,
      el("p", null, "Hint tokens: " + n),
      n ? null : el("p", { class: "muted" }, "No tokens. You earn them by confirming key leads on the board and solving side puzzles."),
      S.hintsShown.length && !message ? el("div", null, [el("h3", { class: "minihead" }, "Earlier hints"), el("ul", { class: "entries" }, S.hintsShown.map(function (id) {
        var h = C.hints.filter(function (x) { return x.id === id; })[0];
        return h ? el("li", { class: "entry" }, el("p", { class: "entry__text" }, h.text)) : null;
      }))]) : null
    ]);
    openModal({ title: "Ask Lena", body: body, actions: [
      { label: "Ask Lena for a hint", k: "hint-ask", primary: true, disabled: n <= 0, fn: askHint },
      { label: "Close", k: "modal-ok", fn: closeModal }
    ] });
  }

  /* ---------- solve */
  function renderSolve() {
    var s = S.solve, sol = C.solution;
    var opts = proofOptions(), need = proofsRequired();
    s.proofs = s.proofs.filter(function (p) { return opts.indexOf(p) !== -1; });
    var ready = s.suspect && s.motive && s.method && s.proofs.length === need && opts.length > 0;
    var setS = function (key, val) { return function () { s[key] = val; save(); render(); }; };
    if (s.review && ready) {
      return el("div", { class: "solve" }, [
        sectionHead("File the charge", "Once filed, there is no taking it back."),
        el("div", { class: "charge doc doc--report" }, [
          el("div", { class: "doc__letterhead" }, "Port Halden Police Department · Charging request"),
          el("dl", { class: "doc__meta" }, [
            ["Accused", itemLabel(s.suspect)], ["Motive", (IDX.motive[s.motive] || {}).text], ["Method", (IDX.method[s.method] || {}).text]
          ].map(function (r) { return el("div", { class: "doc__metarow" }, [el("dt", null, r[0]), el("dd", null, str(r[1]))]); })),
          el("p", { class: "doc__formline" }, "Supporting proof"),
          el("ol", { class: "charge__proofs" }, s.proofs.map(function (p) { return el("li", null, itemLabel(p)); }))
        ]),
        el("div", { class: "row" }, [
          btn("File the charge", "file-charge", fileCharge, "btn--danger btn--lg"),
          btn("Go back", "solve-back", function () { s.review = false; save(); render(); focusKey("review"); }, "btn--lg")
        ])
      ]);
    }
    var radioGroup = function (title, list, key, prefix, labelOf, extra) {
      return el("fieldset", { class: "fs" }, [
        el("legend", { class: "minihead" }, title),
        el("div", { class: "opts" + (extra ? " " + extra : "") }, list.map(function (o) {
          var on = s[key] === o.id;
          return el("button", { class: "opt" + (on ? " is-on" : ""), type: "button", role: "radio", "aria-checked": on ? "true" : "false", k: prefix + o.id, onclick: setS(key, o.id) }, labelOf(o));
        }))
      ]);
    };
    var suspects = sol.suspects.map(function (id) { return IDX.person[id] || (C.victim.id === id ? C.victim : { id: id, name: id }); });
    return el("div", { class: "solve" }, [
      sectionHead("Solve", "Build the case: who, why, how, and the proof that holds it together."),
      radioGroup("Suspect", suspects, "suspect", "sus-", function (p) {
        return [el("span", { class: "opt__img" }, artBox(artString("portraits", p.portrait || p.id), "portrait", true, null)), el("span", { class: "opt__label" }, str(p.name, p.id))];
      }, "opts--suspects"),
      radioGroup("Motive", sol.motives, "motive", "mot-", function (m) { return str(m.text, m.id); }),
      radioGroup("Method", sol.methods, "method", "met-", function (m) { return str(m.text, m.id); }),
      el("fieldset", { class: "fs" }, [
        el("legend", { class: "minihead" }, "Proof: pick " + need + " (" + s.proofs.length + "/" + need + ")"),
        opts.length ? el("div", { class: "opts" }, opts.map(function (id) {
          var on = s.proofs.indexOf(id) !== -1;
          var full = !on && s.proofs.length >= need;
          return el("button", { class: "opt opt--check" + (on ? " is-on" : ""), type: "button", role: "checkbox", "aria-checked": on ? "true" : "false", "aria-disabled": full ? "true" : null, k: "proof-" + id,
            onclick: function () {
              var i = s.proofs.indexOf(id);
              if (i !== -1) s.proofs.splice(i, 1); else if (s.proofs.length < need) s.proofs.push(id); else return;
              save(); render();
            } }, [el("span", { class: "tag" }, IDX.ded[id] ? "Deduction" : "Evidence"), " ", itemLabel(id)]);
        })) : el("p", { class: "muted" }, "You have no evidence yet.")
      ]),
      btn("Review the charge", "review", function () { s.review = true; save(); render(); focusKey("file-charge"); }, "btn--primary btn--lg", ready ? null : { disabled: true }),
      ready ? null : el("p", { class: "muted" }, "Choose a suspect, a motive, a method and " + need + " proofs.")
    ]);
  }

  /* ---------- event card (twist) */
  function renderEvent() {
    var root = document.getElementById("event-root");
    if (!root) return;
    root.innerHTML = "";
    if (!S || !S.event || screenOverride === "title" || S.status !== "play") return;
    var e = S.event;
    var art = e.art ? anyArt(e.art) : null;
    closeModal(true);
    root.appendChild(el("div", { class: "event-card", role: "alertdialog", "aria-modal": "true", "aria-labelledby": "event-title" }, [
      art ? el("div", { class: "event-card__art" }, artBox(art, "event-card__svg", false, null)) : el("div", { class: "event-card__art event-card__art--none", "aria-hidden": "true" }),
      el("div", { class: "event-card__inner" }, [
        el("p", { class: "event-card__kicker" }, "Breaking development · " + fmtT(typeof e.t === "number" ? e.t : S.t)),
        el("h2", { class: "event-card__title display", id: "event-title" }, e.title),
        el("p", { class: "event-card__text prose" }, e.text),
        btn("Continue", "event-continue", function () { S.event = null; save(); render(); playFx(); }, "btn--primary btn--lg")
      ])
    ]));
    setTimeout(function () { var b = root.querySelector("[data-k='event-continue']"); if (b) b.focus(); }, 30);
  }

  /* ---------- endings */
  function renderEnding() {
    var ok = S.status === "confession";
    var sc = ok ? (C.solution.success || {}) : (C.solution.failure || {});
    var who = IDX.person[S.solve.suspect];
    app.appendChild(el("main", { class: "screen ending " + (ok ? "ending--win" : "ending--lose") }, [
      el("div", { class: "ending__card" }, [
        who ? el("div", { class: "ending__portrait" }, artBox(artString("portraits", who.portrait || who.id), "portrait", true, "Portrait of " + str(who.name))) : null,
        el("div", { class: "ending__text" }, [
          el("p", { class: "ending__kicker" }, ok ? "Interview room 2 · " + fmtT(S.t) : "Six weeks later"),
          el("h1", { class: "display" }, str(sc.title, ok ? "Confession" : "The case collapses")),
          el("p", { class: "prose" }, str(sc.text)),
          btn(ok ? "Debrief" : "Continue", "ending-continue", function () { S.status = ok ? "solved" : "failed"; save(); render(); window.scrollTo(0, 0); }, "btn--primary btn--lg")
        ])
      ])
    ]));
    focusKey("ending-continue", true);
  }
  function renderFailed() {
    app.appendChild(el("main", { class: "screen failed" }, [
      el("div", { class: "reopen__card" }, [
        el("div", { class: "big-stamp", "aria-hidden": "true" }, "Case failed"),
        el("h1", { class: "display" }, str(C.title)),
        el("p", { class: "prose" }, "The wrong person was charged. The real killer is still out there, and the trail is going cold."),
        el("div", { class: "row" }, [
          btn("Reopen the case", "reopen", reopenCase, "btn--primary btn--lg"),
          btn("Title screen", "to-title-end", function () { screenOverride = "title"; render(); }, "btn--lg")
        ])
      ])
    ]));
    focusKey("reopen", true);
  }
  function renderDebrief() {
    var keys = keyItems(), found = keys.filter(has).length;
    var mins = (S.solvedT || S.t) - S.startT;
    var lies = [];
    C.people.forEach(function (p) { p.questions.forEach(function (q) { if (q.lie) lies.push({ p: p, q: q }); }); });
    app.appendChild(el("main", { class: "screen debrief" }, [
      el("div", { class: "debrief__inner" }, [
        el("div", { class: "big-stamp big-stamp--green", "aria-hidden": "true" }, "Case closed"),
        el("h1", { class: "display" }, str(C.title)),
        el("p", { class: "debrief__sub" }, "Debrief with DS Lena Cruz"),
        el("dl", { class: "debrief__stats" }, [
          ["Key leads found", found + " of " + keys.length], ["Time on the case", durationText(mins)], ["Hints used", String(S.hintsSpent)], ["Wrong charges", String(S.failures || 0)]
        ].map(function (r) { return el("div", null, [el("dt", null, r[0]), el("dd", { class: "mono" }, r[1])]); })),
        el("ol", { class: "debrief__list" }, C.debrief.map(function (d) {
          var got = has(d.flag);
          return el("li", { class: "dcard" + (got ? " dcard--found" : " dcard--missed") }, [
            el("div", { class: "dcard__head" }, [el("span", { class: "dcard__status" }, got ? "Found" : "Missed"), el("h2", { class: "dcard__title display" }, str(d.title))]),
            d.technique ? el("p", { class: "dcard__tech" }, [el("span", { class: "minihead" }, "Technique"), " ", d.technique]) : null,
            d.explanation ? el("p", { class: "prose" }, d.explanation) : null,
            d.tip ? el("p", { class: "dcard__tip" }, [el("span", { class: "minihead" }, "Real-life tip"), " ", d.tip]) : null
          ]);
        })),
        lies.length ? el("section", { class: "debrief__lies" }, [
          el("h2", { class: "display" }, "The lies you were told"),
          el("ul", null, lies.map(function (l) {
            var heard = has(l.q.id);
            return el("li", { class: heard ? "" : "muted" }, [el("strong", null, str(l.p.name) + ": "), "“" + str(l.q.a) + "”", heard ? (l.q.cue ? el("span", { class: "cue" }, " " + l.q.cue) : null) : el("span", null, " (you never heard this one)")]);
          }))
        ]) : null,
        el("div", { class: "row" }, [btn("Title screen", "to-title-end", function () { screenOverride = "title"; render(); }, "btn--primary btn--lg")])
      ])
    ]));
  }

  /* ------------------------------------------------------------------ boot */
  function shell() {
    ["toasts", "stamp-layer", "modal-root", "event-root"].forEach(function (id) {
      if (!document.getElementById(id)) {
        var n = el("div", { id: id });
        if (id === "toasts") { n.setAttribute("aria-live", "polite"); n.className = "toasts"; }
        if (id === "stamp-layer") n.className = "stamp-layer";
        document.body.appendChild(n);
      }
    });
  }
  shell();
  C = buildCase(false); buildIndex();
  render();
})();
