import { z } from 'zod';

export const MAX_LIMIT = 100;

export const esquemaPaginacion = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
});

export type Paginacion = z.infer<typeof esquemaPaginacion>;

export function paginar<T>(lista: T[], { page, limit }: Paginacion) {
  const total = lista.length;
  return {
    data: lista.slice((page - 1) * limit, page * limit),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}
