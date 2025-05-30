import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { Supplier } from './suppliers/entities/supplier.entity';
import { SuppliersModule } from './suppliers/suppliers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoiceDetail } from './invoices/entities/invoice-detail.entity';

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
})
export class AppModule {}
