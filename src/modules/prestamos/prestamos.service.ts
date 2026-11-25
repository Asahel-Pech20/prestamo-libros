import { AppError } from '../../lib/appError.js';
import { almacen, nuevoId, type Prestamo } from '../../lib/almacen.js';
import { paginar } from '../../lib/paginacion.js';
import { ahora } from '../../lib/reloj.js';
import { librosService } from '../libros/libros.service.js';
import {
  centavosATexto,
  ejemplaresDisponibles,
  estaActivo,
  estaVencido,
  fechaLimite,
  type MotivoRechazo,
  motivoParaNoPrestar,
  multaCentavos,
} from './dominio/prestamo.js';
import type { CrearPrestamo, ListarPrestamos } from './prestamos.schemas.js';

const MENSAJES: Record<MotivoRechazo, string> = {
  SIN_EJEMPLARES: 'No hay ejemplares disponibles de este libro.',
  MAXIMO_PRESTAMOS: 'El lector ya tiene 3 préstamos activos.',
  PRESTAMO_VENCIDO: 'El lector tiene un préstamo vencido; debe devolverlo antes de pedir otro.',
};

function aRespuesta(p: Prestamo, momento: Date) {
  const libro = librosService.obtener(p.libroId);
  return {
    id: p.id,
    libro: { id: libro.id, titulo: libro.titulo },
    lectorId: p.lectorId,
    prestadoEn: p.prestadoEn.toISOString(),
    fechaLimite: p.fechaLimite.toISOString(),
    devueltoEn: p.devueltoEn?.toISOString() ?? null,
    vencido: estaVencido(p, momento),
    // RN-05: dinero como string decimal; null mientras no se devuelve
    multa: p.multaCentavos === null ? null : centavosATexto(p.multaCentavos),
  };
}

function filtrar(lista: Prestamo[], estado: ListarPrestamos['estado'], momento: Date) {
  switch (estado) {
    case 'activos':
      return lista.filter(estaActivo);
    case 'vencidos':
      return lista.filter((p) => estaVencido(p, momento));
    case 'devueltos':
      return lista.filter((p) => !estaActivo(p));
    case 'todos':
      return lista;
  }
}

function listar(lista: Prestamo[], { estado, ...paginacion }: ListarPrestamos) {
  const momento = ahora();
  const ordenada = filtrar(lista, estado, momento).sort(
    (a, b) => b.prestadoEn.getTime() - a.prestadoEn.getTime(),
  );
  const pagina = paginar(ordenada, paginacion);
  return { ...pagina, data: pagina.data.map((p) => aRespuesta(p, momento)) };
}

export const prestamosService = {
  // RF-03, RN-01–RN-04
  prestar({ libroId, lectorId }: CrearPrestamo) {
    const libro = librosService.obtener(libroId); // 404 si no existe
    const lector = almacen.usuarios.find((u) => u.id === lectorId && u.rol === 'LECTOR');
    if (!lector) throw new AppError('NOT_FOUND', 'El lector no existe.');

    const momento = ahora();
    const disponibles = ejemplaresDisponibles(
      libro.ejemplares,
      almacen.prestamos.filter((p) => p.libroId === libroId),
    );
    const motivo = motivoParaNoPrestar(
      disponibles,
      almacen.prestamos.filter((p) => p.lectorId === lectorId),
      momento,
    );
    if (motivo) throw new AppError('BUSINESS_RULE', MENSAJES[motivo], { motivo });

    const prestamo: Prestamo = {
      id: nuevoId(),
      libroId,
      lectorId,
      prestadoEn: momento,
      fechaLimite: fechaLimite(momento),
      devueltoEn: null,
      multaCentavos: null,
    };
    almacen.prestamos.push(prestamo);
    return aRespuesta(prestamo, momento);
  },

  // RF-04, RN-05, RN-06
  devolver(id: string) {
    const prestamo = almacen.prestamos.find((p) => p.id === id);
    if (!prestamo) throw new AppError('NOT_FOUND', 'El préstamo no existe.');
    if (!estaActivo(prestamo)) throw new AppError('CONFLICT', 'El préstamo ya se devolvió.');
    const momento = ahora();
    prestamo.devueltoEn = momento;
    prestamo.multaCentavos = multaCentavos(prestamo.fechaLimite, momento);
    return aRespuesta(prestamo, momento);
  },

  // RF-05
  listarTodos(filtros: ListarPrestamos) {
    return listar(almacen.prestamos, filtros);
  },

  // RF-06: el lector solo ve los suyos
  listarDelLector(lectorId: string, filtros: ListarPrestamos) {
    return listar(
      almacen.prestamos.filter((p) => p.lectorId === lectorId),
      filtros,
    );
  },
};
