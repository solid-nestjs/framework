import { Inject, Injectable } from '@nestjs/common';
import { ProductDtoMapper } from '../mappers/product-request.mapper';
import { ProductRepository } from '../../domain/repositories/Product.respository';
import { PRODUCT_REPOSITORY } from '../ports';
import { Context } from '../../../../common';
import { UpdateProductoDto } from '../interfaces';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
    private readonly mapper: ProductDtoMapper,
  ) {}

  async execute(context: Context, dto: UpdateProductoDto) {
    const entity = this.mapper.updateRequestToDomain(dto);

    return this.repository.update(context, entity);
  }
}
