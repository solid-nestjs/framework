import { Context, CreateEventsHandler, CrudServiceFrom, CrudServiceStructure, Transactional } from '@nestjz/typeorm-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TypeOrmRepository } from '@nestjz/typeorm-crud';
import { InternalServerErrorException } from '@nestjs/common';

export const serviceStructure= CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
});

export class ProductsService extends CrudServiceFrom(serviceStructure){

  @Transactional()
  override async create(context: Context, createInput: CreateProductDto, eventHandler?: CreateEventsHandler<string, Product, CreateProductDto, Context> | undefined): Promise<Product> {
    return super.create(context,createInput,eventHandler);
  }

  override async beforeCreate(context: Context, repository: TypeOrmRepository<Product>, entity: Product, createInput: CreateProductDto): Promise<void> {
    console.log('before create');
    //throw new InternalServerErrorException("exception in before create");
  }

  override async afterCreate(context: Context, repository: TypeOrmRepository<Product>, entity: Product, createInput: CreateProductDto): Promise<void> {
    console.log('after create');
    throw new InternalServerErrorException("exception in after create");
  }
  
}