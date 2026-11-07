/* Unidad 15 · ¿Qué te gusta hacer en tu tiempo libre? (La Pandilla 1)
   In every "options" list, the FIRST option is the correct one (the game shuffles them). */
var LEA_TEXT = '«¡Hola! Me llamo Lea. En mi tiempo libre <b>me gusta mucho</b> dibujar y leer. <b>Me gusta poco</b> ver la tele y <b>no me gusta nada</b> hacer la cama. <b>Sé</b> patinar, pero <b>no sé</b> tocar el violín. Mi amigo Juan <b>sabe</b> tocar la guitarra y <b>le gusta</b> mucho ir al parque.»';

window.LESSON = {
  theme: 'u15',
  course: 'La Pandilla 1 · Unidad 15',
  short: 'Mi tiempo libre',
  slides: [
    { type: 'title', eyebrow: 'La Pandilla 1 · Unidad 15', title: '¿Qué te gusta hacer en tu tiempo libre?',
      subtitle: 'Las actividades de tiempo libre, cuánto nos gustan y lo que sabemos hacer.',
      chips: ['Vocabulario', 'mucho · poco · nada', 'gustar: me · te · le', 'saber: sé · sabes · sabe'] },

    { type: 'cards', title: 'Mi vocabulario', heading: 'Cosas que me gusta hacer (1)',
      cards: [['leer', 'to read'], ['dibujar', 'to draw'], ['cantar', 'to sing'], ['bailar', 'to dance'], ['patinar', 'to skate'], ['nadar', 'to swim'], ['cocinar', 'to cook']] },
    { type: 'cards', title: 'Mi vocabulario', heading: 'Cosas que me gusta hacer (2)',
      cards: [['silbar', 'to whistle'], ['jugar al fútbol', 'to play football'], ['montar en bici', 'to ride a bike'], ['ver la tele', 'to watch TV'], ['escuchar música', 'to listen to music'], ['ir al parque', 'to go to the park']] },
    { type: 'cards', title: 'Mi vocabulario', heading: 'Cosas que me gusta hacer (3)',
      cards: [['ir al cine', 'to go to the cinema'], ['tocar la guitarra', 'to play the guitar'], ['tocar la batería', 'to play the drums'], ['tocar el violín', 'to play the violin'], ['hacer la cama', 'to make the bed'], ['hacer los deberes', 'to do homework']] },
    { type: 'cards', title: 'Mi vocabulario', heading: '¿Cuánto me gusta?',
      cards: [['😍 Me gusta mucho.', 'I like it a lot.'], ['🙂 Me gusta poco.', 'I like it a little.'], ['🙁 No me gusta nada.', "I don't like it at all."]] },

    { type: 'mc', title: 'Vocabulario', prompt: '¿Qué significa «silbar»?', say: 'silbar',
      options: ['to whistle', 'to sing', 'to swim', 'to skate'] },
    { type: 'mc', title: 'Vocabulario', prompt: '¿Cómo se dice «to do homework»?',
      options: ['hacer los deberes', 'hacer la cama', 'ver la tele', 'leer'] },
    { type: 'mc', title: 'Vocabulario', prompt: '¿Cómo se dice «to play the drums»?',
      options: ['tocar la batería', 'tocar la guitarra', 'tocar el violín', 'jugar al fútbol'] },
    { type: 'type', title: 'Reto 1 · Completa la palabra', prompt: 'dibu_ar', sub: 'Escribe la palabra completa.', answer: ['dibujar'], say: 'dibujar' },
    { type: 'type', title: 'Reto 1 · Completa la palabra', prompt: 'sil_ar', sub: 'Escribe la palabra completa.', answer: ['silbar'], say: 'silbar' },
    { type: 'type', title: 'Reto 1 · Completa la palabra', prompt: 'tocar el vi_lín', sub: 'Escribe la palabra completa.', answer: ['tocar el violín'], say: 'tocar el violín',
      explain: 'Violín lleva tilde en la í.' },

    { type: 'learn', title: 'Gramática', heading: 'Gustar: me · te · le', reveal: true,
      html:
        '<p>Para hablar de actividades decimos <b>gusta</b> + el verbo sin cambiar: «Me gusta bailar».</p>' +
        '<div class="tw"><table class="conj"><tbody>' +
        '<tr><th>(a mí)</th><td><span class="reveal end-o">me</span> gusta bailar</td><td>I like</td></tr>' +
        '<tr><th>(a ti)</th><td><span class="reveal end-o">te</span> gusta bailar</td><td>you like</td></tr>' +
        '<tr><th>(a él / a ella / a usted)</th><td><span class="reveal end-o">le</span> gusta bailar</td><td>he / she likes · you like</td></tr>' +
        '</tbody></table></div>' +
        '<p class="note">Con un nombre ponemos <b>a</b>: «<b>A</b> Juan le gusta ir al cine». Y <b>a + el = al</b>: ir al parque, jugar al fútbol.</p>' },
    { type: 'conj', title: 'Conjugación', heading: '¿Me, te o le?', verb: 'gustar', meaning: 'to like',
      pronouns: ['(a mí)', '(a ti)', '(a él / a ella / a usted)'], forms: ['me gusta', 'te gusta', 'le gusta'] },

    { type: 'learn', title: 'Gramática', heading: 'Saber + verbo = saber hacer algo', reveal: true,
      html:
        '<p><b>Saber</b> + verbo significa <i>know how to</i>: «Sé nadar» = <i>I know how to swim</i>.</p>' +
        '<div class="tw"><table class="conj"><tbody>' +
        '<tr><th>(yo)</th><td><span class="reveal end-o">sé</span> nadar</td><td>I can swim</td></tr>' +
        '<tr><th>(tú)</th><td><span class="reveal end-o">sabes</span> nadar</td><td>you can swim</td></tr>' +
        '<tr><th>(él / ella / usted)</th><td><span class="reveal end-o">sabe</span> nadar</td><td>he / she can swim · you can swim</td></tr>' +
        '</tbody></table></div>' +
        '<p class="note">¡Ojo con la tilde! <b>sé</b> (I know) lleva tilde. Sin tilde, «se» es otra palabra.</p>' },
    { type: 'conj', title: 'Conjugación', verb: 'saber', meaning: 'to know how to', forms: ['sé', 'sabes', 'sabe'], trap: 'se',
      explain: 'Recuerda: yo sé, con tilde.' },
    { type: 'type', title: 'Conjugación', prompt: 'Yo ___ patinar.', sub: '(saber)', answer: ['sé'], strict: true,
      explain: 'Yo sé lleva tilde.' },

    { type: 'mc', title: 'Reto 2 · ¿Me gusta… o sé?', prompt: '¿___ gusta bailar?', sub: '(a ti)', options: ['Te', 'Me', 'Le'] },
    { type: 'mc', title: 'Reto 2 · ¿Me gusta… o sé?', prompt: 'A mi padre ___ gusta cocinar.', options: ['le', 'me', 'te'] },
    { type: 'mc', title: 'Reto 2 · ¿Me gusta… o sé?', prompt: 'Yo ___ tocar la guitarra.', options: ['sé', 'sabe', 'sabes', 'se'] },
    { type: 'mc', title: 'Reto 2 · ¿Me gusta… o sé?', prompt: '¿Tú ___ nadar?', options: ['sabes', 'sé', 'sabe'] },
    { type: 'mc', title: 'Reto 2 · ¿Me gusta… o sé?', prompt: 'Mi madre ___ cantar muy bien.', options: ['sabe', 'sé', 'sabes'] },
    { type: 'mc', title: 'Reto 2 · ¿Me gusta… o sé?', prompt: '—¿Sabes patinar?\n—No, no ___.', options: ['sé', 'sabes', 'sabe'] },
    { type: 'mc', title: 'Reto 2 · ¿Me gusta… o sé?', prompt: 'A Ana ___ gusta leer.', options: ['le', 'me', 'te'] },

    { type: 'mc', title: 'Reto 5 · ¿Mucho, poco o nada?', big: '😍', prompt: 'Me gusta ___.', options: ['mucho', 'poco', 'nada'] },
    { type: 'mc', title: 'Reto 5 · ¿Mucho, poco o nada?', big: '🙂', prompt: 'Me gusta ___.', options: ['poco', 'mucho', 'nada'] },
    { type: 'mc', title: 'Reto 5 · ¿Mucho, poco o nada?', big: '🙁', prompt: 'No me gusta ___.', options: ['nada', 'mucho', 'poco'],
      explain: 'Con «nada» ponemos «no» delante: No me gusta nada.' },

    { type: 'mc', title: 'Reto 4 · Adivina la actividad', prompt: 'Uso los pies y un balón en el campo.', options: ['jugar al fútbol', 'montar en bici', 'bailar', 'nadar'] },
    { type: 'mc', title: 'Reto 4 · Adivina la actividad', prompt: 'Tiene dos ruedas y pedales.', options: ['montar en bici', 'tocar la guitarra', 'nadar', 'dibujar'] },
    { type: 'mc', title: 'Reto 4 · Adivina la actividad', prompt: 'Necesito lápices de colores y papel.', options: ['dibujar', 'cocinar', 'bailar', 'jugar al fútbol'] },
    { type: 'mc', title: 'Reto 4 · Adivina la actividad', prompt: 'Muevo brazos y piernas dentro de la piscina.', options: ['nadar', 'patinar', 'bailar', 'montar en bici'] },
    { type: 'mc', title: 'Reto 4 · Adivina la actividad', prompt: 'Toco las cuerdas de un instrumento.', options: ['tocar la guitarra', 'tocar la batería', 'cantar', 'silbar'] },
    { type: 'mc', title: 'Reto 4 · Adivina la actividad', prompt: 'Pongo música y muevo todo el cuerpo.', options: ['bailar', 'cantar', 'nadar', 'leer'] },

    { type: 'build', title: 'Reto 3 · Ordena y corrige', prompt: 'Ordena la frase.', sub: '¡Cuidado! Hay una palabra mal escrita que no debes usar.',
      tiles: ['En', 'mi', 'tiempo', 'libre', 'me', 'gusta', 'montar en bici'], extra: ['gusto'],
      alts: ['Me gusta montar en bici en mi tiempo libre'] },
    { type: 'build', title: 'Reto 3 · Ordena y corrige', prompt: 'Ordena la frase.', sub: '¡Cuidado! Hay una palabra mal escrita que no debes usar.',
      tiles: ['A', 'Juan', 'le', 'gusta', 'ir', 'al cine'], extra: ['al sine'] },
    { type: 'build', title: 'Reto 3 · Ordena y corrige', prompt: 'Ordena la frase.', sub: '¡Cuidado! Hay una palabra mal escrita que no debes usar.',
      tiles: ['Yo', 'sé', 'nadar', 'y', 'patinar'], extra: ['sabo'], alts: ['Yo sé patinar y nadar'] },
    { type: 'build', title: 'Reto 3 · Ordena y corrige', prompt: 'Ordena la frase.', sub: '¡Cuidado! Hay una palabra mal escrita que no debes usar.',
      tiles: ['No', 'me', 'gusta', 'nada', 'cocinar'], extra: ['cocinars'] },

    { type: 'learn', title: 'Reto 6 · Lee y responde', heading: 'Lee el texto con atención',
      html: '<div class="passage" style="font-size:clamp(1.15rem,2.2vw,1.6rem);line-height:1.6">' + LEA_TEXT + '</div>' },
    { type: 'mc', title: 'Reto 6 · Lee y responde', passage: LEA_TEXT, prompt: '¿Qué le gusta mucho a Lea?',
      options: ['dibujar y leer', 'ver la tele', 'hacer la cama', 'tocar el violín'] },
    { type: 'mc', title: 'Reto 6 · Lee y responde', passage: LEA_TEXT, prompt: '¿Qué no le gusta nada a Lea?',
      options: ['hacer la cama', 'dibujar', 'patinar', 'leer'] },
    { type: 'mc', title: 'Reto 6 · Lee y responde', passage: LEA_TEXT, prompt: '¿Sabe Lea tocar el violín?',
      options: ['No, no sabe.', 'Sí, sabe.', 'No, no sé.'], explain: 'Hablamos de Lea (ella), por eso: no sabe.' },
    { type: 'mc', title: 'Reto 6 · Lee y responde', passage: LEA_TEXT, prompt: '¿Qué sabe tocar Juan?',
      options: ['la guitarra', 'el violín', 'la batería'] },
    { type: 'tf', title: 'Reto 6 · Lee y responde', heading: '¿Verdad o mentira?', passage: LEA_TEXT, statements: [
      ['A Lea le gusta mucho ver la tele.', false],
      ['Lea sabe patinar.', true],
      ['A Juan le gusta ir al parque.', true],
      ['A Lea le gusta mucho hacer la cama.', false]
    ] },

    { type: 'mc', title: 'Reto 7 · Detective de errores', prompt: '¿Qué frase es correcta?',
      options: ['A Juan le gusta ir al cine.', 'A Juan me gusta ir al cine.'], explain: 'Juan es «él», por eso: le gusta.' },
    { type: 'mc', title: 'Reto 7 · Detective de errores', prompt: '¿Qué frase es correcta?',
      options: ['Yo sé patinar muy bien.', 'Yo sabe patinar muy bien.'], explain: 'Con yo: sé.' },
    { type: 'mc', title: 'Reto 7 · Detective de errores', prompt: '¿Qué frase es correcta?',
      options: ['Tú sabes cantar en inglés.', 'Tú sé cantar en inglés.'], explain: 'Con tú: sabes.' },
    { type: 'mc', title: 'Reto 7 · Detective de errores', prompt: '¿Qué frase es correcta?',
      options: ['Me gusta jugar al fútbol.', 'Me gusta jugar a el fútbol.'], explain: 'a + el = al.' },
    { type: 'mc', title: 'Reto 7 · Detective de errores', prompt: '¿Qué frase es correcta?',
      options: ['A mi madre le gusta bailar.', 'Mi madre le gusta bailar.'], explain: 'Con una persona ponemos «a» delante: A mi madre le gusta…' },

    { type: 'end' }
  ]
};
