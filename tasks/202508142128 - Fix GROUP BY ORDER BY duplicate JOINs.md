# Fix GROUP BY + ORDER BY Duplicate JOINs

## Summary

Debugging and fixing the duplicate JOINs issue when using GROUP BY with ORDER BY functionality in the SOLID NestJS framework. The issue occurs when both GROUP BY fields and ORDER BY fields reference the same relation (e.g., supplier), causing duplicate JOINs to the same table with the same alias, resulting in SQL ambiguity errors.

## Tasks

- [x] Arreglar JOINs duplicados en GROUP BY cuando WHERE ya crea relaciones
- [x] Implementar ORDER BY específico para GROUP BY (solo por llaves de agrupación)
- [x] Modificar getOrCreateRelationAlias para reutilizar JOINs existentes
- [x] Crear applyGroupByOrderBy separado de applyOrderBy normal
- [x] Probar las correcciones con las pruebas E2E
- [x] Bug encontrado: JOINs duplicados - GROUP BY y ORDER BY crean JOINs independientes
- [ ] Analizar y corregir la lógica de detección de JOINs existentes en getOrCreateRelationAlias
- [ ] Implementar alternativa que evite crear JOINs duplicados entre GROUP BY y ORDER BY
- [ ] Validar corrección con pruebas E2E

## Análisis del Problema

### Error observado
```sql
LEFT JOIN "supplier" "entity_supplier" ON ...
LEFT JOIN "supplier" "entity_supplier" ON ...
-- Error: SQLITE_ERROR: ambiguous column name: entity_supplier.name
```

### Flujo del problema
1. `addGroupByFields()` llama `getOrCreateRelationAlias("supplier", queryContext, "entity")` → crea JOIN a supplier con alias "entity_supplier"
2. `validateAndApplyGroupByOrder()` llama `getOrCreateRelationAlias("supplier", queryContext, "entity")` → debería reutilizar el JOIN existente, pero crea uno duplicado

### Causa raíz
La lógica de detección de JOINs existentes en `getOrCreateRelationAlias()` no está funcionando correctamente. El método intenta buscar JOINs existentes revisando `queryContext.queryBuilder.expressionMap.joinAttributes`, pero está fallando en detectar el JOIN previo.

## Plan de solución

1. **Investigar** por qué la detección de JOINs existentes falla
2. **Implementar** un mecanismo más robusto para reutilizar JOINs
3. **Alternative approach**: Mantener un registro de aliases creados en el contexto del query builder para GROUP BY
4. **Validar** con los casos de prueba existentes

## Estado actual

Se ha añadido logging de debug para entender el flujo, pero hay problemas de compilación. El issue fundamental es que el método `getOrCreateRelationAlias()` está creando JOINs duplicados en lugar de reutilizar los existentes.