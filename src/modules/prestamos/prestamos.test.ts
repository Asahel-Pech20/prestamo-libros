import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearApp } from '../../app.js';
import { reiniciarAlmacen } from '../../lib/almacen.js';
import { fijarAhora } from '../../lib/reloj.js';

const app = crearApp();
const BIB = { Authorization: 'Bearer token-bibliotecario' };
const LECTOR_1 = { Authorization: 'Bearer token-lector-1' };
const LECTOR_2 = { Authorization: 'Bearer token-lector-2' };
const DIA = 24 * 60 * 60 * 1000;
const INICIO = new Date('2026-03-01T10:00:00Z');

let isbn = 9786070000000;
async function crearLibro(ejemplares = 2) {
  const r = await request(app)
    .post('/api/v1/libros')
    .set(BIB)
    .send({ titulo: `Libro ${isbn}`, autor: 'Autora', isbn: String(isbn++), ejemplares });
  return r.body.data.id as string;
}

const prestar = (libroId: string, lectorId = 'u-lec1') =>
  request(app).post('/api/v1/prestamos').set(BIB).send({ libroId, lectorId });

const devolver = (id: string) => request(app).patch(`/api/v1/prestamos/${id}/devolucion`).set(BIB);

beforeEach(() => {
  reiniciarAlmacen();
  fijarAhora(INICIO);
});
afterEach(() => fijarAhora(null));

describe('POST /prestamos (RF-03)', () => {
  it('presta un libro con fecha límite a 14 días (RN-01)', async () => {
    const r = await prestar(await crearLibro());
    expect(r.status).toBe(201);
    expect(r.body.data).toMatchObject({
      lectorId: 'u-lec1',
      prestadoEn: '2026-03-01T10:00:00.000Z',
      fechaLimite: '2026-03-15T10:00:00.000Z',
      devueltoEn: null,
      vencido: false,
      multa: null,
    });
  });

  it('400 sin libroId o con un campo desconocido', async () => {
    const libroId = await crearLibro();
    expect((await request(app).post('/api/v1/prestamos').set(BIB).send({})).status).toBe(400);
    const extra = await request(app)
      .post('/api/v1/prestamos')
      .set(BIB)
      .send({ libroId, lectorId: 'u-lec1', dias: 30 });
    expect(extra.status).toBe(400);
  });

  it('404 con un libro o un lector que no existen', async () => {
    expect((await prestar('7d1f6a8e-2b9c-4f3e-9a1d-0c5b8e7f6a42')).status).toBe(404);
    // El bibliotecario no es lector
    expect((await prestar(await crearLibro(), 'u-bib')).status).toBe(404);
  });

  it('401 sin sesión y 403 para un lector', async () => {
    const libroId = await crearLibro();
    const datos = { libroId, lectorId: 'u-lec1' };
    expect((await request(app).post('/api/v1/prestamos').send(datos)).status).toBe(401);
    expect((await request(app).post('/api/v1/prestamos').set(LECTOR_1).send(datos)).status).toBe(
      403,
    );
  });

  it('RN-02: 422 cuando ya no hay ejemplares', async () => {
    const libroId = await crearLibro(1);
    expect((await prestar(libroId, 'u-lec1')).status).toBe(201);
    const r = await prestar(libroId, 'u-lec2');
    expect(r.status).toBe(422);
    expect(r.body.error).toMatchObject({
      code: 'BUSINESS_RULE',
      details: { motivo: 'SIN_EJEMPLARES' },
    });
  });

  it('RN-03: el cuarto préstamo activo da 422', async () => {
    for (let i = 0; i < 3; i++) expect((await prestar(await crearLibro())).status).toBe(201);
    const r = await prestar(await crearLibro());
    expect(r.status).toBe(422);
    expect(r.body.error.details.motivo).toBe('MAXIMO_PRESTAMOS');
  });

  it('RN-04: un préstamo vencido bloquea al lector hasta que lo devuelve', async () => {
    const vencido = (await prestar(await crearLibro())).body.data.id as string;
    fijarAhora(new Date(INICIO.getTime() + 15 * DIA));
    const otro = await crearLibro();
    const r = await prestar(otro);
    expect(r.status).toBe(422);
    expect(r.body.error.details.motivo).toBe('PRESTAMO_VENCIDO');
    expect((await devolver(vencido)).status).toBe(200);
    expect((await prestar(otro)).status).toBe(201);
  });
});

