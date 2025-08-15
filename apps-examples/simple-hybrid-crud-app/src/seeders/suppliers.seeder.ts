import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class SuppliersSeeder extends BaseSeeder {
  getName(): string {
    return 'Suppliers Seeder (Hybrid)';
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
        name: 'Hybrid Technologies Inc',
        contactEmail: 'contact@hybridtech.com',
      },
      {
        name: 'Full-Stack Solutions Ltd',
        contactEmail: 'sales@fullstacksolutions.com',
      },
      {
        name: 'Multi-Protocol Systems',
        contactEmail: 'orders@multiprotocol.net',
      },
      {
        name: 'Universal API Partners',
        contactEmail: 'info@universalapi.com',
      },
      {
        name: 'Omni-Channel Supply Co',
        contactEmail: 'procurement@omnichannelsupply.org',
      },
    ];

    const createdSuppliers = await supplierRepository.save(suppliers);
    this.logger.log(`Created ${createdSuppliers.length} suppliers`);
  }
}