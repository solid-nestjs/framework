import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder } from '../interfaces/seeder.interface';

export abstract class BaseSeeder implements Seeder {
  protected readonly logger = new Logger(this.constructor.name);

  abstract seed(dataSource: DataSource): Promise<void>;
  abstract shouldRun(dataSource: DataSource): Promise<boolean>;
  abstract getOrder(): number;
  abstract getName(): string;

  /**
   * Check if a table is empty
   * @param dataSource The TypeORM DataSource instance
   * @param tableName The name of the table to check
   * @returns True if table is empty, false otherwise
   */
  protected async isTableEmpty(dataSource: DataSource, tableName: string): Promise<boolean> {
    try {
      const result = await dataSource.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = parseInt(result[0]?.count || '0', 10);
      return count === 0;
    } catch (error) {
      this.logger.warn(`Could not check table ${tableName}:`, (error as Error).message);
      return false;
    }
  }

  /**
   * Execute the seeder with proper logging
   * @param dataSource The TypeORM DataSource instance
   */
  async run(dataSource: DataSource): Promise<void> {
    const shouldRun = await this.shouldRun(dataSource);
    
    if (!shouldRun) {
      this.logger.log(`Skipping ${this.getName()} - data already exists`);
      return;
    }

    this.logger.log(`Running ${this.getName()}...`);
    const startTime = Date.now();
    
    try {
      await this.seed(dataSource);
      const duration = Date.now() - startTime;
      this.logger.log(`✅ ${this.getName()} completed in ${duration}ms`);
    } catch (error) {
      this.logger.error(`❌ ${this.getName()} failed:`, (error as Error).message);
      throw error;
    }
  }
}