describe('PATCH /prestamos/:id/devolucion (RF-04)', () => {
  it('a tiempo no hay multa y el ejemplar vuelve a estar disponible', async () => {
    const libroId = await crearLibro(1);
    const id = (await prestar(libroId)).body.data.id as string;
    fijarAhora(new Date(INICIO.getTime() + 10 * DIA));
    const r = await devolver(id);
    expect(r.status).toBe(200);
    expect(r.body.data).toMatchObject({ devueltoEn: '2026-03-11T10:00:00.000Z', multa: '0.00' });
    expect((await prestar(libroId, 'u-lec2')).status).toBe(201);
  });

  it('RN-05: 3 días de retraso son "15.00"', async () => {
    const id = (await prestar(await crearLibro())).body.data.id as string;
    fijarAhora(new Date(INICIO.getTime() + 17 * DIA - 60_000));
    const r = await devolver(id);
    expect(r.body.data.multa).toBe('15.00');
  });

  it('RN-06: devolver dos veces da 409 y el préstamo se conserva', async () => {
    const id = (await prestar(await crearLibro())).body.data.id as string;
    expect((await devolver(id)).status).toBe(200);
    expect((await devolver(id)).status).toBe(409);
    const r = await request(app).get('/api/v1/prestamos?estado=devueltos').set(BIB);
    expect(r.body.data.map((p: { id: string }) => p.id)).toEqual([id]);
  });

  it('400 con un id inválido, 404 si no existe y 403 para un lector', async () => {
    expect((await devolver('no-es-uuid')).status).toBe(400);
    expect((await devolver('7d1f6a8e-2b9c-4f3e-9a1d-0c5b8e7f6a42')).status).toBe(404);
    const id = (await prestar(await crearLibro())).body.data.id as string;
    const r = await request(app).patch(`/api/v1/prestamos/${id}/devolucion`).set(LECTOR_1);
    expect(r.status).toBe(403);
  });
});

describe('GET /prestamos (RF-05)', () => {
  it('separa activos y vencidos', async () => {
    const viejo = (await prestar(await crearLibro())).body.data.id as string;
    fijarAhora(new Date(INICIO.getTime() + 10 * DIA));
    const nuevo = (await prestar(await crearLibro(), 'u-lec2')).body.data.id as string;
    fijarAhora(new Date(INICIO.getTime() + 15 * DIA));

    const activos = await request(app).get('/api/v1/prestamos').set(BIB);
    expect(activos.body.data.map((p: { id: string }) => p.id)).toEqual([nuevo, viejo]);
    expect(activos.body.meta.total).toBe(2);
    const vencidos = await request(app).get('/api/v1/prestamos?estado=vencidos').set(BIB);
    expect(vencidos.body.data).toHaveLength(1);
    expect(vencidos.body.data[0]).toMatchObject({ id: viejo, vencido: true });
  });

  it('400 con un estado desconocido y 403 para un lector', async () => {
    expect((await request(app).get('/api/v1/prestamos?estado=perdidos').set(BIB)).status).toBe(400);
    expect((await request(app).get('/api/v1/prestamos').set(LECTOR_1)).status).toBe(403);
  });
});

describe('GET /prestamos/mios (RF-06)', () => {
  it('cada lector ve solo sus préstamos', async () => {
    await prestar(await crearLibro(), 'u-lec1');
    await prestar(await crearLibro(), 'u-lec2');
    const r = await request(app).get('/api/v1/prestamos/mios').set(LECTOR_2);
    expect(r.status).toBe(200);
    expect(r.body.data).toHaveLength(1);
    expect(r.body.data[0].lectorId).toBe('u-lec2');
  });

  it('401 sin sesión y 403 para el bibliotecario, que no es lector', async () => {
    expect((await request(app).get('/api/v1/prestamos/mios')).status).toBe(401);
    expect((await request(app).get('/api/v1/prestamos/mios').set(BIB)).status).toBe(403);
  });
});
