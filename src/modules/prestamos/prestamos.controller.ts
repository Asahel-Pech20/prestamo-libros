import type { Request, Response } from 'express';
import { usuarioDe } from '../../middlewares/auth.js';
import { prestamosService } from './prestamos.service.js';

export const prestamosController = {
  prestar(_req: Request, res: Response) {
    res.status(201).json({ data: prestamosService.prestar(res.locals.validado.body) });
  },
  devolver(_req: Request, res: Response) {
    res.json({ data: prestamosService.devolver(res.locals.validado.params.id) });
  },
  listar(_req: Request, res: Response) {
    res.json(prestamosService.listarTodos(res.locals.validado.query));
  },
  mios(_req: Request, res: Response) {
    res.json(prestamosService.listarDelLector(usuarioDe(res).id, res.locals.validado.query));
  },
};
