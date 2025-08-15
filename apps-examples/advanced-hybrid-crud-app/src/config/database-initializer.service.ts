import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// Standalone function for ensuring SQL Server database exists
export async function ensureSqlServerDatabase(config: any): Promise<void> {
    const dbName = config.database;
    console.log(`🔍 Checking if database '${dbName}' exists...`);

    // Create connection to master database first
    const masterConfig = {
      ...config,
      database: 'master', // Connect to master database first
      entities: [], // No entities needed for database creation
      synchronize: false,
      migrationsRun: false,
      logging: false,
    };

    let masterDataSource: DataSource;
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        console.log(`🔗 Attempting to connect to SQL Server (attempt ${retries + 1}/${maxRetries})...`);
        masterDataSource = new DataSource(masterConfig as any);
        await masterDataSource.initialize();
        console.log(`✅ Connected to SQL Server successfully!`);

        // Check if database exists
        const result = await masterDataSource.query(
          `SELECT database_id FROM sys.databases WHERE name = '${dbName}'`
        );

        if (result.length === 0) {
          console.log(`🏗️ Database '${dbName}' does not exist. Creating it...`);
          
          // Create the database
          await masterDataSource.query(`CREATE DATABASE [${dbName}]`);
          console.log(`✅ Database '${dbName}' created successfully!`);
          
          // Configure database settings
          try {
            await masterDataSource.query(`
              ALTER DATABASE [${dbName}] SET ALLOW_SNAPSHOT_ISOLATION ON;
              ALTER DATABASE [${dbName}] SET READ_COMMITTED_SNAPSHOT ON;
            `);
            console.log(`⚙️ Database '${dbName}' configuration completed.`);
          } catch (configError) {
            console.warn(`⚠️ Warning: Could not configure database settings:`, configError.message);
          }
        } else {
          console.log(`✅ Database '${dbName}' already exists.`);
        }
        
        // If we get here, everything worked
        return;
        
      } catch (error) {
        retries++;
        console.error(`❌ Error on attempt ${retries}: ${error.message}`);
        
        if (retries >= maxRetries) {
          console.error(`❌ Failed to ensure database exists after ${maxRetries} attempts`);
          console.log('⏳ TypeORM will handle connection retries during application startup...');
          return; // Don't throw, let TypeORM handle it
        }
        
        const waitTime = Math.min(1000 * Math.pow(2, retries), 10000); // Exponential backoff
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
      } finally {
        if (masterDataSource?.isInitialized) {
          try {
            await masterDataSource.destroy();
          } catch (destroyError) {
            console.warn('Warning: Error closing master connection:', destroyError.message);
          }
        }
      }
    }
  }

@Injectable()
export class DatabaseInitializerService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const dbConfig = this.configService.get('database');
    
    if (dbConfig?.type === 'mssql') {
      await ensureSqlServerDatabase(dbConfig);
    }
  }
}