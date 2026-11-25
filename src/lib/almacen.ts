// Almacén en memoria: hace las veces de la BD en esta prueba del arnés (docs/PROYECTO.md).
// Solo los services lo usan; controllers y routes no (regla controller-sin-orm del arnés).
import { randomUUID } from 'node:crypto';

export type Rol = 'BIBLIOTECARIO' | 'LECTOR';

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  token: string;
}

export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  ejemplares: number;
  createdAt: Date;
}

export interface Prestamo {
  id: string;
  libroId: string;
  lectorId: string;
  prestadoEn: Date;
  fechaLimite: Date;
  devueltoEn: Date | null;
  /** Multa en centavos (RN-05); null mientras no se devuelve. */
  multaCentavos: number | null;
}

// Usuarios de prueba (nombres inventados); los tokens solo sirven en desarrollo y pruebas
const USUARIOS_INICIALES: Usuario[] = [
  { id: 'u-bib', nombre: 'Rosa Canché', rol: 'BIBLIOTECARIO', token: 'token-bibliotecario' },
  { id: 'u-lec1', nombre: 'Luis Ek', rol: 'LECTOR', token: 'token-lector-1' },
  { id: 'u-lec2', nombre: 'Ana Pool', rol: 'LECTOR', token: 'token-lector-2' },
];

export const almacen = {
  usuarios: [...USUARIOS_INICIALES],
  libros: [] as Libro[],
  prestamos: [] as Prestamo[],
};

export const nuevoId = () => randomUUID();

/** Deja el almacén como al arrancar (solo pruebas). */
export function reiniciarAlmacen() {
  almacen.usuarios = [...USUARIOS_INICIALES];
  almacen.libros = [];
  almacen.prestamos = [];
}
