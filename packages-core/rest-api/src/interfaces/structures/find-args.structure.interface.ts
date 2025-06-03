import { Constructable, OrderBy, Where } from '@solid-nestjs/common';

/**
 * Interface defining the structure configuration for find arguments.
 *
 * This interface provides the type definitions for query arguments used in
 * find operations, including where clauses for filtering and order by clauses
 * for sorting results.
 *
 * @template EntityType - The entity type that the find arguments will be applied to
 * @template WhereType - The type for where clause conditions, defaults to Where<EntityType>
 * @template OrderByType - The type for order by conditions, defaults to OrderBy<EntityType>
 */
export interface FindArgsStructure<
  EntityType,
  WhereType extends Where<EntityType> = Where<EntityType>,
  OrderByType extends OrderBy<EntityType> = OrderBy<EntityType>,
> {
  /** Optional constructable type for where clause conditions - defines how entities can be filtered */
  whereType?: Constructable<WhereType>;
  /** Optional constructable type for order by conditions - defines how results can be sorted */
  orderByType?: Constructable<OrderByType>;
}
