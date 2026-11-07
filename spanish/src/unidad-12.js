/* Unidad 12 · ¿Me dejas una pintura azul? (La Pandilla 1)
   Only vocabulary and grammar from the Unit 12 worksheet.
   In every "options" list, the FIRST option is the correct one (the game shuffles them).
   Cards: [Spanish, English, picture]. */
window.LESSON = {
  theme: 'u12',
  course: 'Unidad 12',
  short: '¿Me dejas una pintura?',
  slides: [
    { type: 'title', eyebrow: 'La Pandilla 1 · Unidad 12', title: '¿Me dejas una pintura azul?', pics: '🖍️ ✏️ 🔢 ☝️ 🛑',
      subtitle: '¡Vamos a practicar los números, las cosas de clase, los colores y los verbos!' },

    { type: 'cards', title: 'Vocabulario', heading: 'Los números del 16 al 20 🔢',
      cards: [['dieciséis', 'sixteen', '16'], ['diecisiete', 'seventeen', '17'], ['dieciocho', 'eighteen', '18'], ['diecinueve', 'nineteen', '19'], ['veinte', 'twenty', '20']] },
    { type: 'cards', title: 'Vocabulario', heading: 'Cosas de clase ✏️',
      cards: [['un lápiz', 'a pencil', '✏️'], ['una pintura', 'a crayon', '🖍️'], ['una goma', 'a rubber / an eraser', '🧽'], ['un pegamento', 'a glue stick', '🧴']] },
    { type: 'cards', title: 'Vocabulario', heading: 'Los colores 🎨',
      cards: [['azul', 'blue', '🔵'], ['verde', 'green', '🟢'], ['amarillo', 'yellow', '🟡'], ['morado', 'purple', '🟣'], ['rosa', 'pink', '🩷']] },
    { type: 'cards', title: 'Vocabulario', heading: 'Los verbos de «Amanda manda» 🕹️',
      cards: [['tocar', 'to touch', '☝️'], ['coger', 'to pick up', '🤲'], ['dejar', 'to leave / to lend', '🤝'], ['ir', 'to go', '🚶‍♀️'],
        ['volver', 'to come back', '🔙'], ['andar', 'to walk', '👣'], ['parar', 'to stop', '🛑']] },
    { type: 'cards', title: 'Vocabulario', heading: 'Frases importantes 💬',
      cards: [['¿Me dejas un lápiz, por favor?', 'Will you lend me a pencil, please?', '✏️'], ['Sí, toma.', 'Yes, here you go.', '🤲'],
        ['Lo siento, no tengo.', "Sorry, I don't have one.", '😔'], ['Gracias.', 'Thank you.', '🙏'],
        ['¿Cuántas pinturas hay?', 'How many crayons are there?', '🤔'], ['Hay diecisiete pinturas.', 'There are seventeen crayons.', '🖍️']] },

    { type: 'mc', title: 'Los números', big: '18', bigClass: 'bignum', prompt: '¿Cómo se dice?', say: 'dieciocho',
      options: ['dieciocho', 'diecisiete', 'diecinueve', 'dieciséis'] },
    { type: 'mc', title: 'Los números', prompt: '¿Qué número es «diecinueve»?', say: 'diecinueve',
      options: ['19', '17', '16', '20'] },
    { type: 'type', title: 'Escribe el número', big: '17', prompt: 'Escribe el número en letra:', answer: ['diecisiete'], say: 'diecisiete' },
    { type: 'type', title: 'Escribe el número', big: '16', prompt: 'Escribe el número en letra:', answer: ['dieciséis'], say: 'dieciséis',
      explain: 'Dieciséis lleva tilde: dieci-SÉIS.' },
    { type: 'type', title: 'Escribe el número', big: '20', prompt: 'Escribe el número en letra:', answer: ['veinte'], say: 'veinte' },
    { type: 'mc', title: '¿Cuántas pinturas hay? 🖍️', count: 17, prompt: 'Hay ___ pinturas.', sub: '¡Cuéntalas!',
      options: ['diecisiete', 'dieciséis', 'diecinueve', 'veinte'] },
    { type: 'mc', title: '¿Cuántas pinturas hay? 🖍️', count: 20, prompt: 'Hay ___ pinturas.', sub: '¡Cuéntalas!',
      options: ['veinte', 'dieciocho', 'diecinueve', 'dieciséis'] },

    { type: 'mc', title: '¿Me lo dejas?', big: '✏️', prompt: '—¿Me dejas un lápiz, por favor?\n—Sí, ___.',
      options: ['toma', 'gracias', 'no tengo'] },
    { type: 'mc', title: '¿Me lo dejas?', big: '🧽', prompt: '—¿Me dejas una goma, por favor?\n—Lo siento, no ___.',
      options: ['tengo', 'toma', 'gracias'] },
    { type: 'mc', title: '¿Me lo dejas?', big: '🖍️', prompt: 'Tu amiga te deja una pintura. ¿Qué dices?',
      options: ['Gracias.', 'Lo siento.', 'Sí, toma.'] },

    { type: 'learn', title: 'Gramática', heading: 'Un / una + color 🎨', reveal: true,
      html:
        '<p>El color combina con la cosa.</p>' +
        '<div class="cols">' +
        '<div class="box"><h3>un 👦</h3><ul><li>un pegamento amarill<span class="reveal end-o">o</span></li><li>un lápiz morad<span class="reveal end-o">o</span></li></ul></div>' +
        '<div class="box"><h3>una 👧</h3><ul><li>una pintura morad<span class="reveal end-o">a</span></li><li>una goma amarill<span class="reveal end-o">a</span></li></ul></div>' +
        '</div>' +
        '<p class="note">¡Ojo! 👀 <b>azul</b>, <b>verde</b> y <b>rosa</b> no cambian: un lápiz azul · una pintura azul.</p>' },
    { type: 'mc', title: '¡Que combinen!', big: '🖍️🟣', prompt: 'Una pintura ___', options: ['morada', 'morado'],
      explain: 'Una pintura → morada.' },
    { type: 'mc', title: '¡Que combinen!', big: '🧴🟡', prompt: 'Un pegamento ___', options: ['amarillo', 'amarilla'],
      explain: 'Un pegamento → amarillo.' },
    { type: 'mc', title: '¡Que combinen!', big: '✏️🔵', prompt: 'Un lápiz ___', options: ['azul', 'azula', 'azulo'],
      explain: 'Azul no cambia: un lápiz azul, una pintura azul.' },
    { type: 'mc', title: '¡Que combinen!', big: '🖍️🟢', prompt: 'Una pintura ___', options: ['verde', 'verda'],
      explain: 'Verde no cambia: una pintura verde.' },

    { type: 'learn', title: 'Gramática', heading: 'Los verbos: yo · tú · él / ella / usted', reveal: true,
      html:
        '<p>El final del verbo cambia con la persona. <b>Él</b>, <b>ella</b> y <b>usted</b> van igual.</p>' +
        '<div class="tw"><table class="conj"><thead><tr><th></th><th>tocar ☝️</th><th>coger 🤲</th></tr></thead><tbody>' +
        '<tr><th>yo</th><td>toc<span class="reveal end-o">o</span></td><td>co<span class="reveal end-o">jo</span></td></tr>' +
        '<tr><th>tú</th><td>toc<span class="reveal end-o">as</span></td><td>cog<span class="reveal end-o">es</span></td></tr>' +
        '<tr><th>él / ella / usted</th><td>toc<span class="reveal end-o">a</span></td><td>cog<span class="reveal end-o">e</span></td></tr>' +
        '</tbody></table></div>' +
        '<p class="note">⭐ Verbos especiales: <b>ir</b> → voy, vas, va · <b>volver</b> → vuelvo, vuelves, vuelve · <b>coger</b> → yo cojo.</p>' },
    { type: 'conj', title: 'Conjugación', verb: 'tocar', pic: '☝️', meaning: 'to touch', forms: ['toco', 'tocas', 'toca'] },
    { type: 'conj', title: 'Conjugación', verb: 'andar', pic: '👣', meaning: 'to walk', forms: ['ando', 'andas', 'anda'] },
    { type: 'conj', title: 'Conjugación', verb: 'parar', pic: '🛑', meaning: 'to stop', forms: ['paro', 'paras', 'para'] },
    { type: 'conj', title: 'Conjugación', verb: 'dejar', pic: '🤝', meaning: 'to leave / to lend', forms: ['dejo', 'dejas', 'deja'] },
    { type: 'conj', title: 'Conjugación', verb: 'coger', pic: '🤲', meaning: 'to pick up', forms: ['cojo', 'coges', 'coge'], trap: 'cogo',
      explain: 'Con yo se escribe con j: cojo.' },
    { type: 'conj', title: 'Conjugación', verb: 'volver', pic: '🔙', meaning: 'to come back', forms: ['vuelvo', 'vuelves', 'vuelve'], trap: 'volvo',
      explain: 'Volver cambia: vuelvo, vuelves, vuelve.' },
    { type: 'conj', title: 'Conjugación', verb: 'ir', pic: '🚶‍♀️', meaning: 'to go', forms: ['voy', 'vas', 'va'], trap: 'iro',
      explain: 'Ir es especial: voy, vas, va.' },

    { type: 'mc', title: 'Amanda manda 🕹️', big: '☝️', prompt: 'Yo ___ la mesa.', sub: '(tocar)', options: ['toco', 'tocas', 'toca'] },
    { type: 'mc', title: 'Amanda manda 🕹️', big: '✏️', prompt: 'Tú ___ el lápiz.', sub: '(coger)', options: ['coges', 'cojo', 'coge'] },
    { type: 'mc', title: 'Amanda manda 🕹️', big: '🧽', prompt: 'Ella ___ la goma.', sub: '(dejar)', options: ['deja', 'dejo', 'dejas'] },
    { type: 'mc', title: 'Amanda manda 🕹️', big: '🛑', prompt: 'Usted ___.', sub: '(parar)', options: ['para', 'paro', 'paras'],
      explain: 'Usted va como él / ella: para.' },
    { type: 'mc', title: 'Amanda manda 🕹️', big: '🔙', prompt: 'Él ___.', sub: '(volver)', options: ['vuelve', 'vuelvo', 'volve'] },
    { type: 'mc', title: 'Amanda manda 🕹️', prompt: '«Amanda manda tocar la mesa.»\n¿Qué haces?',
      options: ['☝️ Touch the table.', '👣 Walk to the table.', '🛑 Stop at the table.'] },

    { type: 'build', title: 'Descifra el código 🔐', prompt: 'E J R A D', sub: 'Ordena las letras. ¡Es un verbo!', letters: true, scrambled: 'EJRAD', answer: 'DEJAR' },
    { type: 'build', title: 'Descifra el código 🔐', prompt: 'O C G E R', sub: 'Ordena las letras. ¡Es un verbo!', letters: true, scrambled: 'OCGER', answer: 'COGER' },
    { type: 'build', title: 'Descifra el código 🔐', prompt: 'R A P R A', sub: 'Ordena las letras. ¡Es un verbo!', letters: true, scrambled: 'RAPRA', answer: 'PARAR' },
    { type: 'build', title: 'Pide prestado 🖍️', prompt: 'Ordena la frase:', sub: 'Pide una pintura verde.',
      tiles: ['¿Me', 'dejas', 'una', 'pintura', 'verde,', 'por', 'favor?'] },

    { type: 'tf', title: '¿Verdad o mentira? 🤔', statements: [
      ['«Gracias» se dice cuando alguien te ayuda.', true],
      ['«Lo siento, no tengo» es una forma de decir que sí.', false],
      ['«Dieciocho» es el número 18.', true],
      ['«Parar» significa seguir andando.', false]
    ] },

    { type: 'end' }
  ]
};
