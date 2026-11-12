import { useState } from 'react';
import MovieCard from './MovieCard';

function HomeView({
  mesaDeLuz,
  cantidadCajon,
  objetivosActivos,
  avisosObjetivosVencidos,
  onDescartarAvisoVencido,
  peliculasVistasCount,
  onCompletarPelicula,
  onAbandonarPelicula,
  onAgregarObjetivo,
  onEditarObjetivo,
  onSimularFinPlazoObjetivo,
  onSeleccionarPelicula,
  irADescubrir,
  procesando,
}) {
  const [modalAccion, setModalAccion] = useState(null);
  // Estrellas arrancan por default en 0
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState('');
  const [motivoAbandono, setMotivoAbandono] = useState('Me aburrió a los 30 min');

  // Popup del Cajón Oculto al lado de la Mesa de Luz
  const [popupCajonAbierto, setPopupCajonAbierto] = useState(false);

  // Formulario para SUMAR un nuevo objetivo
  const [nombreNuevoObj, setNombreNuevoObj] = useState('');
  const [metaInput, setMetaInput] = useState('');
  const [plazoMeses, setPlazoMeses] = useState(2);
  const [errorObjetivo, setErrorObjetivo] = useState('');

  // Modal para EDITAR un objetivo existente (como el Anual de 50 pelis)
  const [objetivoEditando, setObjetivoEditando] = useState(null);
  const [editMeta, setEditMeta] = useState('');
  const [editPlazo, setEditPlazo] = useState(12);

  const manejarCambioMeta = (e) => {
    const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
    setMetaInput(valor);
  };

  const enviarNuevoObjetivo = (e) => {
    e.preventDefault();
    setErrorObjetivo('');
    const numero = Number(metaInput);

    if (!metaInput || isNaN(numero) || numero < 1 || numero > 9999) {
      setErrorObjetivo('Ingresá un número válido de películas (solo números, entre 1 y 9999).');
      return;
    }

    onAgregarObjetivo({
      titulo: nombreNuevoObj.trim() || `Objetivo de ${plazoMeses} ${plazoMeses === 1 ? 'mes' : 'meses'}`,
      cantidadMeta: numero,
      plazoMeses: Number(plazoMeses),
    });

    setNombreNuevoObj('');
    setMetaInput('');
    setPlazoMeses(2);
  };

  const abrirEdicionObjetivo = (obj) => {
    setObjetivoEditando(obj);
    setEditMeta(String(obj.cantidadMeta));
    setEditPlazo(obj.plazoMeses || 12);
  };

  const guardarEdicionObjetivo = (e) => {
    e.preventDefault();
    if (!objetivoEditando) return;
    const numero = Number(editMeta);
    if (!editMeta || isNaN(numero) || numero < 1 || numero > 9999) return;

    onEditarObjetivo(objetivoEditando.id, {
      cantidadMeta: numero,
      plazoMeses: Number(editPlazo),
    });
    setObjetivoEditando(null);
  };

  const abrirModalCalificar = (pelicula) => {
    setPuntaje(0);
    setComentario('');
    setModalAccion({ tipo: 'vista', pelicula });
  };

  const confirmarModal = async (e) => {
    e.preventDefault();
    if (!modalAccion) return;

    if (modalAccion.tipo === 'vista') {
      await onCompletarPelicula(modalAccion.pelicula, puntaje, comentario.trim());
    } else {
      await onAbandonarPelicula(
        modalAccion.pelicula,
        motivoAbandono.trim() || 'Descartada de la Mesa de Luz'
      );
    }

    setModalAccion(null);
    setPuntaje(0);
    setComentario('');
  };

  const slots = [0, 1, 2];

  return (
    <section className="view-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Tus próximas películas por ver</h1>
          <p className="section-subtitle">
            Tu Mesa de Luz muestra hasta 3 películas en foco. Tocá cualquier póster para ver su ficha completa.
          </p>
        </div>
      </div>

      {/* FILA DE LA MESA DE LUZ (3 SLOTS) + CAJÓN OCULTO AL LADO */}
      <div className="mesa-y-cajon-layout">
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
                    onSeleccionarPelicula={onSeleccionarPelicula}
                    onMarcarVista={abrirModalCalificar}
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

        {/* CAJÓN OCULTO AL LADO DE LA MESA DE LUZ */}
        <aside
          className="cajon-oculto-sidecard"
          onClick={() => setPopupCajonAbierto(true)}
          title="Tocar para ver información del Cajón Oculto"
        >
          <div className="cajon-icon-circle">🔒</div>
          <h3 className="cajon-side-title">Cajón Oculto</h3>
          <span className="cajon-count-badge">
            {cantidadCajon} {cantidadCajon === 1 ? 'película en espera' : 'películas en espera'}
          </span>
          <p className="cajon-side-hint">Tocá para saber cómo desbloquearlas</p>
        </aside>
      </div>

      {/* SECCIÓN TUS OBJETIVOS */}
      <div className="objetivos-section">
        <h2 className="section-title">Tus objetivos</h2>

        {/* Avisos de objetivos cuyo plazo ya terminó */}
        {avisosObjetivosVencidos.length > 0 && (
          <div className="vencidos-alerts-stack">
            {avisosObjetivosVencidos.map((aviso) => (
              <div
                key={aviso.id}
                className={`vencido-alert-card ${aviso.cumplido ? 'vencido-exito' : 'vencido-fallo'}`}
              >
                <div>
                  <strong>
                    {aviso.cumplido
                      ? `🎉 ¡Plazo finalizado! Cumpliste tu "${aviso.titulo}"`
                      : `⏰ Terminó el plazo de "${aviso.titulo}"`}
                  </strong>
                  <p>
                    {aviso.cumplido
                      ? `¡Excelente constancia! Alcanzaste la meta de ${aviso.cantidadMeta} películas a tiempo.`
                      : `No llegaste a la meta de ${aviso.cantidadMeta} películas antes de que venciera el plazo. ¡Programá uno nuevo para la revancha!`}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => onDescartarAvisoVencido(aviso.id)}
                >
                  Entendido
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="objetivos-grid">
          {/* Cuadro 1: Listado de Objetivos Activos (Objetivo Anual de 50 pelis editable + los que el usuario sume) */}
          <div className="objetivo-box">
            <h3 className="box-title">Objetivos en Curso ({objetivosActivos.length})</h3>

            <div className="objetivos-activos-lista">
              {objetivosActivos.map((obj) => {
                const progreso = Math.min(100, Math.round((peliculasVistasCount / obj.cantidadMeta) * 100));
                const diasRestantes = obj.fechaFin
                  ? Math.max(1, Math.ceil((obj.fechaFin - Date.now()) / (1000 * 60 * 60 * 24)))
                  : obj.plazoMeses * 30;

                return (
                  <div key={obj.id} className="objetivo-item-card">
                    <div className="objetivo-item-header">
                      <div>
                        <h4 className="objetivo-item-title">
                          {obj.titulo} {obj.esInicial && <span className="tag-inicial">Inicial</span>}
                        </h4>
                        <p className="objetivo-plazo">
                          Plazo: {obj.plazoMeses} {obj.plazoMeses === 1 ? 'mes' : 'meses'} · Quedan ~{diasRestantes} días
                        </p>
                      </div>
                      <div className="objetivo-item-actions">
                        <button
                          type="button"
                          className="btn-secondary btn-xs"
                          onClick={() => abrirEdicionObjetivo(obj)}
                        >
                          ✎ Editar
                        </button>
                        <button
                          type="button"
                          className="btn-outline-danger btn-xs"
                          onClick={() => onSimularFinPlazoObjetivo(obj)}
                          title="Simular que terminó el plazo para probar el cartel de aviso"
                        >
                          ⏱ Finalizar plazo
                        </button>
                      </div>
                    </div>

                    <p className="objetivo-counter">
                      Vas <strong>{peliculasVistasCount}</strong> películas de <strong>{obj.cantidadMeta}</strong>
                    </p>

                    <div className="progress-bar-outer">
                      <div className="progress-bar-inner" style={{ width: `${progreso}%` }} />
                    </div>
                    <span className="progress-percentage">{progreso}% completado</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cuadro 2: Sumar un nuevo Objetivo Personalizado sin reemplazar los anteriores */}
          <div className="objetivo-box">
            <h3 className="box-title">Sumar Nuevo Objetivo Personalizado</h3>
            <p className="modal-helper">
              Al agregar un nuevo objetivo se suma a tu lista activa sin reemplazar el Objetivo Anual ni los anteriores.
            </p>
            <form onSubmit={enviarNuevoObjetivo} className="objetivo-form" autoComplete="off">
              <label className="form-label">
                Nombre del objetivo (opcional)
                <input
                  type="text"
                  autoComplete="off"
                  value={nombreNuevoObj}
                  onChange={(e) => setNombreNuevoObj(e.target.value)}
                  placeholder="Ej: Maratón de Invierno"
                  className="form-input"
                />
              </label>

              <label className="form-label">
                Número de películas (solo números, hasta 4 dígitos)
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
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
                + Sumar Objetivo
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* POPUP DEL CAJÓN OCULTO */}
      {popupCajonAbierto && (
        <div className="modal-backdrop" onClick={() => setPopupCajonAbierto(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="box-title">🔒 Cajón Oculto ({cantidadCajon} en espera)</h3>
            <p className="cajon-popup-highlight">
              “Mirá tu mesa de luz para desbloquear más películas”
            </p>
            <p className="modal-helper">
              Para evitar que acumules una lista eterna que nunca ves, las películas extras quedan guardadas en este cajón secreto. Cuando marques una de las 3 películas de tu Mesa de Luz como <strong>Vista</strong> o la <strong>Deseches</strong>, la siguiente película más antigua subirá automáticamente.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-accent"
                onClick={() => setPopupCajonAbierto(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA EDITAR UN OBJETIVO EXISTENTE */}
      {objetivoEditando && (
        <div className="modal-backdrop" onClick={() => setObjetivoEditando(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="box-title">Editar "{objetivoEditando.titulo}"</h3>
            <form onSubmit={guardarEdicionObjetivo} className="objetivo-form" autoComplete="off">
              <label className="form-label">
                Meta de películas (solo números, hasta 4 dígitos)
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={editMeta}
                  onChange={(e) => setEditMeta(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="form-input"
                  required
                />
              </label>

              <label className="form-label">
                Plazo de tiempo (1 a 12 meses)
                <select
                  value={editPlazo}
                  onChange={(e) => setEditPlazo(Number(e.target.value))}
                  className="form-input"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => (
                    <option key={mes} value={mes}>
                      {mes} {mes === 1 ? 'mes' : 'meses'}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setObjetivoEditando(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-accent">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA CALIFICAR (ESTRELLAS EN 0 POR DEFAULT) O ABANDONAR */}
      {modalAccion && (
        <div className="modal-backdrop" onClick={() => setModalAccion(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="box-title">
              {modalAccion.tipo === 'vista'
                ? `¡Terminaste "${modalAccion.pelicula.titulo}"!`
                : `Desechar "${modalAccion.pelicula.titulo}"`}
            </h3>

            <form onSubmit={confirmarModal} className="objetivo-form" autoComplete="off">
              {modalAccion.tipo === 'vista' ? (
                <>
                  <p className="modal-helper">
                    Al marcarla como vista sumás +1 a tus objetivos activos y se desbloquea el espacio para la siguiente película de tu cajón.
                  </p>
                  <label className="form-label">
                    Puntaje ({puntaje} de 5 estrellas)
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
                      autoComplete="off"
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
                    Liberás el lugar en tu Mesa de Luz sin culpa para que suba la siguiente película en espera (no suma a los objetivos).
                  </p>
                  <label className="form-label">
                    Motivo de abandono
                    <input
                      type="text"
                      autoComplete="off"
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