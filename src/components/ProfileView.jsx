import { useState } from 'react';
import { NIVELES, calcularPorcentajeEscalaTramos } from '../utils/niveles';
import { generarPosterRespaldo } from '../services/tmdb';

function ProfileView({
  nombreUsuario,
  fotoPerfil,
  nivelInfo,
  mesaDeLuz,
  historialPeliculas,
  onEliminarPelicula,
  onAbrirConfiguracionFoto,
  onSeleccionarPelicula,
  procesando,
}) {
  const [mostrarTodoHistorial, setMostrarTodoHistorial] = useState(false);

  const porcentajeEscalaGeneral = calcularPorcentajeEscalaTramos(nivelInfo.totalVistas);
  const LIMITE_INICIAL_HISTORIAL = 5;
  const peliculasVisiblesHistorial = mostrarTodoHistorial
    ? historialPeliculas
    : historialPeliculas.slice(0, LIMITE_INICIAL_HISTORIAL);

  return (
    <section className="view-container">
      {/* CABECERA DE PERFIL CON HOVER PARA AGREGAR/EDITAR IMAGEN Y MARCOS DIFERENCIADOS */}
      <div className="profile-header">
        <div
          className={`profile-avatar-frame nivel-frame-${nivelInfo.nivel}`}
          style={{
            borderColor: nivelInfo.colorMarco,
            boxShadow: `0 0 24px ${nivelInfo.sombraMarco}`,
          }}
          onClick={onAbrirConfiguracionFoto}
          title="Hacé clic para cambiar tu foto de perfil"
        >
          {fotoPerfil ? (
            <img
              src={fotoPerfil}
              alt={nombreUsuario}
              className="profile-avatar-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
              }}
            />
          ) : (
            <svg viewBox="0 0 24 24" className="profile-avatar-svg" fill="currentColor">
              <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
            </svg>
          )}

          {/* Texto en hover: Editar imagen si ya tiene, o Agregar imagen si no tiene */}
          <div className="avatar-hover-overlay">
            <span>{fotoPerfil ? 'Editar imagen' : 'Agregar imagen'}</span>
          </div>
        </div>

        <div className="profile-user-details">
          <h1 className="profile-username">{nombreUsuario}</h1>
          <div className="profile-rank-badge" style={{ borderColor: nivelInfo.colorMarco }}>
            <span className="rank-dot" style={{ backgroundColor: nivelInfo.colorMarco }} />
            <span>
              Nivel {nivelInfo.nivel}: <strong>{nivelInfo.nombre}</strong> · Marco {nivelInfo.nombreColor} ({nivelInfo.totalVistas} vistas)
            </span>
          </div>
        </div>
      </div>

      {/* ZONA CENTRAL: MESA DE LUZ A LA IZQUIERDA + PROGRESO DE NIVEL / LA CABRA A LA DERECHA */}
      <div className="profile-middle-grid">
        <div className="profile-mesa-block">
          <div className="profile-mini-cards">
            {[0, 1, 2].map((idx) => {
              const peli = mesaDeLuz[idx];
              return peli ? (
                <div
                  key={peli.id}
                  className="profile-mini-poster-card"
                  onClick={() => onSeleccionarPelicula && onSeleccionarPelicula(peli)}
                  title={`Ver ficha de ${peli.titulo}`}
                >
                  <img
                    src={peli.poster || generarPosterRespaldo(peli.titulo)}
                    alt={peli.titulo}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = generarPosterRespaldo(peli.titulo);
                    }}
                  />
                </div>
              ) : (
                <div key={idx} className="profile-mini-poster-empty">
                  <span>Libre</span>
                </div>
              );
            })}
          </div>
          <p className="profile-mesa-caption">mesa de luz</p>
        </div>

        {/* En vez del objetivo, muestra cuánto falta para el siguiente nivel o el mensaje de La Cabra en Nivel 5 */}
        <div className="profile-progress-block">
          {nivelInfo.esNivelMaximo ? (
            <div className="goat-celebration-box">
              <p className="goat-text">¡Esto es una locura, sos la cabra! 🐐</p>
              <span className="goat-subtext">
                Alcanzaste el Nivel 5 "The King" con {nivelInfo.totalVistas} películas vistas.
              </span>
            </div>
          ) : (
            <>
              <p className="profile-progress-text">
                Sos <strong>{nivelInfo.nombre}</strong>, te faltan{' '}
                <strong>{nivelInfo.faltanParaSubir}</strong>{' '}
                {nivelInfo.faltanParaSubir === 1 ? 'película' : 'películas'} para ser{' '}
                <strong>{nivelInfo.siguienteNombre}</strong>
              </p>
              <div className="profile-bar-container">
                <div className="profile-bar-track">
                  <div
                    className="profile-bar-fill-green"
                    style={{ width: `${nivelInfo.porcentajeNivelActual}%` }}
                  />
                </div>
                <span className="profile-bar-caption">
                  {nivelInfo.porcentajeNivelActual}% del camino hacia {nivelInfo.siguienteNombre}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BARRA DE PROGRESO DE ESCALA EVIDENCIANDO LOS ESPACIOS ENTRE NIVELES */}
      <div className="escala-progreso-section">
        <div className="escala-header-row">
          <h2 className="section-title">Progreso en la Escala de Niveles</h2>
          <span className="escala-total-pill">{nivelInfo.totalVistas} películas vistas</span>
        </div>

        <div className="escala-timeline-wrapper">
          <div className="escala-track-bg">
            <div
              className="escala-track-fill"
              style={{ width: `${porcentajeEscalaGeneral}%` }}
            />
          </div>

          <div className="escala-nodes-row">
            {NIVELES.map((n) => {
              const alcanzado = nivelInfo.totalVistas >= n.min;
              const esActual = nivelInfo.nivel === n.nivel;
              return (
                <div
                  key={n.nivel}
                  className={`escala-node-item ${alcanzado ? 'alcanzado' : ''} ${
                    esActual ? 'actual' : ''
                  }`}
                >
                  <div
                    className="escala-node-circle"
                    style={{
                      borderColor: n.colorMarco,
                      backgroundColor: alcanzado ? n.colorMarco : '#121015',
                    }}
                  />
                  <strong className="escala-node-name">{n.nombre}</strong>
                  <span className="escala-node-min">
                    {n.min === 0 ? '0 pelis' : `${n.min} pelis`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* HISTORIAL CON BOTÓN "VER MÁS" DESPUÉS DE VARIAS PELÍCULAS */}
      <div className="historial-section">
        <h2 className="section-title">
          Historial (Proyectadas y Abandonadas) ({historialPeliculas.length})
        </h2>
        {historialPeliculas.length === 0 ? (
          <p className="empty-message">
            Todavía no marcaste películas como vistas o abandonadas.
          </p>
        ) : (
          <>
            <div className="historial-list">
              {peliculasVisiblesHistorial.map((item) => (
                <div key={item.id} className="historial-row">
                  <div className="historial-info">
                    <span
                      className={`status-pill ${
                        item.estado === 'vista' ? 'pill-vista' : 'pill-abandonada'
                      }`}
                    >
                      {item.estado === 'vista' ? '✓ Vista' : '✕ Abandonada'}
                    </span>
                    <strong
                      className="historial-movie-link"
                      onClick={() => onSeleccionarPelicula && onSeleccionarPelicula(item)}
                    >
                      {item.titulo}
                    </strong>
                    {item.estado === 'vista' && item.puntaje > 0 && (
                      <span className="stars-inline">{'★'.repeat(item.puntaje)}</span>
                    )}
                    {item.comentario && <span className="historial-note">"{item.comentario}"</span>}
                  </div>

                  <button
                    type="button"
                    className="btn-delete"
                    disabled={procesando}
                    onClick={() => onEliminarPelicula(item.id)}
                    title="Eliminar registro de Firebase"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            {historialPeliculas.length > LIMITE_INICIAL_HISTORIAL && (
              <div className="ver-mas-container">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setMostrarTodoHistorial(!mostrarTodoHistorial)}
                >
                  {mostrarTodoHistorial
                    ? 'Ver menos'
                    : `Ver más (${historialPeliculas.length - LIMITE_INICIAL_HISTORIAL} películas más)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ProfileView;