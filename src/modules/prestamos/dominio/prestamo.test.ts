import { describe, expect, it } from 'vitest';
import {
  centavosATexto,
  diasDeRetraso,
  ejemplaresDisponibles,
  estaVencido,
  fechaLimite,
  motivoParaNoPrestar,
  multaCentavos,
  type PrestamoDominio,
} from './prestamo.js';

const fecha = (iso: string) => new Date(iso);
const activo = (limite: string): PrestamoDominio => ({
  fechaLimite: fecha(limite),
  devueltoEn: null,
});
const devuelto = (limite: string): PrestamoDominio => ({
  fechaLimite: fecha(limite),
  devueltoEn: fecha('2026-01-02T00:00:00Z'),
});
const AHORA = fecha('2026-03-10T12:00:00Z');

describe('RN-01: duración del préstamo', () => {
  it('la fecha límite es 14 días después', () => {
    expect(fechaLimite(fecha('2026-03-01T10:00:00Z'))).toEqual(fecha('2026-03-15T10:00:00Z'));
  });
});

describe('vencimiento', () => {
  it('vence solo si sigue activo y pasó la fecha límite', () => {
    expect(estaVencido(activo('2026-03-09T12:00:00Z'), AHORA)).toBe(true);
    expect(estaVencido(activo('2026-03-10T12:00:00Z'), AHORA)).toBe(false);
    expect(estaVencido(devuelto('2026-03-01T00:00:00Z'), AHORA)).toBe(false);
  });
});

describe('RN-02: ejemplares disponibles', () => {
  it('resta solo los préstamos activos y no baja de cero', () => {
    const prestamos = [activo('2026-03-20T00:00:00Z'), devuelto('2026-03-01T00:00:00Z')];
    expect(ejemplaresDisponibles(2, prestamos)).toBe(1);
    expect(ejemplaresDisponibles(1, [activo('2026-03-20T00:00:00Z')])).toBe(0);
    expect(ejemplaresDisponibles(0, [activo('2026-03-20T00:00:00Z')])).toBe(0);
  });
});

describe('RN-02–RN-04: ¿se puede prestar?', () => {
  const vigente = activo('2026-03-20T00:00:00Z');

  it('sí, con ejemplares y menos de 3 préstamos al día', () => {
    expect(motivoParaNoPrestar(1, [vigente, vigente], AHORA)).toBeNull();
  });

  it('RN-02: no sin ejemplares', () => {
    expect(motivoParaNoPrestar(0, [], AHORA)).toBe('SIN_EJEMPLARES');
  });

  it('RN-03: no con 3 préstamos activos; los devueltos no cuentan', () => {
    expect(motivoParaNoPrestar(1, [vigente, vigente, vigente], AHORA)).toBe('MAXIMO_PRESTAMOS');
    const conDevuelto = [vigente, vigente, devuelto('2026-03-01T00:00:00Z')];
    expect(motivoParaNoPrestar(1, conDevuelto, AHORA)).toBeNull();
  });

  it('RN-04: no con un préstamo vencido, aunque haya ejemplares', () => {
    expect(motivoParaNoPrestar(5, [activo('2026-03-01T00:00:00Z')], AHORA)).toBe(
      'PRESTAMO_VENCIDO',
    );
  });
});

describe('RN-05: multa por retraso', () => {
  const limite = fecha('2026-03-15T10:00:00Z');

  it('sin retraso no hay multa', () => {
    expect(multaCentavos(limite, fecha('2026-03-15T10:00:00Z'))).toBe(0);
    expect(multaCentavos(limite, fecha('2026-03-14T09:00:00Z'))).toBe(0);
  });

  it('un día empezado cuenta completo: 3 días son 15.00', () => {
    expect(diasDeRetraso(limite, fecha('2026-03-15T10:00:01Z'))).toBe(1);
    expect(multaCentavos(limite, fecha('2026-03-18T09:00:00Z'))).toBe(1500);
    expect(centavosATexto(1500)).toBe('15.00');
  });

  it('el texto es exacto y rechaza centavos no enteros', () => {
    expect(centavosATexto(0)).toBe('0.00');
    expect(centavosATexto(505)).toBe('5.05');
    expect(centavosATexto(123456)).toBe('1234.56');
    expect(() => centavosATexto(1.5)).toThrow(RangeError);
    expect(() => centavosATexto(-1)).toThrow(RangeError);
  });
});
