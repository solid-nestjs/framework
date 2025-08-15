import { DataSource } from 'typeorm';
import { ensureSqlServerDatabase } from '../src/config/database-initializer.service';

// Global test data source for SQL Server (reused across tests for performance)
let globalTestDataSource: DataSource | null = null;

export async function createTestDataSource(): Promise<DataSource> {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'mssql') {
    // For SQL Server, reuse the same connection across tests for better performance
    if (globalTestDataSource?.isInitialized) {
      return globalTestDataSource;
    }

    const baseDbName = process.env.DB_DATABASE || 'composite_key_graphql_crud';
    const testDbName = `${baseDbName}_test`;

    const config = {
      type: 'mssql' as const,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 1433,
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD,
      database: testDbName,
      entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
      dropSchema: false, // Don't drop schema automatically
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };

    try {
      // Ensure the database exists before connecting
      await ensureSqlServerDatabase(config);

      globalTestDataSource = new DataSource(config);
      await globalTestDataSource.initialize();
      
      return globalTestDataSource;
    } catch (error) {
      console.error('Failed to create SQL Server test data source:', error);
      throw error;
    }
  }

  // For SQLite, create a fresh in-memory database
  const dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
  });
  
  await dataSource.initialize();
  return dataSource;
}

export async function cleanupTestData(dataSource: DataSource): Promise<void> {
  if (process.env.DB_TYPE === 'mssql') {
    // For SQL Server, clean up data but keep schema
    const entities = dataSource.entityMetadatas;
    
    try {
      // Disable foreign key constraints temporarily
      await dataSource.query('EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"');
      
      // Clear all tables in reverse order to handle foreign keys
      for (const entity of entities.reverse()) {
        await dataSource.query(`DELETE FROM ${entity.tableName}`);
        
        // Reset identity columns if they exist
        try {
          await dataSource.query(`DBCC CHECKIDENT ('${entity.tableName}', RESEED, 0)`);
        } catch {
          // Ignore errors for tables without identity columns
        }
      }
      
      // Re-enable foreign key constraints
      await dataSource.query('EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"');
    } catch (error) {
      console.error('Error cleaning up SQL Server test data:', error);
      throw error;
    }
  }
  // SQLite creates a fresh database each time, so no cleanup needed
}

export async function destroyTestDataSource(): Promise<void> {
  if (globalTestDataSource?.isInitialized) {
    try {
      await globalTestDataSource.destroy();
      globalTestDataSource = null;
    } catch (error) {
      console.error('Error destroying test data source:', error);
    }
  }
}