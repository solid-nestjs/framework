import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class SuppliersSeeder extends BaseSeeder {
  getName(): string {
    return 'Suppliers Seeder (GraphQL)';
  }

  getOrder(): number {
    return 1; // Run first
  }

  async shouldRun(dataSource: DataSource): Promise<boolean> {
    return await this.isTableEmpty(dataSource, 'supplier');
  }

  async seed(dataSource: DataSource): Promise<void> {
    const supplierRepository = dataSource.getRepository(Supplier);

    const suppliers = [
      {
        name: 'GraphQL Tech Solutions',
        contactEmail: 'contact@graphqltech.com',
      },
      {
        name: 'Modern API Components',
        contactEmail: 'sales@modernapicomponents.com',
      },
      {
        name: 'Cloud-First Supply Co',
        contactEmail: 'orders@cloudfirstsupply.net',
      },
      {
        name: 'Digital Innovation Partners',
        contactEmail: 'info@digitalinnovation.com',
      },
      {
        name: 'NextGen Technology Group',
        contactEmail: 'procurement@nextgentech.org',
      },
    ];

    const createdSuppliers = await supplierRepository.save(suppliers);
    this.logger.log(`Created ${createdSuppliers.length} suppliers`);
  }
}