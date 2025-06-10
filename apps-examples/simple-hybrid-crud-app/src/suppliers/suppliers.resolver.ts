import { Resolver } from '@nestjs/graphql';
import {
  CrudResolverExFrom,
  CrudResolverStructureEx,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { SuppliersService, providerStructure } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';
import { helloWorldResolverPlugin } from '../plugins';

const resolverStructure = CrudResolverStructureEx({
  ...providerStructure,
  serviceType: SuppliersService,
  plugins: [helloWorldResolverPlugin(providerStructure)],
});

@Resolver(() => Supplier)
export class SuppliersResolver extends CrudResolverExFrom(resolverStructure) {}
