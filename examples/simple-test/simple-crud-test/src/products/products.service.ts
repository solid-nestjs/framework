import { CrudServiceFrom, CrudServiceStructure } from '@nestjz/typeorm-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto
});

export class ProductsService extends CrudServiceFrom(serviceStructure){

}