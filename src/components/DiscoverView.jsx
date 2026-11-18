import { useState, useEffect, useRef } from 'react';
import {
  obtenerSeccionesCatalogoTMDB,
  buscarPeliculasTMDB,
  SUGERENCIAS_INICIALES,
  CATALOGO_RESPALDO,
  generarPosterRespaldo,
} from '../services/tmdb';
import MovieCard from './MovieCard';

function CarouselRow({
  titulo,
  peliculas,
  estaGuardada,
  procesando,
  onAgregarPelicula,
  onSeleccionarPelicula,
}) {
  const trackRef = useRef(null);

  const desplazarCarrusel = (direccion) => {
    if (!trackRef.current) return;
    const desplazamiento = trackRef.current.clientWidth * 0.78;
    trackRef.current.scrollBy({
      left: direccion === 'izq' ? -desplazamiento : desplazamiento,
      behavior: 'smooth',
    });
  };

  if (!peliculas || peliculas.length === 0) return null;

  return (
    <div className="carousel-section">
      <div className="carousel-header">
        <h2 className="category-heading">{titulo}</h2>
        <div className="carousel-controls">
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={() => desplazarCarrusel('izq')}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={() => desplazarCarrusel('der')}
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      </div>

      <div className="carousel-track" ref={trackRef}>
        {peliculas.map((peli) => (
          <div key={peli.tmdbId} className="carousel-item">
            <MovieCard
              pelicula={peli}
              modo="catalogo"
              yaGuardada={estaGuardada(peli)}
              procesando={procesando}
              onAgregar={onAgregarPelicula}
              onSeleccionarPelicula={onSeleccionarPelicula}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscoverView({
  peliculasUsuario,
  onAgregarPelicula,
  onSeleccionarPelicula,
  generoPreferido,
  procesando,
}) {
  const [secciones, setSecciones] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [sugerenciasVivo, setSugerenciasVivo] = useState(SUGERENCIAS_INICIALES);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const contenedorBuscadorRef = useRef(null);

  useEffect(() => {
    let activo = true;
    setCargandoCatalogo(true);
    obtenerSeccionesCatalogoTMDB(generoPreferido || 'Ciencia Ficción').then((datos) => {
      if (activo) {
        setSecciones(datos);
        setCargandoCatalogo(false);
      }
    });
    return () => {
      activo = false;
    };
  }, [generoPreferido]);

  // Sugerencias dinámicas en vivo a medida que el usuario escribe en el buscador
  useEffect(() => {
    const texto = busqueda.trim();
    if (!texto) {
      setSugerenciasVivo(SUGERENCIAS_INICIALES);
      setResultadosBusqueda(null);
      return;
    }

    // 1. Filtrado instantáneo sobre las películas ya cargadas en memoria
    const poolLocal = [
      ...CATALOGO_RESPALDO,
      ...secciones.flatMap((s) => s.peliculas || []),
    ];
    const mapaUnico = new Map();
    poolLocal.forEach((p) => {
      if (p.titulo.toLowerCase().includes(texto.toLowerCase())) {
        mapaUnico.set(Number(p.tmdbId), p);
      }
    });
    const instantaneas = Array.from(mapaUnico.values()).slice(0, 7);
    if (instantaneas.length > 0) {
      setSugerenciasVivo(instantaneas);
    }

    // 2. Búsqueda en vivo en la API de TMDB a medida que escribe
    const timer = setTimeout(async () => {
      const resultadosAPI = await buscarPeliculasTMDB(texto);
      setSugerenciasVivo(resultadosAPI.slice(0, 8));
      setResultadosBusqueda(resultadosAPI);
    }, 220);

    return () => clearTimeout(timer);
  }, [busqueda, secciones]);

  useEffect(() => {
    const manejarClickAfuera = (e) => {
      if (
        contenedorBuscadorRef.current &&
        !contenedorBuscadorRef.current.contains(e.target)
      ) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener('mousedown', manejarClickAfuera);
    return () => document.removeEventListener('mousedown', manejarClickAfuera);
  }, []);

  const ejecutarBusqueda = async (terminoManual) => {
    const texto = typeof terminoManual === 'string' ? terminoManual : busqueda;
    setMostrarSugerencias(false);
    if (!texto.trim()) {
      setResultadosBusqueda(null);
      return;
    }
    setCargandoCatalogo(true);
    const resultados = await buscarPeliculasTMDB(texto);
    setResultadosBusqueda(resultados);
    setCargandoCatalogo(false);
  };

  const elegirPeliculaSugerida = (peliSugerida) => {
    setBusqueda(peliSugerida.titulo);
    setMostrarSugerencias(false);
    // Pone primero la película exacta elegida (por su tmdbId único)
    setResultadosBusqueda((prev) => {
      const base = prev || sugerenciasVivo;
      const resto = base.filter((p) => Number(p.tmdbId) !== Number(peliSugerida.tmdbId));
      return [peliSugerida, ...resto];
    });
  };

  // Compara por tmdbId único para que dos películas con el mismo nombre NO se marquen juntas
  const estaGuardada = (peliculaCat) =>
    peliculasUsuario.some((p) => {
      const activa = p.estado === 'mesa_de_luz' || p.estado === 'en_espera';
      if (!activa) return false;
      if (p.tmdbId && peliculaCat.tmdbId) {
        return Number(p.tmdbId) === Number(peliculaCat.tmdbId);
      }
      return (
        p.titulo.toLowerCase() === peliculaCat.titulo.toLowerCase() &&
        String(p.anio) === String(peliculaCat.anio)
      );
    });

  return (
    <section className="view-container">
      <div className="search-bar-container" ref={contenedorBuscadorRef}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ejecutarBusqueda(busqueda);
          }}
          className="search-form-dropdown-wrap"
          autoComplete="off"
        >
          <div className="search-input-wrapper">
            <input
              type="text"
              name="buscador_peliculo_off"
              autoComplete="off"
              value={busqueda}
              onFocus={() => setMostrarSugerencias(true)}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setMostrarSugerencias(true);
              }}
              placeholder="Buscar películas, directores o géneros..."
              className="search-input"
            />
            {busqueda && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setBusqueda('');
                  setResultadosBusqueda(null);
                }}
              >
                ✕
              </button>
            )}
            <button type="submit" className="search-icon-btn" aria-label="Buscar">
              🔍
            </button>
          </div>

          {mostrarSugerencias && sugerenciasVivo.length > 0 && (
            <div className="search-suggestions-dropdown">
              <span className="suggestions-header">
                {busqueda.trim()
                  ? `🔍 Sugerencias en vivo para "${busqueda.trim()}"`
                  : '🔥 Lo más buscado en Peliculo'}
              </span>
              {sugerenciasVivo.map((peli) => (
                <button
                  key={peli.tmdbId}
                  type="button"
                  className="suggestion-item-btn"
                  onClick={() => elegirPeliculaSugerida(peli)}
                >
                  <div className="suggestion-item-left">
                    <img
                      src={peli.poster || generarPosterRespaldo(peli.titulo)}
                      alt={peli.titulo}
                      className="suggestion-mini-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = generarPosterRespaldo(peli.titulo);
                      }}
                    />
                    <div className="suggestion-item-texts">
                      <strong>{peli.titulo}</strong>
                      <span>
                        {peli.anio} · {peli.genero}
                      </span>
                    </div>
                  </div>
                  <span className="suggestion-arrow">↗</span>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {cargandoCatalogo ? (
        <div className="loading-box">Cargando carruseles de películas...</div>
      ) : resultadosBusqueda ? (
        <div className="search-results-section">
          <div className="carousel-header">
            <h2 className="category-heading">
              Resultados para "{busqueda}" ({resultadosBusqueda.length})
            </h2>
            <button
              type="button"
              className="btn-secondary btn-xs"
              onClick={() => {
                setBusqueda('');
                setResultadosBusqueda(null);
              }}
            >
              ← Volver a los carruseles
            </button>
          </div>

          {resultadosBusqueda.length === 0 ? (
            <p className="empty-message">No se encontraron películas para "{busqueda}".</p>
          ) : (
            <CarouselRow
              titulo="Coincidencias encontradas"
              peliculas={resultadosBusqueda}
              estaGuardada={estaGuardada}
              procesando={procesando}
              onAgregarPelicula={onAgregarPelicula}
              onSeleccionarPelicula={onSeleccionarPelicula}
            />
          )}
        </div>
      ) : (
        <div className="carousels-stack">
          {secciones.map((sec) => (
            <CarouselRow
              key={sec.id}
              titulo={sec.titulo}
              peliculas={sec.peliculas}
              estaGuardada={estaGuardada}
              procesando={procesando}
              onAgregarPelicula={onAgregarPelicula}
              onSeleccionarPelicula={onSeleccionarPelicula}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default DiscoverView;