import { z } from 'zod';
import { esquemaPaginacion } from '../../lib/paginacion.js';

// RF-03
export const esquemaCrearPrestamo = z
  .object({
    libroId: z.uuid(),
    lectorId: z.string().trim().min(1).max(50),
  })
  .strict();

// RF-05 y RF-06
export const esquemaListarPrestamos = esquemaPaginacion.extend({
  estado: z.enum(['activos', 'vencidos', 'devueltos', 'todos']).default('activos'),
});

export const esquemaIdPrestamo = z.object({ id: z.uuid() });

export type CrearPrestamo = z.infer<typeof esquemaCrearPrestamo>;
export type ListarPrestamos = z.infer<typeof esquemaListarPrestamos>;
