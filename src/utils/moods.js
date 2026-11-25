export const MOODS = [
  {
    id: 'intenso',
    nombre: 'Adrenalina y Tensión',
    descripcion: 'Ritmo alto, suspenso, acción, oscuridad o adrenalina',
  },
  {
    id: 'profundo',
    nombre: 'Profundo y Emotivo',
    descripcion: 'Historias densas, drama, reflexión, humor negro o carga emocional',
  },
  {
    id: 'liviano',
    nombre: 'Liviano y Feel Good',
    descripcion: 'Para relajarte, reírte o pasarla bien sin bajonearte',
  },
  {
    id: 'olvidadas',
    nombre: 'Olvidadas',
    descripcion: 'Las 3 películas que hace más tiempo tenés guardadas sin ver',
  },
];

// Etiquetas temáticas oficiales de TMDB (vienen en inglés desde la API)
const KEYWORDS_TMDB_VIBRA = {
  intenso: [
    'action', 'chase', 'heist', 'martial arts', 'superhero', 'survival', 'explosion',
    'assassin', 'hitman', 'revenge', 'serial killer', 'slasher', 'monster', 'alien',
    'espionage', 'spy', 'conspiracy', 'kidnapping', 'hostage', 'gunfight', 'fight',
    'battle', 'war', 'apocalypse', 'post-apocalyptic', 'dystopia', 'time travel',
    'cyberpunk', 'horror', 'haunted', 'supernatural', 'zombie', 'gore', 'violent',
    'violence', 'crime', 'gangster', 'mafia', 'thriller', 'suspense', 'escape',
    'catastrophe', 'disaster', 'terrorism', 'psychopath', 'blood', 'shootout',
  ],
  profundo: [
    'dark comedy', 'black comedy', 'tragicomedy', 'satire', 'tragedy', 'grief',
    'mourning', 'depression', 'suicide', 'trauma', 'loneliness', 'isolation',
    'existentialism', 'philosophy', 'psychological', 'mental illness', 'addiction',
    'alcoholism', 'drug addiction', 'poverty', 'class differences', 'social commentary',
    'racism', 'discrimination', 'war crime', 'holocaust', 'biography', 'based on true story',
    'historical', 'corruption', 'betrayal', 'dysfunctional family', 'divorce',
    'terminal illness', 'cancer', 'death', 'loss of loved one', 'guilt', 'redemption',
    'obsession', 'melancholy', 'bleak', 'cynical', 'disturbing', 'memory', 'identity',
    'mystery', 'investigation', 'courtroom', 'documentary', 'politics', 'inequality',
  ],
  liviano: [
    'feel-good', 'feel good', 'heartwarming', 'uplifting', 'lighthearted', 'wholesome',
    'romantic comedy', 'rom-com', 'buddy comedy', 'slapstick', 'parody', 'spoof',
    'friendship', 'best friend', 'coming of age', 'high school', 'college', 'road trip',
    'vacation', 'holiday', 'christmas', 'wedding', 'first love', 'cute', 'funny',
    'humor', 'cheerful', 'musical', 'dance', 'singing', 'magic', 'fairy tale',
    'talking animal', 'family', 'childhood', 'dream', 'sports', 'underdog', 'quirky',
    'whimsical', 'adventure', 'treasure', 'summer', 'party', 'comedy',
  ],
};

// Señales de tono pesado/oscuro para impedir que una comedia densa caiga en "Liviano y Feel Good"
const KEYWORDS_BLOQUEAN_FEEL_GOOD = [
  'dark comedy', 'black comedy', 'tragedy', 'grief', 'suicide', 'depression',
  'trauma', 'serial killer', 'murder', 'gore', 'torture', 'rape', 'abuse',
  'war crime', 'holocaust', 'bleak', 'disturbing', 'nihilism', 'psychopath',
  'addiction', 'terminal illness', 'satire', 'class differences', 'revenge',
  'violence', 'blood', 'slasher', 'massacre', 'dystopia', 'apocalypse',
];

