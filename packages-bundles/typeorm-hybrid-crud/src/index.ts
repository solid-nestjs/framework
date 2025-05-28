// Re-export everything from all packages
export * from '@solid-nestjs/common';
export * as TypeOrm from '@solid-nestjs/typeorm';
export * as RestApi from '@solid-nestjs/rest-api';
export * as GraphQL from '@solid-nestjs/graphql';

//Filtering
export  { 
        FindArgsFrom, 
        getWhereClass, 
        getOrderByClass,
        StringFilter, 
        DateFilter, 
        NumberFilter,
        } from "@solid-nestjs/rest-graphql";

//Crud Controller
export  { 
        CrudControllerFrom, 
        CrudControllerStructure 
        } from '@solid-nestjs/rest-api';

//Crud Resolver
export  { 
        CrudResolverFrom, 
        CrudResolverStructure 
        } from '@solid-nestjs/graphql';

//Crud Service
export  { 
        CrudServiceFrom, 
        CrudServiceStructure,
        Transactional,
        } from '@solid-nestjs/typeorm';

//Interfaces
export  { 
        TypeOrmFindManyOptions,
        TypeOrmFindOptionsWhere,
        TypeOrmRepository,
        TypeOrmSelectQueryBuilder,
        } from '@solid-nestjs/typeorm';

// Optional: Add version info
export const SOLID_NESTJS_VERSION = '0.2.0';
export const BUNDLE_NAME = '@solid-nestjs/typeorm-hybrid-crud';
