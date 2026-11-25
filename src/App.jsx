import { useState, useEffect, useRef } from 'react';
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
import { auth, db, firebaseListo } from './firebase/config';
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

  const [modalBienvenidaAbierto, setModalBienvenidaAbierto] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');
  const [peliculaDetalle, setPeliculaDetalle] = useState(null);

  // Modal compartido entre Home y Perfil para marcar Vista o Desechar
  const [modalAccion, setModalAccion] = useState(null);

  const [peliculas, setPeliculas] = useState([]);
  const [objetivosPersonalizados, setObjetivosPersonalizados] = useState([]);
  const [objetivoAnualConfig, setObjetivoAnualConfig] = useState(OBJETIVO_ANUAL_INICIAL);
  const [avisosObjetivosVencidos, setAvisosObjetivosVencidos] = useState([]);

  const [perfilConfig, setPerfilConfig] = useState({
    apodo: '',
    fotoPerfil: '',
    generoPreferido: 'Ciencia Ficción',
    creadoEn: null,
  });

  const [procesando, setProcesando] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  const mostrarMensaje = (texto, tipo = 'exito') => {
    if (tipo !== 'error') return;
    setNotificacion({ texto, tipo });
    setTimeout(() => {
      setNotificacion(null);
    }, 4000);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [vistaActual]);

  // 1. Autenticación en Firebase
  useEffect(() => {
    if (!firebaseListo || !auth) {
      setUsuario({ uid: '30924820demo' });
      const regLocal = Boolean(localStorage.getItem('peliculo_registrado'));
      setEsUsuarioRegistrado(regLocal);
      if (!regLocal) {
        setModalBienvenidaAbierto(true);
      }
      setCargandoAuth(false);
      return;
    }

    const desuscribir = onAuthStateChanged(auth, async (userActual) => {
      if (userActual) {
        setUsuario(userActual);
        const registrado =
          !userActual.isAnonymous || Boolean(localStorage.getItem('peliculo_registrado'));
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
          setUsuario({ uid: '30924820demo' });
          setCargandoAuth(false);
        }
      }
    });
    return () => desuscribir();
  }, []);

  // 2. Escucha en tiempo real de Cloud Firestore
  useEffect(() => {
    if (!usuario || !firebaseListo || !db) return;

    const qPeliculas = query(collection(db, 'peliculas'), where('uid', '==', usuario.uid));
    const unsubPeliculas = onSnapshot(qPeliculas, (snapshot) => {
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      lista.sort((a, b) => (a.creadoEn || 0) - (b.creadoEn || 0));
      setPeliculas(lista);
    });

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
      () => {}
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

  // Todas las películas pendientes (ordenadas de más vieja a más nueva) para filtrar por Mood
  const peliculasPendientes = peliculas.filter(
    (p) => p.estado === 'mesa_de_luz' || p.estado === 'en_espera'
  );
  const idsKeywordsConsultadosRef = useRef(new Set());

  useEffect(() => {
    const pendientesSinKeywords = peliculasPendientes.filter(
      (p) =>
        p.tmdbId &&
        !Array.isArray(p.keywords) &&
        !idsKeywordsConsultadosRef.current.has(p.id)
    );

    if (pendientesSinKeywords.length === 0) return;

    pendientesSinKeywords.forEach(async (peli) => {
      idsKeywordsConsultadosRef.current.add(peli.id);
      const keywords = await obtenerKeywordsTMDB(peli.tmdbId);
      if (firebaseListo && db) {
        try {
          await updateDoc(doc(db, 'peliculas', peli.id), { keywords });
        } catch {
          // Si falla la escritura, no frena la interfaz
        }
      } else {
        setPeliculas((prev) =>
          prev.map((item) => (item.id === peli.id ? { ...item, keywords } : item))
        );
      }
    });
  }, [peliculasPendientes]);
  const mesaDeLuz = peliculas.filter((p) => p.estado === 'mesa_de_luz').slice(0, 3);
  const cajonDeEspera = peliculas.filter((p) => p.estado === 'en_espera');
  const peliculasVistas = peliculas.filter((p) => p.estado === 'vista');
  const historialPeliculas = peliculas
    .filter((p) => p.estado === 'vista' || p.estado === 'abandonada')
    .sort((a, b) => (b.actualizadoEn || 0) - (a.actualizadoEn || 0));

  const nivelInfo = obtenerNivelUsuario(peliculasVistas.length);

  // Cálculo de DÍAS registrado y HORAS VISTAS en formato "12 hr 57 min"
  const fechaCreacionAuth = usuario?.metadata?.creationTime
    ? new Date(usuario.metadata.creationTime).getTime()
    : null;
  const fechaMasAntiguaPeli =
    peliculas.length > 0 ? Math.min(...peliculas.map((p) => p.creadoEn || Date.now())) : null;
  const timestampRegistro =
    perfilConfig.creadoEn || fechaCreacionAuth || fechaMasAntiguaPeli || Date.now();
  const diasRegistrado = Math.max(
    1,
    Math.ceil((Date.now() - timestampRegistro) / (1000 * 60 * 60 * 24))
  );

  const totalMinutosVistos = peliculasVistas.reduce(
    (acc, p) => acc + (Number(p.duracion) || 124),
    0
  );
  const horasEnteras = Math.floor(totalMinutosVistos / 60);
  const minutosRestantes = totalMinutosVistos % 60;
  const horasVistas = `${horasEnteras} hr ${minutosRestantes} min`;

  const nombreUsuarioVisible =
    perfilConfig.apodo ||
    (usuario?.email
      ? usuario.email.split('@')[0]
      : usuario
      ? `user${usuario.uid.slice(0, 7).toLowerCase()}`
      : 'user30924820');

  const objetivosActivos = [
    ...(objetivoAnualConfig.vencido ? [] : [objetivoAnualConfig]),
    ...objetivosPersonalizados.filter((o) => !o.vencido),
  ];

  useEffect(() => {
    const ahora = Date.now();
    objetivosPersonalizados.forEach((obj) => {
      if (obj.fechaFin && ahora >= obj.fechaFin && !obj.vencido) {
        finalizarPlazoObjetivo(obj);
      }
    });
  }, [objetivosPersonalizados, peliculasVistas.length]);

  const abrirDetallePelicula = async (pelicula) => {
    setPeliculaDetalle(pelicula);
    const detalleEnriquecido = await obtenerDetalleCompletoPelicula(pelicula);
    setPeliculaDetalle(detalleEnriquecido);
  };

  const autenticarUsuario = async ({ tipo, email, password, apodo }) => {
    setErrorAuth('');
    if (!firebaseListo || !auth) {
      localStorage.setItem('peliculo_registrado', 'true');
      setEsUsuarioRegistrado(true);
      setModalBienvenidaAbierto(false);
      const nuevoApodo = apodo || email.split('@')[0];
      setPerfilConfig((prev) => ({
        ...prev,
        apodo: nuevoApodo,
        creadoEn: prev.creadoEn || Date.now(),
      }));
      return;
    }

    try {
      if (tipo === 'registro') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        localStorage.setItem('peliculo_registrado', 'true');
        setEsUsuarioRegistrado(true);
        setModalBienvenidaAbierto(false);
        if (db) {
          await setDoc(doc(db, 'perfiles', cred.user.uid), {
            uid: cred.user.uid,
            apodo: apodo || email.split('@')[0],
            cuentaRegistrada: true,
            creadoEn: Date.now(),
            actualizadoEn: Date.now(),
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('peliculo_registrado', 'true');
        setEsUsuarioRegistrado(true);
        setModalBienvenidaAbierto(false);
      }
    } catch (err) {
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/configuration-not-found'
      ) {
        localStorage.setItem('peliculo_registrado', 'true');
        setEsUsuarioRegistrado(true);
        setModalBienvenidaAbierto(false);
        const nuevoApodo = apodo || email.split('@')[0];
        await guardarPerfilConfig({
          ...perfilConfig,
          apodo: nuevoApodo,
          cuentaRegistrada: true,
          creadoEn: perfilConfig.creadoEn || Date.now(),
        });
        return;
      }
      setErrorAuth('Verificá tu correo y contraseña (mínimo 6 caracteres).');
    }
  };

  // CRUD 1: Guardar película por tmdbId único
  const agregarPelicula = async (datosPelicula) => {
    if (!esUsuarioRegistrado) {
      setModalBienvenidaAbierto(true);
      return;
    }
    if (!usuario) return;

    const yaExiste = peliculas.some(
      (p) =>
        (p.estado === 'mesa_de_luz' || p.estado === 'en_espera') &&
        Number(p.tmdbId) === Number(datosPelicula.tmdbId)
    );
    if (yaExiste) return;

    setProcesando(true);
    try {
      const fichaCompleta = await obtenerDetalleCompletoPelicula(datosPelicula);
      const estadoInicial = mesaDeLuz.length < 3 ? 'mesa_de_luz' : 'en_espera';
const nuevoDoc = {
        uid: usuario.uid,
        tmdbId: Number(fichaCompleta.tmdbId || datosPelicula.tmdbId || Date.now()),
        titulo: fichaCompleta.titulo,
        anio: fichaCompleta.anio || '2024',
        duracion: Number(fichaCompleta.duracion) || 124,
        genero: fichaCompleta.genero || 'General',
        director: fichaCompleta.director || 'Director destacado',
        cast: fichaCompleta.cast || 'Reparto principal',
        sinopsis: fichaCompleta.sinopsis || '',
        keywords: Array.isArray(fichaCompleta.keywords) ? fichaCompleta.keywords : [],
        poster: fichaCompleta.poster,
        estado: estadoInicial,
        puntaje: 0,
        comentario: '',
        creadoEn: Date.now(),
        actualizadoEn: Date.now(),
      };

      if (firebaseListo && db) {
        await addDoc(collection(db, 'peliculas'), nuevoDoc);
      } else {
        setPeliculas((prev) => [...prev, { id: String(Date.now()), ...nuevoDoc }]);
      }
    } catch (error) {
      console.error('Error al guardar película:', error);
      mostrarMensaje('Error al guardar la película.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  // Promueve la siguiente película en espera solo si la película liberada ocupaba un lugar de mesa_de_luz
  const promoverSiguienteDelCajon = async (peliculaLiberada) => {
    if (peliculaLiberada.estado !== 'mesa_de_luz') return null;

    const siguiente = cajonDeEspera.find((p) => p.id !== peliculaLiberada.id);
    if (siguiente) {
      if (firebaseListo && db) {
        await updateDoc(doc(db, 'peliculas', siguiente.id), {
          estado: 'mesa_de_luz',
          actualizadoEn: Date.now(),
        });
      } else {
        setPeliculas((prev) =>
          prev.map((p) =>
            p.id === siguiente.id
              ? { ...p, estado: 'mesa_de_luz', actualizadoEn: Date.now() }
              : p
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
              ? {
                  ...p,
                  estado: 'vista',
                  puntaje: Number(puntaje),
                  comentario,
                  actualizadoEn: Date.now(),
                }
              : p
          )
        );
      }
      await promoverSiguienteDelCajon(pelicula);
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
      await promoverSiguienteDelCajon(pelicula);
    } catch (error) {
      console.error('Error al abandonar película:', error);
      mostrarMensaje('No se pudo modificar el registro.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  // CRUD 4: Eliminar Película del Historial
  const eliminarPelicula = async (idDocumento) => {
    setProcesando(true);
    try {
      if (firebaseListo && db) {
        await deleteDoc(doc(db, 'peliculas', idDocumento));
      } else {
        setPeliculas((prev) => prev.filter((p) => p.id !== idDocumento));
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      mostrarMensaje('Error al intentar eliminar el documento.', 'error');
    } finally {
      setProcesando(false);
    }
  };

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
      if (firebaseListo && db) {
        await addDoc(collection(db, 'objetivos_usuario'), nuevo);
      } else {
        setObjetivosPersonalizados((prev) => [...prev, { id: String(Date.now()), ...nuevo }]);
      }
    } catch {
      setObjetivosPersonalizados((prev) => [...prev, { id: String(Date.now()), ...nuevo }]);
    } finally {
      setProcesando(false);
    }
  };

  const editarObjetivoExistente = async (idObj, cambios) => {
    if (!usuario) return;
    setProcesando(true);
    try {
      if (idObj === 'anual_default') {
        if (firebaseListo && db) {
          await setDoc(doc(db, 'objetivos', usuario.uid), {
            uid: usuario.uid,
            cantidadMeta: cambios.cantidadMeta,
            plazoMeses: cambios.plazoMeses,
            actualizadoEn: Date.now(),
          });
        } else {
          setObjetivoAnualConfig((prev) => ({ ...prev, ...cambios }));
        }
      } else {
        if (firebaseListo && db) {
          await updateDoc(doc(db, 'objetivos_usuario', idObj), {
            cantidadMeta: cambios.cantidadMeta,
            plazoMeses: cambios.plazoMeses,
            actualizadoEn: Date.now(),
          });
        } else {
          setObjetivosPersonalizados((prev) =>
            prev.map((o) => (o.id === idObj ? { ...o, ...cambios } : o))
          );
        }
      }
    } finally {
      setProcesando(false);
    }
  };

  const finalizarPlazoObjetivo = async (obj) => {
    const cumplido = peliculasVistas.length >= obj.cantidadMeta;
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
        if (firebaseListo && db) {
          await deleteDoc(doc(db, 'objetivos_usuario', obj.id));
        } else {
          setObjetivosPersonalizados((prev) => prev.filter((o) => o.id !== obj.id));
        }
      } catch {
        setObjetivosPersonalizados((prev) => prev.filter((o) => o.id !== obj.id));
      }
    }
  };

  const guardarPerfilConfig = async (nuevaConfig) => {
    if (!usuario) return;
    setProcesando(true);
    const payload = {
      uid: usuario.uid,
      ...perfilConfig,
      ...nuevaConfig,
      creadoEn: perfilConfig.creadoEn || Date.now(),
      actualizadoEn: Date.now(),
    };
    try {
      if (firebaseListo && db) {
        await setDoc(doc(db, 'perfiles', usuario.uid), payload);
      }
      setPerfilConfig(payload);
    } catch {
      setPerfilConfig(payload);
    } finally {
      setProcesando(false);
    }
  };

  const enviarTicketSoporte = async ({ asunto, mensaje }) => {
    if (!usuario || !firebaseListo || !db) return;
    try {
      await addDoc(collection(db, 'soporte_tickets'), {
        uid: usuario.uid,
        usuario: nombreUsuarioVisible,
        asunto,
        mensaje,
        creadoEn: Date.now(),
      });
    } catch {
      // Confirma igualmente en interfaz
    }
  };

  const cerrarSesionUsuario = async () => {
    try {
      localStorage.removeItem('peliculo_registrado');
      setEsUsuarioRegistrado(false);
      if (firebaseListo && auth) {
        await signOut(auth);
      }
      setModalBienvenidaAbierto(true);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (cargandoAuth) {
    return (
      <div className="fullscreen-loader">
        <h1 className="brand-logo">PELICULO</h1>
        <p>Cargando aplicación...</p>
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
        <div
          className={`toast-banner ${
            notificacion.tipo === 'error' ? 'toast-error' : 'toast-success'
          }`}
        >
          <span>{notificacion.texto}</span>
        </div>
      )}

      <main className="main-content">
        {vistaActual === 'home' && (
          <HomeView
            pendientes={peliculasPendientes}
            objetivosActivos={objetivosActivos}
            avisosObjetivosVencidos={avisosObjetivosVencidos}
            onDescartarAvisoVencido={(idAviso) =>
              setAvisosObjetivosVencidos((prev) => prev.filter((a) => a.id !== idAviso))
            }
            peliculasVistasCount={peliculasVistas.length}
            onSolicitarCompletar={(p) => setModalAccion({ tipo: 'vista', pelicula: p })}
            onSolicitarAbandonar={(p) => setModalAccion({ tipo: 'abandonada', pelicula: p })}
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
            diasRegistrado={diasRegistrado}
            horasVistas={horasVistas}
            mesaDeLuz={mesaDeLuz}
            historialPeliculas={historialPeliculas}
            onEliminarPelicula={eliminarPelicula}
            onAbrirConfiguracionFoto={() => setModalMenu('configuracion')}
            onSeleccionarPelicula={abrirDetallePelicula}
            onSolicitarCompletar={(p) => setModalAccion({ tipo: 'vista', pelicula: p })}
            onSolicitarAbandonar={(p) => setModalAccion({ tipo: 'abandonada', pelicula: p })}
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
        onGuardarPerfilConfig={guardarPerfilConfig}
        onEnviarSoporte={enviarTicketSoporte}
        mesaDeLuz={mesaDeLuz}
        peliculaDetalle={peliculaDetalle}
        cerrarDetallePelicula={() => setPeliculaDetalle(null)}
        onAgregarDesdeDetalle={agregarPelicula}
        yaGuardadaEnDetalle={
          peliculaDetalle
            ? peliculas.some(
                (p) =>
                  (p.estado === 'mesa_de_luz' || p.estado === 'en_espera') &&
                  Number(p.tmdbId) === Number(peliculaDetalle.tmdbId)
              )
            : false
        }
        modalBienvenidaAbierto={modalBienvenidaAbierto}
        cerrarModalBienvenida={() => setModalBienvenidaAbierto(false)}
        onAutenticarUsuario={autenticarUsuario}
        errorAuth={errorAuth}
        modalAccion={modalAccion}
        cerrarModalAccion={() => setModalAccion(null)}
        onCompletarPelicula={completarPelicula}
        onAbandonarPelicula={abandonarPelicula}
        procesando={procesando}
      />
    </div>
  );
}

export default App;