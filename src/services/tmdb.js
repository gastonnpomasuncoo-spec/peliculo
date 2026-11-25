import { obtenerDetalleCompletoPelicula, obtenerKeywordsTMDB } from './services/tmdb';
const RAW_TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim() || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

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

export const GENEROS_DISPONIBLES = [
  { nombre: 'Ciencia Ficción', id: 878 },
  { nombre: 'Thriller / Drama', id: 53 },
  { nombre: 'Drama / Fantasía', id: 14 },
  { nombre: 'Acción', id: 28 },
  { nombre: 'Comedia', id: 35 },
  { nombre: 'Terror', id: 27 },
  { nombre: 'Animación', id: 16 },
  { nombre: 'Crimen', id: 80 },
];

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

export function generarPosterRespaldo(titulo = 'Peliculo') {
  const textoLimpio = String(titulo).slice(0, 26);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#121015"/>
        <stop offset="100%" stop-color="#26262D"/>
      </linearGradient>
    </defs>
    <rect width="500" height="750" fill="url(#bg)"/>
    <rect x="24" y="24" width="452" height="702" fill="none" stroke="#EAB308" stroke-width="3" stroke-dasharray="10,8"/>
    <text x="250" y="330" text-anchor="middle" fill="#EAB308" font-family="sans-serif" font-size="38" font-weight="bold">PELICULO</text>
    <text x="250" y="400" text-anchor="middle" fill="#F4F4F4" font-family="sans-serif" font-size="22">${textoLimpio}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const CATALOGO_RESPALDO = [
  {
    tmdbId: 693134,
    titulo: 'Dune: Parte Dos',
    anio: '2024',
    duracion: 166,
    genero: 'Ciencia Ficción',
    categoria: 'lanzamientos',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem',
    poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    sinopsis: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia en el desierto de Arrakis.',
  },
  {
    tmdbId: 438631,
    titulo: 'Dune',
    anio: '2021',
    duracion: 155,
    genero: 'Ciencia Ficción',
    categoria: 'cienciaFiccion',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Rebecca Ferguson, Oscar Isaac, Zendaya',
    poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    sinopsis: 'Paul Atreides, un joven brillante con un destino más grande de lo que puede comprender, debe viajar al planeta más peligroso del universo.',
  },
  {
    tmdbId: 841,
    titulo: 'Dune',
    anio: '1984',
    duracion: 137,
    genero: 'Ciencia Ficción',
    categoria: 'clasicos',
    director: 'David Lynch',
    cast: 'Kyle MacLachlan, Francesca Annis, Sting, Patrick Stewart',
    poster: 'https://image.tmdb.org/t/p/w500/71I3c8N2kH9J0uR5H8K2W9yV3xM.jpg',
    sinopsis: 'En el año 10191, la especia melange se produce en un único lugar de todo el universo: el desértico planeta Arrakis.',
  },
  {
    tmdbId: 157336,
    titulo: 'Interstellar',
    anio: '2014',
    duracion: 169,
    genero: 'Ciencia Ficción',
    categoria: 'cienciaFiccion',
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
    categoria: 'cienciaFiccion',
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
    categoria: 'cienciaFiccion',
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
    categoria: 'clasicos',
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
    categoria: 'aclamadas',
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
    categoria: 'cienciaFiccion',
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
    genero: 'Animación / Ciencia Ficción',
    categoria: 'lanzamientos',
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
    categoria: 'lanzamientos',
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
    categoria: 'aclamadas',
    director: 'Bong Joon-ho',
    cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    sinopsis: 'Tanto toda la familia de Ki-taek como el clan Park están en mundos opuestos, hasta que sus vidas se entrelazan de forma inesperada.',
  },
  {
    tmdbId: 244786,
    titulo: 'Whiplash',
    anio: '2014',
    duracion: 107,
    genero: 'Thriller / Drama',
    categoria: 'aclamadas',
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
    categoria: 'lanzamientos',
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
    categoria: 'clasicos',
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
    categoria: 'aclamadas',
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
    categoria: 'clasicos',
    director: 'Quentin Tarantino',
    cast: 'John Travolta, Samuel L. Jackson, Uma Thurman, Bruce Willis',
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    sinopsis: 'Las vidas de dos sicarios de la mafia, un boxeador, la esposa de un gánster y dos bandidos se entrelazan en cuatro historias de violencia y redención.',
  },
  {
    tmdbId: 550,
    titulo: 'El Club de la Pelea',
    anio: '1999',
    duracion: 139,
    genero: 'Thriller / Drama',
    categoria: 'clasicos',
    director: 'David Fincher',
    cast: 'Brad Pitt, Edward Norton, Helena Bonham Carter',
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    sinopsis: 'Un oficinista con insomnio y un despreocupado fabricante de jabón forman un club de lucha clandestino que evoluciona hacia algo mucho más grande.',
  },
  {
    tmdbId: 129,
    titulo: 'El Viaje de Chihiro',
    anio: '2001',
    duracion: 125,
    genero: 'Animación / Fantasía',
    categoria: 'aclamadas',
    director: 'Hayao Miyazaki',
    cast: 'Rumi Hiiragi, Miyu Irino, Mari Natsuki',
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    sinopsis: 'Durante el traslado de su familia a los suburbios, una niña de 10 años deambula por un mundo gobernado por dioses, brujas y espíritus.',
  },
  {
    tmdbId: 25376,
    titulo: 'El Secreto de sus Ojos',
    anio: '2009',
    duracion: 129,
    genero: 'Thriller / Drama',
    categoria: 'clasicos',
    director: 'Juan José Campanella',
    cast: 'Ricardo Darín, Soledad Villamil, Guillermo Francella, Pablo Rago',
    poster: 'https://image.tmdb.org/t/p/w500/dkeAwfZ1L3bfT5E7rC6sTWTeC8N.jpg',
    sinopsis: 'Un empleado judicial retirado escribe una novela con la esperanza de encontrarle un cierre a uno de sus casos de homicidio sin resolver.',
  },
];

export const SUGERENCIAS_INICIALES = CATALOGO_RESPALDO.slice(0, 8);

function mapearPeliculaTMDB(item, generoPorDefecto = '') {
  const respaldo = CATALOGO_RESPALDO.find((c) => Number(c.tmdbId) === Number(item.id));
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
    tmdbId: Number(item.id),
    titulo: item.title || item.original_title || 'Sin título',
    anio: item.release_date ? item.release_date.slice(0, 4) : respaldo?.anio || '2024',
    duracion: item.runtime || respaldo?.duracion || 124,
    genero: generoMapeado,
    director: respaldo?.director || 'Ver en ficha técnica',
    cast: respaldo?.cast || 'Ver en ficha técnica',
    poster: item.poster_path
      ? `${TMDB_IMG_BASE}${item.poster_path}`
      : generarPosterRespaldo(item.title || 'Peliculo'),
    sinopsis: item.overview || respaldo?.sinopsis || 'Sin descripción disponible en TMDB.',
  };
}

