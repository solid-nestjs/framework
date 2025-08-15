-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'advanced_hybrid_crud')
BEGIN
    PRINT '🏗️ Creating database advanced_hybrid_crud...';
    CREATE DATABASE [advanced_hybrid_crud];
    PRINT '✅ Database advanced_hybrid_crud created successfully!';
END
ELSE
BEGIN
    PRINT '✅ Database advanced_hybrid_crud already exists.';
END
GO

-- Configure database settings
USE [advanced_hybrid_crud];
GO

-- Enable snapshot isolation for better concurrent access
ALTER DATABASE [advanced_hybrid_crud] SET ALLOW_SNAPSHOT_ISOLATION ON;
ALTER DATABASE [advanced_hybrid_crud] SET READ_COMMITTED_SNAPSHOT ON;
GO

PRINT '⚙️ Database configuration completed.';
GO