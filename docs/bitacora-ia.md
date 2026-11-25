# Bitácora de uso de IA

> Mínimo 20 entradas en el proyecto, al menos 5 de ellas con **error de la IA** (qué propuso mal y cómo se detectó).
> Una entrada por pedido relevante; se escribe al terminar la tarea.

| # | Fecha | Quién | Tarea / IDs | Prompt (plantilla usada) | Qué produjo | ¿Error de la IA? | Cómo se detectó y corrigió | Commit |
|---|---|---|---|---|---|---|---|---|
| 1 | 2026-11-25 | Santiago | Instalar el arnés y la base (`libros`, RF-01, RF-02) | README del arnés, paso a paso | Base de la API, módulo `libros` y `PROYECTO.md` | **Sí**: el arnés traía rutas fijas de Ecclesia y el primer commit falló | Lo detuvo el pre-commit; se hizo `arnes.config.json` (arnés 0.4.0) | `aaeaaf6` |
| 2 | 2026-11-25 | Santiago | Probar que el hook bloquea un controller con acceso a datos | README del arnés, paso 6 | Commit de prueba con un controller que lee `lib/almacen` | **Sí**: la regla solo conocía Prisma y el commit entró | Se vio al probarlo a propósito; se deshizo el commit y se agregó `accesoDatos`; probado de nuevo, lo bloquea | `0420918` |
| 3 | 2026-11-25 | Santiago | Ajuste del punto 2 | Libre | `require` en `.dependency-cruiser.cjs` | **Sí**: ESLint prohíbe `require()` y el hook lo rechazó | Bloque para `**/*.cjs` en la plantilla de ESLint | `0420918` |
| 4 | 2026-11-25 | Santiago | Módulo `prestamos` (RF-03–RF-06, RN-01–RN-06) | `nuevo-modulo.md`: plan, aprobación y código | Dominio puro, service, rutas y 25 pruebas nuevas (47 en total) | No | Se rompieron a propósito dos reglas (máximo 3 y redondeo de la multa): fallaron 4 pruebas | ver `git log` |
