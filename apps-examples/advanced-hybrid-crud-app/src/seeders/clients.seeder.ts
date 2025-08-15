import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseSeeder } from '@solid-nestjs/typeorm';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class ClientsSeeder extends BaseSeeder {
  getName(): string {
    return 'Clients Seeder';
  }

  getOrder(): number {
    return 3; // Run after products
  }

  async shouldRun(dataSource: DataSource): Promise<boolean> {
    return await this.isTableEmpty(dataSource, 'client');
  }

  async seed(dataSource: DataSource): Promise<void> {
    const clientRepository = dataSource.getRepository(Client);

    const clients = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@enterprise.com',
        phone: '+1-555-0101',
        address: '123 Business Ave',
        city: 'New York',
        country: 'USA',
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@techcorp.com',
        phone: '+1-555-0102',
        address: '456 Innovation Blvd',
        city: 'San Francisco',
        country: 'USA',
      },
      {
        firstName: 'David',
        lastName: 'Johnson',
        email: 'david.johnson@manufacturing.com',
        phone: '+1-555-0103',
        address: '789 Industrial Way',
        city: 'Detroit',
        country: 'USA',
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@finance.com',
        phone: '+1-555-0104',
        address: '321 Financial St',
        city: 'Chicago',
        country: 'USA',
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@healthcare.org',
        phone: '+1-555-0105',
        address: '654 Medical Center Dr',
        city: 'Houston',
        country: 'USA',
      },
      {
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@education.edu',
        phone: '+1-555-0106',
        address: '987 Campus Rd',
        city: 'Boston',
        country: 'USA',
      },
      {
        firstName: 'James',
        lastName: 'Miller',
        email: 'james.miller@logistics.com',
        phone: '+1-555-0107',
        address: '147 Warehouse Blvd',
        city: 'Atlanta',
        country: 'USA',
      },
      {
        firstName: 'Lisa',
        lastName: 'Wilson',
        email: 'lisa.wilson@consulting.com',
        phone: '+1-555-0108',
        address: '258 Executive Plaza',
        city: 'Seattle',
        country: 'USA',
      },
    ];

    const createdClients = await clientRepository.save(clients);
    this.logger.log(`Created ${createdClients.length} clients`);
  }
}