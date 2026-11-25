import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

interface Esquemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

/** Valida body, params y query; lo validado queda en res.locals.validado. Los errores los responde errores.ts. */
export function validar(esquemas: Esquemas): RequestHandler {
  return (req, res, next) => {
    res.locals.validado = {
      body: esquemas.body?.parse(req.body),
      params: esquemas.params?.parse(req.params),
      query: esquemas.query?.parse(req.query),
    };
    next();
  };
}
