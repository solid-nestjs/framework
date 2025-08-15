import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class ProductsSeeder extends BaseSeeder {
  getName(): string {
    return 'Products Seeder (Advanced CRUD)';
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

    const products = [
      {
        name: 'Enterprise Server',
        description: 'High-performance enterprise server for data centers',
        price: 4999.99,
        stock: 10,
        supplier: suppliers[0], // Advanced Solutions Corp
      },
      {
        name: 'Professional Workstation',
        description: 'High-end workstation for demanding applications',
        price: 3299.99,
        stock: 15,
        supplier: suppliers[1], // Enterprise Systems Ltd
      },
      {
        name: 'Network Infrastructure Kit',
        description: 'Complete network infrastructure solution',
        price: 2199.99,
        stock: 8,
        supplier: suppliers[2], // Global Tech Industries
      },
      {
        name: 'Advanced Security System',
        description: 'Comprehensive security monitoring system',
        price: 1899.99,
        stock: 12,
        supplier: suppliers[3], // Professional Equipment Inc
      },
      {
        name: 'Industrial Automation Unit',
        description: 'Automated control system for industrial processes',
        price: 3499.99,
        stock: 6,
        supplier: suppliers[4], // Industrial Supply Partners
      },
      {
        name: 'Smart Display Array',
        description: 'Multi-display system for control rooms',
        price: 2799.99,
        stock: 9,
        supplier: suppliers[5], // Technology Innovations LLC
      },
      {
        name: 'Enterprise Storage Solution',
        description: 'High-capacity storage array with redundancy',
        price: 5999.99,
        stock: 4,
        supplier: suppliers[0], // Advanced Solutions Corp
      },
      {
        name: 'Professional Audio System',
        description: 'High-quality audio system for conferences',
        price: 1299.99,
        stock: 20,
        supplier: suppliers[1], // Enterprise Systems Ltd
      },
      {
        name: 'Advanced Router System',
        description: 'Enterprise-grade routing solution',
        price: 899.99,
        stock: 25,
        supplier: suppliers[2], // Global Tech Industries
      },
      {
        name: 'Security Camera Network',
        description: 'Comprehensive surveillance camera system',
        price: 1599.99,
        stock: 18,
        supplier: suppliers[3], // Professional Equipment Inc
      },
      {
        name: 'Industrial Control Panel',
        description: 'Heavy-duty control interface for machinery',
        price: 2299.99,
        stock: 7,
        supplier: suppliers[4], // Industrial Supply Partners
      },
      {
        name: 'Innovation Lab Equipment',
        description: 'Cutting-edge equipment for R&D laboratories',
        price: 4299.99,
        stock: 5,
        supplier: suppliers[5], // Technology Innovations LLC
      },
    ];

    const createdProducts = await productRepository.save(products);
    this.logger.log(`Created ${createdProducts.length} products`);
  }
}