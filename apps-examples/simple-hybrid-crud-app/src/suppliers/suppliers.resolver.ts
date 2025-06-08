import { Query, Resolver } from '@nestjs/graphql';
import {
  Context,
  CrudResolverFrom,
  CrudResolverStructure,
  CurrentContext,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { SuppliersService, providerStructure } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';

const resolverStructure = CrudResolverStructure({
  ...providerStructure,
  serviceType: SuppliersService,
});

@Resolver(() => Supplier)
export class SuppliersResolver extends CrudResolverFrom(resolverStructure) {
  @Query(returns => String, { name: 'sayHelloToSupplier' })
  sayHello(@CurrentContext() context: Context) {
    return this.service.saySimpleHello();
  }
}
