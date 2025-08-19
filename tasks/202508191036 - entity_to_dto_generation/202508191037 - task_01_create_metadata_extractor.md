# Task 1: Create Metadata Extractor Helper

**Feature**: Entity-to-DTO Code Generation  
**Task ID**: 202508191037  
**Status**: Pending  
**Estimated Time**: 2 hours  

## Objective

Create a helper function that extracts field metadata from entity classes, including type information, decorators, and validation rules.

## Requirements

1. **Function Location**: `packages-core/common/src/helpers/metadata-extractor.helper.ts`

2. **Main Functions**:
   ```typescript
   export function extractEntityFieldMetadata(EntityClass: Type): FieldMetadata[]
   export function isFlat Type(type: any): boolean
   export function shouldIncludeField(fieldName: string, metadata: FieldMetadata): boolean
   ```

3. **Functionality**:
   - Extract all field metadata from MetadataStorage
   - Identify field types using Reflect API
   - Classify properties as flat or complex
   - Filter out system fields (id, timestamps, relations)

## Implementation Steps

1. Create `metadata-extractor.helper.ts` file
2. Implement `extractEntityFieldMetadata`:
   - Use `MetadataStorage.getAllFieldMetadata(EntityClass)`
   - Get type information with `Reflect.getMetadata('design:type', ...)`
   - Return array of FieldMetadata

3. Implement `isFlatType`:
   - Check if type is string, number, boolean, or Date
   - Return false for arrays, objects, or custom classes

4. Implement `shouldIncludeField`:
   - Exclude 'id' field by default
   - Exclude timestamp fields (createdAt, updatedAt, deletedAt)
   - Exclude relational fields

## Testing

- Unit test for type detection (flat vs complex)
- Unit test for field filtering logic
- Test with various entity configurations

## Dependencies

- `MetadataStorage` from existing codebase
- `Reflect` API for type metadata
- TypeScript type definitions

## Success Criteria

- [ ] Successfully extracts metadata from any entity class
- [ ] Correctly identifies flat vs complex types
- [ ] Properly filters system and relational fields
- [ ] All unit tests pass