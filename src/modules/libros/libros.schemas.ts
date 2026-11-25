import { z } from 'zod';
import { esquemaPaginacion } from '../../lib/paginacion.js';

// RF-01
export const esquemaCrearLibro = z
  .object({
    titulo: z.string().trim().min(1).max(200),
    autor: z.string().trim().min(1).max(150),
    isbn: z
      .string()
      .trim()
      .regex(/^(97[89])?\d{9}[\dX]$/, 'ISBN de 10 o 13 dígitos, sin guiones.'),
    ejemplares: z.number().int().min(1).max(100),
  })
  .strict();

// RF-02
export const esquemaListarLibros = esquemaPaginacion.extend({
  q: z.string().trim().max(100).optional(),
});

export const esquemaIdLibro = z.object({ id: z.uuid() });

export type CrearLibro = z.infer<typeof esquemaCrearLibro>;
export type ListarLibros = z.infer<typeof esquemaListarLibros>;
