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
        name: 'Enterprise Server Rack',
        description: '42U enterprise server rack with cooling system',
        price: 2999.99,
        stock: 5,
        supplier: suppliers[0], // Advanced Tech Solutions
      },
      {
        name: 'Professional Workstation',
        description: 'High-end workstation for CAD and video editing',
        price: 3499.99,
        stock: 12,
        supplier: suppliers[1], // Enterprise Components Inc
      },
      {
        name: 'Network Switch 48-Port',
        description: 'Managed gigabit switch with PoE support',
        price: 899.99,
        stock: 25,
        supplier: suppliers[2], // Global Manufacturing Co
      },
      {
        name: 'Industrial Tablet',
        description: 'Rugged tablet for industrial environments',
        price: 1299.99,
        stock: 18,
        supplier: suppliers[3], // Premium Technology Ltd
      },
      {
        name: 'Security Camera System',
        description: '8-channel 4K security camera system',
        price: 1599.99,
        stock: 15,
        supplier: suppliers[4], // Industrial Supply Network
      },
      {
        name: 'Smart Display Panel',
        description: '55-inch interactive display for conferences',
        price: 2199.99,
        stock: 8,
        supplier: suppliers[5], // Innovation Electronics
      },
      {
        name: 'UPS Battery Backup',
        description: '1500VA uninterruptible power supply',
        price: 349.99,
        stock: 30,
        supplier: suppliers[0], // Advanced Tech Solutions
      },
      {
        name: 'Fiber Optic Cable Kit',
        description: 'Single-mode fiber optic cable assembly kit',
        price: 249.99,
        stock: 40,
        supplier: suppliers[2], // Global Manufacturing Co
      },
      {
        name: 'Wireless Access Point',
        description: 'Enterprise Wi-Fi 6 access point',
        price: 449.99,
        stock: 35,
        supplier: suppliers[1], // Enterprise Components Inc
      },
      {
        name: 'Data Storage Array',
        description: '24-bay NAS storage array with RAID support',
        price: 4999.99,
        stock: 6,
        supplier: suppliers[3], // Premium Technology Ltd
      },
      {
        name: 'Industrial Keyboard',
        description: 'Waterproof mechanical keyboard for harsh environments',
        price: 189.99,
        stock: 50,
        supplier: suppliers[4], // Industrial Supply Network
      },
      {
        name: 'Conference Microphone',
        description: 'Wireless conference microphone system',
        price: 799.99,
        stock: 20,
        supplier: suppliers[5], // Innovation Electronics
      },
    ];

    const createdProducts = await productRepository.save(products);
    this.logger.log(`Created ${createdProducts.length} products`);
  }
}