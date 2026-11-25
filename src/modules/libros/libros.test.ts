import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { crearApp } from '../../app.js';
import { reiniciarAlmacen } from '../../lib/almacen.js';

const app = crearApp();
const BIB = { Authorization: 'Bearer token-bibliotecario' };
const LECTOR = { Authorization: 'Bearer token-lector-1' };
const LIBRO = {
  titulo: 'Pedro Páramo',
  autor: 'Juan Rulfo',
  isbn: '9786071603173',
  ejemplares: 2,
};

beforeEach(() => reiniciarAlmacen());

describe('POST /libros (RF-01)', () => {
  it('el bibliotecario registra un libro', async () => {
    const r = await request(app).post('/api/v1/libros').set(BIB).send(LIBRO);
    expect(r.status).toBe(201);
    expect(r.body.data).toMatchObject(LIBRO);
  });

  it('400 con un ISBN inválido, un campo desconocido o JSON roto', async () => {
    const isbn = await request(app)
      .post('/api/v1/libros')
      .set(BIB)
      .send({ ...LIBRO, isbn: '12-3' });
    expect(isbn.status).toBe(400);
    expect(isbn.body.error.code).toBe('VALIDATION_ERROR');
    const extra = await request(app)
      .post('/api/v1/libros')
      .set(BIB)
      .send({ ...LIBRO, precio: 1 });
    expect(extra.status).toBe(400);
    const roto = await request(app)
      .post('/api/v1/libros')
      .set({ ...BIB, 'Content-Type': 'application/json' })
      .send('{');
    expect(roto.status).toBe(400);
  });

  it('409 con un ISBN repetido', async () => {
    await request(app).post('/api/v1/libros').set(BIB).send(LIBRO);
    const r = await request(app).post('/api/v1/libros').set(BIB).send(LIBRO);
    expect(r.status).toBe(409);
  });

  it('401 sin sesión y 403 para un lector', async () => {
    expect((await request(app).post('/api/v1/libros').send(LIBRO)).status).toBe(401);
    expect((await request(app).post('/api/v1/libros').set(LECTOR).send(LIBRO)).status).toBe(403);
  });
});

describe('GET /libros (RF-02)', () => {
  it('un lector busca por autor sin acentos y recibe la lista paginada', async () => {
    await request(app).post('/api/v1/libros').set(BIB).send(LIBRO);
    await request(app)
      .post('/api/v1/libros')
      .set(BIB)
      .send({ titulo: 'Aura', autor: 'Carlos Fuentes', isbn: '9789681900000', ejemplares: 1 });
    const r = await request(app).get('/api/v1/libros?q=rulfo&limit=10').set(LECTOR);
    expect(r.status).toBe(200);
    expect(r.body.data.map((l: { titulo: string }) => l.titulo)).toEqual(['Pedro Páramo']);
    expect(r.body.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });

  it('400 con un límite mayor a 100 y 401 sin sesión', async () => {
    expect((await request(app).get('/api/v1/libros?limit=101').set(LECTOR)).status).toBe(400);
    expect((await request(app).get('/api/v1/libros')).status).toBe(401);
  });

  it('404 con un id que no existe', async () => {
    const r = await request(app)
      .get('/api/v1/libros/7d1f6a8e-2b9c-4f3e-9a1d-0c5b8e7f6a42')
      .set(LECTOR);
    expect(r.status).toBe(404);
  });
});
