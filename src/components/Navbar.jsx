import { useState } from 'react';

function Navbar({
  vistaActual,
  setVistaActual,
  abrirModalMenu,
  cerrarSesionUsuario,
  esUsuarioRegistrado,
  abrirModalBienvenida,
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const navegarA = (vista) => {
    setVistaActual(vista);
    setMenuAbierto(false);
  };

  const seleccionarOpcionMenu = (tipoModal) => {
    setMenuAbierto(false);
    abrirModalMenu(tipoModal);
  };

  return (
    <header className="navbar">
      <div className="navbar-left" onClick={() => navegarA('home')}>
        <span className="brand-logo">PELICULO :V</span>
      </div>

      <nav className="navbar-links">
        <button
          type="button"
          className={`nav-btn ${vistaActual === 'home' ? 'active' : ''}`}
          onClick={() => navegarA('home')}
        >
          Home
        </button>

        <button
          type="button"
          className={`nav-btn ${vistaActual === 'descubrir' ? 'active' : ''}`}
          onClick={() => navegarA('descubrir')}
        >
          Descubrir
        </button>

        <button
          type="button"
          className={`nav-btn ${vistaActual === 'perfil' ? 'active' : ''}`}
          onClick={() => navegarA('perfil')}
        >
          Perfil
        </button>

        <div className="config-dropdown-wrapper">
          <button
            type="button"
            className="config-icon-btn"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Abrir menú de configuración"
            title="Configuración y soporte"
          >
            ⚙️
          </button>

          {menuAbierto && (
            <div className="dropdown-menu">
              <button type="button" onClick={() => seleccionarOpcionMenu('configuracion')}>
                Configuración
              </button>
              <button type="button" onClick={() => seleccionarOpcionMenu('preferencias')}>
                Preferencias
              </button>
              <button type="button" onClick={() => seleccionarOpcionMenu('sos')}>
                SOS
              </button>
              <button type="button" onClick={() => seleccionarOpcionMenu('soporte')}>
                Soporte técnico
              </button>

              {!esUsuarioRegistrado ? (
                <button
                  type="button"
                  className="login-option"
                  onClick={() => {
                    setMenuAbierto(false);
                    abrirModalBienvenida();
                  }}
                >
                  Iniciar sesión / Registrarse
                </button>
              ) : (
                <button
                  type="button"
                  className="logout-option"
                  onClick={() => {
                    setMenuAbierto(false);
                    cerrarSesionUsuario();
                  }}
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;