# Task: SQL Server Support for Advanced Hybrid CRUD App

## Summary
Configure the advanced-hybrid-crud-app to support both SQLite and SQL Server databases through environment variables, with Docker Compose setup for SQL Server and E2E test support for both databases.

## Task List

- [x] Install SQL Server dependencies
- [x] Create environment configuration files
- [x] Create database configuration module
- [x] Update app.module.ts with dynamic configuration
- [x] Create Docker Compose setup
- [x] Update E2E test configuration
- [x] Update entity definitions for SQL Server compatibility
- [x] Add npm scripts for Docker and testing
- [x] Update documentation

## Implementation Details

### Dependencies to Install
- mssql (SQL Server driver for Node.js)
- @nestjs/config (configuration management)
- dotenv (environment variable support)

### Environment Files
- .env.example - Template with all variables
- .env.development - SQLite configuration
- .env.sqlserver - SQL Server configuration

### Docker Setup
- SQL Server 2022 Developer Edition
- Port 1433 exposed
- SA password configuration
- Health check implementation

### Test Configuration
- Support DB_TYPE environment variable
- SQLite in-memory for default tests
- SQL Server for integration tests
- Test data isolation