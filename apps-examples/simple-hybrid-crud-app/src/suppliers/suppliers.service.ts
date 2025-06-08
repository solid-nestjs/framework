import {
  CrudProviderStructure,
  CrudServiceExFrom,
  CrudServiceStructureEx,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, FindSupplierArgs, UpdateSupplierDto } from './dto';
import { helloWorldPlugin } from '../plugins';

export const providerStructure = CrudProviderStructure({
  entityType: Supplier,
  createInputType: CreateSupplierDto,
  updateInputType: UpdateSupplierDto,
  findArgsType: FindSupplierArgs,
});

export const serviceStructure = CrudServiceStructureEx({
  ...providerStructure,
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
  plugins: [helloWorldPlugin(providerStructure)],
  hwMessage: 'colombia',
});

export class SuppliersService extends CrudServiceExFrom(serviceStructure) {}
