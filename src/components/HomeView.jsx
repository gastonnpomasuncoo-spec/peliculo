import { useState, useRef, useEffect } from 'react';
import MovieCard from './MovieCard';
import { MOODS, filtrarMesaPorMood } from '../utils/moods';

function HomeView({
  pendientes,
  objetivosActivos,
  avisosObjetivosVencidos,
  onDescartarAvisoVencido,
  peliculasVistasCount,
  onSolicitarCompletar,
  onSolicitarAbandonar,
  onAgregarObjetivo,
  onEditarObjetivo,
  onSimularFinPlazoObjetivo,
  onSeleccionarPelicula,
  irADescubrir,
  procesando,
}) {
  // Arranca en null para mostrar primero la pregunta "¿Qué quieres ver hoy?"
  const [moodSeleccionado, setMoodSeleccionado] = useState(null);
  const [dropdownMoodAbierto, setDropdownMoodAbierto] = useState(false);
  const dropdownMoodRef = useRef(null);

  // Estados para la animación del Cajón Oculto debajo de la Mesa de Luz
  const [cajonAnimando, setCajonAnimando] = useState(false);
  const [mensajeCajonVisible, setMensajeCajonVisible] = useState(false);
  const timerCajonRef = useRef(null);

  // Estados de Objetivos
  const [nombreNuevoObj, setNombreNuevoObj] = useState('');
  const [metaInput, setMetaInput] = useState('');
  const [plazoMeses, setPlazoMeses] = useState(2);
  const [errorObjetivo, setErrorObjetivo] = useState('');

  const [objetivoEditando, setObjetivoEditando] = useState(null);
  const [editMeta, setEditMeta] = useState('');
  const [editPlazo, setEditPlazo] = useState(12);

  useEffect(() => {
    const manejarClickAfuera = (e) => {
      if (dropdownMoodRef.current && !dropdownMoodRef.current.contains(e.target)) {
        setDropdownMoodAbierto(false);
      }
    };
    document.addEventListener('mousedown', manejarClickAfuera);
    return () => {
      document.removeEventListener('mousedown', manejarClickAfuera);
      if (timerCajonRef.current) clearTimeout(timerCajonRef.current);
    };
  }, []);

  const moodActualObj = MOODS.find((m) => m.id === moodSeleccionado) || null;
  const peliculasEnMesa = moodSeleccionado
    ? filtrarMesaPorMood(pendientes, moodSeleccionado)
    : [];
  const cantidadEnCajon = moodSeleccionado
    ? Math.max(0, pendientes.length - peliculasEnMesa.length)
    : Math.max(0, pendientes.length - 3);

  const elegirMood = (idMood) => {
    setMoodSeleccionado(idMood);
    setDropdownMoodAbierto(false);
    setMensajeCajonVisible(false);
  };

  // Animación de cajón trabado: intenta abrir ~1 segundo, no cede y luego despliega el mensaje suave
  const intentarAbrirCajon = () => {
    if (cajonAnimando) return;
    setMensajeCajonVisible(false);
    setCajonAnimando(true);

    if (timerCajonRef.current) clearTimeout(timerCajonRef.current);
    timerCajonRef.current = setTimeout(() => {
      setCajonAnimando(false);
      setMensajeCajonVisible(true);
    }, 950);
  };

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
      titulo:
        nombreNuevoObj.trim() ||
        `Objetivo de ${plazoMeses} ${plazoMeses === 1 ? 'mes' : 'meses'}`,
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

  const slots = [0, 1, 2];

  return (
    <section className="view-container">
      {/* CABECERA + BOTÓN DROPDOWN DE MOODS ARRIBA */}
      <div className="section-header home-top-header">
        <div>
          <h1 className="section-title">Tu Mesa de Luz</h1>
          <p className="section-subtitle">
            {moodActualObj
              ? `Mostrando hasta 3 películas para el mood "${moodActualObj.nombre}". Tocá cualquier póster para ver su ficha completa.`
              : 'Elegí tu mood de hoy para ver hasta 3 opciones sin perder tiempo scrolleando.'}
          </p>
        </div>

        {moodSeleccionado && (
          <div className="mood-dropdown-wrapper" ref={dropdownMoodRef}>
            <button
              type="button"
              className="mood-dropdown-trigger"
              onClick={() => setDropdownMoodAbierto(!dropdownMoodAbierto)}
            >
              <span className="mood-trigger-label">Mood:</span>
              <strong>{moodActualObj?.nombre}</strong>
              <span className="mood-caret">{dropdownMoodAbierto ? '▴' : '▾'}</span>
            </button>

            {dropdownMoodAbierto && (
              <div className="mood-dropdown-menu">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`mood-dropdown-item ${moodSeleccionado === m.id ? 'active' : ''}`}
                    onClick={() => elegirMood(m.id)}
                  >
                    <strong>{m.nombre}</strong>
                    <span>{m.descripcion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

{/* MUEBLE LITERAL: LA MESA DE LUZ SIN RECUADRO GRIS, CON LUZ CENITAL + LUZ DE RELLENO */}
      <div className="nightstand-furniture">
        {/* Luz cenital cálida intensa desde arriba + luz de relleno ambiental de fondo */}
        <div className="nightstand-lamp-glow" aria-hidden="true" />
        <div className="nightstand-ambient-fill" aria-hidden="true" />

        {/* SUPERFICIE ABIERTA SOBRE LA MESA DE LUZ (SIN RECUADRO TIPO TV) */}
        <div className="nightstand-top-stage">
          {!moodSeleccionado ? (
            <div className="mood-selector-stage">
              <h2 className="mood-question-title">¿Qué quieres ver hoy?</h2>
              <p className="mood-question-subtitle">
                Elegí la vibra que buscás ahora y te traemos hasta 3 películas de tus pendientes sobre la mesa.
              </p>

              <div className="mood-options-grid">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`mood-choice-card ${m.id === 'olvidadas' ? 'mood-choice-all' : ''}`}
                    onClick={() => elegirMood(m.id)}
                  >
                    <span className="mood-choice-title">{m.nombre}</span>
                    <span className="mood-choice-desc">{m.descripcion}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : peliculasEnMesa.length === 0 && pendientes.length > 0 && moodSeleccionado !== 'olvidadas' ? (
            <div className="mood-empty-match">
              <h3>No tenés pendientes guardadas con la vibra "{moodActualObj?.nombre}"</h3>
              <p>
                Podés cambiar de mood arriba, mirar tus películas olvidadas o sumar nuevas desde Descubrir.
              </p>
              <div className="mood-empty-actions">
                <button
                  type="button"
                  className="btn-accent"
                  onClick={() => elegirMood('olvidadas')}
                >
                  Ver Olvidadas
                </button>
                <button type="button" className="btn-secondary" onClick={irADescubrir}>
                  Ir a Descubrir →
                </button>
              </div>
            </div>
          ) : (
            <div className="mesa-de-luz-grid">
              {slots.map((index) => {
                const peli = peliculasEnMesa[index];
                if (peli) {
                  return (
                    <div key={peli.id} className="slot-wrapper">
                      <MovieCard
                        pelicula={peli}
                        modo="mesa_de_luz"
                        procesando={procesando}
                        onSeleccionarPelicula={onSeleccionarPelicula}
                        onMarcarVista={onSolicitarCompletar}
                        onAbandonar={onSolicitarAbandonar}
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
          )}
        </div>

        {/* TAPA DE MADERA DE LA MESA DE LUZ */}
        <div className="nightstand-tabletop" />

        {/* CUERPO INFERIOR DEL MUEBLE CON EL CAJÓN OCULTO */}
        <div className="nightstand-cabinet">
          <div className="nightstand-drawer-cavity">
            <button
              type="button"
              className={`nightstand-drawer ${cajonAnimando ? 'intentando-abrir' : ''}`}
              onClick={intentarAbrirCajon}
              aria-label="Intentar abrir el Cajón Oculto"
            >
              <div className="drawer-handle-notch" aria-hidden="true" />

              <div className="drawer-front-content">
                <div className="drawer-title-group">
                  <span className="drawer-lock-icon">🔒</span>
                  <span className="drawer-title">Cajón Oculto</span>
                </div>
                <span className="drawer-count-pill">
                  {cantidadEnCajon} {cantidadEnCajon === 1 ? 'película en espera' : 'películas en espera'}
                </span>
                <span className="drawer-tap-hint">
                  {cajonAnimando ? 'No cede...' : 'Tocá el cajón para intentar abrirlo'}
                </span>
              </div>
            </button>
          </div>

          <div
            className={`cajon-smooth-reveal ${mensajeCajonVisible ? 'visible' : ''}`}
            aria-live="polite"
          >
            <div className="cajon-smooth-inner">
              <div className="cajon-smooth-texts">
                <p className="cajon-smooth-quote">
                  “Mirá tu mesa de luz para desbloquear más películas”
                </p>
                <p className="cajon-smooth-desc">
                  El cajón permanece cerrado para que no acumules ruido visual. Cuando marques una de las películas de arriba como <strong>Vista</strong> o la <strong>Deseches</strong>, la siguiente en espera subirá automáticamente.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary btn-xs"
                onClick={() => setMensajeCajonVisible(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>

        {/* PATAS DEL MUEBLE */}
        <div className="nightstand-legs" aria-hidden="true">
          <div className="nightstand-leg" />
          <div className="nightstand-leg" />
        </div>
      </div>

      {/* SECCIÓN TUS OBJETIVOS */}
      <div className="objetivos-section">
        <h2 className="section-title">Tus objetivos</h2>

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
                      ? `¡Plazo finalizado! Cumpliste tu "${aviso.titulo}"`
                      : `Terminó el plazo de "${aviso.titulo}"`}
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
          <div className="objetivo-box">
            <h3 className="box-title">Objetivos en Curso ({objetivosActivos.length})</h3>

            <div className="objetivos-activos-lista">
              {objetivosActivos.map((obj) => {
                const progreso = Math.min(
                  100,
                  Math.round((peliculasVistasCount / obj.cantidadMeta) * 100)
                );
                const diasRestantes = obj.fechaFin
                  ? Math.max(1, Math.ceil((obj.fechaFin - Date.now()) / (1000 * 60 * 60 * 24)))
                  : obj.plazoMeses * 30;

                return (
                  <div key={obj.id} className="objetivo-item-card">
                    <div className="objetivo-item-header">
                      <div>
                        <h4 className="objetivo-item-title">
                          {obj.titulo}{' '}
                          {obj.esInicial && <span className="tag-inicial">Inicial</span>}
                        </h4>
                        <p className="objetivo-plazo">
                          Plazo: {obj.plazoMeses} {obj.plazoMeses === 1 ? 'mes' : 'meses'} ·
                          Quedan ~{diasRestantes} días
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
                          title="Simular que terminó el plazo"
                        >
                          ⏱ Finalizar plazo
                        </button>
                      </div>
                    </div>

                    <p className="objetivo-counter">
                      Vas <strong>{peliculasVistasCount}</strong> películas de{' '}
                      <strong>{obj.cantidadMeta}</strong>
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
    </section>
  );
}

export default HomeView;