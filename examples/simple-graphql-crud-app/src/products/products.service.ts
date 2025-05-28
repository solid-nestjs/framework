import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm-graphql-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto, FindProductArgs, UpdateProductDto } from './dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      supplier: true
    }
  }
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {

}