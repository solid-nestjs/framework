import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class SuppliersSeeder extends BaseSeeder {
  getName(): string {
    return 'Suppliers Seeder (Composite Keys)';
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
        type: 'TECH',
        code: 1,
        name: 'Composite Tech Solutions',
        contactEmail: 'contact@compositetech.com',
      },
      {
        type: 'OFFICE',
        code: 1,
        name: 'Office Composite Ltd',
        contactEmail: 'sales@officecomposite.com',
      },
      {
        type: 'INDUSTRIAL',
        code: 1,
        name: 'Industrial Composite Corp',
        contactEmail: 'orders@industrialcomposite.net',
      },
      {
        type: 'PREMIUM',
        code: 1,
        name: 'Premium Composite Inc',
        contactEmail: 'info@premiumcomposite.com',
      },
      {
        type: 'BUDGET',
        code: 1,
        name: 'Budget Composite Co',
        contactEmail: 'procurement@budgetcomposite.org',
      },
      {
        type: 'TECH',
        code: 2,
        name: 'Advanced Tech Composite',
        contactEmail: 'sales@advancedtechcomposite.com',
      },
      {
        type: 'OFFICE',
        code: 2,
        name: 'Modern Office Composite',
        contactEmail: 'info@modernofficecomposite.com',
      },
    ];

    const createdSuppliers = await supplierRepository.save(suppliers);
    this.logger.log(`Created ${createdSuppliers.length} composite key suppliers`);
  }
}