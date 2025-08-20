# Task 5: Add Automatic Validation Inference

**Feature**: Entity-to-DTO Code Generation  
**Task ID**: 202508191041  
**Status**: Pending  
**Estimated Time**: 2 hours  
**Dependencies**: Task 4  

## Objective

Implement automatic validation inference based on field types, following the rules in DECORATORS_AUTOMATIC_VALIDATION_INFERENCE.md.

## Requirements

1. **Validation Rules** (from documentation):
   - String → `@IsString()`, `@IsNotEmpty()`
   - Number → `@IsNumber()` or `@IsInt()`
   - Boolean → `@IsBoolean()`
   - Date → `@IsDate()`
   - Optional → `@IsOptional()`
   - Special flags (email, url, etc.) → corresponding validators

2. **Integration**:
   - Work with existing DecoratorRegistry
   - Complement transferred @SolidField decorators
   - Don't duplicate existing validations

## Implementation Steps

1. Update decorator transfer to ensure validation:
   ```typescript
   function ensureValidationDecorators(
     metadata: FieldMetadata,
     targetClass: Function,
     propertyKey: string | symbol
   ): void {
     const type = metadata.type;
     const options = metadata.options;
     
     // Check if validation should be inferred
     if (options.skipValidation || options.skip?.includes('validation')) {
       return;
     }
     
     // The @SolidField decorator already handles this
     // Just ensure the options have the right flags
     const enhancedOptions = {
       ...options,
       // Ensure type-specific validations are set
       ...(type === String && { isString: true }),
       ...(type === Number && { isNumber: true }),
       ...(type === Boolean && { isBoolean: true }),
       ...(type === Date && { isDate: true }),
     };
     
     // Apply enhanced @SolidField
     const decorator = SolidField(enhancedOptions);
     decorator(targetClass.prototype, propertyKey);
   }
   ```

2. Leverage existing validation inference:
   - The @SolidField decorator already infers validations
   - Ensure options are properly set for inference
   - Let DecoratorRegistry handle actual decorator application

3. Handle special validation cases:
   ```typescript
   function enhanceValidationOptions(
     options: SolidFieldOptions,
     type: any,
     isOptional: boolean
   ): SolidFieldOptions {
     return {
       ...options,
       nullable: isOptional || options.nullable,
       // Special validations are already in options
       // (email, url, uuid, integer, positive, etc.)
     };
   }
   ```

## Testing

- Test string field gets `@IsString()`, `@IsNotEmpty()`
- Test number field gets `@IsNumber()`
- Test optional field gets `@IsOptional()`
- Test email field gets `@IsEmail()`
- Test constraints (min, max, minLength, etc.)

## Integration with Existing System

Since @SolidField already handles validation inference:
1. Ensure transferred options trigger correct inference
2. Preserve all validation-related options
3. Let the existing DecoratorRegistry do the work

## Success Criteria

- [ ] Generated DTOs have appropriate validation decorators
- [ ] Validation works with NestJS ValidationPipe
- [ ] Special validations (email, url) are applied
- [ ] Optional fields handled correctly
- [ ] No duplicate validation decorators