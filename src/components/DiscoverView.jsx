import { useState, useEffect, useRef } from 'react';
import {
  obtenerCatalogoTMDB,
  buscarPeliculasTMDB,
  SUGERENCIAS_MAS_BUSCADAS,
} from '../services/tmdb';
import MovieCard from './MovieCard';

function DiscoverView({
  peliculasUsuario,
  onAgregarPelicula,
  onSeleccionarPelicula,
  generoPreferido,
  procesando,
}) {
  const [catalogo, setCatalogo] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const contenedorBuscadorRef = useRef(null);

  useEffect(() => {
    let activo = true;
    obtenerCatalogoTMDB().then((datos) => {
      if (activo) {
        setCatalogo(datos);
        setCargandoCatalogo(false);
      }
    });
    return () => {
      activo = false;
    };
  }, []);

  // Cierra el dropdown de sugerencias al hacer clic afuera
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
    setCargandoCatalogo(true);
    const resultados = await buscarPeliculasTMDB(texto);
    setCatalogo(resultados);
    setCargandoCatalogo(false);
  };

  const elegirSugerencia = (sugerencia) => {
    setBusqueda(sugerencia);
    ejecutarBusqueda(sugerencia);
  };

  const estaGuardada = (peliculaCat) =>
    peliculasUsuario.some(
      (p) =>
        (p.estado === 'mesa_de_luz' || p.estado === 'en_espera') &&
        p.titulo.toLowerCase() === peliculaCat.titulo.toLowerCase()
    );

  const peliculasCienciaFiccion = catalogo.filter((p) =>
    p.genero.toLowerCase().includes('ciencia')
  );
  const peliculasOtras = catalogo.filter(
    (p) => !p.genero.toLowerCase().includes('ciencia')
  );

  return (
    <section className="view-container">
      {/* Barra de búsqueda sin sugerencias nativas + Dropdown de lo más buscado */}
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
                  ejecutarBusqueda('');
                }}
              >
                ✕
              </button>
            )}
            <button type="submit" className="search-icon-btn" aria-label="Buscar">
              🔍
            </button>
          </div>

          {mostrarSugerencias && (
            <div className="search-suggestions-dropdown">
              <span className="suggestions-header">🔥 Lo más buscado en Peliculo</span>
              {SUGERENCIAS_MAS_BUSCADAS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="suggestion-item-btn"
                  onClick={() => elegirSugerencia(item)}
                >
                  <span>🔍 {item}</span>
                  <span className="suggestion-arrow">↗</span>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {cargandoCatalogo ? (
        <div className="loading-box">Cargando catálogo completo de películas...</div>
      ) : (
        <>
          {peliculasCienciaFiccion.length > 0 && (
            <div className="catalog-category-block">
              <h2 className="category-heading">
                Ciencia Ficción {generoPreferido === 'Ciencia Ficción' && '★ Tu género favorito'}
              </h2>
              <div className="catalog-grid">
                {peliculasCienciaFiccion.map((peli) => (
                  <MovieCard
                    key={peli.tmdbId}
                    pelicula={peli}
                    modo="catalogo"
                    yaGuardada={estaGuardada(peli)}
                    procesando={procesando}
                    onAgregar={onAgregarPelicula}
                    onSeleccionarPelicula={onSeleccionarPelicula}
                  />
                ))}
              </div>
            </div>
          )}

          {peliculasOtras.length > 0 && (
            <div className="catalog-category-block">
              <h2 className="category-heading">Catálogo Completo y Aclamadas</h2>
              <div className="catalog-grid">
                {peliculasOtras.map((peli) => (
                  <MovieCard
                    key={peli.tmdbId}
                    pelicula={peli}
                    modo="catalogo"
                    yaGuardada={estaGuardada(peli)}
                    procesando={procesando}
                    onAgregar={onAgregarPelicula}
                    onSeleccionarPelicula={onSeleccionarPelicula}
                  />
                ))}
              </div>
            </div>
          )}

          {catalogo.length === 0 && (
            <p className="empty-message">No se encontraron películas para "{busqueda}".</p>
          )}
        </>
      )}
    </section>
  );
}

export default DiscoverView;