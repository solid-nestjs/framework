# Task 2: Implement Property Filtering Logic

**Feature**: Entity-to-DTO Code Generation  
**Task ID**: 202508191038  
**Status**: Pending  
**Estimated Time**: 1.5 hours  
**Dependencies**: Task 1  

## Objective

Implement the logic to filter and select properties based on user specification or default rules.

## Requirements

1. **Function Location**: `packages-core/common/src/helpers/property-filter.helper.ts`

2. **Main Functions**:
   ```typescript
   export function filterProperties(
     allMetadata: FieldMetadata[],
     selectedProperties?: string[]
   ): FieldMetadata[]
   
   export function getDefaultProperties(
     allMetadata: FieldMetadata[]
   ): FieldMetadata[]
   
   export function validatePropertyNames(
     entityName: string,
     metadata: FieldMetadata[],
     properties: string[]
   ): void
   ```

3. **Functionality**:
   - If properties specified: validate and return only those
   - If no properties: return all flat properties except defaults
   - Throw error if specified property doesn't exist
   - Throw error if specified property is not flat type

## Implementation Steps

1. Create `property-filter.helper.ts` file

2. Implement `filterProperties`:
   - If selectedProperties provided, validate and filter
   - Otherwise, use getDefaultProperties
   - Return filtered metadata array

3. Implement `getDefaultProperties`:
   - Filter for flat types only
   - Exclude 'id' field
   - Exclude timestamp fields
   - Exclude relational fields

4. Implement `validatePropertyNames`:
   - Check all property names exist in metadata
   - Verify all selected properties are flat types
   - Throw descriptive errors for invalid selections

## Testing

- Test with explicit property selection
- Test with default property selection
- Test validation errors for non-existent properties
- Test validation errors for non-flat properties

## Error Messages

```typescript
throw new Error(`Property '${prop}' does not exist on entity ${entityName}`);
throw new Error(`Property '${prop}' is not a flat type and cannot be included in generated DTO`);
```

## Success Criteria

- [ ] Correctly filters properties when specified
- [ ] Applies default rules when no properties specified
- [ ] Validates property names exist
- [ ] Validates properties are flat types
- [ ] Clear error messages for invalid inputs