import {
  CrudServiceFrom,
  CrudServiceStructure,
} from '@solid-nestjs/typeorm-crud';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, FindSupplierArgs, UpdateSupplierDto } from './dto';

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

export class SuppliersService extends CrudServiceFrom(serviceStructure) {}
