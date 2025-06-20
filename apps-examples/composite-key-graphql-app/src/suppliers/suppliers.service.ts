import {
  CrudServiceFrom,
  CrudServiceStructure,
} from '@solid-nestjs/typeorm-graphql-crud';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, FindSupplierArgs, UpdateSupplierDto } from './dto';
import { SupplierId } from './entities/supplier.key';

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
  entityId: {
    type: SupplierId,
  },
});

export class SuppliersService extends CrudServiceFrom(serviceStructure) {}
