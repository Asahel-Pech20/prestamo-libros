import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../lib/appError.js';
import { almacen, type Rol, type Usuario } from '../lib/almacen.js';

export type Permiso =
  | 'libros:crear'
  | 'libros:leer'
  | 'prestamos:crear'
  | 'prestamos:devolver'
  | 'prestamos:leer'
  | 'prestamos:leer-propio';

/** Matriz de roles de docs/requerimientos.md. */
export const PERMISOS: Record<Rol, readonly Permiso[]> = {
  BIBLIOTECARIO: [
    'libros:crear',
    'libros:leer',
    'prestamos:crear',
    'prestamos:devolver',
    'prestamos:leer',
  ],
  LECTOR: ['libros:leer', 'prestamos:leer-propio'],
};

export function usuarioDe(res: Response): Usuario {
  const usuario: unknown = res.locals.usuario;
  if (!usuario) throw new AppError('UNAUTHENTICATED', 'Inicia sesión.');
  return usuario as Usuario;
}

export const autenticar: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace(/^Bearer /, '');
  const usuario = almacen.usuarios.find((u) => u.token === token);
  if (!usuario) return next(new AppError('UNAUTHENTICATED', 'Inicia sesión.'));
  res.locals.usuario = usuario;
  next();
};

/** Deja pasar si el rol tiene alguno de los permisos. */
export function autorizar(...permisos: Permiso[]): RequestHandler {
  return (_req, res, next) => {
    const { rol } = usuarioDe(res);
    if (permisos.some((p) => PERMISOS[rol].includes(p))) return next();
    next(new AppError('FORBIDDEN', 'No tienes permiso para esta acción.'));
  };
}

export const puede = (usuario: Usuario, permiso: Permiso) =>
  PERMISOS[usuario.rol].includes(permiso);
