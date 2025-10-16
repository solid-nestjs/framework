import { Inject, Injectable } from '@nestjs/common';
import { ProductDtoMapper } from '../mappers/product-request.mapper';
import { ProductRepository } from '../../domain/repositories/Product.respository';
import { PRODUCT_REPOSITORY } from '../ports';
import { Context } from '../../../../common';
import { CreateProductoDto } from '../interfaces';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
    private readonly mapper: ProductDtoMapper,
  ) {}

  async execute(context: Context, dto: CreateProductoDto) {
    const entity = this.mapper.createRequestToDomain(dto);

    return this.repository.create(context, entity);
  }
}
