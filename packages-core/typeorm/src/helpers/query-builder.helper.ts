import {
  And,
  Between,
  Brackets,
  FindOptionsRelations,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  Constructable,
  Entity,
  FindArgs,
  getPaginationArgs,
  IdTypeFrom,
  OrderBy,
  Where,
} from '@solid-nestjs/common';
import {
  DataRetrievalOptions,
  Relation as RelationInterface,
  ExtendedRelationInfo,
  QueryBuilderConfig,
  getMainAliasFromConfig,
  getRelationsFromConfig,
} from '../interfaces';
import { getEntityRelationsExtended } from './entity-relations.helper';

const conditions = {
  _eq: value => value,
  _neq: value => Not(value),
  _gt: value => MoreThan(value),
  _gte: value => MoreThanOrEqual(value),
  _lt: value => LessThan(value),
  _lte: value => LessThanOrEqual(value),
  _in: value => In(value),
  _between: value => Between(value[0], value[1]),
  _notbetween: value => Not(Between(value[0], value[1])),
  _startswith: value => Like(value + '%'),
  _notstartswith: value => Not(Like(value + '%')),
  _endswith: value => Like('%' + value),
  _notendswith: value => Not(Like('%' + value)),
  _contains: value => Like('%' + value + '%'),
  _notcontains: value => Not(Like('%' + value + '%')),
  _like: value => Like(value),
  _notlike: value => Not(Like(value)),
};

const conditionsKeys = Object.keys(conditions);

function fixBracketQueryBuilder(bracketQueryBuilder, queryBuilder) {
  //bracketQueryBuilder.expressionMap.joinAttributes = queryBuilder.expressionMap.joinAttributes;
  bracketQueryBuilder.expressionMap.joinAttributes = [
    ...queryBuilder.expressionMap.joinAttributes,
  ];
}

interface Relation extends RelationInterface {
  alias: string;
  relationInfo?: ExtendedRelationInfo;
}

function isMultiplyingCardinality(cardinality: RelationType): boolean {
  return cardinality === 'one-to-many' || cardinality === 'many-to-many';
}

interface QueryContext<EntityType extends ObjectLiteral> {
  queryBuilder: SelectQueryBuilder<EntityType>;
  relations: Relation[];
  relationsInfo: ExtendedRelationInfo[];
  ignoreMultiplyingJoins?: boolean;
  ignoreSelects?: boolean;
  validRelations?: (relations: Relation[]) => boolean;
}

interface RecursiveContext<EntityType extends ObjectLiteral>
  extends QueryContext<EntityType> {
  alias: string;
  recusirveDepth: number;
}

interface WhereContext<EntityType extends ObjectLiteral>
  extends RecursiveContext<EntityType> {
  constructField: (fieldName: string, value: any) => object;
}

const MAX_RECURSIVE_DEPTH = 20;
const RECURSIVE_DEPTH_ERROR = `Max recursive depth reached`;

/**
 * Helper class for building advanced TypeORM queries with support for relations, pagination, and filtering.
 *
 * `QueryBuilderHelper` provides a set of utilities to construct complex queries for a given entity type,
 * handling relation joins, pagination, ordering, and dynamic where conditions. It is designed to avoid
 * issues such as multiplying cardinality when joining one-to-many or many-to-many relations, and to
 * facilitate the creation of paginated queries that return distinct results.
 *
 * @typeParam IdType - The type of the entity's primary key.
 * @typeParam EntityType - The entity type extending the base `Entity`.
 *
 * @example
 * ```typescript
 * const helper = new QueryBuilderHelper(UserEntity);
 * const qb = helper.getQueryBuilder(userRepository, { where: { name: 'John' } });
 * const users = await qb.getMany();
 * ```
 *
 * @remarks
 * - Handles relation joins and prevents multiplying cardinality in paginated queries.
 * - Supports dynamic where conditions, including nested and/or logic.
 * - Integrates with TypeORM's `SelectQueryBuilder` and repository patterns.
 * - Throws exceptions for invalid relations or query conditions.
 *
 * @see {@link getQueryBuilder}
 * @see {@link getNonMultiplyingPaginatedQueryBuilder}
 * @see {@link applyArgs}
 * @see {@link addRelation}
 */
