# Task 4: Implement Decorator Transfer Logic

**Feature**: Entity-to-DTO Code Generation  
**Task ID**: 202508191040  
**Status**: Pending  
**Estimated Time**: 3 hours  
**Dependencies**: Task 3  

## Objective

Implement the logic to transfer all decorators (SOLID, Swagger, GraphQL, validation) from entity to generated DTO in each package.

## Requirements

1. **Function Locations**: Update all three `generate-dto-from-entity.helper.ts` files

2. **Package-Specific Decorator Transfer**:

   **rest-api package**:
   - Transfer `@ApiProperty()` decorators with all metadata
   - Transfer validation decorators
   - Transfer @SolidField configurations (without TypeORM)
   
   **graphql package**:
   - Transfer `@Field()` decorators with all metadata
   - Transfer validation decorators
   - Transfer @SolidField configurations (without TypeORM)
   
   **rest-graphql package**:
   - Transfer both `@ApiProperty()` and `@Field()` decorators
   - Transfer validation decorators
   - Transfer @SolidField configurations (without TypeORM)

3. **Configuration Filtering**:
   - Remove `adapters.typeorm` configurations
   - Keep `adapters.graphql` and `adapters.swagger`
   - Preserve all validation-related options

## Implementation Steps

### REST API Package Implementation

```typescript
// packages-core/rest-api/src/helpers/generate-dto-from-entity.helper.ts
function transferDecorators(
  sourceClass: Function,
  targetClass: Function,
  propertyKey: string | symbol
): void {
  // Transfer Swagger metadata
  const swaggerMetadata = Reflect.getMetadata(
    DECORATORS.API_MODEL_PROPERTIES,
    sourceClass.prototype,
    propertyKey
  );
  
  if (swaggerMetadata) {
    const decorator = ApiProperty(swaggerMetadata);
    decorator(targetClass.prototype, propertyKey);
  }
  
  // Transfer validation metadata
  transferValidationDecorators(sourceClass, targetClass, propertyKey);
  
  // Transfer SOLID metadata if present
  transferSolidDecorators(sourceClass, targetClass, propertyKey);
}
```

### GraphQL Package Implementation

```typescript
// packages-core/graphql/src/helpers/generate-dto-from-entity.helper.ts
function transferDecorators(
  sourceClass: Function,
  targetClass: Function,
  propertyKey: string | symbol
): void {
  // Transfer GraphQL field metadata
  const graphqlMetadata = Reflect.getMetadata(
    'graphql:field_metadata',
    sourceClass.prototype,
    propertyKey
  );
  
  if (graphqlMetadata) {
    const decorator = Field(graphqlMetadata.type, graphqlMetadata.options);
    decorator(targetClass.prototype, propertyKey);
  }
  
  // Transfer validation and SOLID decorators
  transferValidationDecorators(sourceClass, targetClass, propertyKey);
  transferSolidDecorators(sourceClass, targetClass, propertyKey);
}
```

### REST-GraphQL Package Implementation

```typescript
// packages-core/rest-graphql/src/helpers/generate-dto-from-entity.helper.ts
function transferDecorators(
  sourceClass: Function,
  targetClass: Function,
  propertyKey: string | symbol
): void {
  // Transfer both Swagger and GraphQL metadata
  transferSwaggerDecorators(sourceClass, targetClass, propertyKey);
  transferGraphQLDecorators(sourceClass, targetClass, propertyKey);
  transferValidationDecorators(sourceClass, targetClass, propertyKey);
  transferSolidDecorators(sourceClass, targetClass, propertyKey);
}
```

2. Implement common helper functions:

```typescript
// Shared helper to clean SOLID options
function cleanSolidFieldOptions(options: SolidFieldOptions): SolidFieldOptions {
  const cleaned = { ...options };
  
  // Remove TypeORM-specific configurations
  if (cleaned.adapters?.typeorm) {
    cleaned.adapters = { ...cleaned.adapters };
    delete cleaned.adapters.typeorm;
  }
  
  return cleaned;
}

// Transfer validation decorators
function transferValidationDecorators(
  sourceClass: Function,
  targetClass: Function,
  propertyKey: string | symbol
): void {
  // Get all validation metadata keys
  const metadataKeys = Reflect.getMetadataKeys(
    sourceClass.prototype,
    propertyKey
  );
  
  // Transfer validation-related metadata
  metadataKeys
    .filter(key => key.toString().includes('validation'))
    .forEach(key => {
      const metadata = Reflect.getMetadata(key, sourceClass.prototype, propertyKey);
      Reflect.defineMetadata(key, metadata, targetClass.prototype, propertyKey);
    });
}
```

3. Update main mixin to use decorator transfer:
   ```typescript
   selectedMetadata.forEach(metadata => {
     // ... existing property definition code ...
     
     // Transfer decorators
     transferFieldDecorators(metadata, GeneratedDto, metadata.propertyKey);
   });
   ```

4. Handle special cases:
   - Nested field configurations
   - Array field configurations
   - Custom validation options

## Testing

- Verify @SolidField is applied to generated properties
- Check that descriptions are preserved
- Verify validation constraints are transferred
- Ensure TypeORM configs are removed
- Test GraphQL/Swagger configs are maintained

## Validation

Ensure the following are transferred:
- `description`
- `minLength`, `maxLength`
- `min`, `max`
- `pattern`
- `email`, `url`, `uuid`, `json`
- `integer`, `positive`, `negative`
- `nullable`, `required`
- `defaultValue`

## Success Criteria

- [ ] All @SolidField configurations transferred except TypeORM
- [ ] Validation rules preserved
- [ ] GraphQL configurations maintained
- [ ] Swagger configurations maintained
- [ ] No TypeORM decorators in generated DTO