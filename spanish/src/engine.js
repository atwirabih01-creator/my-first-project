/* Lesson slide engine: reads window.LESSON and runs a presentable practice deck. */
(function () {
  'use strict';
  var L = window.LESSON;
  var root = document.documentElement;
  root.classList.add(L.theme || 'u12');
  root.lang = 'es';

  var PRAISE = ['¡Muy bien! 🎉', '¡Genial! ⭐', '¡Perfecto! 🥳', '¡Fenomenal! 🌟', '¡Estupendo! 🙌', '¡Bravo! 👏', '¡Olé! 💃'];
  var app = document.getElementById('app');
  var slides, st, idx = 0, flash = null;

  /* ---------- helpers ---------- */
  function h(tag, a, kids) {
    var e = document.createElement(tag);
    if (a) for (var k in a) {
      var v = a[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    (kids || []).forEach(function (c) {
      if (c == null || c === false) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function norm(s) { return String(s).toLowerCase().replace(/[¿?¡!.,;:«»"—-]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function plain(s) { return norm(s).normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var SPEAK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';

  /* ---------- speech (optional) ---------- */
  var canSpeak = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  function say(text) {
    if (!canSpeak) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text.replace(/[—«»]/g, ''));
      u.lang = 'es-ES'; u.rate = 0.85;
      var vs = window.speechSynthesis.getVoices() || [];
      var v = vs.filter(function (x) { return /^es(-|_|$)/i.test(x.lang); })[0];
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech is a nice-to-have */ }
  }
  function sayBtn(text) {
    if (!canSpeak) return null;
    return h('button', { type: 'button', class: 'say', title: 'Escuchar', 'aria-label': 'Escuchar: ' + text,
      onclick: function (ev) { ev.stopPropagation(); say(text); }, html: SPEAK });
  }

  /* ---------- setup ---------- */
  function setup() {
    slides = L.slides.map(function (s) {
      var c = Object.assign({}, s);
      if (c.type === 'mc') c.opts = shuffle(c.options.map(function (o, i) { return { t: o, ok: i === 0 }; }));
      if (c.type === 'conj') {
        var labels = c.pronouns || ['yo', 'tú', 'él / ella / usted'];
        c.rowsX = c.forms.map(function (f, i) {
          return { p: labels[i], ok: f, opts: shuffle(c.forms.concat(c.trap ? [c.trap] : [])) };
        });
      }
      if (c.type === 'build') {
        var base = c.letters ? c.scrambled.split('') : shuffle(c.tiles.concat(c.extra || []));
        c.pool = base.map(function (t) { return t; });
      }
      return c;
    });
    st = slides.map(function () { return {}; });
  }

  function itemsOf(s) {
    if (s.type === 'mc' || s.type === 'type' || s.type === 'build') return 1;
    if (s.type === 'conj') return s.rowsX.length;
    if (s.type === 'tf') return s.statements.length;
    return 0;
  }
  function pointsOf(i) {
    var s = slides[i], S = st[i], p = 0;
    if (s.type === 'mc') return S.picked != null && s.opts[S.picked].ok ? 1 : 0;
    if (s.type === 'type' || s.type === 'build') return S.result === 'ok' ? 1 : 0;
    if (s.type === 'conj') { s.rowsX.forEach(function (r, ri) { var k = S.rows && S.rows[ri]; if (k != null && r.opts[k] === r.ok) p++; }); return p; }
    if (s.type === 'tf') { s.statements.forEach(function (x, ri) { var a = S.ans && S.ans[ri]; if (a != null && a === x[1]) p++; }); return p; }
    return 0;
  }
  function answeredOf(i) {
    var s = slides[i], S = st[i];
    if (s.type === 'mc') return S.picked != null ? 1 : 0;
    if (s.type === 'type' || s.type === 'build') return S.result ? 1 : 0;
    if (s.type === 'conj') return S.rows ? Object.keys(S.rows).length : 0;
    if (s.type === 'tf') return S.ans ? Object.keys(S.ans).length : 0;
    return 0;
  }
  function totals() {
    var got = 0, max = 0, done = 0;
    slides.forEach(function (s, i) { got += pointsOf(i); max += itemsOf(s); done += answeredOf(i); });
    return { got: got, max: max, done: done };
  }

  /* ---------- prompt with ___ blanks ---------- */
  function promptEl(text, fill, sub) {
    var lines = String(text).split('\n');
    var kids = lines.map(function (line) {
      var parts = line.split('___');
      var row = [];
      parts.forEach(function (p, i) {
        if (p) row.push(p);
        if (i < parts.length - 1) row.push(h('span', { class: 'blank' + (fill ? ' filled' : '') }, [fill || ' ']));
      });
      return h('span', { class: 'line' }, row);
    });
    if (sub) kids.push(h('span', { class: 'sub' }, [sub]));
    return h('p', { class: 'prompt' }, kids);
  }
  function feedback(ok, right, why, extra) {
    if (ok == null) return h('p', { class: 'feedback', 'aria-live': 'polite' });
    var msg = ok ? pick(PRAISE) + (extra ? ' ' + extra : '') : '¡Casi! 💪 Es: ' + right;
    return h('p', { class: 'feedback ' + (ok ? 'ok' : 'bad'), 'aria-live': 'polite' },
      [msg, why ? h('span', { class: 'why' }, [why]) : null]);
  }
  function pencils(n) {
    var cols = ['--c1', '--c2', '--c3', '--c4', '--c5', '--c6'];
    var w = h('div', { class: 'pencils', role: 'img', 'aria-label': n + ' pinturas' });
    for (var i = 0; i < n; i++) {
      var c = 'var(' + cols[i % 6] + ')';
      w.insertAdjacentHTML('beforeend',
        '<svg viewBox="0 0 26 96" aria-hidden="true"><polygon points="3,22 13,2 23,22" fill="' + c + '" opacity=".75"/>' +
        '<rect x="3" y="22" width="20" height="70" rx="3" fill="' + c + '"/><rect x="3" y="30" width="20" height="5" fill="var(--card)" opacity=".5"/></svg>');
    }
    return w;
  }
  function done(i, ok, key) { flash = { i: i, ok: ok, key: key }; render(); if (ok) confetti(); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function confetti() {
    if (reduce) return;
    var c = document.createElement('canvas'); c.className = 'confetti'; c.setAttribute('aria-hidden', 'true');
    var W = c.width = window.innerWidth, H = c.height = window.innerHeight; document.body.appendChild(c);
    var x = c.getContext('2d'), cs = getComputedStyle(document.documentElement);
    var cols = ['--c1', '--c2', '--c3', '--c4', '--c5', '--c6'].map(function (v) { return cs.getPropertyValue(v).trim() || '#f90'; });
    var parts = []; for (var k = 0; k < 90; k++) parts.push({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .55, vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 6,
      r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - .5) * .4, col: cols[k % cols.length] });
    var t0 = performance.now();
    (function step(t) {
      var dt = t - t0; x.clearRect(0, 0, W, H);
      parts.forEach(function (p) { p.vy += .45; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = Math.max(0, 1 - dt / 1400); x.fillStyle = p.col; x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore(); });
      if (dt < 1400) requestAnimationFrame(step); else c.remove();
    })(t0);
  }

  /* ---------- slide renderers ---------- */
  function rTitle(s) {
    return [
      h('div', { class: 'crayons', 'aria-hidden': 'true' }, ['--c1', '--c2', '--c3', '--c4', '--c5', '--c6'].map(function (c) { return h('i', { style: 'background:var(' + c + ')' }); })),
      h('p', { class: 'eyebrow' }, [s.eyebrow]),
      s.pics ? h('div', { class: 'titlepics', 'aria-hidden': 'true' }, s.pics.split(' ').map(function (e) { return h('span', {}, [e]); })) : null,
      h('h1', {}, [s.title]),
      h('p', { class: 'lead' }, [s.subtitle]),
      s.chips ? h('ul', { class: 'chips' }, s.chips.map(function (c) { return h('li', {}, [c]); })) : null,
      h('p', { class: 'hint' }, ['Pulsa «Siguiente →» para empezar. ¡Mucha suerte! 🍀'])
    ];
  }

  function rCards(s, S) {
    S.flipped = S.flipped || {};
    var grid = h('div', { class: 'cards' }, s.cards.map(function (c, i) {
      var card = h('div', { class: 'card' + (S.flipped[i] ? ' flip' : ''), role: 'button', tabindex: '0', 'aria-pressed': S.flipped[i] ? 'true' : 'false',
        'aria-label': c[0] + ' (toca para ver el significado)' }, [
        h('div', { class: 'in' }, [
          h('div', { class: 'face front' }, [c[2] ? h('span', { class: 'pic' + (/^\d+$/.test(c[2]) ? ' num' : '') }, [c[2]]) : null, h('span', { class: 'es' }, [c[0]]), h('span', { class: 'tap' }, ['👆 toca'])]),
          h('div', { class: 'face back' }, [c[2] ? h('span', { class: 'pic small' + (/^\d+$/.test(c[2]) ? ' num' : '') }, [c[2]]) : null, h('span', { class: 'en' }, [c[1]]), h('span', { class: 'es2' }, [c[0]])])
        ])
      ]);
      function toggle() { S.flipped[i] = !S.flipped[i]; card.classList.toggle('flip', !!S.flipped[i]); card.setAttribute('aria-pressed', S.flipped[i] ? 'true' : 'false'); if (S.flipped[i]) return; }
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      var sb = sayBtn(c[0]);
      if (sb) { sb.style.cssText = 'position:absolute;top:6px;right:6px;z-index:2'; card.querySelector('.front').appendChild(sb); }
      return card;
    }));
    var all = h('button', { type: 'button', class: 'btn soft', onclick: function () {
      var any = s.cards.some(function (_, i) { return !S.flipped[i]; });
      s.cards.forEach(function (_, i) { S.flipped[i] = any; });
      render();
    } }, ['Girar todas']);
    return [h('h2', {}, [s.heading || 'Mi vocabulario']), h('p', { class: 'hint' }, [s.hint || '🗣️ Di la palabra en voz alta. Después toca la tarjeta.']), grid, h('div', { class: 'tools' }, [all])];
  }

  function rLearn(s, S) {
    var box = h('div', { class: 'learn' + (S.revealed || !s.reveal ? ' shown' : ''), html: s.html });
    return [h('h2', {}, [s.heading]), box,
      s.reveal ? h('div', { class: 'tools' }, [h('button', { type: 'button', class: 'btn soft', onclick: function () { S.revealed = !S.revealed; render(); } }, [S.revealed ? 'Ocultar respuestas' : 'Mostrar respuestas'])]) : null];
  }

  function rMC(s, S, i) {
    var answered = S.picked != null;
    var right = s.opts.filter(function (o) { return o.ok; })[0].t;
    var ok = answered ? s.opts[S.picked].ok : null;
    var opts = h('div', { class: 'opts' }, s.opts.map(function (o, k) {
      var cls = 'opt';
      if (answered) cls += o.ok ? ' ok' : (S.picked === k ? ' bad' : ' dim');
      if (flash && flash.i === i && answered && k === S.picked) cls += ok ? ' pop' : ' shake';
      return h('button', { type: 'button', class: cls, disabled: answered, 'data-k': k,
        onclick: function () { if (st[i].picked != null) return; st[i].picked = k; done(i, o.ok); } },
        [h('span', { class: 'key', 'aria-hidden': 'true' }, [String(k + 1)]), h('span', { class: 't' }, [o.t])]);
    }));
    var head = [];
    if (s.passage) head.push(h('div', { class: 'passage', html: s.passage }));
    if (s.big) head.push(h('div', { class: s.bigClass || 'bigemoji' }, [s.big]));
    if (s.count) head.push(pencils(s.count));
    var fill = answered && /___/.test(s.prompt) ? right : null;
    var p = promptEl(s.prompt, fill, s.sub);
    if (s.say) { var sb = sayBtn(s.say); if (sb) p.firstChild.appendChild(sb); }
    return head.concat([p, opts, feedback(ok, right, s.explain)]);
  }

  function rType(s, S, i) {
    var res = S.result;
    var inp = h('input', { id: 'ans-' + i, type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Tu respuesta',
      placeholder: 'Escribe aquí…', class: res === 'ok' ? 'ok' : res === 'bad' ? 'bad' : null, disabled: !!res });
    inp.value = S.value || '';
    inp.addEventListener('input', function () { st[i].value = inp.value; });
    function check() {
      var v = inp.value; if (!v.trim()) { inp.focus(); return; }
      var good = s.answer.some(function (a) { return norm(a) === norm(v); });
      var near = !good && s.answer.some(function (a) { return plain(a) === plain(v); });
      st[i].value = v;
      st[i].result = good || (near && !s.strict) ? 'ok' : 'bad';
      st[i].near = near;
      done(i, st[i].result === 'ok');
      var nx = document.getElementById('next'); if (nx) nx.focus();
    }
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    var accents = res ? null : h('div', { class: 'accents', 'aria-label': 'Letras especiales' }, ['á', 'é', 'í', 'ó', 'ú', 'ñ'].map(function (ch) {
      return h('button', { type: 'button', 'aria-label': 'Escribir ' + ch, onclick: function () {
        var a = inp.selectionStart != null ? inp.selectionStart : inp.value.length, b = inp.selectionEnd != null ? inp.selectionEnd : a;
        inp.value = inp.value.slice(0, a) + ch + inp.value.slice(b); st[i].value = inp.value; inp.focus(); inp.setSelectionRange(a + 1, a + 1);
      } }, [ch]);
    }));
    var right = s.answer[0];
    var fb;
    if (!res) fb = feedback(null);
    else if (res === 'ok') fb = feedback(true, right, s.explain, S.near ? '(¡Ojo con la tilde: ' + right + '!)' : null);
    else fb = feedback(false, right, S.near ? '¡Muy cerca! Solo falta la tilde. ' + (s.explain || '') : s.explain);
    var fill = res ? right : null;
    var head = [];
    if (s.big) head.push(h('div', { class: s.bigClass || 'bignum' }, [s.big]));
    var p = promptEl(s.prompt, /___/.test(s.prompt) ? fill : null, s.sub);
    if (res && s.say) { var sb = sayBtn(s.say); if (sb) p.firstChild.appendChild(sb); }
    return head.concat([p,
      h('div', { class: 'typerow' }, [inp, h('button', { type: 'button', class: 'btn', disabled: !!res, onclick: check }, ['Comprobar'])]),
      accents, fb]);
  }

  function rConj(s, S, i) {
    S.rows = S.rows || {};
    var rows = s.rowsX.map(function (r, ri) {
      var picked = S.rows[ri];
      var ans = picked != null;
      return h('div', { class: 'crow' }, [
        h('div', { class: 'pr' }, [r.p]),
        h('div', { class: 'ch' }, r.opts.map(function (o, k) {
          var cls = 'chip';
          if (ans) cls += o === r.ok ? ' ok' : (picked === k ? ' bad' : ' dim');
          if (flash && flash.i === i && flash.key === ri && picked === k) cls += o === r.ok ? ' pop' : ' shake';
          return h('button', { type: 'button', class: cls, disabled: ans, onclick: function () {
            if (st[i].rows[ri] != null) return; st[i].rows[ri] = k; done(i, o === r.ok, ri);
          } }, [o]);
        }))
      ]);
    });
    var all = Object.keys(S.rows).length === s.rowsX.length;
    var allOk = all && pointsOf(i) === s.rowsX.length;
    var head = h('div', { class: 'verbhead' }, [s.pic ? h('span', { class: 'vpic', 'aria-hidden': 'true' }, [s.pic]) : null, h('span', { class: 'v' }, [s.verb]), h('span', { class: 'm' }, [s.meaning]), sayBtn(s.forms.join(', '))]);
    return [h('h2', {}, [s.heading || 'Conjuga el verbo']), head, h('p', { class: 'hint' }, [s.hint || 'Elige la palabra correcta en cada fila. 👇']),
      h('div', {}, rows), all ? feedback(allOk ? true : false, s.forms.join(' · '), s.explain) : feedback(null)];
  }

  function rBuild(s, S, i) {
    S.seq = S.seq || [];
    var res = S.result;
    var sep = s.letters ? '' : ' ';
    var target = h('div', { class: 'target' + (res ? ' ' + res : '') + (flash && flash.i === i ? (res === 'ok' ? ' pop' : ' shake') : ''), 'aria-label': 'Tu respuesta' },
      S.seq.length ? S.seq.map(function (pi, pos) {
        return h('button', { type: 'button', class: 'tile in-target' + (s.letters ? ' letter' : ''), disabled: !!res, title: 'Quitar',
          onclick: function () { st[i].seq.splice(pos, 1); render(); } }, [s.pool[pi]]);
      }) : [h('span', { class: 'empty' }, [s.letters ? 'Toca las letras en orden…' : 'Toca las palabras en orden…'])]);
    var pool = h('div', { class: 'pool' }, s.pool.map(function (t, pi) {
      var used = S.seq.indexOf(pi) !== -1;
      return h('button', { type: 'button', class: 'tile' + (s.letters ? ' letter' : '') + (used ? ' used' : ''), disabled: used || !!res, 'aria-hidden': used ? 'true' : null,
        onclick: function () { st[i].seq.push(pi); render(); } }, [t]);
    }));
    var answerText = s.letters ? s.answer : s.tiles.join(' ');
    function check() {
      var built = S.seq.map(function (pi) { return s.pool[pi]; }).join(sep);
      var accepted = [answerText].concat(s.alts || []);
      var good = accepted.some(function (a) { return norm(a) === norm(built); });
      st[i].result = good ? 'ok' : 'bad';
      done(i, good);
    }
    var tools = res ? null : h('div', { class: 'tools' }, [
      h('button', { type: 'button', class: 'btn', disabled: !S.seq.length, onclick: check }, ['Comprobar']),
      h('button', { type: 'button', class: 'btn soft', disabled: !S.seq.length, onclick: function () { st[i].seq = []; render(); } }, ['Borrar'])
    ]);
    var p = promptEl(s.prompt, null, s.sub);
    return [p, target, res ? null : pool, tools,
      res ? feedback(res === 'ok', answerText, s.explain) : feedback(null)];
  }

  function rTF(s, S, i) {
    S.ans = S.ans || {};
    var rows = s.statements.map(function (x, ri) {
      var a = S.ans[ri], ans = a != null;
      function b(val, label) {
        var cls = 'chip';
        if (ans) cls += val === x[1] ? ' ok' : (a === val ? ' bad' : ' dim');
        if (flash && flash.i === i && flash.key === ri && a === val) cls += a === x[1] ? ' pop' : ' shake';
        return h('button', { type: 'button', class: cls, disabled: ans, onclick: function () { if (st[i].ans[ri] != null) return; st[i].ans[ri] = val; done(i, val === x[1], ri); } }, [label]);
      }
      return h('div', { class: 'tfrow' }, [h('span', {}, [x[0]]), h('div', { class: 'ch' }, [b(true, 'Verdad'), b(false, 'Mentira')])]);
    });
    var all = Object.keys(S.ans).length === s.statements.length;
    return [h('h2', {}, [s.heading || '¿Verdad o mentira?']), s.passage ? h('div', { class: 'passage', html: s.passage }) : null,
      h('div', {}, rows), all ? h('p', { class: 'feedback ' + (pointsOf(i) === s.statements.length ? 'ok' : 'bad') }, [pointsOf(i) + ' de ' + s.statements.length + ' correctas. ' + (pointsOf(i) === s.statements.length ? pick(PRAISE) : 'Las respuestas correctas están en verde.')]) : feedback(null)];
  }

  function rEnd() {
    var t = totals();
    var pct = t.max ? t.got / t.max : 0;
    var n = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : t.got > 0 ? 1 : 0;
    var stars = h('div', { class: 'stars', 'aria-label': n + ' de 3 estrellas' }, [0, 1, 2].map(function (k) {
      var w = h('span', { html: STAR }); var svg = w.firstChild; if (k < n) svg.setAttribute('class', 'on'); return svg;
    }));
    var missed = [];
    slides.forEach(function (s, i) { if (itemsOf(s) && pointsOf(i) < itemsOf(s)) missed.push(i); });
    var msg = n === 3 ? '¡Eres una superexploradora!' : n === 2 ? '¡Muy buen trabajo!' : '¡Buen intento! ¡Vamos a repasar!';
    if (n >= 2) setTimeout(confetti, 300);
    return [
      h('div', { class: 'trophy', 'aria-hidden': 'true' }, [n === 3 ? '🏆' : n === 2 ? '🥈' : '💪']),
      h('p', { class: 'eyebrow' }, ['¡Has terminado! · ' + L.course]),
      h('h1', {}, [msg]), stars,
      h('p', { class: 'bigscore' }, [t.got + ' / ' + t.max]),
      h('p', { class: 'hint' }, [t.done < t.max ? 'respuestas correctas (sin contestar: ' + (t.max - t.done) + ')' : 'respuestas correctas']),
      missed.length ? h('div', {}, [h('p', { class: 'hint', style: 'margin-bottom:8px' }, ['📚 Para repasar:']),
        h('div', { class: 'review' }, missed.map(function (i) { return h('button', { type: 'button', onclick: function () { go(i); } }, ['Diapositiva ' + (i + 1) + (slides[i].title ? ' · ' + slides[i].title : '')]); }))]) : null,
      h('div', { class: 'tools' }, [h('button', { type: 'button', class: 'btn', onclick: restart }, ['🔄 Jugar otra vez'])])
    ];
  }

  /* ---------- frame ---------- */
  function render() {
    var s = slides[idx], S = st[idx];
    var t = totals();
    var body;
    switch (s.type) {
      case 'title': body = rTitle(s); break;
      case 'cards': body = rCards(s, S); break;
      case 'learn': body = rLearn(s, S); break;
      case 'mc': body = rMC(s, S, idx); break;
      case 'type': body = rType(s, S, idx); break;
      case 'conj': body = rConj(s, S, idx); break;
      case 'build': body = rBuild(s, S, idx); break;
      case 'tf': body = rTF(s, S, idx); break;
      default: body = rEnd();
    }
    var slideKids = [];
    if (s.title && s.type !== 'title' && s.type !== 'end') slideKids.push(h('p', { class: 'eyebrow' }, [s.title]));
    slideKids = slideKids.concat(body);
    var keepAnim = !flash;
    var slide = h('section', { class: 'slide', 'aria-label': 'Diapositiva ' + (idx + 1) + ' de ' + slides.length, style: keepAnim ? null : 'animation:none' }, slideKids);

    var fsOk = !!(document.documentElement.requestFullscreen);
    var bar = h('header', { class: 'bar' }, [
      h('div', { class: 'brand' }, [h('small', {}, [L.course]), L.short]),
      h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Progreso', 'aria-valuemin': '0', 'aria-valuemax': String(slides.length), 'aria-valuenow': String(idx + 1) },
        [h('span', { style: 'width:' + Math.round((idx + 1) / slides.length * 100) + '%' })]),
      h('div', { class: 'score', title: 'Respuestas correctas', 'aria-label': t.got + ' respuestas correctas', html: STAR + '<span>' + t.got + '</span>' }),
      fsOk ? h('button', { type: 'button', class: 'icon-btn', title: 'Pantalla completa', onclick: toggleFs,
        html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg><span class="fs-label">' + (document.fullscreenElement ? 'Salir' : 'Pantalla completa') + '</span>' }) : null,
      h('button', { type: 'button', class: 'icon-btn', title: 'Empezar de nuevo', onclick: restart,
        html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/></svg><span class="fs-label">Reiniciar</span>' })
    ]);
    var foot = h('footer', { class: 'bar foot' }, [
      h('button', { type: 'button', class: 'nav', id: 'prev', disabled: idx === 0, onclick: function () { go(idx - 1); } }, ['← Atrás']),
      h('div', { class: 'counter' }, [h('strong', {}, [String(idx + 1)]), ' / ' + slides.length, h('span', { class: 'keys' }, ['  ·  teclas ', h('kbd', {}, ['←']), ' ', h('kbd', {}, ['→'])])]),
      h('button', { type: 'button', class: 'nav next', id: 'next', disabled: idx === slides.length - 1, onclick: function () { go(idx + 1); } }, [idx === slides.length - 2 ? '¡Final! →' : 'Siguiente →'])
    ]);
    var stage = h('main', { class: 'stage' }, [slide]);
    var focusedId = document.activeElement && document.activeElement.id;
    app.replaceChildren(bar, stage, foot);
    if (focusedId === 'next' || focusedId === 'prev') { var f = document.getElementById(focusedId); if (f && !f.disabled) f.focus(); }
    flash = null;
  }

  function go(n) {
    if (n < 0 || n >= slides.length) return;
    idx = n;
    if (canSpeak) try { window.speechSynthesis.cancel(); } catch (e) {}
    render();
    var stg = app.querySelector('.stage'); if (stg) stg.scrollTop = 0;
    if (slides[idx].type === 'type') { var inp = document.getElementById('ans-' + idx); if (inp && !inp.disabled) inp.focus({ preventScroll: true }); }
  }
  function restart() { setup(); idx = 0; render(); }
  function toggleFs() {
    try {
      var p = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  document.addEventListener('fullscreenchange', function () { render(); });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      // Presenter clickers (PageUp/PageDown) always move; arrows move only while the box is empty.
      var arrow = e.key === 'ArrowRight' || e.key === 'ArrowLeft';
      if (!(e.key === 'PageDown' || e.key === 'PageUp' || (arrow && !e.target.value))) return;
    }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(idx + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(idx - 1); }
    else if (/^[1-4]$/.test(e.key) && slides[idx].type === 'mc') {
      var b = app.querySelector('.opt[data-k="' + (Number(e.key) - 1) + '"]'); if (b && !b.disabled) b.click();
    }
  });
  var tx = null, ty = null;
  document.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; } }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx == null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
  if (canSpeak) try { window.speechSynthesis.getVoices(); } catch (e) {}

  setup();
  render();
})();
