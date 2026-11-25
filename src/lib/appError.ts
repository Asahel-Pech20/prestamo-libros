// Error de dominio: el middleware de errores lo traduce a { error: { code, message, details? } }.
export type CodigoError =
  'VALIDATION_ERROR' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'BUSINESS_RULE';

const ESTADO_HTTP: Record<CodigoError, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  BUSINESS_RULE: 422,
};

export class AppError extends Error {
  readonly status: number;

  constructor(
    readonly code: CodigoError,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.status = ESTADO_HTTP[code];
  }
}
