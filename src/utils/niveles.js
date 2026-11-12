export const NIVELES = [
  {
    nivel: 1,
    nombre: 'Pichi',
    min: 0,
    max: 49,
    colorMarco: '#374151',
    sombraMarco: 'rgba(17, 24, 39, 0.9)',
    nombreColor: 'Gris',
  },
  {
    nivel: 2,
    nombre: 'Medio pichi',
    min: 50,
    max: 99,
    colorMarco: '#EAB308',
    sombraMarco: 'rgba(234, 179, 8, 0.55)',
    nombreColor: 'Amarillo',
  },
  {
    nivel: 3,
    nombre: 'Capo',
    min: 100,
    max: 299,
    colorMarco: '#3B82F6',
    sombraMarco: 'rgba(59, 130, 246, 0.6)',
    nombreColor: 'Azul',
  },
  {
    nivel: 4,
    nombre: 'Tipazo',
    min: 300,
    max: 999,
    colorMarco: '#E2E8F0',
    sombraMarco: 'rgba(226, 232, 240, 0.85)',
    nombreColor: 'Plateado',
  },
  {
    nivel: 5,
    nombre: 'The King',
    min: 1000,
    max: Infinity,
    colorMarco: '#FFD700',
    sombraMarco: 'rgba(255, 215, 0, 0.85)',
    nombreColor: 'Dorado',
  },
];

export function obtenerNivelUsuario(cantidadVistas) {
  const total = Math.max(0, Number(cantidadVistas) || 0);

  for (let i = 0; i < NIVELES.length; i++) {
    const actual = NIVELES[i];
    if (total >= actual.min && total <= actual.max) {
      const siguienteNivel = NIVELES[i + 1] || null;
      const faltanParaSubir = siguienteNivel ? siguienteNivel.min - total : 0;
      const totalTramo = siguienteNivel ? siguienteNivel.min - actual.min : 1;
      const avanceEnTramo = total - actual.min;
      const porcentajeNivelActual = siguienteNivel
        ? Math.min(100, Math.round((avanceEnTramo / totalTramo) * 100))
        : 100;

      return {
        ...actual,
        totalVistas: total,
        siguienteNombre: siguienteNivel ? siguienteNivel.nombre : null,
        siguienteMeta: siguienteNivel ? siguienteNivel.min : total,
        faltanParaSubir,
        porcentajeNivelActual,
        esNivelMaximo: actual.nivel === 5,
      };
    }
  }

  return {
    ...NIVELES[0],
    totalVistas: 0,
    siguienteNombre: 'Medio pichi',
    siguienteMeta: 50,
    faltanParaSubir: 50,
    porcentajeNivelActual: 0,
    esNivelMaximo: false,
  };
}

// Calcula el progreso visual por tramos para que se evidencien los espacios entre los 5 niveles
export function calcularPorcentajeEscalaTramos(cantidadVistas) {
  const v = Math.max(0, Number(cantidadVistas) || 0);
  const metas = [0, 50, 100, 300, 1000];
  if (v >= 1000) return 100;

  for (let i = 0; i < metas.length - 1; i++) {
    const inicio = metas[i];
    const fin = metas[i + 1];
    if (v >= inicio && v < fin) {
      const fraccionTramo = (v - inicio) / (fin - inicio);
      return Math.min(100, Math.round((i * 25) + (fraccionTramo * 25)));
    }
  }
  return 0;
}