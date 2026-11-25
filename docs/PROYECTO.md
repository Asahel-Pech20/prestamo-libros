# PROYECTO.md — Lo propio de este proyecto

> El arnés (`core/`) es genérico. Este archivo le dice a la IA de qué trata **este** proyecto.

## Dominio en 5 líneas

API de una biblioteca escolar: el bibliotecario registra libros y presta ejemplares a los lectores; cada lector ve sus préstamos.
La regla más delicada es la disponibilidad: no se presta lo que no hay (RN-02), ni a quien tiene 3 préstamos o uno vencido (RN-03, RN-04).
Las multas por retraso son dinero: decimal exacto, nunca `number` flotante (RN-05).
Los datos viven en memoria (`src/lib/almacen.ts`): es una prueba del arnés, no un sistema en producción.

## Fuentes de verdad

- Requerimientos: `docs/requerimientos.md` (IDs `RF`, `RN`).
- Arquitectura: `ARCHITECTURE.md` · Decisiones: `docs/adr/`.
- Contrato de API: las rutas de cada `*.routes.ts` (este proyecto no publica OpenAPI).

## Equipo y dueños

| Integrante | Módulos | IDs |
|---|---|---|
| Santiago Pech | `libros`, `prestamos` | RF-01–RF-06, RN-01–RN-06 |

## Términos que la IA suele confundir

| Término | Significa | No confundir con |
|---|---|---|
| Ejemplar | Una copia física de un libro | El libro (título), que puede tener varios ejemplares |
| Préstamo activo | Prestado y sin devolver, vencido o no | Préstamo vencido: activo y con la fecha límite pasada |
| Lector | Usuario que pide libros | Bibliotecario, que los presta |

## Comandos

```bash
npm install
npm run dev          # API en http://localhost:3000
npm test             # Vitest + Supertest
npm run lint  &&  npm run typecheck  &&  npm run arquitectura
```

## Herramienta de IA

Claude Code. Trailer de commit: `Asistido-por: Claude Code`.
