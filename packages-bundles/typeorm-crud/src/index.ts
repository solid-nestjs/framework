// Re-export everything from all packages
export * from '@solid-nestjs/common';
export * as TypeOrm from '@solid-nestjs/typeorm';
export * as RestApi from '@solid-nestjs/rest-api';

//Filtering
export {
  FindArgsFrom,
  getWhereClass,
  getOrderByClass,
  StringFilter,
  DateFilter,
  NumberFilter,
} from '@solid-nestjs/rest-api';

//Grouping
export { GroupByRequestInput, GroupByArgsFrom } from '@solid-nestjs/rest-api';

//Args Helpers
export {
  createWhereFields,
  createOrderByFields,
  createGroupByFields,
} from '@solid-nestjs/rest-api';

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

export const BUNDLE_NAME = '@solid-nestjs/typeorm-crud';
