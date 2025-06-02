import {
  CrudResolverFrom,
  CrudResolverStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { ClientsService, serviceStructure } from './clients.service';
import { Client } from './entities/client.entity';
import { Resolver } from '@nestjs/graphql';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ClientsService,
  operations: {
    recover: true,
    hardRemove: true,
  },
});

@Resolver(() => Client)
export class ClientsResolver extends CrudResolverFrom(resolverStructure) {}
