import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom, CrudResolverStructure } from '@solid-nestjs/typeorm-hybrid-crud';
import { SuppliersService, serviceStructure } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';

const resolverStructure = CrudResolverStructure({
    ...serviceStructure,
    serviceType:SuppliersService,
});

@Resolver(() => Supplier)
export class SuppliersResolver extends CrudResolverFrom(resolverStructure) {
    
}
