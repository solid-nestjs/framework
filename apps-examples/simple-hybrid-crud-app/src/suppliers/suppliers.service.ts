import {
  CrudProviderStructure,
  CrudServiceExFrom,
  CrudServiceStructureEx,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, FindSupplierArgs, UpdateSupplierDto } from './dto';
import { helloWorld2ServicePlugin, helloWorldServicePlugin } from '../plugins';

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
  plugins: [
    helloWorldServicePlugin(providerStructure),
    helloWorld2ServicePlugin(providerStructure),
  ],
  hwMessage: 'america',
  hwMessage2: 'europe',
});

export class SuppliersService extends CrudServiceExFrom(serviceStructure) {}
