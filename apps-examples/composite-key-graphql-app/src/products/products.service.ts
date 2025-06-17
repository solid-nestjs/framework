import {
  CrudServiceFrom,
  CrudServiceStructure,
} from '@solid-nestjs/typeorm-graphql-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto, FindProductArgs, UpdateProductDto } from './dto';
import { ProductId } from './entities/product.key';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  entityId: {
    type: ProductId,
  },
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {}
