import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SeederService } from '@solid-nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { Supplier } from './suppliers/entities/supplier.entity';
import { SuppliersModule } from './suppliers/suppliers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoiceDetail } from './invoices/entities/invoice-detail.entity';
import { SuppliersSeeder, ProductsSeeder, InvoicesSeeder } from './seeders';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database-data/products.sqlite',
      entities: [Product, Supplier, Invoice, InvoiceDetail],
      synchronize: true, // Set to false in production
      logging: true,
    }),
    ProductsModule,
    SuppliersModule,
    InvoicesModule,
  ],
  providers: [SeederService, SuppliersSeeder, ProductsSeeder, InvoicesSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly seederService: SeederService,
    private readonly suppliersSeeder: SuppliersSeeder,
    private readonly productsSeeder: ProductsSeeder,
    private readonly invoicesSeeder: InvoicesSeeder,
  ) {}

  async onModuleInit() {
    // Skip seeders during testing to avoid interference with E2E tests
    const isTestEnvironment = process.env.NODE_ENV === 'test' || 
                             process.env.JEST_WORKER_ID !== undefined ||
                             global.process?.env?.npm_lifecycle_event?.includes('test');
    
    if (isTestEnvironment) {
      return;
    }

    const seeders = [
      this.suppliersSeeder,
      this.productsSeeder,
      this.invoicesSeeder,
    ];
    
    // Check if any seeder needs to run before running them
    const shouldRunSeeders = await this.seederService.shouldRunAnySeeder(
      this.dataSource,
      seeders,
    );

    if (shouldRunSeeders) {
      await this.seederService.runSeeders(this.dataSource, seeders);
    }
  }
}
