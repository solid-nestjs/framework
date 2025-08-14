import { Constructable, OrderBy, Where, GroupBy, GroupByRequest } from '@solid-nestjs/common';

/**
 * Interface defining the structure configuration for GraphQL find arguments.
 *
 * This interface provides the type definitions for GraphQL query arguments used in
 * find operations, including where clauses for filtering, order by clauses
 * for sorting results, and group by clauses for aggregated results in GraphQL queries.
 *
 * @template EntityType - The entity type that the GraphQL find arguments will be applied to
 * @template WhereType - The type for GraphQL where clause conditions, defaults to Where<EntityType>
 * @template OrderByType - The type for GraphQL order by conditions, defaults to OrderBy<EntityType>
 * @template GroupByType - The type for GraphQL group by conditions, defaults to GroupByRequest<EntityType>
 */
export interface FindArgsStructure<
  EntityType,
  WhereType extends Where<EntityType> = Where<EntityType>,
  OrderByType extends OrderBy<EntityType> = OrderBy<EntityType>,
  GroupByType extends GroupByRequest<EntityType> = GroupByRequest<EntityType>,
> {
  /** Optional constructable type for GraphQL where clause conditions - defines how entities can be filtered in queries */
  whereType?: Constructable<WhereType>;
  /** Optional constructable type for GraphQL order by conditions - defines how results can be sorted in queries */
  orderByType?: Constructable<OrderByType>;
  /** Optional constructable type for GraphQL group by conditions - defines how entities can be grouped and aggregated in queries */
  groupByType?: Constructable<GroupByType>;
}
