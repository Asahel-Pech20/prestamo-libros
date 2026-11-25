import { crearApp } from './app.js';

const PUERTO = Number(process.env.PORT ?? 3000);
crearApp().listen(PUERTO, () => {
  console.warn(`API de préstamo de libros en http://localhost:${PUERTO}/api/v1`);
});
