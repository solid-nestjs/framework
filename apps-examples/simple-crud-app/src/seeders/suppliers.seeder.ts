import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class SuppliersSeeder extends BaseSeeder {
  getName(): string {
    return 'Suppliers Seeder';
  }

  getOrder(): number {
    return 1; // Run before products
  }

  async shouldRun(dataSource: DataSource): Promise<boolean> {
    return await this.isTableEmpty(dataSource, 'supplier');
  }

  async seed(dataSource: DataSource): Promise<void> {
    const supplierRepository = dataSource.getRepository(Supplier);

    const suppliers = [
      {
        name: 'Tech Solutions Inc',
        contactEmail: 'contact@techsolutions.com',
      },
      {
        name: 'Quality Components Ltd',
        contactEmail: 'sales@qualitycomponents.com',
      },
      {
        name: 'Global Supply Chain',
        contactEmail: 'orders@globalsupply.net',
      },
      {
        name: 'Premium Electronics',
        contactEmail: 'info@premiumelectronics.com',
      },
      {
        name: 'Industrial Partners',
        contactEmail: 'procurement@industrialpartners.org',
      },
    ];

    const createdSuppliers = await supplierRepository.save(suppliers);
    this.logger.log(`Created ${createdSuppliers.length} suppliers`);
  }
}