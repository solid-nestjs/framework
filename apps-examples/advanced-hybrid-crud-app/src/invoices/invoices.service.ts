import { DeepPartial } from 'typeorm';
import {
  Context,
  CrudServiceFrom,
  CrudServiceStructure,
  TypeOrmRepository,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto, FindInvoiceArgs, UpdateInvoiceDto } from './dto';
import { ProductsService } from '../products/products.service';

export const serviceStructure = CrudServiceStructure({
  entityType: Invoice,
  createInputType: CreateInvoiceDto,
  updateInputType: UpdateInvoiceDto,
  findArgsType: FindInvoiceArgs,
  relationsConfig: {
    client: true,
    details: {
      product: {
        supplier: true,
      },
    },
  },
});

@Injectable()
export class InvoicesService extends CrudServiceFrom(serviceStructure) {
  constructor(
    @Inject(ProductsService)
    private readonly productsService: ProductsService,
  ) {
    super();
  }

  override beforeCreate = this.beforeCreateOrUpdate;

  override beforeUpdate = this.beforeCreateOrUpdate;

  async beforeCreateOrUpdate(
    context: Context,
    repository: TypeOrmRepository<Invoice>,
    entity: Invoice,
    input: DeepPartial<Invoice>,
  ): Promise<void> {
    //if there is no detail
    if (!entity?.details || entity.details.length === 0)
      throw new BadRequestException('Invoice must have at least one detail.');

    // Check that all products in the details exist
    const productIds = [
      ...new Set(entity.details.map(detail => detail.productId)),
    ];

    for (const productId of productIds) {
      await this.productsService.findOne(context, productId, true);
    }

    let totalAmount = 0;

    entity.details.forEach(detail => {
      totalAmount += detail.totalAmount = detail.unitPrice * detail.quantity;
    });

    entity.totalAmount = totalAmount;
  }
}
