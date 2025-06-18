// Re-export everything from all packages
export * from '@solid-nestjs/common';
export * as TypeOrm from '@solid-nestjs/typeorm';
export * as RestApi from '@solid-nestjs/rest-api';
export * as GraphQL from '@solid-nestjs/graphql';

//Filtering
export {
  PartialType,
  FindArgsFrom,
  getWhereClass,
  getOrderByClass,
  StringFilter,
  DateFilter,
  NumberFilter,
} from '@solid-nestjs/rest-graphql';

//Crud Controller
export {
  DataControllerFrom,
  CrudControllerFrom,
  DataControllerExFrom,
  CrudControllerExFrom,
  DataControllerStructure,
  CrudControllerStructure,
  DataControllerStructureEx,
  CrudControllerStructureEx,
  ControllerPlugin,
} from '@solid-nestjs/rest-api';

//Crud Resolver
export {
  DataResolverFrom,
  CrudResolverFrom,
  DataResolverExFrom,
  CrudResolverExFrom,
  DataResolverStructure,
  CrudResolverStructure,
  DataResolverStructureEx,
  CrudResolverStructureEx,
  ResolverPlugin,
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
  AutoIncrement,
} from '@solid-nestjs/typeorm';

//Interfaces
export {
  TypeOrmFindManyOptions,
  TypeOrmFindOptionsWhere,
  TypeOrmRepository,
  TypeOrmSelectQueryBuilder,
} from '@solid-nestjs/typeorm';

export const BUNDLE_NAME = '@solid-nestjs/typeorm-hybrid-crud';
