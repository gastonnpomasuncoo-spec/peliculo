const RAW_TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim() || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

// Detecta automáticamente si el usuario pegó la API Key (32 caracteres) o el Token JWT (empieza con eyJ)
const tieneClaveTMDB = Boolean(
  RAW_TMDB_KEY &&
  RAW_TMDB_KEY !== 'opcional_tu_api_key_de_tmdb' &&
  RAW_TMDB_KEY !== 'valor_de_apiKey'
);
const esBearerToken = RAW_TMDB_KEY.startsWith('eyJ');

async function fetchTMDB(rutaConParametros) {
  const separador = rutaConParametros.includes('?') ? '&' : '?';
  const url = esBearerToken
    ? `${TMDB_BASE_URL}${rutaConParametros}`
    : `${TMDB_BASE_URL}${rutaConParametros}${separador}api_key=${RAW_TMDB_KEY}`;

  const opciones = esBearerToken
    ? {
        headers: {
          Authorization: `Bearer ${RAW_TMDB_KEY}`,
          accept: 'application/json',
        },
      }
    : {};

  const respuesta = await fetch(url, opciones);
  if (!respuesta.ok) {
    throw new Error(`Error TMDB: ${respuesta.status}`);
  }
  return respuesta.json();
}

export const SUGERENCIAS_MAS_BUSCADAS = [
  'Dune: Parte Dos',
  'Interstellar',
  'Oppenheimer',
  'Pobres Criaturas',
  'Parásitos',
  'El Padrino',
  'Spider-Man: A través del Spider-Verso',
  'Batman: El Caballero de la Noche',
];

