import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder } from '../interfaces/seeder.interface';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  /**
   * Execute all seeders in order
   * @param dataSource The TypeORM DataSource instance
   * @param seeders Array of seeder instances
   */
  async runSeeders(dataSource: DataSource, seeders: Seeder[]): Promise<void> {
    if (!seeders.length) {
      this.logger.log('No seeders to run');
      return;
    }

    // Sort seeders by order
    const sortedSeeders = [...seeders].sort((a, b) => a.getOrder() - b.getOrder());

    this.logger.log(`🌱 Starting seeding process with ${sortedSeeders.length} seeders...`);
    const startTime = Date.now();

    try {
      for (const seeder of sortedSeeders) {
        await seeder.run(dataSource);
      }

      const duration = Date.now() - startTime;
      this.logger.log(`🎉 Seeding completed successfully in ${duration}ms`);
    } catch (error) {
      this.logger.error('💥 Seeding process failed:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Check if any seeder needs to run
   * @param dataSource The TypeORM DataSource instance
   * @param seeders Array of seeder instances
   * @returns True if any seeder should run
   */
  async shouldRunAnySeeder(dataSource: DataSource, seeders: Seeder[]): Promise<boolean> {
    for (const seeder of seeders) {
      if (await seeder.shouldRun(dataSource)) {
        return true;
      }
    }
    return false;
  }
}