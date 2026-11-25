import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validar.js';
import { prestamosController } from './prestamos.controller.js';
import {
  esquemaCrearPrestamo,
  esquemaIdPrestamo,
  esquemaListarPrestamos,
} from './prestamos.schemas.js';

export const prestamosRouter = Router();

// RF-06 (antes de /:id para que «mios» no se tome como id)
prestamosRouter.get(
  '/mios',
  autenticar,
  autorizar('prestamos:leer-propio'),
  validar({ query: esquemaListarPrestamos }),
  prestamosController.mios,
);
// RF-03
prestamosRouter.post(
  '/',
  autenticar,
  autorizar('prestamos:crear'),
  validar({ body: esquemaCrearPrestamo }),
  prestamosController.prestar,
);
// RF-05
prestamosRouter.get(
  '/',
  autenticar,
  autorizar('prestamos:leer'),
  validar({ query: esquemaListarPrestamos }),
  prestamosController.listar,
);
// RF-04
prestamosRouter.patch(
  '/:id/devolucion',
  autenticar,
  autorizar('prestamos:devolver'),
  validar({ params: esquemaIdPrestamo }),
  prestamosController.devolver,
);
