import {
  CrudServiceFrom,
  CrudServiceStructure,
  TypeOrmSelectQueryBuilder,
} from '@solid-nestjs/typeorm-graphql-crud';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, FindSupplierArgs, UpdateSupplierDto } from './dto';
import { Context, DataRetrievalOptions } from '@solid-nestjs/typeorm';

export const serviceStructure = CrudServiceStructure({
  entityType: Supplier,
  createInputType: CreateSupplierDto,
  updateInputType: UpdateSupplierDto,
  findArgsType: FindSupplierArgs,
  functions: {
    create: { transactional: true },
    update: { transactional: true },
    remove: { transactional: true },
    hardRemove: { transactional: true },
    findOne: {
      relationsConfig: {
        products: true,
      },
    },
    findAll: {
      relationsConfig: {
        products: true,
      },
    },
  },
});

export class SuppliersService extends CrudServiceFrom(serviceStructure) {
  override getQueryBuilder(
    context: Context,
    args?: FindSupplierArgs,
    options?: DataRetrievalOptions<Supplier>,
  ): TypeOrmSelectQueryBuilder<Supplier> {
    const queryBuilder = super.getQueryBuilder(context, args, options);

    return this.additionalConditions(queryBuilder);
  }

  //this is needed for paginated queries with multiplying relations
  override getNonMultiplyingPaginatedQueryBuilder(
    context: Context,
    args?: FindSupplierArgs,
    options?: DataRetrievalOptions<Supplier>,
  ): false | TypeOrmSelectQueryBuilder<Supplier> {
    const queryBuilderOrFalse = super.getQueryBuilder(context, args, options);

    if (!queryBuilderOrFalse) return queryBuilderOrFalse;

    const queryBuilder = queryBuilderOrFalse;

    return this.additionalConditions(queryBuilder);
  }

  additionalConditions(
    queryBuilder: TypeOrmSelectQueryBuilder<Supplier>,
  ): TypeOrmSelectQueryBuilder<Supplier> {
    return queryBuilder.andWhere('"supplier_products"."id" is not null');
  }
}
