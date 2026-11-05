import { useState } from 'react';

function MenuModals({
  modalActivo,
  cerrarModal,
  nombreUsuario,
  generoPreferido,
  vistasExtraSimuladas,
  onGuardarPerfilConfig,
  mesaDeLuz,
}) {
  const [apodo, setApodo] = useState(nombreUsuario);
  const [genero, setGenero] = useState(generoPreferido || 'Ciencia Ficción');
  const [simulacionVistas, setSimulacionVistas] = useState(vistasExtraSimuladas || 0);
  const [elegidaSOS, setElegidaSOS] = useState(null);

  if (!modalActivo) return null;

  const guardarConfig = (e) => {
    e.preventDefault();
    onGuardarPerfilConfig({
      apodo: apodo.trim() || nombreUsuario,
      generoPreferido: genero,
      vistasExtraSimuladas: Number(simulacionVistas) || 0,
    });
    cerrarModal();
  };

  const tirarRuletaSOS = () => {
    if (mesaDeLuz.length === 0) return;
    const indice = Math.floor(Math.random() * mesaDeLuz.length);
    setElegidaSOS(mesaDeLuz[indice]);
  };

  return (
    <div className="modal-backdrop" onClick={cerrarModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {modalActivo === 'configuracion' && (
          <form onSubmit={guardarConfig} className="objetivo-form">
            <h3 className="box-title">Configuración de Perfil</h3>
            <label className="form-label">
              Nombre de usuario
              <input
                type="text"
                value={apodo}
                onChange={(e) => setApodo(e.target.value)}
                className="form-input"
              />
            </label>

            <label className="form-label">
              Simulador de Películas Vistas (para probar los 5 marcos de Nivel)
              <select
                value={simulacionVistas}
                onChange={(e) => setSimulacionVistas(Number(e.target.value))}
                className="form-input"
              >
                <option value={0}>Sin simulación (usar solo vistas reales)</option>
                <option value={10}>Nivel 1: Pichi (10 vistas - Marco Gris)</option>
                <option value={60}>Nivel 2: Medio pichi (60 vistas - Marco Amarillo)</option>
                <option value={150}>Nivel 3: Capo (150 vistas - Marco Azul)</option>
                <option value={450}>Nivel 4: Tipazo (450 vistas - Marco Plateado)</option>
                <option value={1050}>Nivel 5: The King (1050 vistas - Marco Dorado)</option>
              </select>
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={cerrarModal}>
                Cancelar
              </button>
              <button type="submit" className="btn-accent">
                Guardar cambios
              </button>
            </div>
          </form>
        )}

        {modalActivo === 'preferencias' && (
          <form onSubmit={guardarConfig} className="objetivo-form">
            <h3 className="box-title">Preferencias de Catálogo</h3>
            <label className="form-label">
              Género favorito para destacar en Descubrir
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="form-input"
              >
                <option value="Ciencia Ficción">Ciencia Ficción</option>
                <option value="Thriller / Drama">Thriller / Drama</option>
                <option value="Drama / Fantasía">Drama / Fantasía</option>
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={cerrarModal}>
                Cerrar
              </button>
              <button type="submit" className="btn-accent">
                Guardar Preferencia
              </button>
            </div>
          </form>
        )}

        {modalActivo === 'sos' && (
          <div className="objetivo-form">
            <h3 className="box-title">🚨 SOS Anti-Procrastinación</h3>
            <p className="modal-helper">
              ¿No te decidís entre las películas de tu Mesa de Luz? Tocá el botón y Peliculo decide por vos qué ver esta noche, sin excusas.
            </p>

            {mesaDeLuz.length === 0 ? (
              <p className="form-error">
                Tu Mesa de Luz está vacía. Agregá primero una película desde Descubrir.
              </p>
            ) : (
              <>
                <button type="button" className="btn-accent" onClick={tirarRuletaSOS}>
                  🎲 Elegir por mí ahora
                </button>
                {elegidaSOS && (
                  <div className="sos-result-card">
                    <span>Hoy tenés que ver:</span>
                    <h4>{elegidaSOS.titulo}</h4>
                    <p>{elegidaSOS.genero} · {elegidaSOS.anio}</p>
                  </div>
                )}
              </>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={cerrarModal}>
                Listo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuModals;