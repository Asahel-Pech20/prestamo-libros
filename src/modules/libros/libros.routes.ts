import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validar.js';
import { librosController } from './libros.controller.js';
import { esquemaCrearLibro, esquemaIdLibro, esquemaListarLibros } from './libros.schemas.js';

export const librosRouter = Router();

librosRouter.post(
  '/',
  autenticar,
  autorizar('libros:crear'),
  validar({ body: esquemaCrearLibro }),
  librosController.crear,
);
librosRouter.get(
  '/',
  autenticar,
  autorizar('libros:leer'),
  validar({ query: esquemaListarLibros }),
  librosController.listar,
);
librosRouter.get(
  '/:id',
  autenticar,
  autorizar('libros:leer'),
  validar({ params: esquemaIdLibro }),
  librosController.obtener,
);
