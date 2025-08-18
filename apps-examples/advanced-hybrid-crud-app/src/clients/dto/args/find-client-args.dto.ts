import { ArgsType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  createWhereFields,
  createOrderByFields,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Client } from '../../entities/client.entity';

// Generated WHERE fields using helper - auto-infers StringFilter for string fields
const ClientWhere = createWhereFields(Client, {
  id: true, // Auto-infers StringFilter + applies all decorators
  firstName: true, // Auto-infers StringFilter + applies all decorators
  lastName: true, // Auto-infers StringFilter + applies all decorators
  email: true, // Auto-infers StringFilter + applies all decorators
  phone: true, // Auto-infers StringFilter + applies all decorators
  city: true, // Auto-infers StringFilter + applies all decorators
  country: true, // Auto-infers StringFilter + applies all decorators
}, {
  name: 'ClientWhere',
  description: 'WHERE conditions for Client queries'
});

// Generated ORDER BY fields using helper - auto-infers OrderByTypes enum
const ClientOrderBy = createOrderByFields(Client, {
  id: true, // Enables ordering + applies all decorators
  firstName: true, // Enables ordering + applies all decorators
  lastName: true, // Enables ordering + applies all decorators
  email: true, // Enables ordering + applies all decorators
  phone: true, // Enables ordering + applies all decorators
  city: true, // Enables ordering + applies all decorators
  country: true, // Enables ordering + applies all decorators
}, {
  name: 'ClientOrderBy',
  description: 'ORDER BY options for Client queries'
});

@ArgsType()
export class FindClientArgs extends FindArgsFrom<Client>({
  whereType: ClientWhere,
  orderByType: ClientOrderBy,
}) {}
