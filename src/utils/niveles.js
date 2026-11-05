export const NIVELES = [
  {
    nivel: 1,
    nombre: 'Pichi',
    min: 0,
    max: 49,
    colorMarco: '#9CA3AF',
    nombreColor: 'Gris',
  },
  {
    nivel: 2,
    nombre: 'Medio pichi',
    min: 50,
    max: 99,
    colorMarco: '#EAB308',
    nombreColor: 'Amarillo',
  },
  {
    nivel: 3,
    nombre: 'Capo',
    min: 100,
    max: 299,
    colorMarco: '#3B82F6',
    nombreColor: 'Azul',
  },
  {
    nivel: 4,
    nombre: 'Tipazo',
    min: 300,
    max: 999,
    colorMarco: '#E2E8F0',
    nombreColor: 'Plateado',
  },
  {
    nivel: 5,
    nombre: 'The King',
    min: 1000,
    max: Infinity,
    colorMarco: '#FFD700',
    nombreColor: 'Dorado',
  },
];

export function obtenerNivelUsuario(cantidadVistas) {
  const total = Number(cantidadVistas) || 0;
  for (let i = 0; i < NIVELES.length; i++) {
    if (total >= NIVELES[i].min && total <= NIVELES[i].max) {
      const siguienteNivel = NIVELES[i + 1] || null;
      return {
        ...NIVELES[i],
        totalVistas: total,
        siguienteMeta: siguienteNivel ? siguienteNivel.min : total,
        faltanParaSubir: siguienteNivel ? siguienteNivel.min - total : 0,
      };
    }
  }
  return { ...NIVELES[0], totalVistas: 0, siguienteMeta: 50, faltanParaSubir: 50 };
}