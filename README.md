# Préstamo de libros

API pequeña de una biblioteca escolar ficticia, hecha para la **prueba de portabilidad** del arnés de IA de Ecclesia: se instaló el arnés en un repositorio nuevo, se llenó `docs/PROYECTO.md` y se pidió a la IA (Claude Code) un módulo completo con el flujo plan → aprobación → código.

- Qué se tuvo que ajustar del arnés: [docs/nota-portabilidad.md](docs/nota-portabilidad.md).
- Requerimientos: [docs/requerimientos.md](docs/requerimientos.md) · Arquitectura: [ARCHITECTURE.md](ARCHITECTURE.md) · Bitácora: [docs/bitacora-ia.md](docs/bitacora-ia.md).

## Cómo levantarlo

Requisitos: Node 22.12+ y git.

```bash
npm install
git config core.hooksPath arnes-ia/stacks/express/hooks   # hooks del arnés
npm test                                                   # 47 pruebas
npm run dev                                                # http://localhost:3000/api/v1
```

Los datos viven en memoria y se pierden al reiniciar. Tokens de prueba (solo desarrollo): `token-bibliotecario`, `token-lector-1`, `token-lector-2`, en la cabecera `Authorization: Bearer <token>`.

## Rutas

| Método | Ruta | Rol | IDs |
|---|---|---|---|
| POST | `/libros` | Bibliotecario | RF-01 |
| GET | `/libros?q&page&limit`, `/libros/:id` | Todos | RF-02 |
| POST | `/prestamos` (`{ libroId, lectorId }`) | Bibliotecario | RF-03, RN-01–RN-04 |
| PATCH | `/prestamos/:id/devolucion` | Bibliotecario | RF-04, RN-05, RN-06 |
| GET | `/prestamos?estado=activos\|vencidos\|devueltos\|todos` | Bibliotecario | RF-05 |
| GET | `/prestamos/mios` | Lector | RF-06 |

## Verificaciones

```bash
npm run lint && npm run typecheck && npm run format && npm run arquitectura && npm test
```

El hook de pre-commit corre formato, lint, reglas de dependencias y pruebas; el de commit-msg exige Conventional Commits y `Asistido-por:`.
