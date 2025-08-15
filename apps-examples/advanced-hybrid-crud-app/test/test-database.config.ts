import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Product } from '../src/products/entities/product.entity';
import { Supplier } from '../src/suppliers/entities/supplier.entity';
import { Invoice } from '../src/invoices/entities/invoice.entity';
import { InvoiceDetail } from '../src/invoices/entities/invoice-detail.entity';
import { Client } from '../src/clients/entities/client.entity';

// Helper function to ensure SQL Server database exists for tests
const ensureTestDatabase = async (dbName: string): Promise<void> => {
  const masterConfig = {
    type: 'mssql' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'YourStrong@Password123',
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
    }
    
    await masterDataSource.destroy();
  } catch (error) {
    // Database creation failed - tests may still pass with fallback database
  }
};

export const getTestDatabaseConfig = async (): Promise<TypeOrmModuleOptions> => {
  const dbType = process.env.DB_TYPE || 'sqlite';
  const entities = [Product, Supplier, Invoice, InvoiceDetail, Client];
  
  switch (dbType) {
    case 'mssql':
      const dbName = `advanced_hybrid_crud_test_${Date.now()}`;
      
      // Ensure database exists before creating config
      await ensureTestDatabase(dbName);
      
      return {
        type: 'mssql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '1433', 10),
        username: process.env.DB_USERNAME || 'sa',
        password: process.env.DB_PASSWORD || 'YourStrong@Password123',
        database: dbName,
        entities,
        synchronize: true,
        dropSchema: true,
        logging: false,
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
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
  const config = await getTestDatabaseConfig();
  const dataSource = new DataSource(config as any);
  await dataSource.initialize();
  return dataSource;
};