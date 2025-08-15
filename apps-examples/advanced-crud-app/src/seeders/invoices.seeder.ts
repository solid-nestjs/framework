import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceDetail } from '../invoices/entities/invoice-detail.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class InvoicesSeeder extends BaseSeeder {
  getName(): string {
    return 'Invoices Seeder (Advanced CRUD)';
  }

  getOrder(): number {
    return 3; // Run after products
  }

  async shouldRun(dataSource: DataSource): Promise<boolean> {
    return await this.isTableEmpty(dataSource, 'invoice');
  }

  async seed(dataSource: DataSource): Promise<void> {
    const invoiceRepository = dataSource.getRepository(Invoice);
    const invoiceDetailRepository = dataSource.getRepository(InvoiceDetail);
    const productRepository = dataSource.getRepository(Product);

    // Get all products
    const products = await productRepository.find();
    if (products.length === 0) {
      throw new Error('No products found. Please run products seeder first.');
    }

    // Create invoices with details
    const invoicesData = [
      {
        number: 'ADV-2024-001',
        date: new Date('2024-01-10'),
        details: [
          { product: products[0], quantity: 1, unitPrice: products[0].price }, // Enterprise Server
          { product: products[6], quantity: 1, unitPrice: products[6].price }, // Enterprise Storage Solution
        ],
      },
      {
        number: 'ADV-2024-002',
        date: new Date('2024-01-15'),
        details: [
          { product: products[1], quantity: 2, unitPrice: products[1].price }, // Professional Workstation
          { product: products[7], quantity: 1, unitPrice: products[7].price }, // Professional Audio System
        ],
      },
      {
        number: 'ADV-2024-003',
        date: new Date('2024-01-20'),
        details: [
          { product: products[2], quantity: 1, unitPrice: products[2].price }, // Network Infrastructure Kit
          { product: products[8], quantity: 3, unitPrice: products[8].price }, // Advanced Router System
        ],
      },
      {
        number: 'ADV-2024-004',
        date: new Date('2024-01-25'),
        details: [
          { product: products[3], quantity: 2, unitPrice: products[3].price }, // Advanced Security System
          { product: products[9], quantity: 1, unitPrice: products[9].price }, // Security Camera Network
        ],
      },
      {
        number: 'ADV-2024-005',
        date: new Date('2024-02-01'),
        details: [
          { product: products[4], quantity: 1, unitPrice: products[4].price }, // Industrial Automation Unit
          { product: products[10], quantity: 1, unitPrice: products[10].price }, // Industrial Control Panel
        ],
      },
      {
        number: 'ADV-2024-006',
        date: new Date('2024-02-05'),
        details: [
          { product: products[5], quantity: 1, unitPrice: products[5].price }, // Smart Display Array
          { product: products[11], quantity: 1, unitPrice: products[11].price }, // Innovation Lab Equipment
        ],
      },
    ];

    let totalInvoices = 0;
    let totalDetails = 0;

    for (const invoiceData of invoicesData) {
      // Calculate total amount
      const totalAmount = invoiceData.details.reduce(
        (sum, detail) => sum + detail.quantity * detail.unitPrice,
        0,
      );

      // Create invoice
      const invoice = await invoiceRepository.save({
        invoiceNumber: invoiceData.number,
        invoiceDate: invoiceData.date,
        totalAmount,
      });

      // Create invoice details
      const details = invoiceData.details.map(detail => ({
        invoice,
        product: detail.product,
        productId: detail.product.id,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        totalAmount: detail.quantity * detail.unitPrice,
      }));

      await invoiceDetailRepository.save(details);
      
      totalInvoices++;
      totalDetails += details.length;
    }

    this.logger.log(`Created ${totalInvoices} invoices with ${totalDetails} invoice details`);
  }
}