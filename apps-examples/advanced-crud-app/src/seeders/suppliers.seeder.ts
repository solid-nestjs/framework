import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class SuppliersSeeder extends BaseSeeder {
  getName(): string {
    return 'Suppliers Seeder (Advanced CRUD)';
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
        name: 'Advanced Solutions Corp',
        contactEmail: 'contact@advancedsolutions.com',
      },
      {
        name: 'Enterprise Systems Ltd',
        contactEmail: 'sales@enterprisesystems.com',
      },
      {
        name: 'Global Tech Industries',
        contactEmail: 'orders@globaltechindustries.net',
      },
      {
        name: 'Professional Equipment Inc',
        contactEmail: 'info@professionalequipment.com',
      },
      {
        name: 'Industrial Supply Partners',
        contactEmail: 'procurement@industrialsupplypartners.org',
      },
      {
        name: 'Technology Innovations LLC',
        contactEmail: 'sales@techinnovations.com',
      },
    ];

    const createdSuppliers = await supplierRepository.save(suppliers);
    this.logger.log(`Created ${createdSuppliers.length} suppliers`);
  }
}