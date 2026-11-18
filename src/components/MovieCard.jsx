import { generarPosterRespaldo } from '../services/tmdb';

function MovieCard({
  pelicula,
  modo,
  onMarcarVista,
  onAbandonar,
  onAgregar,
  onSeleccionarPelicula,
  yaGuardada,
  procesando,
}) {
  const abrirDetalle = () => {
    if (onSeleccionarPelicula) {
      onSeleccionarPelicula(pelicula);
    }
  };

  return (
    <article className="movie-card">
      <div
        className="movie-poster-wrapper clickable-poster"
        onClick={abrirDetalle}
        title="Tocar para ver ficha completa"
      >
        <img
          src={pelicula.poster || generarPosterRespaldo(pelicula.titulo)}
          alt={pelicula.titulo}
          className="movie-poster"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = generarPosterRespaldo(pelicula.titulo);
          }}
        />
        {pelicula.anio && <span className="movie-year-badge">{pelicula.anio}</span>}
        <span className="movie-info-hint">Ver info</span>
      </div>

      <div className="movie-card-body">
        <div onClick={abrirDetalle} className="movie-title-click">
          <h3 className="movie-title" title={pelicula.titulo}>
            {pelicula.titulo}
          </h3>
          <p className="movie-genre">{pelicula.genero || 'Película'}</p>
        </div>

        {modo === 'mesa_de_luz' && (
          <div className="movie-actions">
            <button
              type="button"
              className="btn-accent btn-sm"
              disabled={procesando}
              onClick={() => onMarcarVista(pelicula)}
            >
              ✓ ¡La vi!
            </button>
            <button
              type="button"
              className="btn-outline-danger btn-sm"
              disabled={procesando}
              onClick={() => onAbandonar(pelicula)}
            >
              ✕ Desechar
            </button>
          </div>
        )}

        {modo === 'catalogo' && (
          <div className="movie-actions">
            <button
              type="button"
              className={`btn-full ${yaGuardada ? 'btn-disabled' : 'btn-accent'}`}
              disabled={yaGuardada || procesando}
              onClick={() => onAgregar(pelicula)}
            >
              {yaGuardada ? 'Ya en tu lista' : '+ Guardar película'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default MovieCard;