export function generarPosterRespaldo(titulo = 'Peliculo') {
  const textoLimpio = String(titulo).slice(0, 28);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#121015"/>
        <stop offset="100%" stop-color="#26262D"/>
      </linearGradient>
    </defs>
    <rect width="500" height="750" fill="url(#bg)"/>
    <rect x="24" y="24" width="452" height="702" fill="none" stroke="#EAB308" stroke-width="3" stroke-dasharray="10,8"/>
    <text x="250" y="330" text-anchor="middle" fill="#EAB308" font-family="sans-serif" font-size="38" font-weight="bold">PELICULO :V</text>
    <text x="250" y="400" text-anchor="middle" fill="#F4F4F4" font-family="sans-serif" font-size="24">${textoLimpio}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Mapa de géneros oficiales de TMDB
const GENEROS_TMDB = {
  28: 'Acción',
  12: 'Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familia',
  14: 'Fantasía',
  36: 'Historia',
  27: 'Terror',
  10402: 'Música',
  9648: 'Misterio',
  10749: 'Romance',
  878: 'Ciencia Ficción',
  53: 'Thriller',
  10752: 'Bélica',
  37: 'Western',
};

export const CATALOGO_RESPALDO = [
  {
    tmdbId: 693134,
    titulo: 'Dune: Parte Dos',
    anio: '2024',
    duracion: 166,
    genero: 'Ciencia Ficción',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem',
    poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    sinopsis: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia en el desierto de Arrakis.',
  },
  {
    tmdbId: 157336,
    titulo: 'Interstellar',
    anio: '2014',
    duracion: 169,
    genero: 'Ciencia Ficción',
    director: 'Christopher Nolan',
    cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    sinopsis: 'Un grupo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por asegurar la supervivencia de la humanidad.',
  },
  {
    tmdbId: 335984,
    titulo: 'Blade Runner 2049',
    anio: '2017',
    duracion: 164,
    genero: 'Ciencia Ficción',
    director: 'Denis Villeneuve',
    cast: 'Ryan Gosling, Harrison Ford, Ana de Armas, Sylvia Hoeks',
    poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    sinopsis: 'El descubrimiento de un secreto enterrado durante mucho tiempo lleva a un joven Blade Runner a buscar al desaparecido Rick Deckard.',
  },
  {
    tmdbId: 329865,
    titulo: 'La Llegada (Arrival)',
    anio: '2016',
    duracion: 116,
    genero: 'Ciencia Ficción',
    director: 'Denis Villeneuve',
    cast: 'Amy Adams, Jeremy Renner, Forest Whitaker',
    poster: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
    sinopsis: 'Una experta lingüista trabaja con el ejército para comunicarse con formas de vida extraterrestres tras la llegada de doce naves espaciales.',
  },
  {
    tmdbId: 603,
    titulo: 'Matrix',
    anio: '1999',
    duracion: 136,
    genero: 'Ciencia Ficción',
    director: 'Lana Wachowski, Lilly Wachowski',
    cast: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving',
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    sinopsis: 'Un programador y hacker descubre a través de misteriosos rebeldes la verdadera naturaleza de su realidad y su rol en la guerra contra las máquinas.',
  },
  {
    tmdbId: 545611,
    titulo: 'Todo en todas partes al mismo tiempo',
    anio: '2022',
    duracion: 139,
    genero: 'Ciencia Ficción',
    director: 'Daniel Kwan, Daniel Scheinert',
    cast: 'Michelle Yeoh, Stephanie Hsu, Ke Huy Quan, Jamie Lee Curtis',
    poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    sinopsis: 'Una inmigrante china se ve envuelta en una aventura multiversal donde solo ella puede salvar la existencia conectándose con otras vidas posibles.',
  },
  {
    tmdbId: 27205,
    titulo: 'El Origen (Inception)',
    anio: '2010',
    duracion: 148,
    genero: 'Ciencia Ficción',
    director: 'Christopher Nolan',
    cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy',
    poster: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    sinopsis: 'A un ladrón que roba secretos corporativos mediante la tecnología de compartir sueños se le encarga la tarea inversa: implantar una idea.',
  },
  {
    tmdbId: 569094,
    titulo: 'Spider-Man: A través del Spider-Verso',
    anio: '2023',
    duracion: 140,
    genero: 'Ciencia Ficción',
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    cast: 'Shameik Moore, Hailee Steinfeld, Oscar Isaac, Daniel Kaluuya',
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    sinopsis: 'Miles Morales es catapultado a través del Multiverso, donde se encuentra con un equipo de Spider-Personas encargadas de proteger su propia existencia.',
  },
  {
    tmdbId: 872585,
    titulo: 'Oppenheimer',
    anio: '2023',
    duracion: 180,
    genero: 'Thriller / Drama',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    sinopsis: 'La historia del físico teórico J. Robert Oppenheimer y su papel decisivo en el Proyecto Manhattan y el desarrollo de la bomba atómica.',
  },
  {
    tmdbId: 496243,
    titulo: 'Parásitos',
    anio: '2019',
    duracion: 132,
    genero: 'Thriller / Drama',
    director: 'Bong Joon-ho',
    cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    sinopsis: 'Tanto toda la familia de Ki-taek como el clan Park están desocupados o en mundos opuestos, hasta que sus vidas se entrelazan de forma inesperada.',
  },
  {
    tmdbId: 244786,
    titulo: 'Whiplash',
    anio: '2014',
    duracion: 107,
    genero: 'Thriller / Drama',
    director: 'Damien Chazelle',
    cast: 'Miles Teller, J.K. Simmons, Paul Reiser',
    poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    sinopsis: 'Un joven baterista de jazz se inscribe en un conservatorio de élite donde sus sueños de grandeza son guiados por un instructor implacable.',
  },
  {
    tmdbId: 792307,
    titulo: 'Pobres Criaturas',
    anio: '2023',
    duracion: 141,
    genero: 'Drama / Fantasía',
    director: 'Yorgos Lanthimos',
    cast: 'Emma Stone, Mark Ruffalo, Willem Dafoe, Ramy Youssef',
    poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
    sinopsis: 'La increíble historia de la evolución de Bella Baxter, una joven devuelta a la vida por el brillante y poco ortodoxo científico Dr. Godwin Baxter.',
  },
  {
    tmdbId: 238,
    titulo: 'El Padrino',
    anio: '1972',
    duracion: 175,
    genero: 'Crimen / Drama',
    director: 'Francis Ford Coppola',
    cast: 'Marlon Brando, Al Pacino, James Caan, Robert Duvall',
    poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    sinopsis: 'El patriarca de una dinastía del crimen organizado transfiere el control de su imperio clandestino a su reacio hijo menor.',
  },
  {
    tmdbId: 155,
    titulo: 'Batman: El Caballero de la Noche',
    anio: '2008',
    duracion: 152,
    genero: 'Acción / Thriller',
    director: 'Christopher Nolan',
    cast: 'Christian Bale, Heath Ledger, Aaron Eckhart, Gary Oldman',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    sinopsis: 'Cuando la amenaza conocida como el Joker emerge de su pasado misterioso, causa estragos y caos en la gente de Ciudad Gótica.',
  },
  {
    tmdbId: 680,
    titulo: 'Pulp Fiction',
    anio: '1994',
    duracion: 154,
    genero: 'Crimen / Thriller',
    director: 'Quentin Tarantino',
    cast: 'John Travolta, Samuel L. Jackson, Uma Thurman, Bruce Willis',
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    sinopsis: 'Las vidas de dos sicarios de la mafia, un boxeador, la esposa de un gánster y dos bandidos se entrelazan en cuatro historias de violencia y redención.',
  },
];

function mapearPeliculaTMDB(item, generoPorDefecto = '') {
  const respaldo = CATALOGO_RESPALDO.find((c) => c.tmdbId === item.id);
  const generoMapeado =
    generoPorDefecto ||
    (item.genre_ids && item.genre_ids.length > 0
      ? item.genre_ids
          .slice(0, 2)
          .map((id) => GENEROS_TMDB[id] || '')
          .filter(Boolean)
          .join(' / ')
      : '') ||
    'Destacadas';

  return {
    tmdbId: item.id,
    titulo: item.title || item.original_title || 'Sin título',
    anio: item.release_date ? item.release_date.slice(0, 4) : respaldo?.anio || '2024',
    duracion: item.runtime || respaldo?.duracion || 125,
    genero: generoMapeado,
    director: respaldo?.director || 'Ver en ficha técnica',
    cast: respaldo?.cast || 'Ver en ficha técnica',
    poster: item.poster_path
      ? `${TMDB_IMG_BASE}${item.poster_path}`
      : generarPosterRespaldo(item.title || 'Peliculo'),
    sinopsis: item.overview || respaldo?.sinopsis || 'Sin descripción disponible en TMDB.',
  };
}

export async function obtenerCatalogoTMDB() {
  if (!tieneClaveTMDB) {
    return CATALOGO_RESPALDO;
  }

  try {
    // Trae múltiples páginas y géneros en paralelo (más de 80 películas reales de TMDB)
    const [sciFi1, sciFi2, pop1, pop2, top1] = await Promise.all([
      fetchTMDB('/discover/movie?language=es-ES&with_genres=878&sort_by=popularity.desc&page=1'),
      fetchTMDB('/discover/movie?language=es-ES&with_genres=878&sort_by=popularity.desc&page=2'),
      fetchTMDB('/movie/popular?language=es-ES&page=1'),
      fetchTMDB('/movie/popular?language=es-ES&page=2'),
      fetchTMDB('/movie/top_rated?language=es-ES&page=1'),
    ]);

    const listaSciFi = [...(sciFi1.results || []), ...(sciFi2.results || [])].map((m) =>
      mapearPeliculaTMDB(m, 'Ciencia Ficción')
    );
    const listaResto = [
      ...(pop1.results || []),
      ...(pop2.results || []),
      ...(top1.results || []),
    ].map((m) => mapearPeliculaTMDB(m));

    const combinadas = [...listaSciFi, ...listaResto];
    const unicas = [];
    const vistos = new Set();

    for (const p of combinadas) {
      if (!vistos.has(p.tmdbId)) {
        vistos.add(p.tmdbId);
        unicas.push(p);
      }
    }

    return unicas.length > 0 ? unicas : CATALOGO_RESPALDO;
  } catch (err) {
    console.warn('No se pudo conectar con TMDB, usando catálogo local:', err);
    return CATALOGO_RESPALDO;
  }
}

export async function buscarPeliculasTMDB(termino) {
  const queryLimpio = termino.trim();
  if (!queryLimpio) return obtenerCatalogoTMDB();

  if (!tieneClaveTMDB) {
    return CATALOGO_RESPALDO.filter(
      (p) =>
        p.titulo.toLowerCase().includes(queryLimpio.toLowerCase()) ||
        p.genero.toLowerCase().includes(queryLimpio.toLowerCase()) ||
        (p.director && p.director.toLowerCase().includes(queryLimpio.toLowerCase()))
    );
  }

  try {
    const data = await fetchTMDB(
      `/search/movie?language=es-ES&query=${encodeURIComponent(queryLimpio)}&page=1`
    );
    return (data.results || []).map((m) => mapearPeliculaTMDB(m));
  } catch {
    return CATALOGO_RESPALDO.filter((p) =>
      p.titulo.toLowerCase().includes(queryLimpio.toLowerCase())
    );
  }
}

export async function obtenerDetalleCompletoPelicula(pelicula) {
  if (!tieneClaveTMDB || !pelicula.tmdbId) {
    return pelicula;
  }

  try {
    const data = await fetchTMDB(
      `/movie/${pelicula.tmdbId}?language=es-ES&append_to_response=credits`
    );
    const directorObj = data.credits?.crew?.find((c) => c.job === 'Director');
    const actores = (data.credits?.cast || []).slice(0, 6).map((a) => a.name).join(', ');
    const generosTexto = (data.genres || []).map((g) => g.name).join(' / ');

    return {
      ...pelicula,
      duracion: data.runtime || pelicula.duracion || 120,
      genero: generosTexto || pelicula.genero || 'General',
      director: directorObj ? directorObj.name : pelicula.director || 'No especificado',
      cast: actores || pelicula.cast || 'No especificado',
      sinopsis: data.overview || pelicula.sinopsis || 'Sin descripción disponible.',
    };
  } catch {
    return pelicula;
  }
}