const SINOPSIS_PESADA_ES = [
  'asesinato', 'asesino', 'suicidio', 'tragedia', 'venganza', 'violencia',
  'abismo', 'sangre', 'muerte', 'homicidio', 'secuestro', 'crimen', 'mafia',
  'guerra', 'bomba', 'terror', 'pesadilla', 'trauma', 'depresion', 'oscuro',
  'brutal', 'cadaver', 'infierno', 'tortura', 'drogas', 'adiccion', 'duelo',
];

function normalizarTexto(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function clasificarVibraPelicula(pelicula) {
  const genero = normalizarTexto(pelicula.genero);
  const sinopsis = normalizarTexto(pelicula.sinopsis);
  const keywords = Array.isArray(pelicula.keywords)
    ? pelicula.keywords.map((k) => normalizarTexto(k))
    : [];

  const puntos = {
    intenso: 0,
    profundo: 0,
    liviano: 0,
  };

  // 1. Señal principal: Keywords temáticas traídas desde la API de TMDB (peso alto)
  for (const kw of keywords) {
    if (KEYWORDS_TMDB_VIBRA.intenso.some((t) => kw.includes(t))) {
      puntos.intenso += 3;
    }
    if (KEYWORDS_TMDB_VIBRA.profundo.some((t) => kw.includes(t))) {
      puntos.profundo += 3;
    }
    if (KEYWORDS_TMDB_VIBRA.liviano.some((t) => kw.includes(t))) {
      puntos.liviano += 2.5;
    }
  }

  // 2. Señal secundaria: Géneros base (peso moderado, refinado por combinaciones)
  if (/accion|thriller|suspenso|terror|horror|crimen|belica|guerra|western/.test(genero)) {
    puntos.intenso += 2.5;
  }
  if (/ciencia|sci-fi/.test(genero)) {
    puntos.intenso += 2;
    puntos.profundo += 1;
  }
  if (/drama|misterio|documental|historia|clasico/.test(genero)) {
    puntos.profundo += 2.5;
  }
  if (/comedia|romance|animacion|familia|fantasia|musica/.test(genero)) {
    puntos.liviano += 2.2;
  }
  if (/aventura/.test(genero)) {
    puntos.intenso += 1;
    puntos.liviano += 1;
  }

  // 3. Filtro anti-bajón: detecta comedias negras, sátiras pesadas o películas densas
  const tieneKeywordOscura = keywords.some((kw) =>
    KEYWORDS_BLOQUEAN_FEEL_GOOD.some((b) => kw.includes(b))
  );
  const tieneGeneroPesado = /thriller|terror|horror|crimen|belica|guerra|negra/.test(genero);
  const coincidenciasSinopsisPesada = SINOPSIS_PESADA_ES.filter((p) =>
    sinopsis.includes(p)
  ).length;

  if (tieneKeywordOscura || tieneGeneroPesado || coincidenciasSinopsisPesada >= 2) {
    puntos.liviano -= 6;
    if (tieneKeywordOscura) {
      puntos.profundo += 2;
    }
    if (tieneGeneroPesado) {
      puntos.intenso += 1.5;
    }
  }

  // Si mezcla Comedia + Drama y tiene tono reflexivo/pesado en la sinopsis, prioriza "Profundo"
  if (genero.includes('comedia') && genero.includes('drama') && coincidenciasSinopsisPesada >= 1) {
    puntos.liviano -= 3;
    puntos.profundo += 2;
  }

  // 4. Determinar la vibra ganadora (si empata todo en 0, cae en "profundo" como respaldo)
  if (puntos.liviano > 0 && puntos.liviano >= puntos.intenso && puntos.liviano >= puntos.profundo) {
    return 'liviano';
  }
  if (puntos.intenso >= puntos.profundo && puntos.intenso > 0) {
    return 'intenso';
  }
  return 'profundo';
}

export function peliculaCoincideConMood(pelicula, moodId) {
  if (!moodId || moodId === 'olvidadas') return true;
  return clasificarVibraPelicula(pelicula) === moodId;
}

export function filtrarMesaPorMood(peliculasPendientes, moodId) {
  if (!moodId || moodId === 'olvidadas') {
    return peliculasPendientes.slice(0, 3);
  }
  return peliculasPendientes
    .filter((p) => peliculaCoincideConMood(p, moodId))
    .slice(0, 3);
}