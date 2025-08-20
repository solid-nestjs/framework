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

//Grouping
export {
  GroupByRequestInput,
  GroupByArgsFrom,
} from '@solid-nestjs/rest-graphql';

//Args Helpers
export {
  createWhereFields,
  createOrderByFields,
  createGroupByFields,
} from '@solid-nestjs/rest-graphql';

//DTO Generation
export { GenerateDtoFromEntity } from '@solid-nestjs/rest-graphql';

//Crud Controller
export {
  DataControllerStructure,
  CrudControllerStructure,
  DataControllerStructureEx,
  CrudControllerStructureEx,
  ControllerPlugin,
} from '@solid-nestjs/rest-api';

//Crud Resolver
export {
  DataResolverStructure,
  CrudResolverStructure,
  DataResolverStructureEx,
  CrudResolverStructureEx,
  ResolverPlugin,
} from '@solid-nestjs/graphql';

//Hybrid Crud Controller/Resolver
export {
  DataControllerFrom,
  CrudControllerFrom,
  DataControllerExFrom,
  CrudControllerExFrom,
  DataResolverFrom,
  CrudResolverFrom,
  DataResolverExFrom,
  CrudResolverExFrom,
} from '@solid-nestjs/rest-graphql';

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
