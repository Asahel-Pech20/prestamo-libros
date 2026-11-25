# Requerimientos — Préstamo de libros

> Proyecto pequeño para la prueba de portabilidad del arnés. El cliente es una biblioteca escolar ficticia.

## Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-01 | El bibliotecario registra un libro con título, autor, ISBN y número de ejemplares. |
| RF-02 | Cualquier usuario consulta el catálogo, paginado, y busca por título o autor. |
| RF-03 | El bibliotecario presta un libro a un lector; el préstamo guarda la fecha y la fecha límite. |
| RF-04 | El bibliotecario registra la devolución de un préstamo. |
| RF-05 | El bibliotecario consulta los préstamos activos y cuáles están vencidos. |
| RF-06 | Un lector consulta solo sus propios préstamos. |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Un préstamo dura 14 días naturales desde que se presta. |
| RN-02 | No se presta un libro sin ejemplares disponibles (ejemplares menos préstamos activos). |
| RN-03 | Un lector no tiene más de 3 préstamos activos. |
| RN-04 | Un lector con un préstamo vencido sin devolver no puede pedir otro. |
| RN-05 | La multa es de 5.00 por día de retraso, calculada al devolver, en decimal exacto. |
| RN-06 | Un préstamo devuelto no se borra ni se devuelve dos veces. |

## Roles

| Rol | Puede |
|---|---|
| `BIBLIOTECARIO` | Todo |
| `LECTOR` | Consultar el catálogo y sus propios préstamos |
