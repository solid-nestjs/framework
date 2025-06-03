import {
  CrudServiceFrom,
  CrudServiceStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Client } from './entities/client.entity';
import { CreateClientDto, FindClientArgs, UpdateClientDto } from './dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Client,
  createInputType: CreateClientDto,
  updateInputType: UpdateClientDto,
  findArgsType: FindClientArgs,
  relationsConfig: {
    invoices: true,
  },
});

export class ClientsService extends CrudServiceFrom(serviceStructure) {}
