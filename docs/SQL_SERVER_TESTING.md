# SQL Server Testing Guide

This document provides comprehensive instructions for testing the SOLID NestJS Framework with SQL Server.

## Prerequisites

### SQL Server Setup

1. **Install SQL Server** (one of the following options):
   - SQL Server Express (free)
   - SQL Server Developer Edition (free)
   - SQL Server in Docker container
   - Azure SQL Database

2. **Docker Setup (Recommended)**:
   ```bash
   # Pull SQL Server image
   docker pull mcr.microsoft.com/mssql/server:2022-latest
   
   # Run SQL Server container
   docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPassword123!" \
      -p 1433:1433 --name sqlserver \
      -d mcr.microsoft.com/mssql/server:2022-latest
   ```

### Connection Requirements

- SQL Server must accept SQL Server Authentication
- SA account or custom user with `dbcreator` and `sysadmin` roles
- TCP/IP protocol enabled
- Port 1433 open (or custom port configured)

## Configuration

### Environment Variables

Create or update the `.env` file in your application:

```env
# SQL Server Configuration
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourPassword123!
DB_DATABASE=your_app_database
DB_SYNCHRONIZE=true
DB_LOGGING=false
DB_MIGRATIONS_RUN=false

# Application Settings
NODE_ENV=development
PORT=3000

# GraphQL Settings (for hybrid apps)
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
SWAGGER_ENABLED=true
```

### Test Environment Configuration

For testing, the framework uses separate test databases. The database name will be automatically suffixed with `_test`:

```env
# Test environment will use: your_app_database_test
DB_DATABASE=your_app_database
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with coverage
npm run test:e2e:coverage

# Run specific test file
npm run test:e2e -- multiplicative-relations-filter.e2e-spec.ts
```

### Testing Specific Applications

**Important**: Currently, only the `apps-examples/advanced-hybrid-crud-app` is fully configured and tested for SQL Server compatibility.

```bash
# Advanced hybrid with all features (SQL Server compatible)
npm run test:e2e -w apps-examples/advanced-hybrid-crud-app
```

Other example applications are designed for SQLite and may require additional configuration for SQL Server:

```bash
# These applications may need SQL Server configuration updates:
# npm run test:e2e -w apps-examples/simple-crud-app
# npm run test:e2e -w apps-examples/simple-graphql-crud-app
# npm run test:e2e -w apps-examples/simple-hybrid-crud-app
# npm run test:e2e -w apps-examples/advanced-crud-app
# npm run test:e2e -w apps-examples/composite-key-graphql-app
```

**Recommendation**: Use `advanced-hybrid-crud-app` for SQL Server testing as it includes:
- Complete SQL Server configuration
- Database initialization service
- Proper test data cleanup
- All 102 E2E tests verified for SQL Server compatibility

## Database Management

### Automatic Database Creation

The framework automatically:
1. Creates the database if it doesn't exist
2. Configures snapshot isolation for better concurrency
3. Sets up proper transaction isolation levels

### Manual Database Management

```sql
-- Create database manually
CREATE DATABASE your_app_database;

-- Configure for optimal performance
ALTER DATABASE your_app_database SET ALLOW_SNAPSHOT_ISOLATION ON;
ALTER DATABASE your_app_database SET READ_COMMITTED_SNAPSHOT ON;

-- Check existing databases
SELECT name FROM sys.databases WHERE name LIKE '%your_app%';
```

### Test Data Cleanup

The framework provides automatic test data cleanup:

- **SQLite**: Creates fresh in-memory database for each test
- **SQL Server**: Reuses database with cleanup between tests

## Common Issues and Solutions

### Connection Issues

1. **SQL Server not accessible**:
   ```bash
   # Check if SQL Server is running
   docker ps  # for Docker installations
   
   # Test connection
   sqlcmd -S localhost,1433 -U sa -P YourPassword123!
   ```

2. **Authentication failures**:
   - Ensure SQL Server Authentication is enabled
   - Verify username/password combination
   - Check if user has sufficient permissions

3. **Port conflicts**:
   ```bash
   # Check what's running on port 1433
   netstat -an | grep 1433
   
   # Use custom port in Docker
   docker run -p 1533:1433 ... # Use port 1533 locally
   ```

