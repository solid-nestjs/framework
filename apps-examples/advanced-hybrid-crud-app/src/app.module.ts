import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { Supplier } from './suppliers/entities/supplier.entity';
import { SuppliersModule } from './suppliers/suppliers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoiceDetail } from './invoices/entities/invoice-detail.entity';
import { ClientsModule } from './clients/clients.module';
import { Client } from './clients/entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database-data/products.sqlite',
      entities: [Product, Supplier, Invoice, InvoiceDetail, Client],
      synchronize: true, // Set to false in production
      logging: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      introspection: true,
      sortSchema: true,
      driver: ApolloDriver,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    ProductsModule,
    SuppliersModule,
    InvoicesModule,
    ClientsModule,
  ],
})
export class AppModule {}
