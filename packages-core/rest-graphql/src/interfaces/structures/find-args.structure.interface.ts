import { Constructable, OrderBy, Where } from '@solid-nestjs/common';

export interface FindArgsStructure<
  EntityType,
  WhereType extends Where<EntityType> = Where<EntityType>,
  OrderByType extends OrderBy<EntityType> = OrderBy<EntityType>,
> {
  whereType?: Constructable<WhereType>;
  orderByType?: Constructable<OrderByType>;
}
