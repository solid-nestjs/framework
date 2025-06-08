// Re-export everything from all packages
export * from '@solid-nestjs/common';
export * as TypeOrm from '@solid-nestjs/typeorm';
export * as GraphQL from '@solid-nestjs/graphql';

//Filtering
export {
  FindArgsFrom,
  getWhereClass,
  getOrderByClass,
  StringFilter,
  DateFilter,
  NumberFilter,
} from '@solid-nestjs/graphql';

//Crud Resolver
export {
  DataResolverFrom,
  CrudResolverFrom,
  DataResolverStructure,
  CrudResolverStructure,
} from '@solid-nestjs/graphql';

//Crud Service
export {
  DataServiceFrom,
  CrudServiceFrom,
  DataServiceExFrom,
  CrudServiceExFrom,
  DataServiceStructure,
  CrudServiceStructure,
  DataServiceStructureEx,
  CrudServiceStructureEx,
  Transactional,
} from '@solid-nestjs/typeorm';

//Interfaces
export {
  TypeOrmFindManyOptions,
  TypeOrmFindOptionsWhere,
  TypeOrmRepository,
  TypeOrmSelectQueryBuilder,
} from '@solid-nestjs/typeorm';

export const BUNDLE_NAME = '@solid-nestjs/typeorm-graphql-crud';
