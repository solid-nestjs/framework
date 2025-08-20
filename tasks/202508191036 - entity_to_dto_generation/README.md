# Entity-to-DTO Code Generation - Task List

**Feature**: Entity-to-DTO Code Generation  
**Start Date**: August 19, 2025  
**Status**: Planning Complete

## Task Execution Order

### Phase 1: Core Infrastructure (Common Package)
1. **Task 1** - Create Metadata Extractor Helper ✅ (Merged into Task 9)
2. **Task 2** - Implement Property Filtering Logic ✅ (Merged into Task 9)
3. **Task 9** - Create Common Base Implementation (NEW)
   - Consolidates Tasks 1 & 2
   - Provides base helpers for all packages
   - **Duration**: 2 hours

### Phase 2: Package-Specific Implementations
4. **Task 3** - Create GenerateDtoFromEntity Mixin (3 packages)
   - REST API implementation
   - GraphQL implementation
   - REST-GraphQL implementation
   - **Duration**: 4 hours

5. **Task 4** - Implement Decorator Transfer Logic
   - Package-specific decorator handling
   - Swagger, GraphQL, and validation decorators
   - **Duration**: 3 hours

6. **Task 5** - Add Automatic Validation Inference
   - Leverage existing SOLID validation system
   - **Duration**: 2 hours

### Phase 3: Testing & Integration
7. **Task 6** - Create Unit Tests
   - Test all helpers and implementations
   - **Duration**: 3 hours

8. **Task 7** - Update Example Application
   - Demonstrate usage in advanced-hybrid-crud-app
   - **Duration**: 2 hours

### Phase 4: Documentation
9. **Task 8** - Create Documentation
   - API reference, usage guide, migration guide
   - **Duration**: 2 hours

## Total Estimated Time: 18 hours

## Key Changes from Original Plan

1. **Multiple Package Implementation**: Instead of a single implementation in `common`, we now have three package-specific implementations to properly handle Swagger, GraphQL, and combined decorators.

2. **Decorator Transfer**: Extended to include native NestJS decorators (@ApiProperty, @Field) in addition to SOLID decorators.

3. **Common Base**: Added Task 9 to create shared infrastructure in the common package that all three implementations will use.

## Implementation Notes

- Each package (rest-api, graphql, rest-graphql) will have its own `GenerateDtoFromEntity` helper
- The common package provides base functionality for metadata extraction and property filtering
- Decorator transfer is package-specific to handle different decorator types appropriately
- The implementation follows the same pattern as the existing `PartialType` helper in rest-graphql

## Dependencies

- `@nestjs/swagger` (for rest-api and rest-graphql)
- `@nestjs/graphql` (for graphql and rest-graphql)
- `class-validator` (all packages)
- `class-transformer` (all packages)
- `reflect-metadata` (all packages)