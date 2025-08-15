-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'advanced_hybrid_crud')
BEGIN
    CREATE DATABASE advanced_hybrid_crud;
END
GO

-- Create test database for E2E tests
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'advanced_hybrid_crud_test')
BEGIN
    CREATE DATABASE advanced_hybrid_crud_test;
END
GO

USE advanced_hybrid_crud;
GO

-- Enable snapshot isolation for better concurrent access
ALTER DATABASE advanced_hybrid_crud SET ALLOW_SNAPSHOT_ISOLATION ON;
ALTER DATABASE advanced_hybrid_crud SET READ_COMMITTED_SNAPSHOT ON;
GO

PRINT 'Database initialization completed successfully';