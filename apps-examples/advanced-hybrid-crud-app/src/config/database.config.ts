import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SqlServerConnectionOptions } from 'typeorm/driver/sqlserver/SqlServerConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceDetail } from '../invoices/entities/invoice-detail.entity';
import { Client } from '../clients/entities/client.entity';

// Helper function to ensure MySQL database exists
async function ensureMysqlDatabase(config: any): Promise<void> {
  const dbName = config.database;
  // Create connection to mysql database first
  const masterConfig = {
    ...config,
    database: 'mysql', // Connect to mysql database first
    entities: [], // No entities needed for database creation
    synchronize: false,
    migrationsRun: false,
    logging: true,
  };

  let masterDataSource: DataSource;
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      masterDataSource = new DataSource(masterConfig as any);
      await masterDataSource.initialize();

      // Check if database exists
      const result = await masterDataSource.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbName}'`,
      );

      if (result.length === 0) {
        // Create the database
        await masterDataSource.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      }

      return;
    } catch (error) {
      retries++;

      if (retries >= maxRetries) {
        return; // Don't throw, let TypeORM handle it
      }

      const waitTime = Math.min(1000 * Math.pow(2, retries), 10000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    } finally {
      if (masterDataSource?.isInitialized) {
        try {
          await masterDataSource.destroy();
        } catch (destroyError) {
          // Warning: Error closing master connection
        }
      }
    }
  }
}

// Helper function to ensure SQL Server database exists
async function ensureSqlServerDatabase(config: any): Promise<void> {
  const dbName = config.database;
  // Checking if database exists

  // Create connection to master database first
  const masterConfig = {
    ...config,
    database: 'master', // Connect to master database first
    entities: [], // No entities needed for database creation
    synchronize: false,
    migrationsRun: false,
    logging: true,
  };

  let masterDataSource: DataSource;
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Attempting to connect to SQL Server
      masterDataSource = new DataSource(masterConfig as any);
      await masterDataSource.initialize();
      // Connected to SQL Server successfully

      // Check if database exists
      const result = await masterDataSource.query(
        `SELECT database_id FROM sys.databases WHERE name = '${dbName}'`,
      );

      if (result.length === 0) {
        // Database does not exist. Creating it...

        // Create the database
        await masterDataSource.query(`CREATE DATABASE [${dbName}]`);
        // Database created successfully

        // Configure database settings
        try {
          await masterDataSource.query(`
            ALTER DATABASE [${dbName}] SET ALLOW_SNAPSHOT_ISOLATION ON;
            ALTER DATABASE [${dbName}] SET READ_COMMITTED_SNAPSHOT ON;
          `);
          // Database configuration completed
        } catch (configError) {
          // Warning: Could not configure database settings
        }
      } else {
        // Database already exists
      }

      // If we get here, everything worked
      return;
    } catch (error) {
      retries++;
      // Error on attempt

      if (retries >= maxRetries) {
        // Failed to ensure database exists after max attempts
        // TypeORM will handle connection retries during application startup...
        return; // Don't throw, let TypeORM handle it
      }

      const waitTime = Math.min(1000 * Math.pow(2, retries), 10000); // Exponential backoff
      // Waiting before retry...
      await new Promise(resolve => setTimeout(resolve, waitTime));
    } finally {
      if (masterDataSource?.isInitialized) {
        try {
          await masterDataSource.destroy();
        } catch (destroyError) {
          // Warning: Error closing master connection
        }
      }
    }
  }
}

export default registerAs('database', (): TypeOrmModuleOptions => {
  const dbType = process.env.DB_TYPE || 'sqlite';

  // Database configuration loaded

  const entities = [Product, Supplier, Invoice, InvoiceDetail, Client];

  // Common configuration with defaults for SQLite when no .env file
  const commonConfig: Partial<TypeOrmModuleOptions> = {
    entities,
    synchronize: process.env.DB_SYNCHRONIZE
      ? process.env.DB_SYNCHRONIZE === 'true'
      : dbType === 'sqlite',
    logging: process.env.DB_LOGGING ? process.env.DB_LOGGING === 'true' : true,
    migrationsRun: process.env.DB_MIGRATIONS_RUN
      ? process.env.DB_MIGRATIONS_RUN === 'true'
      : false,
    retryAttempts: 10,
    retryDelay: 3000,
  };

  // Database-specific configuration
  switch (dbType) {
    case 'mssql':
      return {
        ...commonConfig,
        type: 'mssql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '1433', 10),
        username: process.env.DB_USERNAME || 'sa',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'advanced_hybrid_crud',
        options: {
          encrypt: false, // For local development
          trustServerCertificate: true, // For self-signed certificates
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000,
        },
        connectionTimeout: 30000,
        requestTimeout: 30000,
        // Custom connection factory that ensures database exists
        extra: {
          onConnect: async (connection: any) => {
            // Connected to SQL Server successfully
          },
        },
      } as SqlServerConnectionOptions;

    case 'postgres':
      return {
        ...commonConfig,
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'advanced_hybrid_crud',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        poolSize: 10,
        connectTimeoutMS: 30000,
        // Important: Quote identifiers for PostgreSQL to handle camelCase properly
        extra: {
          // This ensures TypeORM quotes identifiers in PostgreSQL
          options: '-c search_path=public',
        },
      } as PostgresConnectionOptions;

    case 'mysql':
      return {
        ...commonConfig,
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'advanced_hybrid_crud',
        charset: 'utf8mb4',
        timezone: '+00:00',
      } as MysqlConnectionOptions;

    case 'sqlite':
    default:
      return {
        ...commonConfig,
        type: 'sqlite',
        database:
          process.env.SQLITE_DATABASE || './database-data/products.sqlite',
      } as SqliteConnectionOptions;
  }
});

// Helper function to get database configuration for testing
export const getDatabaseConfig = (
  overrides?: Partial<TypeOrmModuleOptions>,
): TypeOrmModuleOptions => {
  const baseConfig = registerAs('database', (): TypeOrmModuleOptions => {
    const dbType = process.env.DB_TYPE || 'sqlite';

    const entities = [Product, Supplier, Invoice, InvoiceDetail, Client];

    // Common configuration
    const commonConfig: Partial<TypeOrmModuleOptions> = {
      entities,
      synchronize: true,
      logging: true,
      dropSchema: true, // For testing
    };

    // Database-specific configuration for testing
    switch (dbType) {
      case 'mssql':
        return {
          ...commonConfig,
          type: 'mssql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '1433', 10),
          username: process.env.DB_USERNAME || 'sa',
          password: process.env.DB_PASSWORD,
          database: `${process.env.DB_DATABASE || 'advanced_hybrid_crud'}_test_${Date.now()}`,
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        } as SqlServerConnectionOptions;

      case 'postgres':
        return {
          ...commonConfig,
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD,
          database: `${process.env.DB_DATABASE || 'advanced_hybrid_crud'}_test_${Date.now()}`,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        } as PostgresConnectionOptions;

      case 'mysql':
        return {
          ...commonConfig,
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306', 10),
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD,
          database: `${process.env.DB_DATABASE || 'advanced_hybrid_crud'}_test_${Date.now()}`,
          charset: 'utf8mb4',
          timezone: '+00:00',
        } as MysqlConnectionOptions;

      case 'sqlite':
      default:
        return {
          ...commonConfig,
          type: 'sqlite',
          database: ':memory:', // In-memory database for testing
        } as SqliteConnectionOptions;
    }
  })();

  return { ...baseConfig, ...overrides } as TypeOrmModuleOptions;
};
