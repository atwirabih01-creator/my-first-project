/* Unidad 15 · ¿Qué te gusta hacer en tu tiempo libre? (La Pandilla 1)
   Only vocabulary and grammar from the Unit 15 worksheet, singular pronouns only.
   In every "options" list, the FIRST option is the correct one (the game shuffles them).
   Cards: [Spanish, English, picture]. */
window.LESSON = {
  theme: 'u15',
  course: 'Unidad 15',
  short: 'Mi tiempo libre',
  slides: [
    { type: 'title', eyebrow: 'La Pandilla 1 · Unidad 15', title: '¿Qué te gusta hacer en tu tiempo libre?', pics: '🎸 🚲 ⚽ 💃 📖',
      subtitle: '¡Vamos a practicar las actividades, «me gusta» y «sé»!' },

    { type: 'cards', title: 'Vocabulario', heading: 'Cosas que me gusta hacer (1)',
      cards: [['leer', 'to read', '📖'], ['dibujar', 'to draw', '🖍️'], ['cantar', 'to sing', '🎤'], ['bailar', 'to dance', '💃'],
        ['patinar', 'to skate', '⛸️'], ['nadar', 'to swim', '🏊'], ['cocinar', 'to cook', '🍳']] },
    { type: 'cards', title: 'Vocabulario', heading: 'Cosas que me gusta hacer (2)',
      cards: [['silbar', 'to whistle', '🎶'], ['jugar al fútbol', 'to play football', '⚽'], ['montar en bici', 'to ride a bike', '🚲'],
        ['ver la tele', 'to watch TV', '📺'], ['escuchar música', 'to listen to music', '🎧'], ['ir al parque', 'to go to the park', '🌳']] },
    { type: 'cards', title: 'Vocabulario', heading: 'Cosas que me gusta hacer (3)',
      cards: [['ir al cine', 'to go to the cinema', '🎬'], ['tocar la guitarra', 'to play the guitar', '🎸'], ['tocar la batería', 'to play the drums', '🥁'],
        ['tocar el violín', 'to play the violin', '🎻'], ['hacer la cama', 'to make the bed', '🛏️'], ['hacer los deberes', 'to do homework', '📝']] },
    { type: 'cards', title: 'Vocabulario', heading: '¿Cuánto me gusta?',
      cards: [['Me gusta mucho.', 'I like it a lot.', '😍'], ['Me gusta poco.', 'I like it a little.', '🙂'], ['No me gusta nada.', "I don't like it at all.", '🙁']] },

    { type: 'mc', title: 'Vocabulario', big: '🎶', prompt: '¿Qué es?', options: ['silbar', 'cantar', 'nadar', 'leer'] },
    { type: 'mc', title: 'Vocabulario', big: '📝', prompt: '¿Qué es?', options: ['hacer los deberes', 'hacer la cama', 'ver la tele', 'dibujar'] },
    { type: 'mc', title: 'Vocabulario', big: '🥁', prompt: '¿Qué es?', options: ['tocar la batería', 'tocar la guitarra', 'tocar el violín', 'escuchar música'] },
    { type: 'mc', title: 'Vocabulario', big: '🚲', prompt: '¿Qué es?', options: ['montar en bici', 'patinar', 'jugar al fútbol', 'ir al parque'] },
    { type: 'type', title: 'Completa la palabra', big: '🖍️', prompt: 'dibu_ar', sub: 'Escribe la palabra completa.', answer: ['dibujar'], say: 'dibujar' },
    { type: 'type', title: 'Completa la palabra', big: '🎶', prompt: 'sil_ar', sub: 'Escribe la palabra completa.', answer: ['silbar'], say: 'silbar' },
    { type: 'type', title: 'Completa la palabra', big: '🎻', prompt: 'tocar el vi_lín', sub: 'Escribe la palabra completa.', answer: ['tocar el violín'], say: 'tocar el violín',
      explain: 'Violín lleva tilde en la í.' },

    { type: 'learn', title: 'Gramática', heading: 'Gustar: me · te · le 💛', reveal: true,
      html:
        '<p>Decimos <b>gusta</b> + el verbo sin cambiar: «Me gusta bailar» 💃.</p>' +
        '<div class="tw"><table class="conj"><tbody>' +
        '<tr><th>(a mí)</th><td><span class="reveal end-o">me</span> gusta bailar</td><td>I like</td></tr>' +
        '<tr><th>(a ti)</th><td><span class="reveal end-o">te</span> gusta bailar</td><td>you like</td></tr>' +
        '<tr><th>(a él / a ella)</th><td><span class="reveal end-o">le</span> gusta bailar</td><td>he / she likes</td></tr>' +
        '</tbody></table></div>' +
        '<p class="note">⭐ Con un nombre ponemos <b>a</b>: «<b>A</b> Juan le gusta ir al cine». Y <b>a + el = al</b>: ir al parque, jugar al fútbol.</p>' },
    { type: 'conj', title: 'Conjugación', heading: '¿Me, te o le?', verb: 'gustar', pic: '💛', meaning: 'to like',
      pronouns: ['(a mí)', '(a ti)', '(a él / a ella)'], forms: ['me gusta', 'te gusta', 'le gusta'] },

    { type: 'learn', title: 'Gramática', heading: 'Saber: sé · sabes · sabe 🧠', reveal: true,
      html:
        '<p><b>Saber</b> + verbo = <i>know how to</i>: «Sé nadar» 🏊 = <i>I can swim</i>.</p>' +
        '<div class="tw"><table class="conj"><tbody>' +
        '<tr><th>(yo)</th><td><span class="reveal end-o">sé</span> nadar</td><td>I can swim</td></tr>' +
        '<tr><th>(tú)</th><td><span class="reveal end-o">sabes</span> nadar</td><td>you can swim</td></tr>' +
        '<tr><th>(él / ella)</th><td><span class="reveal end-o">sabe</span> nadar</td><td>he / she can swim</td></tr>' +
        '</tbody></table></div>' +
        '<p class="note">👀 ¡Ojo con la tilde! Yo <b>sé</b>.</p>' },
    { type: 'conj', title: 'Conjugación', verb: 'saber', pic: '🧠', meaning: 'to know how to', pronouns: ['(yo)', '(tú)', '(él / ella)'],
      forms: ['sé', 'sabes', 'sabe'], trap: 'se', explain: 'Recuerda: yo sé, con tilde.' },
    { type: 'type', title: 'Conjugación', big: '⛸️', prompt: 'Yo ___ patinar.', sub: '(saber)', answer: ['sé'], strict: true,
      explain: 'Yo sé lleva tilde.' },

    { type: 'mc', title: '¿Me gusta… o sé?', big: '💃', prompt: '¿___ gusta bailar?', sub: '(a ti)', options: ['Te', 'Me', 'Le'] },
    { type: 'mc', title: '¿Me gusta… o sé?', big: '🍳', prompt: 'A mi padre ___ gusta cocinar.', options: ['le', 'me', 'te'] },
    { type: 'mc', title: '¿Me gusta… o sé?', big: '📖', prompt: 'A Ana ___ gusta leer.', options: ['le', 'me', 'te'] },
    { type: 'mc', title: '¿Me gusta… o sé?', big: '🎸', prompt: 'Yo ___ tocar la guitarra.', options: ['sé', 'sabe', 'sabes'] },
    { type: 'mc', title: '¿Me gusta… o sé?', big: '🏊', prompt: '¿Tú ___ nadar?', options: ['sabes', 'sé', 'sabe'] },
    { type: 'mc', title: '¿Me gusta… o sé?', big: '🎤', prompt: 'Mi madre ___ cantar muy bien.', options: ['sabe', 'sé', 'sabes'] },
    { type: 'mc', title: '¿Me gusta… o sé?', big: '⛸️', prompt: '—¿Sabes patinar?\n—No, no ___.', options: ['sé', 'sabes', 'sabe'] },

    { type: 'mc', title: '¿Mucho, poco o nada?', big: '😍', prompt: 'Me gusta ___.', options: ['mucho', 'poco', 'nada'] },
    { type: 'mc', title: '¿Mucho, poco o nada?', big: '🙂', prompt: 'Me gusta ___.', options: ['poco', 'mucho', 'nada'] },
    { type: 'mc', title: '¿Mucho, poco o nada?', big: '🙁', prompt: 'No me gusta ___.', options: ['nada', 'mucho', 'poco'],
      explain: 'Con «nada» ponemos «no» delante: No me gusta nada.' },

    { type: 'mc', title: 'Adivina la actividad 🔮', prompt: 'Uso los pies y un balón en el campo.', options: ['jugar al fútbol', 'montar en bici', 'bailar', 'nadar'] },
    { type: 'mc', title: 'Adivina la actividad 🔮', prompt: 'Tiene dos ruedas y pedales.', options: ['montar en bici', 'tocar la guitarra', 'nadar', 'dibujar'] },
    { type: 'mc', title: 'Adivina la actividad 🔮', prompt: 'Necesito lápices de colores y papel.', options: ['dibujar', 'cocinar', 'bailar', 'jugar al fútbol'] },
    { type: 'mc', title: 'Adivina la actividad 🔮', prompt: 'Muevo brazos y piernas dentro de la piscina.', options: ['nadar', 'patinar', 'bailar', 'montar en bici'] },
    { type: 'mc', title: 'Adivina la actividad 🔮', prompt: 'Toco las cuerdas de un instrumento.', options: ['tocar la guitarra', 'tocar la batería', 'cantar', 'silbar'] },
    { type: 'mc', title: 'Adivina la actividad 🔮', prompt: 'Pongo música y muevo todo el cuerpo.', options: ['bailar', 'cantar', 'nadar', 'leer'] },

    { type: 'build', title: 'Ordena y corrige 🧩', prompt: 'Ordena la frase.', sub: '¡Cuidado! Una palabra está mal escrita. ¡No la uses!',
      tiles: ['En', 'mi', 'tiempo', 'libre', 'me', 'gusta', 'montar en bici'], extra: ['gusto'], alts: ['Me gusta montar en bici en mi tiempo libre'] },
    { type: 'build', title: 'Ordena y corrige 🧩', prompt: 'Ordena la frase.', sub: '¡Cuidado! Una palabra está mal escrita. ¡No la uses!',
      tiles: ['A', 'Juan', 'le', 'gusta', 'ir', 'al cine'], extra: ['al sine'] },
    { type: 'build', title: 'Ordena y corrige 🧩', prompt: 'Ordena la frase.', sub: '¡Cuidado! Una palabra está mal escrita. ¡No la uses!',
      tiles: ['Yo', 'sé', 'nadar', 'y', 'patinar'], extra: ['sabo'], alts: ['Yo sé patinar y nadar'] },
    { type: 'build', title: 'Ordena y corrige 🧩', prompt: 'Ordena la frase.', sub: '¡Cuidado! Una palabra está mal escrita. ¡No la uses!',
      tiles: ['No', 'me', 'gusta', 'nada', 'cocinar'], extra: ['cocinars'] },

    { type: 'mc', title: 'Detective de errores 🕵️‍♀️', prompt: '¿Qué frase está bien?',
      options: ['A Juan le gusta ir al cine.', 'A Juan me gusta ir al cine.'], explain: 'Juan es «él», por eso: le gusta.' },
    { type: 'mc', title: 'Detective de errores 🕵️‍♀️', prompt: '¿Qué frase está bien?',
      options: ['Yo sé patinar muy bien.', 'Yo sabe patinar muy bien.'], explain: 'Con yo: sé.' },
    { type: 'mc', title: 'Detective de errores 🕵️‍♀️', prompt: '¿Qué frase está bien?',
      options: ['Tú sabes cantar en inglés.', 'Tú sé cantar en inglés.'], explain: 'Con tú: sabes.' },
    { type: 'mc', title: 'Detective de errores 🕵️‍♀️', prompt: '¿Qué frase está bien?',
      options: ['Me gusta jugar al fútbol.', 'Me gusta jugar a el fútbol.'], explain: 'a + el = al.' },
    { type: 'mc', title: 'Detective de errores 🕵️‍♀️', prompt: '¿Qué frase está bien?',
      options: ['A mi madre le gusta bailar.', 'Mi madre le gusta bailar.'], explain: 'Con una persona ponemos «a» delante.' },

    { type: 'end' }
  ]
};
