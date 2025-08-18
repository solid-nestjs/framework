import { ArgsType } from '@nestjs/graphql';
import { GroupByArgsFrom, createGroupByFields } from '@solid-nestjs/typeorm-hybrid-crud';
import { FindClientArgs } from './find-client-args.dto';
import { Client } from '../../entities/client.entity';

// Generated GROUP BY fields using helper
export const ClientGroupByFields = createGroupByFields(Client, {
  id: {
    description: 'Group by client ID'
  },
  firstName: {
    description: 'Group by client first name'
  },
  lastName: {
    description: 'Group by client last name'
  },
  email: {
    description: 'Group by client email'
  },
  phone: {
    description: 'Group by client phone'
  },
  city: {
    description: 'Group by client city'
  },
  country: {
    description: 'Group by client country'
  },
}, {
  name: 'ClientGroupByFields',
  description: 'GROUP BY fields for Client queries'
});

/**
 * GroupBy arguments for Client queries with both REST and GraphQL support
 * 
 * This class extends FindClientArgs to add groupBy functionality using the
 * ClientGroupByFields generated with createGroupByFields helper.
 * 
 * Example usage:
 * - REST API: POST /clients/grouped with { groupBy: { fields: { city: true }, aggregates: [...] } }
 * - GraphQL: query { clientsGrouped(groupBy: { fields: { city: true }, aggregates: [...] }) { ... } }
 */
@ArgsType()
export class GroupedClientArgs extends GroupByArgsFrom({
  findArgsType: FindClientArgs,
  groupByFieldsType: ClientGroupByFields,
  options: {
    name: 'GroupedClientArgs',
    description: 'Arguments for grouping clients with filtering and aggregation support',
    groupByInputTypeName: 'ClientGroupByInput',
  },
}) {}