export async function obtenerSeccionesCatalogoTMDB(generoPreferidoNombre = 'Ciencia Ficción') {
  const generoObj =
    GENEROS_DISPONIBLES.find((g) => g.nombre === generoPreferidoNombre) ||
    GENEROS_DISPONIBLES[0];

  if (!tieneClaveTMDB) {
    return [
      {
        id: 'preferido',
        titulo: `★ Tu Género Preferido: ${generoObj.nombre}`,
        peliculas: CATALOGO_RESPALDO.filter((p) =>
          p.genero.toLowerCase().includes(generoObj.nombre.split(' ')[0].toLowerCase())
        ).concat(CATALOGO_RESPALDO.slice(0, 4)),
      },
      {
        id: 'aclamadas',
        titulo: 'Películas Aclamadas por la Crítica',
        peliculas: CATALOGO_RESPALDO.filter((p) => p.categoria === 'aclamadas' || p.duracion > 135),
      },
      {
        id: 'lanzamientos',
        titulo: 'Nuevos Lanzamientos y Tendencias',
        peliculas: CATALOGO_RESPALDO.filter((p) => Number(p.anio) >= 2021),
      },
      {
        id: 'clasicos',
        titulo: 'Clásicos del Cine',
        peliculas: CATALOGO_RESPALDO.filter((p) => Number(p.anio) <= 2010),
      },
      {
        id: 'scifi',
        titulo: 'Universo Ciencia Ficción',
        peliculas: CATALOGO_RESPALDO.filter((p) => p.genero.includes('Ciencia Ficción')),
      },
    ];
  }

  try {
    const [resPref, resTop, resNow, resClasicos, resSciFi] = await Promise.all([
      fetchTMDB(`/discover/movie?language=es-ES&with_genres=${generoObj.id}&sort_by=popularity.desc&page=1`),
      fetchTMDB('/movie/top_rated?language=es-ES&page=1'),
      fetchTMDB('/movie/now_playing?language=es-ES&page=1'),
      fetchTMDB('/discover/movie?language=es-ES&primary_release_date.lte=2005-12-31&sort_by=vote_count.desc&page=1'),
      fetchTMDB('/discover/movie?language=es-ES&with_genres=878&sort_by=vote_count.desc&page=1'),
    ]);

    const secciones = [
      {
        id: 'preferido',
        titulo: `★ Tu Género Preferido: ${generoObj.nombre}`,
        peliculas: (resPref.results || []).map((m) => mapearPeliculaTMDB(m, generoObj.nombre)),
      },
      {
        id: 'aclamadas',
        titulo: 'Películas Aclamadas por la Crítica',
        peliculas: (resTop.results || []).map((m) => mapearPeliculaTMDB(m)),
      },
      {
        id: 'lanzamientos',
        titulo: 'Nuevos Lanzamientos en Cartelera',
        peliculas: (resNow.results || []).map((m) => mapearPeliculaTMDB(m)),
      },
      {
        id: 'clasicos',
        titulo: 'Clásicos Inolvidables del Cine',
        peliculas: (resClasicos.results || []).map((m) => mapearPeliculaTMDB(m, 'Clásico')),
      },
    ];

    if (generoObj.id !== 878) {
      secciones.push({
        id: 'scifi',
        titulo: 'Ciencia Ficción Destacada',
        peliculas: (resSciFi.results || []).map((m) => mapearPeliculaTMDB(m, 'Ciencia Ficción')),
      });
    }

    return secciones;
  } catch (err) {
    console.warn('Usando secciones de respaldo local:', err);
    return obtenerSeccionesCatalogoTMDB(' fallback ');
  }
}

