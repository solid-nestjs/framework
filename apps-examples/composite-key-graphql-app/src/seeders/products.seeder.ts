import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class ProductsSeeder extends BaseSeeder {
  getName(): string {
    return 'Products Seeder (Composite Keys)';
  }

  getOrder(): number {
    return 2; // Run after suppliers
  }

  async shouldRun(dataSource: DataSource): Promise<boolean> {
    return await this.isTableEmpty(dataSource, 'product');
  }

  async seed(dataSource: DataSource): Promise<void> {
    const productRepository = dataSource.getRepository(Product);
    const supplierRepository = dataSource.getRepository(Supplier);

    // Get all suppliers
    const suppliers = await supplierRepository.find();
    if (suppliers.length === 0) {
      throw new Error('No suppliers found. Please run suppliers seeder first.');
    }

    // Find specific suppliers by their composite keys
    const techSupplier1 = suppliers.find(s => s.type === 'TECH' && s.code === 1);
    const techSupplier2 = suppliers.find(s => s.type === 'TECH' && s.code === 2);
    const officeSupplier1 = suppliers.find(s => s.type === 'OFFICE' && s.code === 1);
    const officeSupplier2 = suppliers.find(s => s.type === 'OFFICE' && s.code === 2);
    const industrialSupplier = suppliers.find(s => s.type === 'INDUSTRIAL' && s.code === 1);
    const premiumSupplier = suppliers.find(s => s.type === 'PREMIUM' && s.code === 1);
    const budgetSupplier = suppliers.find(s => s.type === 'BUDGET' && s.code === 1);

    const products = [
      {
        type: 'LAPTOP',
        code: 1,
        name: 'Gaming Laptop Pro',
        description: 'High-performance gaming laptop with composite design',
        price: 1899.99,
        stock: 12,
        supplier: techSupplier1,
        supplier_id_type: techSupplier1?.type,
        supplier_id_code: techSupplier1?.code,
      },
      {
        type: 'DESKTOP',
        code: 1,
        name: 'Workstation Desktop',
        description: 'Professional workstation with composite architecture',
        price: 2499.99,
        stock: 8,
        supplier: techSupplier2,
        supplier_id_type: techSupplier2?.type,
        supplier_id_code: techSupplier2?.code,
      },
      {
        type: 'KEYBOARD',
        code: 1,
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with composite switches',
        price: 149.99,
        stock: 45,
        supplier: officeSupplier1,
        supplier_id_type: officeSupplier1?.type,
        supplier_id_code: officeSupplier1?.code,
      },
      {
        type: 'MOUSE',
        code: 1,
        name: 'Wireless Gaming Mouse',
        description: 'High-precision wireless mouse with composite frame',
        price: 89.99,
        stock: 60,
        supplier: officeSupplier1,
        supplier_id_type: officeSupplier1?.type,
        supplier_id_code: officeSupplier1?.code,
      },
      {
        type: 'MONITOR',
        code: 1,
        name: '4K Professional Monitor',
        description: '32-inch 4K monitor with composite stand',
        price: 599.99,
        stock: 20,
        supplier: premiumSupplier,
        supplier_id_type: premiumSupplier?.type,
        supplier_id_code: premiumSupplier?.code,
      },
      {
        type: 'CHAIR',
        code: 1,
        name: 'Ergonomic Office Chair',
        description: 'Ergonomic chair with composite materials',
        price: 399.99,
        stock: 25,
        supplier: officeSupplier2,
        supplier_id_type: officeSupplier2?.type,
        supplier_id_code: officeSupplier2?.code,
      },
      {
        type: 'TABLET',
        code: 1,
        name: 'Industrial Tablet',
        description: 'Rugged tablet with composite casing',
        price: 799.99,
        stock: 15,
        supplier: industrialSupplier,
        supplier_id_type: industrialSupplier?.type,
        supplier_id_code: industrialSupplier?.code,
      },
      {
        type: 'PHONE',
        code: 1,
        name: 'Business Smartphone',
        description: 'Enterprise smartphone with composite construction',
        price: 999.99,
        stock: 30,
        supplier: techSupplier1,
        supplier_id_type: techSupplier1?.type,
        supplier_id_code: techSupplier1?.code,
      },
      {
        type: 'HEADSET',
        code: 1,
        name: 'Wireless Headset',
        description: 'Professional wireless headset with composite design',
        price: 299.99,
        stock: 40,
        supplier: premiumSupplier,
        supplier_id_type: premiumSupplier?.type,
        supplier_id_code: premiumSupplier?.code,
      },
      {
        type: 'SPEAKER',
        code: 1,
        name: 'Bluetooth Speaker',
        description: 'Portable speaker with composite housing',
        price: 129.99,
        stock: 50,
        supplier: budgetSupplier,
        supplier_id_type: budgetSupplier?.type,
        supplier_id_code: budgetSupplier?.code,
      },
      {
        type: 'LAPTOP',
        code: 2,
        name: 'Budget Laptop',
        description: 'Affordable laptop with basic composite features',
        price: 699.99,
        stock: 35,
        supplier: budgetSupplier,
        supplier_id_type: budgetSupplier?.type,
        supplier_id_code: budgetSupplier?.code,
      },
      {
        type: 'PRINTER',
        code: 1,
        name: 'Laser Printer',
        description: 'Professional laser printer with composite frame',
        price: 449.99,
        stock: 18,
        supplier: officeSupplier2,
        supplier_id_type: officeSupplier2?.type,
        supplier_id_code: officeSupplier2?.code,
      },
    ];

    const createdProducts = await productRepository.save(products);
    this.logger.log(`Created ${createdProducts.length} composite key products`);
  }
}