import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm-graphql-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto';

export const serviceStructure= CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
});

export class ProductsService extends CrudServiceFrom(serviceStructure){
  
}