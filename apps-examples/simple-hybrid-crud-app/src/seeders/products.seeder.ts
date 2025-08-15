import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class ProductsSeeder extends BaseSeeder {
  getName(): string {
    return 'Products Seeder (Hybrid)';
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
        name: 'Hybrid API Gateway',
        description: 'REST and GraphQL API gateway with unified interface',
        price: 1299.99,
        stock: 15,
        supplier: suppliers[0], // Hybrid Technologies Inc
      },
      {
        name: 'Full-Stack Development Platform',
        description: 'Complete platform supporting both REST and GraphQL',
        price: 2499.99,
        stock: 8,
        supplier: suppliers[1], // Full-Stack Solutions Ltd
      },
      {
        name: 'Multi-Protocol Router',
        description: 'Advanced router supporting multiple API protocols',
        price: 899.99,
        stock: 20,
        supplier: suppliers[2], // Multi-Protocol Systems
      },
      {
        name: 'Universal SDK Suite',
        description: 'SDK supporting both REST and GraphQL clients',
        price: 399.99,
        stock: 35,
        supplier: suppliers[3], // Universal API Partners
      },
      {
        name: 'Omni-Channel Integration Hub',
        description: 'Hub for integrating REST and GraphQL services',
        price: 1799.99,
        stock: 12,
        supplier: suppliers[4], // Omni-Channel Supply Co
      },
      {
        name: 'Hybrid Documentation Tool',
        description: 'Documentation generator for REST and GraphQL APIs',
        price: 299.99,
        stock: 40,
        supplier: suppliers[0], // Hybrid Technologies Inc
      },
      {
        name: 'Cross-Protocol Testing Suite',
        description: 'Testing framework for both REST and GraphQL endpoints',
        price: 599.99,
        stock: 25,
        supplier: suppliers[1], // Full-Stack Solutions Ltd
      },
      {
        name: 'Protocol Bridge Service',
        description: 'Service for bridging REST and GraphQL protocols',
        price: 1099.99,
        stock: 18,
        supplier: suppliers[2], // Multi-Protocol Systems
      },
      {
        name: 'Universal Cache Layer',
        description: 'Caching solution for both REST and GraphQL',
        price: 799.99,
        stock: 22,
        supplier: suppliers[3], // Universal API Partners
      },
      {
        name: 'Hybrid Monitoring Dashboard',
        description: 'Unified monitoring for REST and GraphQL services',
        price: 999.99,
        stock: 16,
        supplier: suppliers[4], // Omni-Channel Supply Co
      },
    ];

    const createdProducts = await productRepository.save(products);
    this.logger.log(`Created ${createdProducts.length} products`);
  }
}