import express from 'express';
import { manejarErrores, noEncontrado } from './middlewares/errores.js';
import { librosRouter } from './modules/libros/libros.routes.js';
import { prestamosRouter } from './modules/prestamos/prestamos.routes.js';

export function crearApp() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));
  app.use('/api/v1/libros', librosRouter);
  app.use('/api/v1/prestamos', prestamosRouter);
  app.use(noEncontrado);
  app.use(manejarErrores);
  return app;
}
