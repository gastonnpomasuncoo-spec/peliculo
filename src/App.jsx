import { useState, useEffect } from 'react';
import {
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
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
import { auth, db } from './firebase/config';
import { obtenerNivelUsuario } from './utils/niveles';
import { obtenerDetalleCompletoPelicula } from './services/tmdb';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import DiscoverView from './components/DiscoverView';
import ProfileView from './components/ProfileView';
import MenuModals from './components/MenuModals';
import './App.css';

const OBJETIVO_ANUAL_INICIAL = {
  id: 'anual_default',
  titulo: 'Objetivo Anual Inicial',
  cantidadMeta: 50,
  plazoMeses: 12,
  esInicial: true,
};

function App() {
  const [usuario, setUsuario] = useState(null);
  const [esUsuarioRegistrado, setEsUsuarioRegistrado] = useState(false);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [vistaActual, setVistaActual] = useState('home');
  const [modalMenu, setModalMenu] = useState(null);

  // Modal de Bienvenida (Iniciar sesión / Registrarse)
  const [modalBienvenidaAbierto, setModalBienvenidaAbierto] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');

  // Modal de Ficha Técnica al tocar una película
  const [peliculaDetalle, setPeliculaDetalle] = useState(null);

  const [peliculas, setPeliculas] = useState([]);
  const [objetivosPersonalizados, setObjetivosPersonalizados] = useState([]);
  const [objetivoAnualConfig, setObjetivoAnualConfig] = useState(OBJETIVO_ANUAL_INICIAL);
  const [avisosObjetivosVencidos, setAvisosObjetivosVencidos] = useState([]);

  const [perfilConfig, setPerfilConfig] = useState({
    apodo: '',
    fotoPerfil: '',
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

  // 1. Autenticación en Firebase + Modal de Bienvenida para invitados
  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, async (userActual) => {
      if (userActual) {
        setUsuario(userActual);
        const registrado = !userActual.isAnonymous || Boolean(localStorage.getItem('peliculo_registrado'));
        setEsUsuarioRegistrado(registrado);
        if (!registrado) {
          setModalBienvenidaAbierto(true);
        }
        setCargandoAuth(false);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error('Error en Auth:', err);
          setCargandoAuth(false);
        }
      }
    });
    return () => desuscribir();
  }, []);

  // 2. Escucha en tiempo real de Películas, Objetivos y Perfil en Cloud Firestore
  useEffect(() => {
    if (!usuario) return;

    const qPeliculas = query(collection(db, 'peliculas'), where('uid', '==', usuario.uid));
    const unsubPeliculas = onSnapshot(qPeliculas, (snapshot) => {
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      lista.sort((a, b) => (a.creadoEn || 0) - (b.creadoEn || 0));
      setPeliculas(lista);
    });

    // Objetivo Anual Inicial (editable) guardado en colección 'objetivos'
    const refObjAnual = doc(db, 'objetivos', usuario.uid);
    const unsubObjAnual = onSnapshot(refObjAnual, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setObjetivoAnualConfig({
          ...OBJETIVO_ANUAL_INICIAL,
          cantidadMeta: data.cantidadMeta || 50,
          plazoMeses: data.plazoMeses || 12,
          fechaFin: data.fechaFin || null,
        });
      }
    });

    // Objetivos adicionales sumados por el usuario en 'objetivos_usuario'
    const qObjetivosExtra = query(
      collection(db, 'objetivos_usuario'),
      where('uid', '==', usuario.uid)
    );
    const unsubObjetivosExtra = onSnapshot(
      qObjetivosExtra,
      (snapshot) => {
        const listaObj = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        listaObj.sort((a, b) => (a.creadoEn || 0) - (b.creadoEn || 0));
        setObjetivosPersonalizados(listaObj);
      },
      () => {
        // Si las reglas de Firestore aún no tienen objetivos_usuario, mantiene estado en memoria
      }
    );

    const refPerfil = doc(db, 'perfiles', usuario.uid);
    const unsubPerfil = onSnapshot(refPerfil, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPerfilConfig((prev) => ({ ...prev, ...data }));
        if (data.cuentaRegistrada) {
          setEsUsuarioRegistrado(true);
        }
      }
    });

    return () => {
      unsubPeliculas();
      unsubObjAnual();
      unsubObjetivosExtra();
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
    (usuario?.email ? usuario.email.split('@')[0] : usuario ? `user${usuario.uid.slice(0, 7).toLowerCase()}` : 'user30924820');

  // Lista unificada de objetivos activos: el Anual Inicial + todos los sumados
  const objetivosActivos = [
    ...(objetivoAnualConfig.vencido ? [] : [objetivoAnualConfig]),
    ...objetivosPersonalizados.filter((o) => !o.vencido),
  ];

  // Verificación automática de vencimiento de plazo en objetivos
  useEffect(() => {
    const ahora = Date.now();
    objetivosPersonalizados.forEach((obj) => {
      if (obj.fechaFin && ahora >= obj.fechaFin && !obj.vencido) {
        finalizarPlazoObjetivo(obj);
      }
    });
  }, [objetivosPersonalizados, totalVistasConSimulacion]);

  // Abrir pop-up con información completa de la película
  const abrirDetallePelicula = async (pelicula) => {
    setPeliculaDetalle(pelicula);
    const detalleEnriquecido = await obtenerDetalleCompletoPelicula(pelicula);
    setPeliculaDetalle(detalleEnriquecido);
  };

  // Iniciar sesión o Registrarse desde el Modal de Bienvenida
  const autenticarUsuario = async ({ tipo, email, password, apodo }) => {
    setErrorAuth('');
    try {
      if (tipo === 'registro') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        localStorage.setItem('peliculo_registrado', 'true');
        setEsUsuarioRegistrado(true);
        setModalBienvenidaAbierto(false);
        if (apodo) {
          await setDoc(doc(db, 'perfiles', cred.user.uid), {
            uid: cred.user.uid,
            apodo,
            cuentaRegistrada: true,
            actualizadoEn: Date.now(),
          });
        }
        mostrarMensaje(`¡Cuenta creada con éxito! Bienvenido/a, ${apodo || email}.`);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('peliculo_registrado', 'true');
        setEsUsuarioRegistrado(true);
        setModalBienvenidaAbierto(false);
        mostrarMensaje('¡Iniciaste sesión correctamente!');
      }
    } catch (err) {
      // Si en Firebase Console aún no habilitaron Email/Password, permite registro vinculado al UID actual
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/configuration-not-found'
      ) {
        if (usuario) {
          localStorage.setItem('peliculo_registrado', 'true');
          setEsUsuarioRegistrado(true);
          setModalBienvenidaAbierto(false);
          const nuevoApodo = apodo || email.split('@')[0];
          await guardarPerfilConfig({
            ...perfilConfig,
            apodo: nuevoApodo,
            cuentaRegistrada: true,
          });
          mostrarMensaje(`¡Bienvenido/a ${nuevoApodo}! Ya podés guardar tus películas.`);
          return;
        }
      }
      setErrorAuth('Verificá tu correo y contraseña (mínimo 6 caracteres).');
    }
  };

  // CRUD 1: Agregar Película (Si omitió el login, vuelve a saltar el modal de bienvenida)
  const agregarPelicula = async (datosPelicula) => {
    if (!esUsuarioRegistrado) {
      setModalBienvenidaAbierto(true);
      return;
    }
    if (!usuario) return;

    setProcesando(true);
    try {
      const estadoInicial = mesaDeLuz.length < 3 ? 'mesa_de_luz' : 'en_espera';
      await addDoc(collection(db, 'peliculas'), {
        uid: usuario.uid,
        tmdbId: datosPelicula.tmdbId || Date.now(),
        titulo: datosPelicula.titulo,
        anio: datosPelicula.anio || '2024',
        duracion: datosPelicula.duracion || 125,
        genero: datosPelicula.genero || 'General',
        director: datosPelicula.director || 'Director destacado',
        cast: datosPelicula.cast || 'Reparto principal',
        sinopsis: datosPelicula.sinopsis || '',
        poster: datosPelicula.poster,
        estado: estadoInicial,
        puntaje: 0,
        comentario: '',
        creadoEn: Date.now(),
        actualizadoEn: Date.now(),
      });

      if (estadoInicial === 'mesa_de_luz') {
        mostrarMensaje(
          `"${datosPelicula.titulo}" se sumó a tu Mesa de Luz (${mesaDeLuz.length + 1}/3).`
        );
      } else {
        mostrarMensaje(
          `Mesa de Luz completa (3/3). "${datosPelicula.titulo}" se guardó en tu Cajón Oculto.`
        );
      }
    } catch (error) {
      console.error('Error al guardar película:', error);
      mostrarMensaje('Error al guardar la película en Firebase.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const promoverSiguienteDelCajon = async () => {
    if (cajonDeEspera.length > 0) {
      const siguiente = cajonDeEspera[0];
      await updateDoc(doc(db, 'peliculas', siguiente.id), {
        estado: 'mesa_de_luz',
        actualizadoEn: Date.now(),
      });
      return siguiente.titulo;
    }
    return null;
  };

  // CRUD 2: Marcar como Vista
  const completarPelicula = async (pelicula, puntaje, comentario) => {
    setProcesando(true);
    try {
      await updateDoc(doc(db, 'peliculas', pelicula.id), {
        estado: 'vista',
        puntaje: Number(puntaje),
        comentario,
        actualizadoEn: Date.now(),
      });

      const promovida = await promoverSiguienteDelCajon();
      if (promovida) {
        mostrarMensaje(
          `¡Sumaste +1 a tus objetivos! "${promovida}" se desbloqueó del Cajón Oculto a tu Mesa de Luz.`
        );
      } else {
        mostrarMensaje(`¡Felicitaciones! "${pelicula.titulo}" sumó +1 a tus objetivos.`);
      }
    } catch (error) {
      console.error('Error al actualizar película:', error);
      mostrarMensaje('No se pudo actualizar el estado en Firebase.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  // CRUD 3: Marcar como Abandonada
  const abandonarPelicula = async (pelicula, motivo) => {
    setProcesando(true);
    try {
      await updateDoc(doc(db, 'peliculas', pelicula.id), {
        estado: 'abandonada',
        comentario: motivo,
        actualizadoEn: Date.now(),
      });

      const promovida = await promoverSiguienteDelCajon();
      if (promovida) {
        mostrarMensaje(
          `Descartaste "${pelicula.titulo}". Se desbloqueó en tu Mesa de Luz "${promovida}".`
        );
      } else {
        mostrarMensaje(`Descartaste "${pelicula.titulo}". Liberaste un espacio en tu Mesa de Luz.`);
      }
    } catch (error) {
      console.error('Error al abandonar película:', error);
      mostrarMensaje('No se pudo modificar el registro en Firebase.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  // CRUD 4: Eliminar Película del historial
  const eliminarPelicula = async (idDocumento) => {
    setProcesando(true);
    try {
      await deleteDoc(doc(db, 'peliculas', idDocumento));
      mostrarMensaje('Registro eliminado correctamente de Cloud Firestore.');
    } catch (error) {
      console.error('Error al eliminar:', error);
      mostrarMensaje('Error al intentar eliminar el documento.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  // SUMAR un nuevo objetivo sin reemplazar los anteriores
  const agregarNuevoObjetivo = async (datosObj) => {
    if (!usuario) return;
    setProcesando(true);
    const fechaInicio = Date.now();
    const fechaFin = fechaInicio + datosObj.plazoMeses * 30 * 24 * 60 * 60 * 1000;
    const nuevo = {
      uid: usuario.uid,
      titulo: datosObj.titulo,
      cantidadMeta: datosObj.cantidadMeta,
      plazoMeses: datosObj.plazoMeses,
      fechaInicio,
      fechaFin,
      creadoEn: Date.now(),
    };

    try {
      await addDoc(collection(db, 'objetivos_usuario'), nuevo);
      mostrarMensaje(`Se sumó "${datosObj.titulo}" (${datosObj.cantidadMeta} películas) a tus objetivos.`);
    } catch {
      // Respaldo local inmediato si aún no publicaron la regla objetivos_usuario
      setObjetivosPersonalizados((prev) => [...prev, { id: String(Date.now()), ...nuevo }]);
      mostrarMensaje(`Se sumó "${datosObj.titulo}" a tus objetivos activos.`);
    } finally {
      setProcesando(false);
    }
  };

  // EDITAR un objetivo existente (incluido el Anual Inicial de 50 películas)
  const editarObjetivoExistente = async (idObj, cambios) => {
    if (!usuario) return;
    setProcesando(true);
    try {
      if (idObj === 'anual_default') {
        await setDoc(doc(db, 'objetivos', usuario.uid), {
          uid: usuario.uid,
          cantidadMeta: cambios.cantidadMeta,
          plazoMeses: cambios.plazoMeses,
          actualizadoEn: Date.now(),
        });
      } else {
        try {
          await updateDoc(doc(db, 'objetivos_usuario', idObj), {
            cantidadMeta: cambios.cantidadMeta,
            plazoMeses: cambios.plazoMeses,
            actualizadoEn: Date.now(),
          });
        } catch {
          setObjetivosPersonalizados((prev) =>
            prev.map((o) => (o.id === idObj ? { ...o, ...cambios } : o))
          );
        }
      }
      mostrarMensaje('Objetivo actualizado correctamente.');
    } finally {
      setProcesando(false);
    }
  };

  // Cuando termina el plazo de un objetivo: desaparece de activos y muestra aviso según si se cumplió o no
  const finalizarPlazoObjetivo = async (obj) => {
    const cumplido = totalVistasConSimulacion >= obj.cantidadMeta;
    setAvisosObjetivosVencidos((prev) => [
      {
        id: `${obj.id}_${Date.now()}`,
        titulo: obj.titulo,
        cantidadMeta: obj.cantidadMeta,
        cumplido,
      },
      ...prev,
    ]);

    if (obj.id === 'anual_default') {
      setObjetivoAnualConfig((prev) => ({ ...prev, vencido: true }));
    } else {
      try {
        await deleteDoc(doc(db, 'objetivos_usuario', obj.id));
      } catch {
        setObjetivosPersonalizados((prev) => prev.filter((o) => o.id !== obj.id));
      }
    }
  };

  // Guardar Configuración / Foto / Simulador de Perfil
  const guardarPerfilConfig = async (nuevaConfig) => {
    if (!usuario) return;
    setProcesando(true);
    try {
      await setDoc(doc(db, 'perfiles', usuario.uid), {
        uid: usuario.uid,
        ...nuevaConfig,
        actualizadoEn: Date.now(),
      });
      setPerfilConfig((prev) => ({ ...prev, ...nuevaConfig }));
      mostrarMensaje('Configuración de perfil guardada en Firebase.');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      setPerfilConfig((prev) => ({ ...prev, ...nuevaConfig }));
      mostrarMensaje('Configuración aplicada.');
    } finally {
      setProcesando(false);
    }
  };

  const cerrarSesionUsuario = async () => {
    try {
      localStorage.removeItem('peliculo_registrado');
      setEsUsuarioRegistrado(false);
      await signOut(auth);
      mostrarMensaje('Cerraste sesión correctamente.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (cargandoAuth) {
    return (
      <div className="fullscreen-loader">
        <h1 className="brand-logo">PELICULO :V</h1>
        <p>Conectando con Firebase...</p>
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
        esUsuarioRegistrado={esUsuarioRegistrado}
        abrirModalBienvenida={() => setModalBienvenidaAbierto(true)}
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
            objetivosActivos={objetivosActivos}
            avisosObjetivosVencidos={avisosObjetivosVencidos}
            onDescartarAvisoVencido={(idAviso) =>
              setAvisosObjetivosVencidos((prev) => prev.filter((a) => a.id !== idAviso))
            }
            peliculasVistasCount={totalVistasConSimulacion}
            onCompletarPelicula={completarPelicula}
            onAbandonarPelicula={abandonarPelicula}
            onAgregarObjetivo={agregarNuevoObjetivo}
            onEditarObjetivo={editarObjetivoExistente}
            onSimularFinPlazoObjetivo={finalizarPlazoObjetivo}
            onSeleccionarPelicula={abrirDetallePelicula}
            irADescubrir={() => setVistaActual('descubrir')}
            procesando={procesando}
          />
        )}

        {vistaActual === 'descubrir' && (
          <DiscoverView
            peliculasUsuario={peliculas}
            onAgregarPelicula={agregarPelicula}
            onSeleccionarPelicula={abrirDetallePelicula}
            generoPreferido={perfilConfig.generoPreferido}
            procesando={procesando}
          />
        )}

        {vistaActual === 'perfil' && (
          <ProfileView
            nombreUsuario={nombreUsuarioVisible}
            fotoPerfil={perfilConfig.fotoPerfil}
            nivelInfo={nivelInfo}
            mesaDeLuz={mesaDeLuz}
            historialPeliculas={historialPeliculas}
            onEliminarPelicula={eliminarPelicula}
            onAbrirConfiguracionFoto={() => setModalMenu('configuracion')}
            onSeleccionarPelicula={abrirDetallePelicula}
            procesando={procesando}
          />
        )}
      </main>

      <MenuModals
        modalActivo={modalMenu}
        cerrarModal={() => setModalMenu(null)}
        nombreUsuario={nombreUsuarioVisible}
        fotoPerfil={perfilConfig.fotoPerfil}
        generoPreferido={perfilConfig.generoPreferido}
        vistasExtraSimuladas={perfilConfig.vistasExtraSimuladas}
        onGuardarPerfilConfig={guardarPerfilConfig}
        mesaDeLuz={mesaDeLuz}
        peliculaDetalle={peliculaDetalle}
        cerrarDetallePelicula={() => setPeliculaDetalle(null)}
        onAgregarDesdeDetalle={agregarPelicula}
        yaGuardadaEnDetalle={
          peliculaDetalle
            ? peliculas.some(
                (p) =>
                  (p.estado === 'mesa_de_luz' || p.estado === 'en_espera') &&
                  p.titulo.toLowerCase() === peliculaDetalle.titulo.toLowerCase()
              )
            : false
        }
        modalBienvenidaAbierto={modalBienvenidaAbierto}
        cerrarModalBienvenida={() => setModalBienvenidaAbierto(false)}
        onAutenticarUsuario={autenticarUsuario}
        errorAuth={errorAuth}
      />
    </div>
  );
}

export default App;