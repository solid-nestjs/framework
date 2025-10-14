import { Module } from '@nestjs/common';
  import { TypeOrmModule } from '@nestjs/typeorm';
  import {
  Product
  } from './entities/product.entity';
  import {
  ProductsService
  } from './services/products.service';
  import {
  ProductsController
  } from './controllers/products.controller';
  import {
  ProductsResolver
  } from './resolvers/products.resolver';

/** *
Product
Module * * This module encapsulates all
product-related functionality including: *
- Entities:
  Product
*
- Services:
  Products
*
- Controllers:
  Products
*/ @Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
    ]),
  ],
  controllers: [
    ProductsController,
  ],
  providers: [
    ProductsService,
    ProductsResolver,
  ],
}) export class
ProductModule {}