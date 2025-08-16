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

// Helper function to ensure MySQL database exists for tests
const ensureMysqlTestDatabase = async (dbName: string): Promise<void> => {
  const masterConfig = {
    type: 'mysql' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD,
    database: 'mysql', // Connect to mysql database to create test database
    charset: 'utf8mb4',
  };

  try {
    const masterDataSource = new DataSource(masterConfig);
    await masterDataSource.initialize();
    
    // Check if database exists
    const result = await masterDataSource.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbName}'`
    );

    if (result.length === 0) {
      // Create database
      await masterDataSource.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    }
    
    await masterDataSource.destroy();
  } catch (error) {
    console.warn('Warning: Could not ensure MySQL test database exists:', error.message);
  }
};

// Helper function to ensure PostgreSQL database exists for tests
const ensurePostgresTestDatabase = async (dbName: string): Promise<void> => {
  const masterConfig = {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to postgres database to create test database
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };

  try {
    const masterDataSource = new DataSource(masterConfig);
    await masterDataSource.initialize();
    
    // Check if database exists
    const result = await masterDataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );

    if (result.length === 0) {
      // Create database
      await masterDataSource.query(`CREATE DATABASE ${dbName}`);
    }
    
    await masterDataSource.destroy();
  } catch (error) {
    console.warn('Warning: Could not ensure PostgreSQL test database exists:', error.message);
  }
};

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
      
    case 'postgres':
      // Use a test database name for PostgreSQL tests
      const pgDbName = 'advanced_hybrid_crud_test';
      
      // Ensure database exists before creating config
      await ensurePostgresTestDatabase(pgDbName);
      
      return {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD,
        database: pgDbName,
        entities,
        synchronize: !isSchemaInitialized, // Only sync schema once
        dropSchema: false, // Never drop schema, just clean data
        logging: false,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        poolSize: 10,
        connectTimeoutMS: 5000,
      };
      
    case 'mysql':
      // Use a test database name for MySQL tests
      const mysqlDbName = 'advanced_hybrid_crud_test';
      
      // Ensure database exists before creating config
      await ensureMysqlTestDatabase(mysqlDbName);
      
      return {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD,
        database: mysqlDbName,
        entities,
        synchronize: !isSchemaInitialized, // Only sync schema once
        dropSchema: false, // Never drop schema, just clean data
        logging: false,
        charset: 'utf8mb4',
        timezone: '+00:00',
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
  
  // For SQL Server, PostgreSQL, and MySQL, reuse the same DataSource for all tests
  if (dbType === 'mssql' || dbType === 'postgres' || dbType === 'mysql') {
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

// Efficient data cleanup for SQL Server and PostgreSQL (keeps schema intact)
export const cleanupTestData = async (dataSource?: DataSource): Promise<void> => {
  const ds = dataSource || sharedDataSource;
  
  if (!ds || !ds.isInitialized) {
    return;
  }
  
  // Only clean data for SQL Server, PostgreSQL, and MySQL - SQLite uses fresh in-memory DB for each test
  if (ds.options.type !== 'mssql' && ds.options.type !== 'postgres' && ds.options.type !== 'mysql') {
    return;
  }

  const queryRunner = ds.createQueryRunner();
  await queryRunner.connect();
  
  try {
    if (ds.options.type === 'postgres') {
      // PostgreSQL-specific cleanup
      try {
        // First, disable triggers temporarily
        await queryRunner.query('SET session_replication_role = replica;');
        
        const tables = await queryRunner.query(`
          SELECT tablename 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename NOT LIKE 'typeorm_%'
          ORDER BY tablename
        `);
        
        if (tables.length > 0) {
          const tableNames = tables.map(t => `"${t.tablename}"`).join(', ');
          
          // Truncate all tables at once with CASCADE to handle foreign keys
          await queryRunner.query(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`);
        }
      } finally {
        // Re-enable triggers
        await queryRunner.query('SET session_replication_role = DEFAULT;');
      }
    } else if (ds.options.type === 'mysql') {
      // MySQL-specific cleanup
      try {
        // Disable foreign key checks temporarily
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');
        
        const tables = await queryRunner.query(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_TYPE = 'BASE TABLE'
          AND TABLE_NAME NOT LIKE 'typeorm_%'
          ORDER BY TABLE_NAME
        `);
        
        if (tables.length > 0) {
          // Truncate all tables at once
          for (const table of tables) {
            await queryRunner.query(`TRUNCATE TABLE \`${table.TABLE_NAME}\``);
          }
        }
      } finally {
        // Re-enable foreign key checks
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
      }
    } else if (ds.options.type === 'mssql') {
      // SQL Server-specific cleanup
      const tables = await queryRunner.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_CATALOG = DB_NAME()
        AND TABLE_NAME NOT LIKE 'typeorm_%'
        ORDER BY TABLE_NAME
      `);
      
      if (tables.length > 0) {
        // Get table names in reverse order for proper deletion (respecting FK constraints)
        const tableNames = tables.map(t => t.TABLE_NAME);
        
        try {
          // Disable all foreign key constraints
          await queryRunner.query('EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"');
          
          // Delete data from all tables
          for (const tableName of tableNames) {
            await queryRunner.query(`DELETE FROM [${tableName}]`);
            
            // Reset identity if table has one
            const hasIdentity = await queryRunner.query(`
              SELECT 1 FROM sys.identity_columns 
              WHERE OBJECT_NAME(object_id) = '${tableName}'
            `);
            
            if (hasIdentity.length > 0) {
              await queryRunner.query(`DBCC CHECKIDENT ('[${tableName}]', RESEED, 0)`);
            }
          }
        } finally {
          // Always re-enable foreign key constraints
          await queryRunner.query('EXEC sp_MSforeachtable "ALTER TABLE ? CHECK CONSTRAINT all"');
        }
      }
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