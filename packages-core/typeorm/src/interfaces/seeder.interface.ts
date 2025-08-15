import { DataSource } from 'typeorm';

export interface Seeder {
  /**
   * Execute the seeder to populate data
   * @param dataSource The TypeORM DataSource instance
   */
  seed(dataSource: DataSource): Promise<void>;

  /**
   * Check if the seeder should run (e.g., check if data already exists)
   * @param dataSource The TypeORM DataSource instance
   * @returns True if seeder should run, false otherwise
   */
  shouldRun(dataSource: DataSource): Promise<boolean>;

  /**
   * Get the order priority for this seeder (lower numbers run first)
   */
  getOrder(): number;

  /**
   * Get a descriptive name for this seeder
   */
  getName(): string;

  /**
   * Execute the seeder with proper logging
   * @param dataSource The TypeORM DataSource instance
   */
  run(dataSource: DataSource): Promise<void>;
}