import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceDetail } from '../invoices/entities/invoice-detail.entity';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class InvoicesSeeder extends BaseSeeder {
  getName(): string {
    return 'Invoices Seeder';
  }

  getOrder(): number {
    return 4; // Run after clients
  }

  async shouldRun(dataSource: DataSource): Promise<boolean> {
    return await this.isTableEmpty(dataSource, 'invoice');
  }

  async seed(dataSource: DataSource): Promise<void> {
    const invoiceRepository = dataSource.getRepository(Invoice);
    const invoiceDetailRepository = dataSource.getRepository(InvoiceDetail);
    const clientRepository = dataSource.getRepository(Client);
    const productRepository = dataSource.getRepository(Product);

    // Get all clients and products
    const clients = await clientRepository.find();
    const products = await productRepository.find();

    if (clients.length === 0) {
      throw new Error('No clients found. Please run clients seeder first.');
    }
    if (products.length === 0) {
      throw new Error('No products found. Please run products seeder first.');
    }

    // Create invoices with details
    const invoicesData = [
      {
        client: clients[0], // John Smith
        number: 'INV-2024-001',
        date: new Date('2024-01-15'),
        details: [
          { product: products[0], quantity: 2, unitPrice: products[0].price }, // Enterprise Server Rack
          { product: products[6], quantity: 1, unitPrice: products[6].price }, // UPS Battery Backup
        ],
      },
      {
        client: clients[1], // Maria Garcia
        number: 'INV-2024-002',
        date: new Date('2024-01-18'),
        details: [
          { product: products[1], quantity: 1, unitPrice: products[1].price }, // Professional Workstation
          { product: products[8], quantity: 2, unitPrice: products[8].price }, // Wireless Access Point
        ],
      },
      {
        client: clients[2], // David Johnson
        number: 'INV-2024-003',
        date: new Date('2024-01-22'),
        details: [
          { product: products[2], quantity: 3, unitPrice: products[2].price }, // Network Switch 48-Port
          { product: products[7], quantity: 5, unitPrice: products[7].price }, // Fiber Optic Cable Kit
          { product: products[10], quantity: 10, unitPrice: products[10].price }, // Industrial Keyboard
        ],
      },
      {
        client: clients[3], // Sarah Williams
        number: 'INV-2024-004',
        date: new Date('2024-01-25'),
        details: [
          { product: products[5], quantity: 1, unitPrice: products[5].price }, // Smart Display Panel
          { product: products[11], quantity: 2, unitPrice: products[11].price }, // Conference Microphone
        ],
      },
      {
        client: clients[4], // Michael Brown
        number: 'INV-2024-005',
        date: new Date('2024-02-01'),
        details: [
          { product: products[3], quantity: 5, unitPrice: products[3].price }, // Industrial Tablet
          { product: products[4], quantity: 2, unitPrice: products[4].price }, // Security Camera System
        ],
      },
      {
        client: clients[5], // Emma Davis
        number: 'INV-2024-006',
        date: new Date('2024-02-05'),
        details: [
          { product: products[9], quantity: 1, unitPrice: products[9].price }, // Data Storage Array
          { product: products[6], quantity: 3, unitPrice: products[6].price }, // UPS Battery Backup
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
        client: invoiceData.client,
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