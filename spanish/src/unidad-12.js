/* Unidad 12 · ¿Me dejas una pintura azul? (La Pandilla 1)
   In every "options" list, the FIRST option is the correct one (the game shuffles them). */
window.LESSON = {
  theme: 'u12',
  course: 'La Pandilla 1 · Unidad 12',
  short: '¿Me dejas una pintura?',
  slides: [
    { type: 'title', eyebrow: 'La Pandilla 1 · Unidad 12', title: '¿Me dejas una pintura azul?',
      subtitle: 'Números del 16 al 20, cómo pedir cosas de clase, los colores con un / una y los verbos de «Amanda manda».',
      chips: ['Vocabulario', 'Números 16–20', 'Un / una + color', 'Verbos: yo · tú · él / ella / usted'] },

    { type: 'cards', title: 'Mi vocabulario', heading: 'Números del 16 al 20',
      cards: [['dieciséis', '16'], ['diecisiete', '17'], ['dieciocho', '18'], ['diecinueve', '19'], ['veinte', '20']] },
    { type: 'cards', title: 'Mi vocabulario', heading: 'Los verbos de «Amanda manda»',
      cards: [['tocar', 'to touch'], ['coger', 'to pick up'], ['dejar', 'to leave / to lend'], ['ir', 'to go'], ['volver', 'to come back'], ['andar', 'to walk'], ['parar', 'to stop']] },
    { type: 'cards', title: 'Mi vocabulario', heading: 'Frases importantes',
      cards: [['¿Me dejas un lápiz, por favor?', 'Will you lend me a pencil, please?'], ['Sí, toma.', 'Yes, here you go.'], ['Lo siento, no tengo.', "Sorry, I don't have one."],
        ['Gracias.', 'Thank you.'], ['¿Cuántas pinturas hay?', 'How many crayons are there?'], ['Hay diecisiete pinturas.', 'There are seventeen crayons.']] },

    { type: 'mc', title: 'Reto 2 · Números', prompt: '¿Cómo se dice 18?', big: '18', bigClass: 'bignum',
      options: ['dieciocho', 'diecisiete', 'diecinueve', 'dieciséis'], say: 'dieciocho' },
    { type: 'mc', title: 'Reto 2 · Números', prompt: '¿Qué número es «diecinueve»?', say: 'diecinueve',
      options: ['19', '17', '16', '20'] },
    { type: 'type', title: 'Reto 2 · Escribe el número', prompt: 'Escribe este número en letra:', big: '17',
      answer: ['diecisiete'], say: 'diecisiete' },
    { type: 'type', title: 'Reto 2 · Escribe el número', prompt: 'Escribe este número en letra:', big: '16',
      answer: ['dieciséis'], say: 'dieciséis', explain: 'Dieciséis lleva tilde: dieci-SÉIS.' },
    { type: 'type', title: 'Reto 2 · Escribe el número', prompt: 'Escribe este número en letra:', big: '20',
      answer: ['veinte'], say: 'veinte' },

    { type: 'mc', title: '¿Cuántas pinturas hay?', count: 17, prompt: 'Hay ___ pinturas.', sub: 'Cuenta las pinturas.',
      options: ['diecisiete', 'dieciséis', 'diecinueve', 'veinte'] },
    { type: 'mc', title: '¿Cuántas pinturas hay?', count: 20, prompt: 'Hay ___ pinturas.', sub: 'Cuenta las pinturas.',
      options: ['veinte', 'dieciocho', 'diecinueve', 'dieciséis'] },

    { type: 'mc', title: 'Reto 1 · ¿Me lo dejas?', prompt: '—¿Me dejas un lápiz, por favor?\n—Sí, ___.',
      options: ['toma', 'gracias', 'no tengo', 'dejas'] },
    { type: 'mc', title: 'Reto 1 · ¿Me lo dejas?', prompt: '—¿Me dejas una goma, por favor?\n—Lo siento, no ___.',
      options: ['tengo', 'toma', 'gracias', 'dejas'] },
    { type: 'mc', title: 'Reto 1 · ¿Me lo dejas?', prompt: 'Tu amiga te deja una pintura. ¿Qué le dices?',
      options: ['Gracias.', 'Lo siento.', 'Sí, toma.', 'No tengo.'] },
    { type: 'mc', title: 'Reto 1 · ¿Me lo dejas?', prompt: '¿Me ___ una pintura azul, por favor?', sub: '(tú + dejar)',
      options: ['dejas', 'dejo', 'deja', 'dejar'], explain: 'Hablas con tu amiga (tú), por eso decimos «¿me dejas…?».' },

    { type: 'learn', title: 'Gramática', heading: 'Un / una + color', reveal: true,
      html:
        '<p>El color tiene que <b>combinar</b> con la cosa: si la cosa es masculina (<b>un</b>), el color termina en <b>-o</b>; si es femenina (<b>una</b>), termina en <b>-a</b>.</p>' +
        '<div class="cols">' +
        '<div class="box"><h3>un · masculino</h3><ul><li>un pegamento amarill<span class="reveal end-o">o</span></li><li>un lápiz morad<span class="reveal end-o">o</span></li><li>un estuche rojo</li></ul></div>' +
        '<div class="box"><h3>una · femenino</h3><ul><li>una pintura morad<span class="reveal end-o">a</span></li><li>una goma amarill<span class="reveal end-o">a</span></li><li>una regla roja</li></ul></div>' +
        '</div>' +
        '<p class="note">¡Ojo! <b>azul</b>, <b>verde</b> y <b>rosa</b> no cambian: un lápiz azul · una pintura azul.</p>' },
    { type: 'mc', title: 'Reto 3 · ¡Que combinen!', prompt: 'Una pintura ___', sub: '(morado)',
      options: ['morada', 'morado'], explain: 'Una pintura → femenino → morada.' },
    { type: 'mc', title: 'Reto 3 · ¡Que combinen!', prompt: 'Un pegamento ___', sub: '(amarillo)',
      options: ['amarillo', 'amarilla'], explain: 'Un pegamento → masculino → amarillo.' },
    { type: 'mc', title: 'Reto 3 · ¡Que combinen!', prompt: 'Una goma ___', sub: '(amarillo)',
      options: ['amarilla', 'amarillo'], explain: 'Una goma → femenino → amarilla.' },
    { type: 'mc', title: 'Reto 3 · ¡Que combinen!', prompt: 'Un lápiz ___', sub: '(azul)',
      options: ['azul', 'azula', 'azulo'], explain: 'Azul no cambia nunca: un lápiz azul, una pintura azul.' },
    { type: 'mc', title: 'Reto 3 · ¡Que combinen!', prompt: '¿Cuál está bien?',
      options: ['una pintura verde', 'una pintura verda', 'un pintura verde'], explain: 'Pintura es femenino (una) y verde no cambia.' },

    { type: 'learn', title: 'Gramática', heading: 'Los verbos con yo, tú, él / ella / usted', reveal: true,
      html:
        '<p>El final del verbo cambia según la persona. Con <b>él</b>, <b>ella</b> y <b>usted</b> el verbo es igual.</p>' +
        '<div class="tw"><table class="conj"><thead><tr><th></th><th>-ar · tocar</th><th>-er · coger</th></tr></thead><tbody>' +
        '<tr><th>yo</th><td>toc<span class="reveal end-o">o</span></td><td>co<span class="reveal end-o">jo</span></td></tr>' +
        '<tr><th>tú</th><td>toc<span class="reveal end-o">as</span></td><td>cog<span class="reveal end-o">es</span></td></tr>' +
        '<tr><th>él / ella / usted</th><td>toc<span class="reveal end-o">a</span></td><td>cog<span class="reveal end-o">e</span></td></tr>' +
        '</tbody></table></div>' +
        '<p class="note">Verbos especiales: <b>ir</b> → voy, vas, va · <b>volver</b> → vuelvo, vuelves, vuelve · <b>coger</b> → yo cojo (con j).</p>' },
    { type: 'conj', title: 'Conjugación', verb: 'tocar', meaning: 'to touch', forms: ['toco', 'tocas', 'toca'] },
    { type: 'conj', title: 'Conjugación', verb: 'andar', meaning: 'to walk', forms: ['ando', 'andas', 'anda'] },
    { type: 'conj', title: 'Conjugación', verb: 'parar', meaning: 'to stop', forms: ['paro', 'paras', 'para'] },
    { type: 'conj', title: 'Conjugación', verb: 'dejar', meaning: 'to leave / to lend', forms: ['dejo', 'dejas', 'deja'] },
    { type: 'conj', title: 'Conjugación', verb: 'coger', meaning: 'to pick up', forms: ['cojo', 'coges', 'coge'], trap: 'cogo',
      explain: 'Con yo se escribe con j: cojo.' },
    { type: 'conj', title: 'Conjugación', verb: 'volver', meaning: 'to come back', forms: ['vuelvo', 'vuelves', 'vuelve'], trap: 'volvo',
      explain: 'Volver cambia la o por ue: vuelvo, vuelves, vuelve.' },
    { type: 'conj', title: 'Conjugación', verb: 'ir', meaning: 'to go', forms: ['voy', 'vas', 'va'], trap: 'iro',
      explain: 'Ir es muy especial: voy, vas, va.' },

    { type: 'mc', title: 'Amanda manda', prompt: 'Yo ___ la mesa.', sub: '(tocar)', options: ['toco', 'tocas', 'toca'] },
    { type: 'mc', title: 'Amanda manda', prompt: 'Tú ___ a la puerta.', sub: '(ir)', options: ['vas', 'voy', 'va'] },
    { type: 'mc', title: 'Amanda manda', prompt: 'Ella ___ a su sitio.', sub: '(volver)', options: ['vuelve', 'vuelvo', 'vuelves', 'volve'] },
    { type: 'mc', title: 'Amanda manda', prompt: 'Usted ___ el lápiz.', sub: '(coger)', options: ['coge', 'cojo', 'coges'],
      explain: 'Usted va como él / ella: coge.' },
    { type: 'mc', title: 'Amanda manda', prompt: 'Él ___ por la clase.', sub: '(andar)', options: ['anda', 'ando', 'andas'] },
    { type: 'mc', title: 'Amanda manda', prompt: '«Amanda manda tocar la mesa.»\n¿Qué tienes que hacer?',
      options: ['Touch the table.', 'Walk to the table.', 'Leave the table.', 'Stop at the table.'] },
    { type: 'mc', title: 'Amanda manda', prompt: '«Amanda manda… ¡parar!»\n¿Qué tienes que hacer?',
      options: ['Stop.', 'Walk.', 'Come back.', 'Pick up a pencil.'] },

    { type: 'build', title: 'Reto 5 · Descifra el código', prompt: 'E J R A D', sub: 'Ordena las letras para formar un verbo.',
      letters: true, scrambled: 'EJRAD', answer: 'DEJAR' },
    { type: 'build', title: 'Reto 5 · Descifra el código', prompt: 'O C G E R', sub: 'Ordena las letras para formar un verbo.',
      letters: true, scrambled: 'OCGER', answer: 'COGER' },
    { type: 'build', title: 'Reto 5 · Descifra el código', prompt: 'R A P R A', sub: 'Ordena las letras para formar un verbo.',
      letters: true, scrambled: 'RAPRA', answer: 'PARAR' },
    { type: 'build', title: 'Reto 9 · Pide prestado', prompt: 'Ordena la frase:', sub: 'Pide una pintura verde a tu amiga.',
      tiles: ['¿Me', 'dejas', 'una', 'pintura', 'verde,', 'por', 'favor?'] },

    { type: 'tf', title: 'Reto 6 · ¿Verdad o mentira?', statements: [
      ['«Gracias» se dice cuando alguien te ayuda.', true],
      ['«Lo siento, no tengo» es una forma de decir que sí.', false],
      ['«Dieciocho» es el número 18.', true],
      ['«Parar» significa seguir andando.', false],
      ['Decimos «un pegamento amarillo» y «una goma amarilla».', true]
    ] },

    { type: 'end' }
  ]
};
