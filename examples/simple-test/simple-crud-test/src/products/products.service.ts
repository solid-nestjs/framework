import { Context, CrudServiceFrom, CrudServiceStructure, DataRetrievalOptions, FindArgsInterface, UpdateEventsHandler } from '@nestjz/typeorm-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BooleanType, NotNullableIf, TypeOrmRepository, TypeOrmSelectQueryBuilder } from '@nestjz/typeorm-crud/dist/types';

export const serviceStructure= CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
});

export class ProductsService extends CrudServiceFrom(serviceStructure){

 override async afterCreate(context: Context, repository: TypeOrmRepository<Product>, entity: Product, createInput: CreateProductDto): Promise<void> {
   console.log(entity);
 }
 
}