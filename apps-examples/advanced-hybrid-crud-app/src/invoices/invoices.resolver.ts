import { Resolver } from '@nestjs/graphql';
import {
  CrudResolverFrom,
  CrudResolverStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { InvoicesService, serviceStructure } from './invoices.service';
import { Invoice } from './entities/invoice.entity';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: InvoicesService,
});

@Resolver(() => Invoice)
export class InvoicesResolver extends CrudResolverFrom(resolverStructure) {}
