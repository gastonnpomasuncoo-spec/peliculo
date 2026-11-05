import { useState, useEffect } from 'react';
import { obtenerCatalogoTMDB, buscarPeliculasTMDB } from '../services/tmdb';
import MovieCard from './MovieCard';

function DiscoverView({
  peliculasUsuario,
  onAgregarPelicula,
  generoPreferido,
  procesando,
}) {
  const [catalogo, setCatalogo] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);

  const [mostrarFormManual, setMostrarFormManual] = useState(false);
  const [tituloManual, setTituloManual] = useState('');
  const [generoManual, setGeneroManual] = useState('Ciencia Ficción');
  const [anioManual, setAnioManual] = useState('2024');

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

  const ejecutarBusqueda = async (e) => {
    e.preventDefault();
    setCargandoCatalogo(true);
    const resultados = await buscarPeliculasTMDB(busqueda);
    setCatalogo(resultados);
    setCargandoCatalogo(false);
  };

  const agregarManual = async (e) => {
    e.preventDefault();
    if (!tituloManual.trim()) return;

    await onAgregarPelicula({
      tmdbId: Date.now(),
      titulo: tituloManual.trim(),
      anio: anioManual.trim() || '2024',
      genero: generoManual,
      duracion: 120,
      poster: 'https://via.placeholder.com/500x750/121015/EAB308?text=' + encodeURIComponent(tituloManual.trim()),
      sinopsis: 'Película agregada manualmente por el usuario.',
    });

    setTituloManual('');
    setMostrarFormManual(false);
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
      {/* Barra de búsqueda centrada como en Descubrir.jpg */}
      <form onSubmit={ejecutarBusqueda} className="search-bar-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar películas en el catálogo TMDB..."
            className="search-input"
          />
          <button type="submit" className="search-icon-btn" aria-label="Buscar">
            🔍
          </button>
        </div>
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={() => setMostrarFormManual(!mostrarFormManual)}
        >
          {mostrarFormManual ? 'Cerrar carga manual' : '+ Cargar título manual'}
        </button>
      </form>

      {mostrarFormManual && (
        <form onSubmit={agregarManual} className="manual-form-card">
          <h3 className="box-title">Agregar película manualmente</h3>
          <div className="manual-form-grid">
            <input
              type="text"
              value={tituloManual}
              onChange={(e) => setTituloManual(e.target.value)}
              placeholder="Título de la película"
              className="form-input"
              required
            />
            <select
              value={generoManual}
              onChange={(e) => setGeneroManual(e.target.value)}
              className="form-input"
            >
              <option value="Ciencia Ficción">Ciencia Ficción</option>
              <option value="Thriller / Drama">Thriller / Drama</option>
              <option value="Drama / Fantasía">Drama / Fantasía</option>
              <option value="Acción">Acción</option>
            </select>
            <input
              type="text"
              maxLength="4"
              value={anioManual}
              onChange={(e) => setAnioManual(e.target.value.replace(/\D/g, ''))}
              placeholder="Año (ej. 2024)"
              className="form-input"
            />
            <button type="submit" className="btn-accent" disabled={procesando}>
              Guardar
            </button>
          </div>
        </form>
      )}

      {cargandoCatalogo ? (
        <div className="loading-box">Cargando catálogo de TMDB...</div>
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
                  />
                ))}
              </div>
            </div>
          )}

          {peliculasOtras.length > 0 && (
            <div className="catalog-category-block">
              <h2 className="category-heading">Destacadas y Recomendadas</h2>
              <div className="catalog-grid">
                {peliculasOtras.map((peli) => (
                  <MovieCard
                    key={peli.tmdbId}
                    pelicula={peli}
                    modo="catalogo"
                    yaGuardada={estaGuardada(peli)}
                    procesando={procesando}
                    onAgregar={onAgregarPelicula}
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