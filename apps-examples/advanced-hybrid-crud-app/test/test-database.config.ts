import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Product } from '../src/products/entities/product.entity';
import { Supplier } from '../src/suppliers/entities/supplier.entity';
import { Invoice } from '../src/invoices/entities/invoice.entity';
import { InvoiceDetail } from '../src/invoices/entities/invoice-detail.entity';
import { Client } from '../src/clients/entities/client.entity';

// Singleton para mantener una sola conexión durante todas las pruebas
let sharedDataSource: DataSource | null = null;
let isSchemaInitialized = false;

// Helper function to ensure SQL Server database exists for tests
const ensureTestDatabase = async (dbName: string): Promise<void> => {
  const masterConfig = {
    type: 'mssql' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD,
    database: 'master',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const masterDataSource = new DataSource(masterConfig);
    await masterDataSource.initialize();
    
    // Check if database exists
    const result = await masterDataSource.query(
      `SELECT database_id FROM sys.databases WHERE name = '${dbName}'`
    );

    if (result.length === 0) {
      await masterDataSource.query(`CREATE DATABASE [${dbName}]`);
      
      // Configure database for better test performance
      await masterDataSource.query(`
        ALTER DATABASE [${dbName}] SET RECOVERY SIMPLE;
        ALTER DATABASE [${dbName}] SET AUTO_UPDATE_STATISTICS OFF;
      `);
    }
    
    await masterDataSource.destroy();
  } catch (error) {
    console.warn('Warning: Could not ensure test database exists:', error.message);
  }
};

export const getTestDatabaseConfig = async (): Promise<TypeOrmModuleOptions> => {
  const dbType = process.env.DB_TYPE || 'sqlite';
  const entities = [Product, Supplier, Invoice, InvoiceDetail, Client];
  
  switch (dbType) {
    case 'mssql':
      // Use a FIXED database name for all tests (no timestamp)
      const dbName = 'advanced_hybrid_crud_test';
      
      // Ensure database exists before creating config
      await ensureTestDatabase(dbName);
      
      return {
        type: 'mssql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '1433', 10),
        username: process.env.DB_USERNAME || 'sa',
        password: process.env.DB_PASSWORD,
        database: dbName,
        entities,
        synchronize: !isSchemaInitialized, // Only sync schema once
        dropSchema: false, // Never drop schema, just clean data
        logging: false,
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
        // Connection pooling for better performance
        pool: {
          max: 10,
          min: 2,
          idleTimeoutMillis: 30000,
        },
        connectionTimeout: 5000,
        requestTimeout: 10000,
      };
      
    case 'sqlite':
    default:
      return {
        type: 'sqlite',
        database: ':memory:',
        entities,
        synchronize: true,
        dropSchema: true,
        logging: false,
      };
  }
};

export const createTestDataSource = async (): Promise<DataSource> => {
  const dbType = process.env.DB_TYPE || 'sqlite';
  
  // For SQL Server, reuse the same DataSource for all tests
  if (dbType === 'mssql') {
    if (!sharedDataSource || !sharedDataSource.isInitialized) {
      const config = await getTestDatabaseConfig();
      sharedDataSource = new DataSource(config as any);
      await sharedDataSource.initialize();
      
      // Mark schema as initialized after first successful connection
      isSchemaInitialized = true;
    }
    return sharedDataSource;
  }
  
  // For SQLite, create new in-memory database for each test
  const config = await getTestDatabaseConfig();
  const dataSource = new DataSource(config as any);
  await dataSource.initialize();
  return dataSource;
};

// Efficient data cleanup for SQL Server (keeps schema intact)
export const cleanupTestData = async (dataSource?: DataSource): Promise<void> => {
  const ds = dataSource || sharedDataSource;
  
  if (!ds || !ds.isInitialized || ds.options.type !== 'mssql') {
    return;
  }

  const queryRunner = ds.createQueryRunner();
  await queryRunner.connect();
  
  try {
    // Get all table names except system tables
    const tables = await queryRunner.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_CATALOG = DB_NAME()
      AND TABLE_NAME NOT LIKE 'typeorm_%'
      ORDER BY TABLE_NAME
    `);
    
    if (tables.length > 0) {
      // Disable all foreign key constraints
      await queryRunner.query('EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"');
      
      // Delete data from all tables (TRUNCATE is faster but doesn't work with FK)
      for (const table of tables) {
        try {
          await queryRunner.query(`DELETE FROM [${table.TABLE_NAME}]`);
          
          // Reset identity if table has one
          const hasIdentity = await queryRunner.query(`
            SELECT 1 FROM sys.identity_columns 
            WHERE OBJECT_NAME(object_id) = '${table.TABLE_NAME}'
          `);
          
          if (hasIdentity.length > 0) {
            await queryRunner.query(`DBCC CHECKIDENT ('[${table.TABLE_NAME}]', RESEED, 0)`);
          }
        } catch (error) {
          console.warn(`Warning: Could not clean table ${table.TABLE_NAME}:`, error.message);
        }
      }
      
      // Re-enable all foreign key constraints
      await queryRunner.query('EXEC sp_MSforeachtable "ALTER TABLE ? CHECK CONSTRAINT all"');
    }
  } catch (error) {
    console.error('Error during test data cleanup:', error);
  } finally {
    await queryRunner.release();
  }
};

// Clean up shared connection after all tests
export const destroyTestDataSource = async (): Promise<void> => {
  if (sharedDataSource && sharedDataSource.isInitialized) {
    await sharedDataSource.destroy();
    sharedDataSource = null;
    isSchemaInitialized = false;
  }
};

// Global cleanup hook - can be called in Jest's globalTeardown
export const cleanupAllTestDatabases = async (): Promise<void> => {
  if (process.env.DB_TYPE !== 'mssql') {
    return;
  }
  
  const masterConfig = {
    type: 'mssql' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD,
    database: 'master',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const masterDataSource = new DataSource(masterConfig);
    await masterDataSource.initialize();
    
    // Find and remove old test databases (older than 1 hour)
    const oldDatabases = await masterDataSource.query(`
      SELECT name 
      FROM sys.databases 
      WHERE name LIKE 'advanced_hybrid_crud_test_%'
      AND create_date < DATEADD(hour, -1, GETDATE())
    `);
    
    for (const db of oldDatabases) {
      try {
        await masterDataSource.query(`
          ALTER DATABASE [${db.name}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
          DROP DATABASE [${db.name}];
        `);
        console.log(`Cleaned up old test database: ${db.name}`);
      } catch (error) {
        console.warn(`Could not clean up database ${db.name}:`, error.message);
      }
    }
    
    await masterDataSource.destroy();
  } catch (error) {
    console.warn('Could not clean up old test databases:', error.message);
  }
};