### TypeORM Issues

1. **Synchronization errors**:
   ```bash
   # Clear TypeORM cache
   rm -rf dist/
   npm run build
   ```

2. **Migration conflicts**:
   ```sql
   -- Reset database schema
   DROP DATABASE your_app_database_test;
   -- Framework will recreate automatically
   ```

### Test-Specific Issues

1. **UUID Format Errors**:
   - SQL Server requires valid UUID format for UNIQUEIDENTIFIER columns
   - Use `'00000000-0000-0000-0000-000000000000'` for null UUIDs
   - Generate valid UUIDs with `crypto.randomUUID()` in Node.js

2. **Transaction Isolation**:
   - SQL Server uses different isolation levels than SQLite
   - Framework handles this automatically
   - For custom queries, use framework's transaction context

3. **Data Type Differences**:
   ```typescript
   // TypeORM handles most differences automatically
   @Column('uuid')  // becomes UNIQUEIDENTIFIER in SQL Server
   id: string;
   
   @Column('text')  // becomes NVARCHAR(MAX) in SQL Server
   description: string;
   
   @DeleteDateColumn()  // becomes DATETIME2 in SQL Server
   deletedAt?: Date;
   ```

## Performance Considerations

### SQL Server Optimization

1. **Indexes**: Framework creates appropriate indexes automatically
2. **Query Plans**: SQL Server optimizer handles most cases
3. **Connection Pooling**: TypeORM manages connection pool

### Test Performance

- **Parallel Tests**: Use `--maxWorkers=1` for SQL Server to avoid conflicts
- **Database Isolation**: Each test suite gets isolated data
- **Cleanup Strategy**: Optimized for SQL Server performance

## Debugging

### Enable Detailed Logging

```env
DB_LOGGING=true
```

### SQL Server Logs

```bash
# Docker container logs
docker logs sqlserver

# Query recent connections
SELECT * FROM sys.dm_exec_sessions WHERE is_user_process = 1;
```

### Framework Debug Mode

```bash
# Run tests with debug info
DEBUG=* npm run test:e2e
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: SQL Server Tests

on: [push, pull_request]

jobs:
  test-sqlserver:
    runs-on: ubuntu-latest
    
    services:
      sqlserver:
        image: mcr.microsoft.com/mssql/server:2022-latest
        env:
          ACCEPT_EULA: Y
          MSSQL_SA_PASSWORD: TestPassword123!
        ports:
          - 1433:1433
        options: >-
          --health-cmd="/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P TestPassword123! -Q 'SELECT 1'"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - run: npm ci
      - run: npm run build
      
      - name: Run SQL Server E2E Tests
        env:
          DB_TYPE: mssql
          DB_HOST: localhost
          DB_PORT: 1433
          DB_USERNAME: sa
          DB_PASSWORD: TestPassword123!
          DB_DATABASE: test_database
        run: npm run test:e2e
```

## Best Practices

### Test Organization

1. **Isolate Test Data**: Each test should create and clean its own data
2. **Use Transactions**: Leverage framework's transaction context
3. **Valid Data Types**: Always use SQL Server compatible data formats
4. **Cleanup Strategy**: Let framework handle cleanup automatically

### Development Workflow

1. **Local Development**: Use Docker for consistent SQL Server environment
2. **Test Data**: Create realistic test scenarios
3. **Performance Testing**: Monitor query performance with SQL Server tools
4. **Schema Changes**: Use TypeORM migrations for production deployments

### Security

1. **Strong Passwords**: Use complex passwords for SQL Server
2. **Network Security**: Restrict SQL Server access to necessary hosts
3. **Credential Management**: Use environment variables, never hardcode
4. **Principle of Least Privilege**: Create specific users for applications

## Support

For issues related to SQL Server testing:

1. Check SQL Server logs first
2. Verify connection parameters
3. Review framework test utilities in `test/test-database.config.ts`
4. Ensure SQL Server supports required features (isolation levels, etc.)

The framework is designed to handle SQL Server specifics automatically, but understanding these details helps with troubleshooting and optimization.