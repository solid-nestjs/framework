# Update GROUP BY Documentation for JSON Response Format

## Planning Summary

This task involves updating the GROUP BY documentation to reflect the important change in response format. The GROUP BY feature now returns `key` and `aggregates` as JSON objects instead of JSON strings, thanks to the implementation of the custom JSON scalar type.

## Key Changes Made

### Previous Implementation
- GROUP BY results returned `key` and `aggregates` as JSON strings
- Developers needed to parse these strings to access the data
- Required `JSON.parse()` calls on the client side

### Current Implementation  
- GROUP BY results return `key` and `aggregates` as JSON objects
- Direct access to object properties without parsing
- Custom JSON scalar type handles serialization/deserialization
- Cleaner developer experience

### Technical Details
- Implemented custom `GraphQLJSON` scalar in `packages-core/graphql/src/scalars/json.scalar.ts`
- Removed all `JSON.stringify()` conversions from `packages-core/typeorm/src/helpers/query-builder.helper.ts`
- Updated all E2E tests to expect objects instead of strings
- NestJS auto-discovers custom scalars from `@Field()` decorators, making explicit resolver registration optional

## Task List

- [x] Crear archivo de tarea de planificación
- [x] Actualizar docs/GROUP_BY.md con formato de respuesta JSON object
- [x] Actualizar README.md sección GROUP BY  
- [x] Actualizar ROADMAP.md con logros completados

## Response Format Examples

### Before (JSON Strings)
```json
{
  "groups": [
    {
      "key": "{\"supplier_name\":\"Electronics Corp\"}",
      "aggregates": "{\"avgPrice\":850.50,\"totalStock\":25}"
    }
  ]
}
```

### After (JSON Objects)
```json
{
  "groups": [
    {
      "key": {"supplier_name":"Electronics Corp"},
      "aggregates": {"avgPrice":850.50,"totalStock":25}
    }
  ]
}
```

## Files to Update

1. **docs/GROUP_BY.md**
   - Update response format examples (lines 248-288)
   - Add note about JSON scalar implementation
   - Ensure all examples show objects instead of strings

2. **README.md**
   - Update GROUP BY section response format examples
   - Ensure consistency with new JSON object format
   - Update any references to string responses

3. **ROADMAP.md**
   - Mark JSON scalar implementation as completed
   - Add note about GROUP BY response format improvement
   - Update accomplishments section for v0.2.7

## Benefits of This Change

- **Better Developer Experience**: No need to parse JSON strings
- **Type Safety**: Direct object access with TypeScript support  
- **Cleaner Code**: Eliminates `JSON.parse()` calls
- **Performance**: Slightly better performance without string conversion
- **Consistency**: Matches standard GraphQL scalar behavior