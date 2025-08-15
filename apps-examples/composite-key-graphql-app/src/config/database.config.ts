import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

export default registerAs('database', (): DataSourceOptions => {
  const dbType = process.env.DB_TYPE || 'sqlite';
  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

  if (dbType === 'mssql') {
    const baseDbName = process.env.DB_DATABASE || 'composite_key_graphql_crud';
    const testDbName = isTestEnv ? `${baseDbName}_test` : baseDbName;

    return {
      type: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 1433,
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD,
      database: testDbName,
      entities: [Product, Supplier],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
      migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };
  }

  // Default SQLite configuration
  return {
    type: 'sqlite',
    database: isTestEnv ? ':memory:' : './database-data/products.sqlite',
    entities: [Product, Supplier],
    synchronize: true,
    logging: false,
  };
});