export class QueryBuilderHelper<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<any>,
> {
  constructor(
    private readonly entityType: Constructable<EntityType>,
    private readonly defaultOptions?: QueryBuilderConfig<EntityType>,
  ) {}

  private _relationsInfo?: ExtendedRelationInfo[];

  getRelationsInfo(repository: Repository<EntityType>): ExtendedRelationInfo[] {
    if (!this._relationsInfo)
      this._relationsInfo = getEntityRelationsExtended(repository);

    return this._relationsInfo;
  }

  /**
   * Creates and returns a TypeORM `SelectQueryBuilder` for the specified repository and entity type.
   *
   * @template EntityType - The type of the entity for which the query builder is created.
   * @param repository - The TypeORM repository instance for the target entity.
   * @param args - Optional arguments to customize the query, such as filters, sorting, or pagination.
   * @param options - Optional data retrieval options that may further modify the query behavior.
   * @returns A `SelectQueryBuilder` instance configured for the specified entity type.
   */
  getQueryBuilder(
    repository: Repository<EntityType>,
    args?: FindArgs<EntityType>,
    options?: DataRetrievalOptions<EntityType>,
  ): SelectQueryBuilder<EntityType> {
    return this.implGetQueryBuilder(
      repository,
      args,
      options,
    ) as SelectQueryBuilder<EntityType>;
  }

  /**
   * Generates a paginated query builder that avoids joins causing multiplying cardinality in the result set.
   *
   * This method checks if pagination is requested via `args.pagination` and if any relations in the repository
   * could result in multiplying cardinality (e.g., one-to-many or many-to-many joins). If neither condition is met,
   * it returns `false` to indicate that a special paginated query builder is not needed.
   *
   * If both conditions are satisfied, it constructs a `SelectQueryBuilder` that selects only the primary key (`id`)
   * of the main entity, ensuring that joins with multiplying cardinality are ignored to prevent duplicate rows.
   *
   * @param repository - The TypeORM repository for the entity type.
   * @param args - Optional find arguments, including pagination options.
   * @param options - Optional data retrieval options, such as main alias configuration.
   * @returns A `SelectQueryBuilder` selecting only the main entity's `id` if pagination and multiplying relations exist, or `false` otherwise.
   */
  getNonMultiplyingPaginatedQueryBuilder(
    repository: Repository<EntityType>,
    args?: FindArgs<EntityType>,
    options?: DataRetrievalOptions<EntityType>,
  ): SelectQueryBuilder<EntityType> | false {
    //if there is no pagination, then we dont need to keep checking
    if (
      (args?.pagination?.skip ?? 0) === 0 &&
      (args?.pagination?.take ?? 0) === 0 &&
      (args?.pagination?.page ?? 0) === 0 &&
      (args?.pagination?.limit ?? 0) === 0
    )
      return false;

    const relationsInfo = this.getRelationsInfo(repository);

    //if there is not a posible relation that results in a multiplying cardinality, then we dont need to keep checking
    if (
      !relationsInfo.some(info =>
        isMultiplyingCardinality(info.aggregatedCardinality),
      )
    ) {
      return false;
    }

    const qb = this.implGetQueryBuilder(repository, args, options, {
      ignoreSelects: true,
      ignoreMultiplyingJoins: true,
      validRelations(relations) {
        //it should only keep trying to get paginatedQueryBuilder if finds a relation with multiplying cardinality
        return relations.some(relation =>
          relation.relationInfo
            ? isMultiplyingCardinality(
                relation.relationInfo?.aggregatedCardinality,
              )
            : false,
        );
      },
    });

    if (!qb) return false;

    const mainAlias =
      options?.mainAlias ??
      getMainAliasFromConfig(this.defaultOptions?.relationsConfig) ??
      this.entityType.name.toLowerCase();

    return qb.select(mainAlias + '.id');
  }

  protected implGetQueryBuilder(
    repository: Repository<EntityType>,
    args?: FindArgs<EntityType>,
    options?: DataRetrievalOptions<EntityType>,
    baseQueryContext?: Partial<QueryContext<EntityType>>,
  ): SelectQueryBuilder<EntityType> | false {
    const relationsInfo = this.getRelationsInfo(repository);

    const mainAlias =
      options?.mainAlias ??
      getMainAliasFromConfig(this.defaultOptions?.relationsConfig) ??
      this.entityType.name.toLowerCase();
    const relations =
      options?.relations ??
      getRelationsFromConfig(this.defaultOptions?.relationsConfig) ??
      [];
    const lockMode = options?.lockMode ?? this.defaultOptions?.lockMode;
    const ignoreMultiplyingJoins =
      options?.ignoreMultiplyingJoins ??
      baseQueryContext?.ignoreMultiplyingJoins;
    const ignoreSelects =
      options?.ignoreSelects ?? baseQueryContext?.ignoreSelects;

    const queryBuilder = repository.createQueryBuilder(mainAlias);

    if (lockMode)
      if (lockMode.lockMode === 'optimistic')
        queryBuilder.setLock(lockMode.lockMode, lockMode.lockVersion);
      else
        queryBuilder.setLock(
          lockMode.lockMode,
          lockMode.lockVersion,
          lockMode.lockTables,
        );

    if (options?.withDeleted) queryBuilder.withDeleted();

    const queryContext: QueryContext<EntityType> = {
      ...baseQueryContext,
      queryBuilder: queryBuilder,
      relations: [],
      relationsInfo,
      ignoreMultiplyingJoins,
      ignoreSelects,
    };

    const relationsArray = Array.isArray(relations)
      ? relations
      : this.getRelationsArray(mainAlias, relations);

    relationsArray.forEach(relation => {
      let { property, alias } = relation;

      this.addRelation(queryContext, property, alias, true);
    });

    if (
      queryContext.validRelations &&
      !queryContext.validRelations(queryContext.relations)
    )
      return false;

    if (args) this.applyArgs(queryContext, args);

    return queryBuilder;
  }

  /**
   * Recursively constructs an array of relation metadata objects from the provided relations object.
   *
   * @param alias - The current alias used as a prefix for relation properties.
   * @param relations - An object representing the relations to be included, where each key is a relation name and the value can be a nested relations object or a boolean.
   * @returns An array of `RelationInterface` objects, each containing the fully qualified property path and its corresponding alias.
   */
  protected getRelationsArray(
    alias: string,
    relations: FindOptionsRelations<EntityType>,
  ): RelationInterface[] {
    const resultRelations: RelationInterface[] = [];

    const keys = Object.keys(relations);

    keys.forEach(key => {
      const value = relations[key];

      if (!value) return;

      const newProperty = alias + '.' + key;
      const newAlias = alias + '_' + key;

      resultRelations.push({ property: newProperty, alias: newAlias });

      if (typeof value === 'object')
        resultRelations.push(...this.getRelationsArray(newAlias, value));
    });

    return resultRelations;
  }

  /**
   * Adds a relation to the query context if it does not already exist, validates the relation path,
   * and performs the appropriate join operation on the query builder.
   *
   * @param queryContext - The context containing the query builder, relations, and relation info.
   * @param property - The property name representing the relation to add. Can be a nested path.
   * @param alias - Optional alias for the relation in the query. If not provided, it is generated from the property path.
   * @param andSelect - If true, performs a `leftJoinAndSelect`; otherwise, performs a `leftJoin`.
   * @returns The `Relation` object representing the added or existing relation.
   * @throws {BadRequestException} If the relation path does not match any valid relation info.
   */
  protected addRelation(
    queryContext: QueryContext<EntityType>,
    property: string,
    alias?: string,
    andSelect?: boolean,
  ): Relation {
    const { queryBuilder, relations } = queryContext;

    if (!property.includes('.')) property = queryBuilder.alias + '.' + property;

    const foundRelation = relations.find(item => item.property === property);

    if (foundRelation) return foundRelation;

    if (!alias) alias = property.replaceAll('.', '_');

    const relation: Relation = { property, alias };

    const relationPath = this.getRelationPath(relations, relation, 0);

    const relationsInfo = queryContext.relationsInfo;

    const relationPathString = relationPath.join('.');

    //check if the current relationPath matchs any valid relationsInfo path.
    const relationInfo = relationsInfo.find(
      item => item.path.slice(1).join('.') === relationPathString,
    );

    if (!relationInfo)
      throw new BadRequestException(
        `invalid relation to property: ${relationPathString}`,
      );

    relation.relationInfo = relationInfo;

    relations.push(relation);

    if (
      !(
        queryContext.ignoreMultiplyingJoins &&
        isMultiplyingCardinality(relationInfo.aggregatedCardinality)
      )
    )
      if (andSelect && !queryContext.ignoreSelects)
        queryBuilder.leftJoinAndSelect(property, alias);
      else queryBuilder.leftJoin(property, alias);

    return relation;
  }

  /**
   * Resolves the full path of a relation property as an array of strings, handling nested relations recursively.
   *
   * @param relations - The list of available relations to search for parent relations.
   * @param relation - The current relation whose path is being resolved. If undefined, returns an empty array.
   * @param recursiveDepth - The current recursion depth, used to prevent infinite recursion.
   * @returns An array of strings representing the path to the relation property.
   * @throws {InternalServerErrorException} If the maximum recursion depth is exceeded.
   * @throws {BadRequestException} If the relation property format is invalid (i.e., contains more than one dot).
   */
  protected getRelationPath(
    relations: Relation[],
    relation: Relation | undefined,
    recursiveDepth: number,
  ): string[] {
    if (recursiveDepth > MAX_RECURSIVE_DEPTH)
      throw new InternalServerErrorException(RECURSIVE_DEPTH_ERROR, {
        cause: { relations, relation, depth: recursiveDepth },
      });

    //there was no relation found, so return empty array
    if (!relation) return [];

    const splittedProp = relation.property.split('.');

    //It should be alias.field
    if (splittedProp.length > 2)
      throw new BadRequestException(
        `bad relation property format: ${relation.property}`,
      );

    //it has no alias, so it must be a first level field
    if (splittedProp.length === 1) return [splittedProp[0]];

    const [parentAlias, field] = splittedProp;

    //Find Parent relation
    const parentRelation = relations.find(item => item.alias === parentAlias);

    return [
      ...this.getRelationPath(relations, parentRelation, recursiveDepth + 1),
      field,
    ];
  }

  /**
   * Applies filtering, ordering, and pagination arguments to the provided query context's QueryBuilder.
   *
   * @param queryContext - The context containing the QueryBuilder and related metadata for the entity.
   * @param args - The arguments specifying filtering (`where`), ordering (`orderBy`), and pagination (`pagination`) options.
   *
   * @remarks
   * - If `args.where` is provided, constructs and applies a WHERE condition to the query.
   * - If `args.orderBy` is provided, applies ordering to the query.
   * - If `args.pagination` is provided, sets the offset and limit for pagination.
   */
  protected applyArgs(
    queryContext: QueryContext<EntityType>,
    args: FindArgs<EntityType>,
  ) {
    const { queryBuilder } = queryContext;

    if (args.where) {
      const whereContext = {
        ...queryContext,
        alias: queryBuilder.alias,
        recusirveDepth: 0,
        constructField: (fieldName, value) => {
          return { [fieldName]: value };
        },
      };
      queryBuilder.where(this.getWhereCondition(whereContext, args.where));
    }

    if (args.orderBy)
      this.applyOrderBy(
        { ...queryContext, alias: queryBuilder.alias, recusirveDepth: 0 },
        args.orderBy,
      );

    if (args.pagination) {
      const { skip, take } = getPaginationArgs(args.pagination);
      0;
      queryBuilder.offset(skip);
      queryBuilder.limit(take);
    }
  }

  /**
   * Applies ordering to the query builder based on the provided `orderBy` parameter.
   * Supports both flat and nested ordering, recursively handling relations up to a maximum depth.
   *
   * @protected
   * @param queryContext - The current context of the query, including the query builder, alias, and recursion depth.
   * @param orderBy - An object or array of objects specifying the fields and directions to order by.
   *                  Each key is a field name, and the value is either an order direction (e.g., 'ASC', 'DESC')
   *                  or a nested object for ordering on related entities.
   * @throws InternalServerErrorException If the recursive depth exceeds the maximum allowed.
   */
  protected applyOrderBy(
    queryContext: RecursiveContext<EntityType>,
    orderBy: OrderBy<EntityType> | OrderBy<EntityType>[],
  ) {
    if (queryContext.recusirveDepth > MAX_RECURSIVE_DEPTH)
      throw new InternalServerErrorException(RECURSIVE_DEPTH_ERROR, {
        cause: { queryContext, orderBy, depth: queryContext.recusirveDepth },
      });

    const { queryBuilder, alias } = queryContext;

    let orderByArr = Array.isArray(orderBy) ? orderBy : [orderBy];

    orderByArr.forEach(order => {
      if (!order) return;

      const keys = Object.keys(order);

      keys.forEach(key => {
        const value = order[key];

        if (value) {
          if (typeof value !== 'object') {
            queryBuilder.addOrderBy(alias + '.' + key, value);
          } else {
            const alias = this.addRelationForConditionOrSorting(
              queryContext,
              key,
            );
            this.applyOrderBy(
              {
                ...queryContext,
                alias,
                recusirveDepth: queryContext.recusirveDepth + 1,
              },
              value,
            );
          }
        }
      });
    });
  }

  /**
   * Constructs a TypeORM `Brackets` object representing the WHERE condition for a query,
   * based on the provided `where` object and the current `whereContext`.
   *
   * This method recursively processes logical operators (`_and`, `_or`) and field/relation conditions,
   * combining them into a single bracketed condition suitable for use in a TypeORM query builder.
   * Throws an `InternalServerErrorException` if the recursive depth exceeds the allowed maximum.
   *
   * @param whereContext - The context object containing query builder and recursion depth information.
   * @param where - An object representing the WHERE conditions, which may include logical operators and field/relation filters.
   * @returns A `Brackets` object encapsulating the constructed WHERE condition.
   * @throws {InternalServerErrorException} If the recursive depth exceeds `MAX_RECURSIVE_DEPTH`.
   */
  protected getWhereCondition(
    whereContext: WhereContext<EntityType>,
    where: Where<EntityType>,
  ): any {
    if (whereContext.recusirveDepth > MAX_RECURSIVE_DEPTH)
      throw new InternalServerErrorException(RECURSIVE_DEPTH_ERROR, {
        cause: { whereContext, where, depth: whereContext.recusirveDepth },
      });

    const andConditions: any[] = [];
    const orConditions: any[] = [];

    const keys = Object.keys(where);

    keys.forEach(key => {
      const value = where[key];

      if (!value) return;

      switch (key) {
        case '_and':
          andConditions.push(...this.getComplexConditions(whereContext, value));
          break;
        case '_or':
          orConditions.push(...this.getComplexConditions(whereContext, value));
          break;
        default:
          if (this.hasFieldConditions(key, value))
            andConditions.push(
              this.getFieldConditions(whereContext, key, value),
            );
          else
            andConditions.push(
              this.relationCondition(whereContext, key, value),
            );
      }
    });

    const andBracket = new Brackets(queryBuilder => {
      fixBracketQueryBuilder(queryBuilder, whereContext.queryBuilder);

      andConditions.forEach(condition => {
        queryBuilder.andWhere(condition);
      });
    });

    if (orConditions.length === 0) return andBracket;

    const orBracket = new Brackets(queryBuilder => {
      fixBracketQueryBuilder(queryBuilder, whereContext.queryBuilder);

      if (andConditions.length > 0) queryBuilder.where(andBracket);

      orConditions.forEach(condition => {
        queryBuilder.orWhere(condition);
      });
    });

    return orBracket;
  }

  /**
   * Builds a where condition for a related entity field within a query context.
   *
   * This method updates the query context to include the necessary relation alias,
   * constructs a new field mapping function for the related field, and recursively
   * generates the where condition for the specified relation.
   *
   * @param whereContext - The current context of the where clause, including alias and field construction logic.
   * @param fieldName - The name of the related entity field to apply the condition on.
   * @param condition - The where condition to apply to the related entity.
   * @returns The constructed where condition for the related entity.
   */
  protected relationCondition(
    whereContext: WhereContext<EntityType>,
    fieldName: string,
    condition: Where<EntityType>,
  ) {
    const alias: string = this.addRelationForConditionOrSorting(
      whereContext,
      fieldName,
    );

    const oldConstructField = whereContext.constructField;

    const constructField = (xfieldName, value) => {
      return oldConstructField(fieldName, { [xfieldName]: value });
    };

    return this.getWhereCondition(
      {
        ...whereContext,
        alias,
        constructField,
        recusirveDepth: whereContext.recusirveDepth + 1,
      },
      condition,
    );
  }

  /**
   * Adds a relation to the query builder for a given field, intended for use in conditions or sorting.
   *
   * This method constructs the property path using the provided context alias and field name,
   * then attempts to add the relation. It validates that the relation's aggregated cardinality
   * is present and not of a multiplying type, throwing an error if these conditions are not met.
   *
   * @param context - The recursive context containing alias and entity information.
   * @param fieldName - The name of the field for which the relation should be added.
   * @returns The alias of the added relation.
   * @throws InternalServerErrorException If the relation's aggregated cardinality is missing or invalid for use in conditions.
   */
  protected addRelationForConditionOrSorting(
    context: RecursiveContext<EntityType>,
    fieldName: string,
  ): string {
    const property = context.alias + '.' + fieldName;

    const relation = this.addRelation(context, property);

    const aggregatedCardinality = relation.relationInfo?.aggregatedCardinality;

    if (!aggregatedCardinality)
      throw new InternalServerErrorException(
        `no aggregatedCardinality for ${property}`,
        { cause: { property, relation, context } },
      );

    if (isMultiplyingCardinality(aggregatedCardinality))
      throw new InternalServerErrorException(
        `invalid aggregatedCardinality (${aggregatedCardinality}) for condition in property (${property}), it will cause a multiplying join`,
        {
          cause: {
            property,
            aggregatedCardinality,
            relation,
            whereContext: context,
          },
        },
      );

    return relation.alias;
  }

  /**
   * Constructs query conditions for a given field based on the provided condition value.
   *
   * This method supports primitive values (string, number, boolean, Date), arrays (for `IN` queries),
   * and objects representing advanced query operators. It validates the input and builds the appropriate
   * query condition using the `whereContext` helper methods.
   *
   * @param whereContext - The context object used to construct field conditions.
   * @param fieldName - The name of the field for which the condition is being constructed.
   * @param fieldCondition - The condition value, which can be a primitive, array, or an object with operators.
   * @returns The constructed field condition suitable for use in a query.
   * @throws InternalServerErrorException If the field condition is not a valid object when expected.
   * @throws BadRequestException If the object condition does not contain any valid operators.
   */
  protected getFieldConditions(
    whereContext: WhereContext<EntityType>,
    fieldName: string,
    fieldCondition: unknown,
  ) {
    if (
      typeof fieldCondition === 'string' ||
      typeof fieldCondition === 'number' ||
      typeof fieldCondition === 'boolean' ||
      fieldCondition instanceof Date
    ) {
      return whereContext.constructField(fieldName, fieldCondition);
    }

    if (Array.isArray(fieldCondition)) {
      return whereContext.constructField(fieldName, In(fieldCondition));
    }

    if (!(typeof fieldCondition === 'object' && fieldCondition !== null))
      throw new InternalServerErrorException(`${fieldName} must be an object`);

    const keys = Object.keys(fieldCondition);

    const opColection: any[] = [];

    keys.forEach(key => {
      const value = fieldCondition[key];
      const cond = conditions[key];

      if (value !== undefined && value !== undefined)
        opColection.push(cond(value));
    });

    if (opColection.length === 0)
      throw new BadRequestException(
        `key ${fieldName} must have a valid condition: ${JSON.stringify(fieldCondition)}`,
      );

    let condition: any = undefined;

    if (opColection.length === 1) condition = opColection[0];
    else condition = And(...opColection);

    return whereContext.constructField(fieldName, condition);
  }

  /**
   * Processes one or multiple where conditions and returns their corresponding query representations.
   *
   * @param whereContext - The context object containing metadata and utilities for building the where clause.
   * @param conditions - A single where condition or an array of where conditions to be processed.
   * @returns An array of processed where conditions, each transformed by `getWhereCondition`.
   */
  protected getComplexConditions(
    whereContext: WhereContext<EntityType>,
    conditions: Where<EntityType> | Where<EntityType>[],
  ) {
    const conditionsArr = Array.isArray(conditions) ? conditions : [conditions];

    return conditionsArr.map(condition =>
      this.getWhereCondition(whereContext, condition),
    );
  }

  /**
   * Checks whether the provided value for a given field name satisfies the required conditions.
   *
   * Throws a `BadRequestException` if the value is `null`, `undefined`, or an empty object.
   * Returns `true` if the value is a primitive (`string`, `number`, `boolean`), a `Date`, or an array.
   * If the value is an object, returns `true` if any of its keys match the allowed condition keys.
   * Otherwise, returns `false`.
   *
   * @param fieldName - The name of the field being checked.
   * @param value - The value to validate against the field conditions.
   * @returns `true` if the value satisfies the field conditions, otherwise `false`.
   * @throws {BadRequestException} If the value is `null`, `undefined`, or an empty object.
   */
  protected hasFieldConditions(fieldName: string, value: unknown): boolean {
    if (value === undefined || value === null)
      throw new BadRequestException(
        `field ${fieldName} cannot be null or undefined`,
      );

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Date ||
      Array.isArray(value)
    )
      return true;

    const objKeys = Object.keys(value);

    if (objKeys.length === 0)
      throw new BadRequestException(`field ${fieldName} cannot be empty`);

    if (objKeys.some(item => conditionsKeys.includes(item))) return true;

    return false;
  }
}
