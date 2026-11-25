// Reglas puras de los préstamos (RN-01–RN-05). Sin almacén ni fecha implícita: «ahora» entra como parámetro.

export const DIAS_PRESTAMO = 14; // RN-01
export const MAX_PRESTAMOS_ACTIVOS = 3; // RN-03
export const MULTA_POR_DIA_CENTAVOS = 500; // RN-05: 5.00 por día
const MS_POR_DIA = 24 * 60 * 60 * 1000;

export interface PrestamoDominio {
  fechaLimite: Date;
  devueltoEn: Date | null;
}

/** RN-01: 14 días naturales desde que se presta. */
export function fechaLimite(prestadoEn: Date): Date {
  return new Date(prestadoEn.getTime() + DIAS_PRESTAMO * MS_POR_DIA);
}

export const estaActivo = (p: PrestamoDominio) => p.devueltoEn === null;

/** Activo y con la fecha límite ya pasada. */
export const estaVencido = (p: PrestamoDominio, ahora: Date) =>
  estaActivo(p) && ahora.getTime() > p.fechaLimite.getTime();

/** RN-02: ejemplares del libro menos sus préstamos activos (nunca negativo). */
export function ejemplaresDisponibles(ejemplares: number, prestamosDelLibro: PrestamoDominio[]) {
  return Math.max(0, ejemplares - prestamosDelLibro.filter(estaActivo).length);
}

export type MotivoRechazo = 'SIN_EJEMPLARES' | 'MAXIMO_PRESTAMOS' | 'PRESTAMO_VENCIDO';

/** RN-02–RN-04: por qué no se puede prestar, o null si sí se puede. El vencido se revisa primero. */
export function motivoParaNoPrestar(
  disponibles: number,
  prestamosDelLector: PrestamoDominio[],
  ahora: Date,
): MotivoRechazo | null {
  if (prestamosDelLector.some((p) => estaVencido(p, ahora))) return 'PRESTAMO_VENCIDO';
  if (prestamosDelLector.filter(estaActivo).length >= MAX_PRESTAMOS_ACTIVOS) {
    return 'MAXIMO_PRESTAMOS';
  }
  if (disponibles <= 0) return 'SIN_EJEMPLARES';
  return null;
}

/** RN-05: días de retraso al devolver; un día empezado cuenta completo. */
export function diasDeRetraso(limite: Date, devueltoEn: Date): number {
  const diferencia = devueltoEn.getTime() - limite.getTime();
  return diferencia <= 0 ? 0 : Math.ceil(diferencia / MS_POR_DIA);
}

/** RN-05: multa en centavos enteros (nunca flotante). */
export const multaCentavos = (limite: Date, devueltoEn: Date) =>
  diasDeRetraso(limite, devueltoEn) * MULTA_POR_DIA_CENTAVOS;

/** Centavos enteros a string decimal exacto: 1500 → "15.00". */
export function centavosATexto(centavos: number): string {
  if (!Number.isSafeInteger(centavos) || centavos < 0) {
    throw new RangeError('Los centavos deben ser un entero no negativo.');
  }
  return `${Math.trunc(centavos / 100)}.${String(centavos % 100).padStart(2, '0')}`;
}