export async function buscarPeliculasTMDB(termino) {
  const queryLimpio = termino.trim();
  if (!queryLimpio) return CATALOGO_RESPALDO;

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
    const respaldo = CATALOGO_RESPALDO.find((c) => Number(c.tmdbId) === Number(pelicula.tmdbId));
    return {
      ...respaldo,
      ...pelicula,
      duracion: Number(pelicula.duracion) || respaldo?.duracion || 124,
      keywords: Array.isArray(pelicula.keywords) ? pelicula.keywords : [],
    };
  }

  try {
    const data = await fetchTMDB(
      `/movie/${pelicula.tmdbId}?language=es-ES&append_to_response=credits,keywords`
    );
    const directorObj = data.credits?.crew?.find((c) => c.job === 'Director');
    const actores = (data.credits?.cast || []).slice(0, 6).map((a) => a.name).join(', ');
    const generosTexto = (data.genres || []).map((g) => g.name).join(' / ');
    const keywords = (data.keywords?.keywords || []).map((k) => k.name.toLowerCase());

    return {
      ...pelicula,
      duracion: Number(data.runtime) || Number(pelicula.duracion) || 124,
      genero: generosTexto || pelicula.genero || 'General',
      director: directorObj ? directorObj.name : pelicula.director || 'No especificado',
      cast: actores || pelicula.cast || 'No especificado',
      sinopsis: data.overview || pelicula.sinopsis || 'Sin descripción disponible.',
      keywords,
    };
  } catch {
    return {
      ...pelicula,
      keywords: Array.isArray(pelicula.keywords) ? pelicula.keywords : [],
    };
  }
}

export async function obtenerKeywordsTMDB(tmdbId) {
  if (!tieneClaveTMDB || !tmdbId) return [];
  try {
    const data = await fetchTMDB(`/movie/${tmdbId}/keywords`);
    return (data.keywords || []).map((k) => k.name.toLowerCase());
  } catch {
    return [];
  }
}