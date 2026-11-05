import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { auth, db, firebaseListo } from './firebase/config';
import { obtenerNivelUsuario } from './utils/niveles';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import DiscoverView from './components/DiscoverView';
import ProfileView from './components/ProfileView';
import MenuModals from './components/MenuModals';
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [vistaActual, setVistaActual] = useState('home');
  const [modalMenu, setModalMenu] = useState(null);

  const [peliculas, setPeliculas] = useState([]);
  const [objetivoActivo, setObjetivoActivo] = useState({ cantidadMeta: 15, plazoMeses: 2 });
  const [perfilConfig, setPerfilConfig] = useState({
    apodo: '',
    generoPreferido: 'Ciencia Ficción',
    vistasExtraSimuladas: 0,
  });

  const [procesando, setProcesando] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setNotificacion({ texto, tipo });
    setTimeout(() => {
      setNotificacion(null);
    }, 4500);
  };

  // 1. Autenticación Anónima en Firebase (o Modo Vista Previa si aún no se creó .env)
  useEffect(() => {
    if (!firebaseListo || !auth) {
      setUsuario({ uid: '30924820demo' });
      setCargandoAuth(false);
      mostrarMensaje(
        'Modo Vista Previa activo: Cuando agregues tus claves reales de Firebase en el archivo .env, los datos se guardarán en Cloud Firestore.',
        'exito'
      );
      return;
    }

    const desuscribir = onAuthStateChanged(auth, async (userActual) => {
      if (userActual) {
        setUsuario(userActual);
        setCargandoAuth(false);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error('Error en Auth Anónimo:', err);
          mostrarMensaje(
            'Falta habilitar el proveedor "Anónimo / Anonymous" en Firebase Console → Authentication.',
            'error'
          );
          setUsuario({ uid: '30924820demo' });
          setCargandoAuth(false);
        }
      }
    });
    return () => desuscribir();
  }, []);

  // 2. Escucha en tiempo real de Cloud Firestore cuando Firebase está configurado
  useEffect(() => {
    if (!usuario || !firebaseListo || !db) return;

    const qPeliculas = query(collection(db, 'peliculas'), where('uid', '==', usuario.uid));
    const unsubPeliculas = onSnapshot(
      qPeliculas,
      (snapshot) => {
        const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => (a.creadoEn || 0) - (b.creadoEn || 0));
        setPeliculas(lista);
      },
      (error) => {
        console.error('Error al leer películas:', error);
        mostrarMensaje('No se pudieron leer las películas desde Firestore. Revisá las reglas.', 'error');
      }
    );

    const refObjetivo = doc(db, 'objetivos', usuario.uid);
    const unsubObjetivo = onSnapshot(refObjetivo, (docSnap) => {
      if (docSnap.exists()) {
        setObjetivoActivo(docSnap.data());
      }
    });

    const refPerfil = doc(db, 'perfiles', usuario.uid);
    const unsubPerfil = onSnapshot(refPerfil, (docSnap) => {
      if (docSnap.exists()) {
        setPerfilConfig((prev) => ({ ...prev, ...docSnap.data() }));
      }
    });

    return () => {
      unsubPeliculas();
      unsubObjetivo();
      unsubPerfil();
    };
  }, [usuario]);

  const mesaDeLuz = peliculas.filter((p) => p.estado === 'mesa_de_luz').slice(0, 3);
  const cajonDeEspera = peliculas.filter((p) => p.estado === 'en_espera');
  const peliculasVistas = peliculas.filter((p) => p.estado === 'vista');
  const historialPeliculas = peliculas
    .filter((p) => p.estado === 'vista' || p.estado === 'abandonada')
    .sort((a, b) => (b.actualizadoEn || 0) - (a.actualizadoEn || 0));

  const totalVistasConSimulacion =
    peliculasVistas.length + (Number(perfilConfig.vistasExtraSimuladas) || 0);
  const nivelInfo = obtenerNivelUsuario(totalVistasConSimulacion);

  const nombreUsuarioVisible =
    perfilConfig.apodo ||
    (usuario ? `user${usuario.uid.slice(0, 8).toLowerCase()}` : 'user30924820');

  // CRUD 1: Agregar Película
  const agregarPelicula = async (datosPelicula) => {
    if (!usuario) return;
    setProcesando(true);
    const estadoInicial = mesaDeLuz.length < 3 ? 'mesa_de_luz' : 'en_espera';
    const nuevoRegistro = {
      uid: usuario.uid,
      titulo: datosPelicula.titulo,
      anio: datosPelicula.anio || '2024',
      genero: datosPelicula.genero || 'General',
      poster: datosPelicula.poster,
      estado: estadoInicial,
      puntaje: null,
      comentario: '',
      creadoEn: Date.now(),
      actualizadoEn: Date.now(),
    };

    try {
      if (firebaseListo && db) {
        await addDoc(collection(db, 'peliculas'), nuevoRegistro);
      } else {
        setPeliculas((prev) => [...prev, { id: String(Date.now()), ...nuevoRegistro }]);
      }

      if (estadoInicial === 'mesa_de_luz') {
        mostrarMensaje(`"${datosPelicula.titulo}" se sumó a tu Mesa de Luz (${mesaDeLuz.length + 1}/3).`);
      } else {
        mostrarMensaje(
          `Mesa de Luz llena (3/3). "${datosPelicula.titulo}" se guardó en el Cajón de Espera oculto.`
        );
      }
    } catch (error) {
      console.error('Error al guardar película:', error);
      mostrarMensaje('Error al guardar la película en Firebase.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  // Promover automáticamente la siguiente película del Cajón de Espera
  const promoverSiguienteDelCajon = async () => {
    if (cajonDeEspera.length > 0) {
      const siguiente = cajonDeEspera[0];
      if (firebaseListo && db) {
        await updateDoc(doc(db, 'peliculas', siguiente.id), {
          estado: 'mesa_de_luz',
          actualizadoEn: Date.now(),
        });
      } else {
        setPeliculas((prev) =>
          prev.map((p) =>
            p.id === siguiente.id ? { ...p, estado: 'mesa_de_luz', actualizadoEn: Date.now() } : p
          )
        );
      }
      return siguiente.titulo;
    }
    return null;
  };

  // CRUD 2: Marcar como Vista
  const completarPelicula = async (pelicula, puntaje, comentario) => {
    setProcesando(true);
    try {
      if (firebaseListo && db) {
        await updateDoc(doc(db, 'peliculas', pelicula.id), {
          estado: 'vista',
          puntaje: Number(puntaje),
          comentario,
          actualizadoEn: Date.now(),
        });
      } else {
        setPeliculas((prev) =>
          prev.map((p) =>
            p.id === pelicula.id
              ? { ...p, estado: 'vista', puntaje: Number(puntaje), comentario, actualizadoEn: Date.now() }
              : p
          )
        );
      }

      const promovida = await promoverSiguienteDelCajon();
      if (promovida) {
        mostrarMensaje(
          `¡Sumaste +1 a tu objetivo! "${promovida}" subió automáticamente del Cajón de Espera a tu Mesa de Luz.`
        );
      } else {
        mostrarMensaje(`¡Felicitaciones! "${pelicula.titulo}" sumó +1 a tu objetivo.`);
      }
    } catch (error) {
      console.error('Error al actualizar película:', error);
      mostrarMensaje('No se pudo actualizar el estado.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  // CRUD 3: Marcar como Abandonada
  const abandonarPelicula = async (pelicula, motivo) => {
    setProcesando(true);
    try {
      if (firebaseListo && db) {
        await updateDoc(doc(db, 'peliculas', pelicula.id), {
          estado: 'abandonada',
          comentario: motivo,
          actualizadoEn: Date.now(),
        });
      } else {
        setPeliculas((prev) =>
          prev.map((p) =>
            p.id === pelicula.id
              ? { ...p, estado: 'abandonada', comentario: motivo, actualizadoEn: Date.now() }
              : p
          )
        );
      }

      const promovida = await promoverSiguienteDelCajon();
      if (promovida) {
        mostrarMensaje(`Descartaste "${pelicula.titulo}". Se reemplazó por "${promovida}".`);
      } else {
        mostrarMensaje(`Descartaste "${pelicula.titulo}". Liberaste un espacio en tu Mesa de Luz.`);
      }
    } catch (error) {
      console.error('Error al abandonar película:', error);
      mostrarMensaje('No se pudo modificar el registro.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  // CRUD 4: Eliminar Película
  const eliminarPelicula = async (idDocumento) => {
    setProcesando(true);
    try {
      if (firebaseListo && db) {
        await deleteDoc(doc(db, 'peliculas', idDocumento));
      } else {
        setPeliculas((prev) => prev.filter((p) => p.id !== idDocumento));
      }
      mostrarMensaje('Registro eliminado correctamente.');
    } catch (error) {
      console.error('Error al eliminar:', error);
      mostrarMensaje('Error al intentar eliminar el documento.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const guardarObjetivo = async (nuevoObjetivo) => {
    if (!usuario) return;
    setProcesando(true);
    try {
      if (firebaseListo && db) {
        await setDoc(doc(db, 'objetivos', usuario.uid), {
          uid: usuario.uid,
          cantidadMeta: nuevoObjetivo.cantidadMeta,
          plazoMeses: nuevoObjetivo.plazoMeses,
          actualizadoEn: Date.now(),
        });
      } else {
        setObjetivoActivo(nuevoObjetivo);
      }
      mostrarMensaje(
        `Objetivo actualizado: ${nuevoObjetivo.cantidadMeta} películas en ${nuevoObjetivo.plazoMeses} ${
          nuevoObjetivo.plazoMeses === 1 ? 'mes' : 'meses'
        }.`
      );
    } catch (error) {
      console.error('Error al guardar objetivo:', error);
      mostrarMensaje('No se pudo guardar el objetivo.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const guardarPerfilConfig = async (nuevaConfig) => {
    if (!usuario) return;
    setProcesando(true);
    try {
      if (firebaseListo && db) {
        await setDoc(doc(db, 'perfiles', usuario.uid), {
          uid: usuario.uid,
          ...nuevaConfig,
          actualizadoEn: Date.now(),
        });
      } else {
        setPerfilConfig((prev) => ({ ...prev, ...nuevaConfig }));
      }
      mostrarMensaje('Preferencias de perfil actualizadas.');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      mostrarMensaje('No se pudo guardar la configuración.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const cerrarSesionUsuario = async () => {
    try {
      if (firebaseListo && auth) {
        await signOut(auth);
      } else {
        setPeliculas([]);
      }
      mostrarMensaje('Sesión reiniciada.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (cargandoAuth) {
    return (
      <div className="fullscreen-loader">
        <h1 className="brand-logo">PELICULO :V</h1>
        <p>Iniciando aplicación...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        abrirModalMenu={(tipo) => setModalMenu(tipo)}
        cerrarSesionUsuario={cerrarSesionUsuario}
        cantidadCajon={cajonDeEspera.length}
      />

      {notificacion && (
        <div className={`toast-banner ${notificacion.tipo === 'error' ? 'toast-error' : 'toast-success'}`}>
          <span>{notificacion.texto}</span>
        </div>
      )}

      <main className="main-content">
        {vistaActual === 'home' && (
          <HomeView
            mesaDeLuz={mesaDeLuz}
            cantidadCajon={cajonDeEspera.length}
            objetivoActivo={objetivoActivo}
            peliculasVistasEnObjetivo={peliculasVistas.length}
            nivelInfo={nivelInfo}
            onCompletarPelicula={completarPelicula}
            onAbandonarPelicula={abandonarPelicula}
            onGuardarObjetivo={guardarObjetivo}
            irADescubrir={() => setVistaActual('descubrir')}
            procesando={procesando}
          />
        )}

        {vistaActual === 'descubrir' && (
          <DiscoverView
            peliculasUsuario={peliculas}
            onAgregarPelicula={agregarPelicula}
            generoPreferido={perfilConfig.generoPreferido}
            procesando={procesando}
          />
        )}

        {vistaActual === 'perfil' && (
          <ProfileView
            nombreUsuario={nombreUsuarioVisible}
            nivelInfo={nivelInfo}
            mesaDeLuz={mesaDeLuz}
            objetivoActivo={objetivoActivo}
            peliculasVistasEnObjetivo={peliculasVistas.length}
            historialPeliculas={historialPeliculas}
            onEliminarPelicula={eliminarPelicula}
            procesando={procesando}
          />
        )}
      </main>

      <MenuModals
        modalActivo={modalMenu}
        cerrarModal={() => setModalMenu(null)}
        nombreUsuario={nombreUsuarioVisible}
        generoPreferido={perfilConfig.generoPreferido}
        vistasExtraSimuladas={perfilConfig.vistasExtraSimuladas}
        onGuardarPerfilConfig={guardarPerfilConfig}
        mesaDeLuz={mesaDeLuz}
      />
    </div>
  );
}

export default App;