import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class ProductsSeeder extends BaseSeeder {
  getName(): string {
    return 'Products Seeder (GraphQL)';
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
        name: 'GraphQL Development Kit',
        description: 'Complete toolkit for GraphQL API development',
        price: 299.99,
        stock: 25,
        supplier: suppliers[0], // GraphQL Tech Solutions
      },
      {
        name: 'API Gateway Solution',
        description: 'Enterprise API gateway with GraphQL support',
        price: 1999.99,
        stock: 8,
        supplier: suppliers[1], // Modern API Components
      },
      {
        name: 'Cloud GraphQL Server',
        description: 'Scalable GraphQL server for cloud deployment',
        price: 899.99,
        stock: 15,
        supplier: suppliers[2], // Cloud-First Supply Co
      },
      {
        name: 'Schema Management Tool',
        description: 'Advanced GraphQL schema design and management tool',
        price: 199.99,
        stock: 40,
        supplier: suppliers[3], // Digital Innovation Partners
      },
      {
        name: 'Query Optimizer Engine',
        description: 'High-performance GraphQL query optimization engine',
        price: 1499.99,
        stock: 12,
        supplier: suppliers[4], // NextGen Technology Group
      },
      {
        name: 'Real-time Subscription Service',
        description: 'GraphQL subscription service for real-time data',
        price: 699.99,
        stock: 18,
        supplier: suppliers[0], // GraphQL Tech Solutions
      },
      {
        name: 'Federation Gateway',
        description: 'GraphQL federation gateway for microservices',
        price: 2499.99,
        stock: 6,
        supplier: suppliers[1], // Modern API Components
      },
      {
        name: 'Schema Stitching Platform',
        description: 'Advanced schema stitching and composition platform',
        price: 1799.99,
        stock: 10,
        supplier: suppliers[2], // Cloud-First Supply Co
      },
      {
        name: 'GraphQL Analytics Dashboard',
        description: 'Comprehensive analytics and monitoring for GraphQL APIs',
        price: 799.99,
        stock: 22,
        supplier: suppliers[3], // Digital Innovation Partners
      },
      {
        name: 'Code Generation Suite',
        description: 'Automated code generation for GraphQL schemas',
        price: 399.99,
        stock: 30,
        supplier: suppliers[4], // NextGen Technology Group
      },
    ];

    const createdProducts = await productRepository.save(products);
    this.logger.log(`Created ${createdProducts.length} products`);
  }
}