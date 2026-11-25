import { AppError } from '../../lib/appError.js';
import { almacen, nuevoId, type Libro } from '../../lib/almacen.js';
import { paginar } from '../../lib/paginacion.js';
import type { CrearLibro, ListarLibros } from './libros.schemas.js';

/** Quita acentos y mayúsculas para buscar «garcia» y encontrar «García». */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const aRespuesta = (libro: Libro) => ({
  id: libro.id,
  titulo: libro.titulo,
  autor: libro.autor,
  isbn: libro.isbn,
  ejemplares: libro.ejemplares,
  createdAt: libro.createdAt.toISOString(),
});

export const librosService = {
  // RF-01
  crear(datos: CrearLibro) {
    if (almacen.libros.some((l) => l.isbn === datos.isbn)) {
      throw new AppError('CONFLICT', 'Ya hay un libro con ese ISBN.');
    }
    const libro: Libro = { id: nuevoId(), ...datos, createdAt: new Date() };
    almacen.libros.push(libro);
    return aRespuesta(libro);
  },

  // RF-02
  listar({ q, ...paginacion }: ListarLibros) {
    const buscado = q ? normalizar(q) : null;
    const lista = almacen.libros
      .filter((l) => !buscado || normalizar(`${l.titulo} ${l.autor}`).includes(buscado))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
    const pagina = paginar(lista, paginacion);
    return { ...pagina, data: pagina.data.map(aRespuesta) };
  },

  obtener(id: string) {
    const libro = almacen.libros.find((l) => l.id === id);
    if (!libro) throw new AppError('NOT_FOUND', 'El libro no existe.');
    return aRespuesta(libro);
  },
};
