import { useState } from 'react';

function Navbar({ vistaActual, setVistaActual, abrirModalMenu, cerrarSesionUsuario, cantidadCajon }) {
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
        {cantidadCajon > 0 && (
          <span className="cajon-pill" title="Películas ocultas en el Cajón de Espera">
            +{cantidadCajon} en cajón oculto
          </span>
        )}
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

        <div className="perfil-dropdown-wrapper">
          <button
            type="button"
            className={`nav-btn ${vistaActual === 'perfil' ? 'active' : ''}`}
            onClick={() => navegarA('perfil')}
          >
            Perfil
          </button>
          <button
            type="button"
            className="dropdown-toggle-btn"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Abrir menú de perfil"
          >
            ▾
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
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;