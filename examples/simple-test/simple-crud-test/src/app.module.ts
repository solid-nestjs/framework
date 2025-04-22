import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database-data/products.sqlite',
      entities: [Product],
      synchronize: true, // Set to false in production
    }),
    ProductsModule,
  ],
})
export class AppModule {}
