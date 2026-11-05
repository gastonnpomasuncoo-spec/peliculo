const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export const CATALOGO_RESPALDO = [
  {
    tmdbId: 693134,
    titulo: 'Dune: Parte Dos',
    anio: '2024',
    genero: 'Ciencia Ficción',
    duracion: 166,
    poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    sinopsis: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.',
  },
  {
    tmdbId: 157336,
    titulo: 'Interstellar',
    anio: '2014',
    genero: 'Ciencia Ficción',
    duracion: 169,
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    sinopsis: 'Un grupo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por asegurar la supervivencia de la humanidad.',
  },
  {
    tmdbId: 335984,
    titulo: 'Blade Runner 2049',
    anio: '2017',
    genero: 'Ciencia Ficción',
    duracion: 164,
    poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    sinopsis: 'El descubrimiento de un secreto enterrado durante mucho tiempo lleva a un joven Blade Runner a buscar a Rick Deckard.',
  },
  {
    tmdbId: 329865,
    titulo: 'La Llegada (Arrival)',
    anio: '2016',
    genero: 'Ciencia Ficción',
    duracion: 116,
    poster: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
    sinopsis: 'Una lingüista trabaja con el ejército para comunicarse con formas de vida extraterrestres tras la llegada de doce naves espaciales.',
  },
  {
    tmdbId: 603,
    titulo: 'Matrix',
    anio: '1999',
    genero: 'Ciencia Ficción',
    duracion: 136,
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    sinopsis: 'Un hacker descubre a través de misteriosos rebeldes la verdadera naturaleza de su realidad y su rol en la guerra contra sus controladores.',
  },
  {
    tmdbId: 792307,
    titulo: 'Pobres Criaturas',
    anio: '2023',
    genero: 'Drama / Fantasía',
    duracion: 141,
    poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
    sinopsis: 'La increíble historia de la evolución de Bella Baxter, una joven devuelta a la vida por el brillante y poco ortodoxo científico Dr. Godwin Baxter.',
  },
  {
    tmdbId: 496243,
    titulo: 'Parásitos',
    anio: '2019',
    genero: 'Thriller / Drama',
    duracion: 132,
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    sinopsis: 'La codicia y la discriminación de clases amenazan la relación recién formada entre la adinerada familia Park y el empobrecido clan Kim.',
  },
  {
    tmdbId: 872585,
    titulo: 'Oppenheimer',
    anio: '2023',
    genero: 'Thriller / Drama',
    duracion: 180,
    poster: 'https://image.tmdb.org/t/p/w500/ncKCQVXgk4BcQV6XbvesgZ2zLvZ.jpg',
    sinopsis: 'La historia del físico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica durante la Segunda Guerra Mundial.',
  },
  {
    tmdbId: 244786,
    titulo: 'Whiplash',
    anio: '2014',
    genero: 'Thriller / Drama',
    duracion: 107,
    poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    sinopsis: 'Un joven y prometedor baterista se inscribe en un competitivo conservatorio de música donde sus sueños son guiados por un instructor implacable.',
  },
  {
    tmdbId: 545611,
    titulo: 'Todo en todas partes al mismo tiempo',
    anio: '2022',
    genero: 'Ciencia Ficción',
    duracion: 139,
    poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    sinopsis: 'Una inmigrante china de mediana edad se ve envuelta en una loca aventura en la que solo ella puede salvar la existencia explorando otros universos.',
  },
];

function mapearPeliculaTMDB(item, generoPorDefecto = 'Destacadas') {
  return {
    tmdbId: item.id,
    titulo: item.title || item.original_title || 'Sin título',
    anio: item.release_date ? item.release_date.slice(0, 4) : 'S/F',
    genero: generoPorDefecto,
    duracion: 120,
    poster: item.poster_path
      ? `${TMDB_IMG_BASE}${item.poster_path}`
      : 'https://via.placeholder.com/500x750/121015/EAB308?text=PELICULO',
    sinopsis: item.overview || 'Sin descripción disponible en TMDB.',
  };
}

export async function obtenerCatalogoTMDB() {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'opcional_tu_api_key_de_tmdb') {
    return CATALOGO_RESPALDO;
  }

  try {
    const [resSciFi, resPopulares] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=es-ES&with_genres=878&sort_by=popularity.desc`),
      fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=1`),
    ]);

    if (!resSciFi.ok || !resPopulares.ok) {
      return CATALOGO_RESPALDO;
    }

    const dataSciFi = await resSciFi.json();
    const dataPopulares = await resPopulares.json();

    const sciFi = (dataSciFi.results || []).slice(0, 5).map((m) => mapearPeliculaTMDB(m, 'Ciencia Ficción'));
    const populares = (dataPopulares.results || []).slice(0, 5).map((m) => mapearPeliculaTMDB(m, 'Tendencias'));

    return [...sciFi, ...populares];
  } catch {
    return CATALOGO_RESPALDO;
  }
}

export async function buscarPeliculasTMDB(termino) {
  const queryLimpio = termino.trim();
  if (!queryLimpio) return obtenerCatalogoTMDB();

  if (!TMDB_API_KEY || TMDB_API_KEY === 'opcional_tu_api_key_de_tmdb') {
    return CATALOGO_RESPALDO.filter(
      (p) =>
        p.titulo.toLowerCase().includes(queryLimpio.toLowerCase()) ||
        p.genero.toLowerCase().includes(queryLimpio.toLowerCase())
    );
  }

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(queryLimpio)}`
    );
    if (!res.ok) throw new Error('Error en búsqueda TMDB');
    const data = await res.json();
    return (data.results || []).slice(0, 10).map((m) => mapearPeliculaTMDB(m, 'Resultado TMDB'));
  } catch {
    return CATALOGO_RESPALDO.filter((p) =>
      p.titulo.toLowerCase().includes(queryLimpio.toLowerCase())
    );
  }
}