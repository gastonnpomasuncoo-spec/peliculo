import { useState } from 'react';
import MovieCard from './MovieCard';

function HomeView({
  mesaDeLuz,
  cantidadCajon,
  objetivoActivo,
  peliculasVistasEnObjetivo,
  nivelInfo,
  onCompletarPelicula,
  onAbandonarPelicula,
  onGuardarObjetivo,
  irADescubrir,
  procesando,
}) {
  const [modalAccion, setModalAccion] = useState(null); // { tipo: 'vista' | 'abandonada', pelicula }
  const [puntaje, setPuntaje] = useState(5);
  const [comentario, setComentario] = useState('');
  const [motivoAbandono, setMotivoAbandono] = useState('Me aburrió a los 30 min');

  const [metaInput, setMetaInput] = useState(objetivoActivo?.cantidadMeta ? String(objetivoActivo.cantidadMeta) : '15');
  const [plazoMeses, setPlazoMeses] = useState(objetivoActivo?.plazoMeses || 2);
  const [errorObjetivo, setErrorObjetivo] = useState('');

  // Validación estricta: solo números y hasta 4 dígitos
  const manejarCambioMeta = (e) => {
    const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
    setMetaInput(valor);
  };

  const enviarFormularioObjetivo = (e) => {
    e.preventDefault();
    setErrorObjetivo('');
    const numero = Number(metaInput);

    if (!metaInput || isNaN(numero) || numero < 1 || numero > 9999) {
      setErrorObjetivo('Ingresá un número válido de películas (entre 1 y 9999, hasta 4 dígitos).');
      return;
    }
    if (plazoMeses < 1 || plazoMeses > 12) {
      setErrorObjetivo('El plazo debe estar entre 1 y 12 meses.');
      return;
    }

    onGuardarObjetivo({
      cantidadMeta: numero,
      plazoMeses: Number(plazoMeses),
    });
  };

  const confirmarModal = async (e) => {
    e.preventDefault();
    if (!modalAccion) return;

    if (modalAccion.tipo === 'vista') {
      await onCompletarPelicula(modalAccion.pelicula, puntaje, comentario.trim());
    } else {
      await onAbandonarPelicula(modalAccion.pelicula, motivoAbandono.trim() || 'Descartada de la Mesa de Luz');
    }

    setModalAccion(null);
    setPuntaje(5);
    setComentario('');
  };

  const slots = [0, 1, 2];
  const metaActual = objetivoActivo?.cantidadMeta || 15;
  const porcentajeObjetivo = Math.min(100, Math.round((peliculasVistasEnObjetivo / metaActual) * 100));

  return (
    <section className="view-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Tus próximas películas por ver</h1>
          <p className="section-subtitle">
            Tu Mesa de Luz prioriza hasta 3 películas en foco. Para que aparezca la siguiente del cajón oculto ({cantidadCajon} en espera), tenés que marcar una como vista o desecharla.
          </p>
        </div>
      </div>

      <div className="mesa-de-luz-grid">
        {slots.map((index) => {
          const peli = mesaDeLuz[index];
          if (peli) {
            return (
              <div key={peli.id} className="slot-wrapper">
                <MovieCard
                  pelicula={peli}
                  modo="mesa_de_luz"
                  procesando={procesando}
                  onMarcarVista={(p) => setModalAccion({ tipo: 'vista', pelicula: p })}
                  onAbandonar={(p) => setModalAccion({ tipo: 'abandonada', pelicula: p })}
                />
                <span className="slot-label">Película {index + 1}</span>
              </div>
            );
          }

          return (
            <div key={index} className="slot-wrapper">
              <div className="empty-slot-card" onClick={irADescubrir}>
                <span className="empty-slot-icon">+</span>
                <p>Espacio libre en tu Mesa de Luz</p>
                <span className="empty-slot-cta">Ir a Descubrir →</span>
              </div>
              <span className="slot-label">Película {index + 1}</span>
            </div>
          );
        })}
      </div>

      <div className="objetivos-section">
        <h2 className="section-title">Tus objetivos</h2>

        <div className="objetivos-grid">
          {/* Cuadro 1: Estado del Objetivo Personalizado y Nivel General */}
          <div className="objetivo-box">
            <h3 className="box-title">Progreso Actual</h3>
            <p className="objetivo-counter">
              Vas <strong>{peliculasVistasEnObjetivo}</strong> películas de <strong>{metaActual}</strong>
            </p>
            <p className="objetivo-plazo">
              Plazo configurado: {objetivoActivo?.plazoMeses || 2} {Number(objetivoActivo?.plazoMeses || 2) === 1 ? 'mes' : 'meses'}
            </p>

            <div className="progress-bar-outer">
              <div className="progress-bar-inner" style={{ width: `${porcentajeObjetivo}%` }} />
            </div>
            <span className="progress-percentage">{porcentajeObjetivo}% completado</span>

            <div className="nivel-resumen-card">
              <span
                className="nivel-dot"
                style={{ backgroundColor: nivelInfo.colorMarco }}
              />
              <div>
                <strong>Objetivo General — Nivel {nivelInfo.nivel}: "{nivelInfo.nombre}"</strong>
                <p>
                  Llevás {nivelInfo.totalVistas} vistas históricas (Marco {nivelInfo.nombreColor}).
                  {nivelInfo.faltanParaSubir > 0
                    ? ` Te faltan ${nivelInfo.faltanParaSubir} para el siguiente rango.`
                    : ' ¡Alcanzaste el rango máximo The King!'}
                </p>
              </div>
            </div>
          </div>

          {/* Cuadro 2: Programar un Objetivo Personalizado */}
          <div className="objetivo-box">
            <h3 className="box-title">Programar Objetivo Personalizado</h3>
            <form onSubmit={enviarFormularioObjetivo} className="objetivo-form">
              <label className="form-label">
                Número de películas (solo números, hasta 4 dígitos)
                <input
                  type="text"
                  inputMode="numeric"
                  value={metaInput}
                  onChange={manejarCambioMeta}
                  placeholder="Ej: 15"
                  className="form-input"
                  required
                />
              </label>

              <label className="form-label">
                Plazo de tiempo (1 mes a 12 meses)
                <select
                  value={plazoMeses}
                  onChange={(e) => setPlazoMeses(Number(e.target.value))}
                  className="form-input"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => (
                    <option key={mes} value={mes}>
                      {mes} {mes === 1 ? 'mes' : 'meses'}
                    </option>
                  ))}
                </select>
              </label>

              {errorObjetivo && <p className="form-error">{errorObjetivo}</p>}

              <button type="submit" className="btn-accent" disabled={procesando}>
                Guardar Objetivo en Firebase
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal para calificar película vista o registrar abandono */}
      {modalAccion && (
        <div className="modal-backdrop" onClick={() => setModalAccion(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="box-title">
              {modalAccion.tipo === 'vista'
                ? `¡Terminaste "${modalAccion.pelicula.titulo}"!`
                : `Desechar "${modalAccion.pelicula.titulo}"`}
            </h3>

            <form onSubmit={confirmarModal} className="objetivo-form">
              {modalAccion.tipo === 'vista' ? (
                <>
                  <p className="modal-helper">
                    Al marcarla como vista sumás +1 a tu objetivo y se habilita el espacio para la siguiente película de tu cajón.
                  </p>
                  <label className="form-label">
                    Puntaje (1 a 5 estrellas)
                    <div className="stars-selector">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${puntaje >= star ? 'active' : ''}`}
                          onClick={() => setPuntaje(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </label>

                  <label className="form-label">
                    Comentario (opcional)
                    <textarea
                      rows="3"
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="¿Qué te pareció la película?"
                      className="form-input"
                    />
                  </label>
                </>
              ) : (
                <>
                  <p className="modal-helper">
                    Liberás el lugar en tu Mesa de Luz sin culpa para que suba la siguiente película en espera (no suma al objetivo).
                  </p>
                  <label className="form-label">
                    Motivo de abandono
                    <input
                      type="text"
                      value={motivoAbandono}
                      onChange={(e) => setMotivoAbandono(e.target.value)}
                      placeholder="Ej: Me aburrió a los 30 min"
                      className="form-input"
                    />
                  </label>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalAccion(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-accent" disabled={procesando}>
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default HomeView;