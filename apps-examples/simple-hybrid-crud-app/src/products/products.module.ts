import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsResolver, ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
