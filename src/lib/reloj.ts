// «Ahora» del sistema en un solo lugar, para que las pruebas puedan fijarlo (AGENTS.md «Siempre» 9).
let fijo: Date | null = null;

export const ahora = () => (fijo ? new Date(fijo) : new Date());

/** Solo pruebas: fija la hora del sistema; null vuelve al reloj real. */
export function fijarAhora(fecha: Date | null) {
  fijo = fecha;
}
