# E2E Tests for Composite Key GraphQL App

This directory contains end-to-end tests for the composite-key-graphql-app, which demonstrates GraphQL CRUD operations with composite primary keys using the SOLID NestJS Framework.

## Overview

The tests are designed to verify that the composite key functionality works correctly with GraphQL operations. Unlike simple primary keys, composite keys consist of multiple fields that together form a unique identifier.

## Test Structure

### Suppliers API (Composite Keys)

- **Create**: Tests creating suppliers with composite keys (`type` + `code`)
- **Read**: Tests retrieving all suppliers and single suppliers by composite key
- **Update**: Tests updating suppliers using composite key identification
- **Delete**: Tests removing suppliers using composite key identification

### Products API (Composite Keys)

- **Create**: Tests creating products with composite keys and relationships
- **Read**: Tests retrieving all products and single products by composite key
- **Update**: Tests updating products using composite key identification
- **Delete**: Tests removing products using composite key identification

### Composite Key Relationships

- Tests the basic creation and retrieval of entities with composite keys
- Verifies that composite key structure is properly maintained
- Tests relationship queries (supplier with products)

### GraphQL Features with Composite Keys

- **Introspection**: Verifies GraphQL schema introspection works
- **Aliases**: Tests GraphQL field aliases with composite keys
- **Error Handling**: Tests graceful handling of invalid composite keys
- **Validation**: Tests field validation for required composite key components

### Pagination and Filtering

- **Pagination**: Tests pagination with composite key entities
- **Filtering**: Tests filtering operations (name contains, etc.)
- **Ordering**: Tests ordering results with composite keys

## Key Differences from Simple Keys

1. **ID Structure**: Instead of simple string/number IDs, composite keys use objects:

   ```graphql
   # Simple key
   supplier(id: "123")

   # Composite key
   supplier(id: { type: "VENDOR", code: 1 })
   ```

2. **GraphQL ID Type**: The framework uses GraphQL's `ID` scalar type, which returns values as strings even for numeric fields.

3. **Auto-increment**: The `code` field is auto-incremented while `type` is provided by the user.

## Test Configuration

- **Database**: Uses SQLite in-memory database (`:memory:`)
- **Environment**: Isolated test environment with database reset between tests
- **Framework**: Uses the SOLID NestJS TypeORM GraphQL CRUD framework

## Running Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run specific test pattern
npm run test:e2e -- --testNamePattern="should create a supplier"

# Run with verbose output
npm run test:e2e -- --verbose
```

## Test Data

The tests use the following composite key structure:

**Suppliers:**

- `type`: String (e.g., "VENDOR", "MANUFACTURER")
- `code`: Auto-incremented number

**Products:**

- `type`: String (e.g., "ELECTRONICS", "CLOTHING")
- `code`: Auto-incremented number

## Important Notes

1. **ID Conversion**: GraphQL ID fields return strings, so numeric comparisons require `parseInt()`.

2. **Relationship Complexity**: Direct relationships with composite keys may have limitations in the current framework version.

3. **Auto-increment Behavior**: The `code` field is automatically assigned and incremented by the framework.

4. **Memory Database**: Each test run starts with a fresh database, ensuring test isolation.

## Framework Testing

These tests specifically validate:

- Composite primary key support in TypeORM entities
- GraphQL schema generation for composite keys
- CRUD operations with composite key identification
- Auto-increment functionality for composite key components
- Query and mutation operations with complex key structures

The tests serve as both validation and documentation for composite key usage in the SOLID NestJS Framework.
