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

//Crud Controller
export {
  DataControllerFrom,
  CrudControllerFrom,
  DataControllerStructure,
  CrudControllerStructure,
} from '@solid-nestjs/rest-api';

//Crud Service
export {
  DataServiceFrom,
  CrudServiceFrom,
  DataServiceStructure,
  CrudServiceStructure,
  Transactional,
} from '@solid-nestjs/typeorm';

//Interfaces
export {
  TypeOrmFindManyOptions,
  TypeOrmFindOptionsWhere,
  TypeOrmRepository,
  TypeOrmSelectQueryBuilder,
} from '@solid-nestjs/typeorm';

// Optional: Add version info
export const SOLID_NESTJS_VERSION = '0.2.0';
export const BUNDLE_NAME = '@solid-nestjs/typeorm-crud';
