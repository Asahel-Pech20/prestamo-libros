import type { Request, Response } from 'express';
import { librosService } from './libros.service.js';

export const librosController = {
  crear(_req: Request, res: Response) {
    res.status(201).json({ data: librosService.crear(res.locals.validado.body) });
  },
  listar(_req: Request, res: Response) {
    res.json(librosService.listar(res.locals.validado.query));
  },
  obtener(_req: Request, res: Response) {
    res.json({ data: librosService.obtener(res.locals.validado.params.id) });
  },
};
