import { IdValueObject, NameValueObject } from '@core/domain/value-objects';
import { Product } from '../../domain/classes/product.entity';
import { CreateProductoDto, UpdateProductoDto } from '../interfaces';

export class ProductDtoMapper {
  createRequestToDomain(dto: CreateProductoDto): Product {
    return Product.create({
      name: NameValueObject.create(dto.name),
      price: dto.price,
      stock: dto.stock,
    });
  }

  updateRequestToDomain(dto: UpdateProductoDto): Product {
    return Product.restore({
      id: IdValueObject.create(dto.id),
      name: NameValueObject.create(dto.name),
      price: dto.price,
      stock: dto.stock,
    });
  }
}
