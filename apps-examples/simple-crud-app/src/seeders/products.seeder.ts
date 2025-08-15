import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class ProductsSeeder extends BaseSeeder {
  getName(): string {
    return 'Products Seeder';
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
        name: 'Gaming Laptop',
        description: 'High-performance gaming laptop with RTX graphics',
        price: 1599.99,
        stock: 15,
        supplier: suppliers[0], // Tech Solutions Inc
      },
      {
        name: 'Wireless Keyboard',
        description: 'Mechanical wireless keyboard with RGB lighting',
        price: 129.99,
        stock: 50,
        supplier: suppliers[1], // Quality Components Ltd
      },
      {
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with HDMI and charging',
        price: 79.99,
        stock: 35,
        supplier: suppliers[2], // Global Supply Chain
      },
      {
        name: '4K Monitor',
        description: '27-inch 4K IPS monitor with HDR support',
        price: 449.99,
        stock: 20,
        supplier: suppliers[3], // Premium Electronics
      },
      {
        name: 'Ergonomic Mouse',
        description: 'Wireless ergonomic mouse with precision tracking',
        price: 59.99,
        stock: 75,
        supplier: suppliers[1], // Quality Components Ltd
      },
      {
        name: 'Bluetooth Headphones',
        description: 'Noise-cancelling wireless headphones',
        price: 199.99,
        stock: 40,
        supplier: suppliers[3], // Premium Electronics
      },
      {
        name: 'SSD Drive 1TB',
        description: 'High-speed NVMe SSD for laptops and desktops',
        price: 119.99,
        stock: 60,
        supplier: suppliers[4], // Industrial Partners
      },
      {
        name: 'Smartphone Case',
        description: 'Protective case with wireless charging support',
        price: 29.99,
        stock: 100,
        supplier: suppliers[2], // Global Supply Chain
      },
      {
        name: 'Desktop PC',
        description: 'High-end desktop computer for professionals',
        price: 2299.99,
        stock: 8,
        supplier: suppliers[0], // Tech Solutions Inc
      },
      {
        name: 'Webcam HD',
        description: '1080p webcam with auto-focus and noise reduction',
        price: 89.99,
        stock: 45,
        supplier: suppliers[4], // Industrial Partners
      },
    ];

    const createdProducts = await productRepository.save(products);
    this.logger.log(`Created ${createdProducts.length} products`);
  }
}