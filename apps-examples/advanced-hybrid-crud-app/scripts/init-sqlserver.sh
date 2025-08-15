#!/bin/bash

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &

# Wait for SQL Server to be available
echo "⏳ Waiting for SQL Server to start..."
for i in {1..90}; do
    if /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -Q "SELECT 1" > /dev/null 2>&1; then
        echo "✅ SQL Server is ready!"
        break
    fi
    if [ $i -eq 90 ]; then
        echo "❌ SQL Server failed to start within 90 seconds"
        exit 1
    fi
    echo "  Waiting... ($i/90)"
    sleep 2
done

# Create the database
echo "🏗️ Creating database..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -Q "
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'advanced_hybrid_crud')
BEGIN
    CREATE DATABASE [advanced_hybrid_crud];
    PRINT 'Database created successfully';
END
ELSE
BEGIN
    PRINT 'Database already exists';
END

USE [advanced_hybrid_crud];
ALTER DATABASE [advanced_hybrid_crud] SET ALLOW_SNAPSHOT_ISOLATION ON;
ALTER DATABASE [advanced_hybrid_crud] SET READ_COMMITTED_SNAPSHOT ON;
PRINT 'Database configuration complete';
"

echo "✅ Database initialization complete!"

# Keep the container running
wait