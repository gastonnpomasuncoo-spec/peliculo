import { useState, useEffect } from 'react';
import { generarPosterRespaldo, GENEROS_DISPONIBLES } from '../services/tmdb';

const AVATARES_PREDEFINIDOS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Peliculo1',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Cinefilo',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Director',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Estrella',
];

function MenuModals({
  modalActivo,
  cerrarModal,
  nombreUsuario,
  fotoPerfil,
  generoPreferido,
  onGuardarPerfilConfig,
  onEnviarSoporte,
  mesaDeLuz,
  peliculaDetalle,
  cerrarDetallePelicula,
  onAgregarDesdeDetalle,
  yaGuardadaEnDetalle,
  modalBienvenidaAbierto,
  cerrarModalBienvenida,
  onAutenticarUsuario,
  errorAuth,
}) {
  const [apodo, setApodo] = useState(nombreUsuario);
  const [fotoInput, setFotoInput] = useState(fotoPerfil || '');
  const [genero, setGenero] = useState(generoPreferido || 'Ciencia Ficción');
  const [elegidaSOS, setElegidaSOS] = useState(null);

  // Estados para Soporte Técnico
  const [asuntoSoporte, setAsuntoSoporte] = useState('Problema técnico con la página');
  const [mensajeSoporte, setMensajeSoporte] = useState('');
  const [soporteEnviado, setSoporteEnviado] = useState(false);

  const [modoAuth, setModoAuth] = useState('bienvenida');
  const [emailAuth, setEmailAuth] = useState('');
  const [passwordAuth, setPasswordAuth] = useState('');
  const [nombreRegistro, setNombreRegistro] = useState('');

  useEffect(() => {
    setApodo(nombreUsuario);
    setFotoInput(fotoPerfil || '');
    setGenero(generoPreferido || 'Ciencia Ficción');
    setSoporteEnviado(false);
    setMensajeSoporte('');
  }, [nombreUsuario, fotoPerfil, generoPreferido, modalActivo]);

  useEffect(() => {
    if (modalBienvenidaAbierto) {
      setModoAuth('bienvenida');
    }
  }, [modalBienvenidaAbierto]);

  const manejarSubidaArchivoFoto = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFotoInput(reader.result);
      }
    };
    reader.readAsDataURL(archivo);
  };

  const guardarConfig = (e) => {
    e.preventDefault();
    onGuardarPerfilConfig({
      apodo: apodo.trim() || nombreUsuario,
      fotoPerfil: fotoInput.trim(),
      generoPreferido: genero,
    });
    cerrarModal();
  };

  const enviarFormularioSoporte = async (e) => {
    e.preventDefault();
    if (!mensajeSoporte.trim()) return;
    if (onEnviarSoporte) {
      await onEnviarSoporte({
        asunto: asuntoSoporte,
        mensaje: mensajeSoporte.trim(),
      });
    }
    setSoporteEnviado(true);
    setMensajeSoporte('');
  };

  const tirarRuletaSOS = () => {
    if (mesaDeLuz.length === 0) return;
    const indice = Math.floor(Math.random() * mesaDeLuz.length);
    setElegidaSOS(mesaDeLuz[indice]);
  };

  const enviarAuth = async (e) => {
    e.preventDefault();
    await onAutenticarUsuario({
      tipo: modoAuth,
      email: emailAuth.trim(),
      password: passwordAuth,
      apodo: nombreRegistro.trim(),
    });
  };

  return (
    <>
      {/* 1. MODAL DE FICHA TÉCNICA COMPLETA AL TOCAR UNA PELÍCULA */}
      {peliculaDetalle && (
        <div className="modal-backdrop" onClick={cerrarDetallePelicula}>
          <div className="modal-card modal-movie-detail" onClick={(e) => e.stopPropagation()}>
            <div className="movie-detail-layout">
              <div className="movie-detail-poster-col">
                <img
                  src={peliculaDetalle.poster || generarPosterRespaldo(peliculaDetalle.titulo)}
                  alt={peliculaDetalle.titulo}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = generarPosterRespaldo(peliculaDetalle.titulo);
                  }}
                />
              </div>

              <div className="movie-detail-info-col">
                <h2 className="movie-detail-title">{peliculaDetalle.titulo}</h2>
                <div className="movie-detail-meta">
                  <span className="meta-chip">📅 Estreno: {peliculaDetalle.anio || '2024'}</span>
                  <span className="meta-chip">⏱ Duración: {peliculaDetalle.duracion || 124} min</span>
                  <span className="meta-chip">🎬 {peliculaDetalle.genero || 'General'}</span>
                </div>

                <p className="movie-detail-sinopsis">
                  {peliculaDetalle.sinopsis || 'Sin descripción disponible.'}
                </p>

                <div className="movie-detail-credits">
                  <p>
                    <strong>Director:</strong> {peliculaDetalle.director || 'Información en catálogo'}
                  </p>
                  <p>
                    <strong>Cast / Reparto:</strong> {peliculaDetalle.cast || 'Información en catálogo'}
                  </p>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={cerrarDetallePelicula}
                  >
                    Cerrar
                  </button>
                  {onAgregarDesdeDetalle && (
                    <button
                      type="button"
                      className={yaGuardadaEnDetalle ? 'btn-disabled' : 'btn-accent'}
                      disabled={yaGuardadaEnDetalle}
                      onClick={() => {
                        onAgregarDesdeDetalle(peliculaDetalle);
                        cerrarDetallePelicula();
                      }}
                    >
                      {yaGuardadaEnDetalle ? 'Ya en tu lista' : '+ Guardar película'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL DE BIENVENIDA / INICIAR SESIÓN O REGISTRARSE */}
      {modalBienvenidaAbierto && (
        <div className="modal-backdrop" onClick={cerrarModalBienvenida}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {modoAuth === 'bienvenida' && (
              <div className="objetivo-form welcome-modal-content">
                <h3 className="box-title">¡Bienvenido a Peliculo :V!</h3>
                <p className="welcome-message-text">
                  “Bienvenido :V Si queres guardar películas inicia sesión o regístrate en el caso de no tener una cuenta.”
                </p>

                <div className="welcome-buttons-row">
                  <button
                    type="button"
                    className="btn-accent"
                    onClick={() => setModoAuth('login')}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setModoAuth('registro')}
                  >
                    Registrarse
                  </button>
                </div>

                <button
                  type="button"
                  className="welcome-skip-btn"
                  onClick={cerrarModalBienvenida}
                >
                  Omitir por ahora (solo explorar)
                </button>
              </div>
            )}

            {(modoAuth === 'login' || modoAuth === 'registro') && (
              <form onSubmit={enviarAuth} className="objetivo-form" autoComplete="off">
                <h3 className="box-title">
                  {modoAuth === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta en Peliculo'}
                </h3>

                {modoAuth === 'registro' && (
                  <label className="form-label">
                    Tu nombre de usuario
                    <input
                      type="text"
                      autoComplete="off"
                      value={nombreRegistro}
                      onChange={(e) => setNombreRegistro(e.target.value)}
                      placeholder="Ej: clarita_cine"
                      className="form-input"
                      required
                    />
                  </label>
                )}

                <label className="form-label">
                  Correo electrónico
                  <input
                    type="email"
                    autoComplete="off"
                    value={emailAuth}
                    onChange={(e) => setEmailAuth(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="form-input"
                    required
                  />
                </label>

                <label className="form-label">
                  Contraseña (mínimo 6 caracteres)
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordAuth}
                    onChange={(e) => setPasswordAuth(e.target.value)}
                    placeholder="••••••"
                    className="form-input"
                    required
                  />
                </label>

                {errorAuth && <p className="form-error">{errorAuth}</p>}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setModoAuth('bienvenida')}
                  >
                    ← Volver
                  </button>
                  <button type="submit" className="btn-accent">
                    {modoAuth === 'login' ? 'Entrar' : 'Registrarme'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. MODALES DE CONFIGURACIÓN, PREFERENCIAS, SOS Y SOPORTE TÉCNICO */}
      {modalActivo && (
        <div className="modal-backdrop" onClick={cerrarModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {modalActivo === 'configuracion' && (
              <form onSubmit={guardarConfig} className="objetivo-form" autoComplete="off">
                <h3 className="box-title">Configuración de Perfil</h3>

                <label className="form-label">
                  Cambio de usuario
                  <input
                    type="text"
                    autoComplete="off"
                    value={apodo}
                    onChange={(e) => setApodo(e.target.value)}
                    className="form-input"
                  />
                </label>

                <label className="form-label">
                  Cambio de foto de perfil (URL de imagen o subí desde tu dispositivo)
                  <input
                    type="text"
                    autoComplete="off"
                    value={fotoInput}
                    onChange={(e) => setFotoInput(e.target.value)}
                    placeholder="Pegá el link de una imagen o elegí abajo..."
                    className="form-input"
                  />
                </label>

                <div className="avatar-upload-options">
                  <label className="btn-secondary btn-xs file-upload-label">
                    📁 Subir imagen de mi compu/celu
                    <input
                      type="file"
                      accept="image/*"
                      onChange={manejarSubidaArchivoFoto}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {fotoInput && (
                    <button
                      type="button"
                      className="btn-outline-danger btn-xs"
                      onClick={() => setFotoInput('')}
                    >
                      Quitar foto
                    </button>
                  )}
                </div>

                <div className="preset-avatars-row">
                  {AVATARES_PREDEFINIDOS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Avatar ${i + 1}`}
                      className={`preset-avatar-thumb ${fotoInput === url ? 'selected' : ''}`}
                      onClick={() => setFotoInput(url)}
                    />
                  ))}
                </div>

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
              <form onSubmit={guardarConfig} className="objetivo-form" autoComplete="off">
                <h3 className="box-title">Preferencias de Catálogo</h3>
                <label className="form-label">
                  Género favorito para el primer carrusel de Descubrir
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    className="form-input"
                  >
                    {GENEROS_DISPONIBLES.map((g) => (
                      <option key={g.id} value={g.nombre}>
                        {g.nombre}
                      </option>
                    ))}
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
                        <p>
                          {elegidaSOS.genero} · {elegidaSOS.anio}
                        </p>
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

            {modalActivo === 'soporte' && (
              <div className="objetivo-form">
                <h3 className="box-title">🛠️ Soporte Técnico</h3>
                <p className="modal-helper">
                  ¿Tuviste algún inconveniente con la página o con una película? Escribinos acá abajo o comunicate a <strong>soporte@peliculo.app</strong> y te ayudamos.
                </p>

                {soporteEnviado ? (
                  <div className="sos-result-card">
                    <h4>¡Mensaje recibido!</h4>
                    <p>
                      Registramos tu consulta para el usuario <strong>{nombreUsuario}</strong>. Nuestro equipo técnico la revisará a la brevedad.
                    </p>
                    <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '0.8rem' }}>
                      <button type="button" className="btn-accent" onClick={cerrarModal}>
                        Cerrar
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={enviarFormularioSoporte} className="objetivo-form" autoComplete="off">
                    <label className="form-label">
                      Motivo de la consulta
                      <select
                        value={asuntoSoporte}
                        onChange={(e) => setAsuntoSoporte(e.target.value)}
                        className="form-input"
                      >
                        <option value="Problema técnico con la página">Problema técnico con la página</option>
                        <option value="Error al cargar o guardar una película">Error al cargar o guardar una película</option>
                        <option value="Problema con mi perfil u objetivos">Problema con mi perfil u objetivos</option>
                        <option value="Sugerencia o comentario">Sugerencia o comentario</option>
                      </select>
                    </label>

                    <label className="form-label">
                      Describí tu problema
                      <textarea
                        rows="4"
                        autoComplete="off"
                        value={mensajeSoporte}
                        onChange={(e) => setMensajeSoporte(e.target.value)}
                        placeholder="Contanos qué pasó para poder ayudarte..."
                        className="form-input"
                        required
                      />
                    </label>

                    <div className="modal-actions">
                      <button type="button" className="btn-secondary" onClick={cerrarModal}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-accent">
                        Enviar a Soporte
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default MenuModals;