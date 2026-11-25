export const MOODS = [
  {
    id: 'intenso',
    nombre: 'Adrenalina y Tensión',
    descripcion: 'Acción, Ciencia Ficción, Thriller, Terror, Crimen, Aventura',
    keywords: [
      'accion',
      'aventura',
      'ciencia',
      'sci-fi',
      'thriller',
      'suspenso',
      'terror',
      'horror',
      'crimen',
      'belica',
      'guerra',
      'western',
    ],
  },
  {
    id: 'profundo',
    nombre: 'Profundo y Emotivo',
    descripcion: 'Drama, Misterio, Documental, Historia, Clásicos',
    keywords: [
      'drama',
      'misterio',
      'documental',
      'historia',
      'historico',
      'clasico',
      'biografia',
    ],
  },
  {
    id: 'liviano',
    nombre: 'Liviano y Feel Good',
    descripcion: 'Comedia, Romance, Animación, Familia, Fantasía, Música',
    keywords: [
      'comedia',
      'romance',
      'romantica',
      'animacion',
      'familia',
      'familiar',
      'fantasia',
      'musica',
      'musical',
      'juvenil',
      'infantil',
    ],
  },
  {
    id: 'todas',
    nombre: 'Las 3 más viejas (Todas)',
    descripcion: 'Tus 3 películas pendientes más antiguas sin filtro de género',
    keywords: [],
  },
];

function normalizarTexto(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function peliculaCoincideConMood(pelicula, moodId) {
  if (!moodId || moodId === 'todas') return true;

  const generoNorm = normalizarTexto(pelicula.genero);
  const moodObj = MOODS.find((m) => m.id === moodId);
  if (!moodObj) return true;

  const coincideDirecto = moodObj.keywords.some((kw) => generoNorm.includes(kw));
  if (coincideDirecto) return true;

  // Respaldo universal: si la película viene con un género genérico ("General", "Destacadas", etc.)
  // que no matchea con ninguno de los 3 moods, se incluye en "Profundo y Emotivo" para no dejarla fuera.
  const coincideConAlguno = MOODS.filter((m) => m.id !== 'todas').some((m) =>
    m.keywords.some((kw) => generoNorm.includes(kw))
  );
  if (!coincideConAlguno && moodId === 'profundo') {
    return true;
  }

  return false;
}

export function filtrarMesaPorMood(peliculasPendientes, moodId) {
  if (!moodId || moodId === 'todas') {
    return peliculasPendientes.slice(0, 3);
  }
  return peliculasPendientes
    .filter((p) => peliculaCoincideConMood(p, moodId))
    .slice(0, 3);
}