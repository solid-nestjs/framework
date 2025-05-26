import { ObjectLiteral, Repository, SelectQueryBuilder, FindManyOptions, FindOptionsWhere } from "typeorm";

export type TypeOrmRepository<EntityType extends ObjectLiteral> = Repository<EntityType>;

export type TypeOrmSelectQueryBuilder<EntityType extends ObjectLiteral> = SelectQueryBuilder<EntityType>;

export type TypeOrmFindManyOptions<EntityType extends ObjectLiteral> = FindManyOptions<EntityType>;

export type TypeOrmFindOptionsWhere<EntityType extends ObjectLiteral> = FindOptionsWhere<EntityType>;