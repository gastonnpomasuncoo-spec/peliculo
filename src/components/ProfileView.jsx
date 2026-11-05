import { NIVELES } from '../utils/niveles';

function ProfileView({
  nombreUsuario,
  nivelInfo,
  mesaDeLuz,
  objetivoActivo,
  peliculasVistasEnObjetivo,
  historialPeliculas,
  onEliminarPelicula,
  procesando,
}) {
  const metaActual = objetivoActivo?.cantidadMeta || 15;
  const porcentajeBarra = Math.min(100, Math.round((peliculasVistasEnObjetivo / metaActual) * 100));

  return (
    <section className="view-container">
      {/* Cabecera de Perfil idéntica al boceto Perfil.jpg + Marco Dinámico por Nivel */}
      <div className="profile-header">
        <div
          className="profile-avatar-frame"
          style={{
            borderColor: nivelInfo.colorMarco,
            boxShadow: `0 0 22px ${nivelInfo.colorMarco}55`,
          }}
          title={`Marco ${nivelInfo.nombreColor} - Nivel ${nivelInfo.nivel}: ${nivelInfo.nombre}`}
        >
          <svg viewBox="0 0 24 24" className="profile-avatar-svg" fill="currentColor">
            <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
          </svg>
        </div>

        <div className="profile-user-details">
          <h1 className="profile-username">{nombreUsuario}</h1>
          <div className="profile-rank-badge" style={{ borderColor: nivelInfo.colorMarco }}>
            <span className="rank-dot" style={{ backgroundColor: nivelInfo.colorMarco }} />
            <span>
              Nivel {nivelInfo.nivel}: <strong>{nivelInfo.nombre}</strong> ({nivelInfo.totalVistas} películas vistas)
            </span>
          </div>
        </div>
      </div>

      {/* Zona central de Perfil.jpg: Mesa de luz a la izquierda + Barra de progreso a la derecha */}
      <div className="profile-middle-grid">
        <div className="profile-mesa-block">
          <div className="profile-mini-cards">
            {[0, 1, 2].map((idx) => {
              const peli = mesaDeLuz[idx];
              return peli ? (
                <div key={peli.id} className="profile-mini-poster-card">
                  <img src={peli.poster} alt={peli.titulo} />
                  <span>{peli.titulo}</span>
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

        <div className="profile-progress-block">
          <p className="profile-progress-text">
            vas {peliculasVistasEnObjetivo} películas de {metaActual}
          </p>
          <div className="profile-bar-container">
            <div className="profile-bar-track">
              <div
                className="profile-bar-fill-green"
                style={{ width: `${porcentajeBarra}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Niveles Generales para Todos */}
      <div className="niveles-reference-box">
        <h2 className="section-title">Escala del Objetivo General</h2>
        <div className="niveles-badges-grid">
          {NIVELES.map((n) => {
            const esActual = n.nivel === nivelInfo.nivel;
            return (
              <div
                key={n.nivel}
                className={`nivel-Reference-item ${esActual ? 'active-rank' : ''}`}
                style={{ borderColor: esActual ? n.colorMarco : 'transparent' }}
              >
                <span className="rank-frame-preview" style={{ borderColor: n.colorMarco }} />
                <div>
                  <strong>Nivel {n.nivel}: "{n.nombre}"</strong>
                  <p>
                    {n.max === Infinity ? `${n.min}+ películas` : `${n.min} a ${n.max} películas`} · Marco {n.nombreColor}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de Proyectadas y Abandonadas (Permite eliminar registros de Firestore) */}
      <div className="historial-section">
        <h2 className="section-title">Historial (Proyectadas y Abandonadas)</h2>
        {historialPeliculas.length === 0 ? (
          <p className="empty-message">
            Todavía no marcaste películas como vistas o abandonadas.
          </p>
        ) : (
          <div className="historial-list">
            {historialPeliculas.map((item) => (
              <div key={item.id} className="historial-row">
                <div className="historial-info">
                  <span
                    className={`status-pill ${
                      item.estado === 'vista' ? 'pill-vista' : 'pill-abandonada'
                    }`}
                  >
                    {item.estado === 'vista' ? '✓ Vista' : '✕ Abandonada'}
                  </span>
                  <strong>{item.titulo}</strong>
                  {item.estado === 'vista' && item.puntaje && (
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
        )}
      </div>
    </section>
  );
}

export default ProfileView;