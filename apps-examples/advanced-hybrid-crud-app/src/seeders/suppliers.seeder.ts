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
    return 1; // Run first
  }

  async shouldRun(dataSource: DataSource): Promise<boolean> {
    return await this.isTableEmpty(dataSource, 'supplier');
  }

  async seed(dataSource: DataSource): Promise<void> {
    const supplierRepository = dataSource.getRepository(Supplier);

    const suppliers = [
      {
        name: 'Advanced Tech Solutions',
        contactEmail: 'contact@advancedtech.com',
      },
      {
        name: 'Enterprise Components Inc',
        contactEmail: 'sales@enterprisecomponents.com',
      },
      {
        name: 'Global Manufacturing Co',
        contactEmail: 'orders@globalmanufacturing.net',
      },
      {
        name: 'Premium Technology Ltd',
        contactEmail: 'info@premiumtech.com',
      },
      {
        name: 'Industrial Supply Network',
        contactEmail: 'procurement@industrialsupply.org',
      },
      {
        name: 'Innovation Electronics',
        contactEmail: 'sales@innovationelectronics.com',
      },
    ];

    const createdSuppliers = await supplierRepository.save(suppliers);
    this.logger.log(`Created ${createdSuppliers.length} suppliers`);
  }
}