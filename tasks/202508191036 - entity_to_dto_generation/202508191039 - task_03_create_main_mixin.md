# Task 3: Create GenerateDtoFromEntity Mixin

**Feature**: Entity-to-DTO Code Generation  
**Task ID**: 202508191039  
**Status**: Pending  
**Estimated Time**: 4 hours  
**Dependencies**: Task 1, Task 2  

## Objective

Create the main mixin function in three different packages to support REST, GraphQL, and combined scenarios.

## Requirements

1. **Function Locations**: 
   - `packages-core/rest-api/src/helpers/generate-dto-from-entity.helper.ts`
   - `packages-core/graphql/src/helpers/generate-dto-from-entity.helper.ts`
   - `packages-core/rest-graphql/src/helpers/generate-dto-from-entity.helper.ts`

2. **Main Function Signature**:
   ```typescript
   export function GenerateDtoFromEntity<TEntity extends object>(
     EntityClass: Type<TEntity>,
     properties?: (keyof TEntity)[]
   ): Type<Partial<TEntity>>
   ```

3. **Functionality**:
   - Accept entity class and optional property list
   - Extract and filter metadata
   - Generate new class with selected properties
   - Transfer property descriptors
   - Apply decorators to new class

## Implementation Steps

1. Create `generate-dto-from-entity.helper.ts` file

2. Implement main function:
   ```typescript
   export function GenerateDtoFromEntity<TEntity extends object>(
     EntityClass: Type<TEntity>,
     properties?: (keyof TEntity)[]
   ): Type<Partial<TEntity>> {
     // 1. Extract all field metadata from entity
     const allMetadata = extractEntityFieldMetadata(EntityClass);
     
     // 2. Filter properties based on selection or defaults
     const selectedMetadata = filterProperties(
       allMetadata,
       properties as string[]
     );
     
     // 3. Create base class
     class GeneratedDto {}
     
     // 4. Add properties to class
     selectedMetadata.forEach(metadata => {
       // Copy property descriptor
       const descriptor = Object.getOwnPropertyDescriptor(
         EntityClass.prototype,
         metadata.propertyKey
       );
       
       // Define property on new class
       Object.defineProperty(
         GeneratedDto.prototype,
         metadata.propertyKey,
         descriptor || { writable: true, enumerable: true, configurable: true }
       );
       
       // Store metadata for decorator application
       MetadataStorage.addFieldMetadata({
         ...metadata,
         target: GeneratedDto
       });
     });
     
     // 5. Return generated class
     return GeneratedDto as Type<Partial<TEntity>>;
   }
   ```

3. Handle edge cases:
   - Empty property selection
   - Entity with no flat properties
   - Circular references

4. Add helper utilities:
   - Property descriptor copying
   - Metadata cloning
   - Type preservation

## Testing

- Test with various entity configurations
- Test with different property selections
- Test that generated class has correct properties
- Test that TypeScript types are preserved

## Integration

- Export from main index file
- Ensure compatibility with existing decorators
- Test with @SolidInput decorator

## Success Criteria

- [ ] Generates class with selected properties
- [ ] Preserves property types
- [ ] Compatible with TypeScript type system
- [ ] Works with inheritance (extends)
- [ ] All tests pass