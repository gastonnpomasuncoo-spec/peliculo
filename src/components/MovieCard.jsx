function MovieCard({ pelicula, modo, onMarcarVista, onAbandonar, onAgregar, yaGuardada, procesando }) {
  return (
    <article className="movie-card">
      <div className="movie-poster-wrapper">
        <img
          src={pelicula.poster}
          alt={pelicula.titulo}
          className="movie-poster"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/500x750/121015/EAB308?text=PELICULO';
          }}
        />
        {pelicula.anio && <span className="movie-year-badge">{pelicula.anio}</span>}
      </div>

      <div className="movie-card-body">
        <h3 className="movie-title">{pelicula.titulo}</h3>
        {pelicula.genero && <p className="movie-genre">{pelicula.genero}</p>}

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