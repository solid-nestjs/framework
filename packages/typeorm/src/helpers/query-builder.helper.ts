import { And, Between, Brackets, FindOptionsRelations, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";
import { RelationType } from "typeorm/metadata/types/RelationTypes";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { Constructable, Entity, FindArgs, getPaginationArgs, IdTypeFrom, OrderBy, Where } from "@nestjz/common";
import {
    DataRetrievalOptions, Relation as RelationInterface,
    ExtendedRelationInfo, QueryBuilderConfig
} from "../interfaces";
import { getEntityRelationsExtended } from "./entity-relations.helper";

const conditions = {
    _eq: (value) => value,
    _neq: (value) => Not(value),
    _gt: (value) => MoreThan(value),
    _gte: (value) => MoreThanOrEqual(value),
    _lt: (value) => LessThan(value),
    _lte: (value) => LessThanOrEqual(value),
    _in: (value) => In(value),
    _between: (value) => Between(value[0], value[1]),
    _notbetween: (value) => Not(Between(value[0], value[1])),
    _startswith: (value) => Like(value + '%'),
    _notstartswith: (value) => Not(Like(value + '%')),
    _endswith: (value) => Like('%' + value),
    _notendswith: (value) => Not(Like('%' + value)),
    _contains: (value) => Like('%' + value + '%'),
    _notcontains: (value) => Not(Like('%' + value + '%')),
    _like: (value) => Like(value),
    _notlike: (value) => Not(Like(value)),
};

const conditionsKeys = Object.keys(conditions);

function fixBracketQueryBuilder(bracketQueryBuilder, queryBuilder) {
    //bracketQueryBuilder.expressionMap.joinAttributes = queryBuilder.expressionMap.joinAttributes;
    bracketQueryBuilder.expressionMap.joinAttributes = [...queryBuilder.expressionMap.joinAttributes];
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

interface whereContext<EntityType extends ObjectLiteral> extends QueryContext<EntityType> {
    alias: string;
    recusirveDepth: number;
    constructField: (fieldName: string, value: any) => object;
}

const MAX_RECURSIVE_DEPTH = 20;
const RECURSIVE_DEPTH_ERROR = `Max recursive depth reached`;

export class QueryBuilderHelper<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<any>
> {
    constructor(
        private readonly entityType: Constructable<EntityType>,
        private readonly defaultOptions?: QueryBuilderConfig<EntityType>,
    ) { }


    private _relationsInfo?: ExtendedRelationInfo[];

    getRelationsInfo(repository: Repository<EntityType>): ExtendedRelationInfo[] {
        if (!this._relationsInfo)
            this._relationsInfo = getEntityRelationsExtended(repository);

        return this._relationsInfo;
    }

    getQueryBuilder(
        repository: Repository<EntityType>,
        args?: FindArgs<EntityType>,
        options?: DataRetrievalOptions<EntityType>
    ): SelectQueryBuilder<EntityType> {
        return this.implGetQueryBuilder(repository, args, options) as SelectQueryBuilder<EntityType>;
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
        options?: DataRetrievalOptions<EntityType>
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
        if (!relationsInfo.some(info => isMultiplyingCardinality(info.aggregatedCardinality))) {
            return false;
        }

        const qb = this.implGetQueryBuilder(repository, args, options, {
            ignoreSelects: true,
            ignoreMultiplyingJoins: true,
            validRelations(relations) {
                //it should only keep trying to get paginatedQueryBuilder if finds a relation with multiplying cardinality
                return relations.some(relation => (relation.relationInfo) ? isMultiplyingCardinality(relation.relationInfo?.aggregatedCardinality) : false);
            },
        });

        if (!qb)
            return false;

        const mainAlias = options?.mainAlias ?? this.defaultOptions?.relationsConfig?.mainAlias ?? this.entityType.name.toLowerCase();

        return qb.select(mainAlias + '.id');
    }

    protected implGetQueryBuilder(
        repository: Repository<EntityType>,
        args?: FindArgs<EntityType>,
        options?: DataRetrievalOptions<EntityType>,
        baseQueryContext?: Partial<QueryContext<EntityType>>,
    ): SelectQueryBuilder<EntityType> | false {
        const relationsInfo = this.getRelationsInfo(repository);

        const mainAlias = options?.mainAlias ?? this.defaultOptions?.relationsConfig?.mainAlias ?? this.entityType.name.toLowerCase();
        const relations = options?.relations ?? this.defaultOptions?.relationsConfig?.relations ?? [];
        const lockMode = options?.lockMode ?? this.defaultOptions?.lockMode;
        const ignoreMultiplyingJoins = options?.ignoreMultiplyingJoins ?? baseQueryContext?.ignoreMultiplyingJoins;
        const ignoreSelects = options?.ignoreSelects ?? baseQueryContext?.ignoreSelects;

        const queryBuilder = repository.createQueryBuilder(mainAlias);

        if (lockMode)
            if (lockMode.lockMode === "optimistic")
                queryBuilder.setLock(lockMode.lockMode, lockMode.lockVersion);
            else
                queryBuilder.setLock(lockMode.lockMode, lockMode.lockVersion, lockMode.lockTables);

        if (options?.withDeleted)
            queryBuilder.withDeleted();

        const queryContext: QueryContext<EntityType> = {
            ...baseQueryContext,
            queryBuilder: queryBuilder,
            relations: [],
            relationsInfo,
            ignoreMultiplyingJoins,
            ignoreSelects,
        };

        const relationsArray = (Array.isArray(relations)) ? relations : this.getRelationsArray(mainAlias, relations);

        relationsArray.forEach((relation) => {
            let { property, alias } = relation;

            this.addRelation(queryContext, property, alias, true);
        });

        if (queryContext.validRelations && !queryContext.validRelations(queryContext.relations))
            return false;

        if (args)
            this.applyArgs(queryContext, args);


        return queryBuilder;
    }

    protected getRelationsArray(alias: string, relations: FindOptionsRelations<EntityType>): RelationInterface[] {
        const resultRelations: RelationInterface[] = [];

        const keys = Object.keys(relations);

        keys.forEach((key) => {
            const value = relations[key];

            if (!value)
                return;

            const newProperty = alias + '.' + key;
            const newAlias = alias + '_' + key;

            resultRelations.push({ property: newProperty, alias: newAlias });

            if (typeof (value) === 'object')
                resultRelations.push(...this.getRelationsArray(newAlias, value));
        });

        return resultRelations;
    }

    protected addRelation(
        queryContext: QueryContext<EntityType>,
        property: string,
        alias?: string,
        andSelect?: boolean
    ): Relation {
        const { queryBuilder, relations } = queryContext;

        if (!property.includes('.'))
            property = queryBuilder.alias + '.' + property;

        const foundRelation = relations.find((item) => item.property === property);

        if (foundRelation)
            return foundRelation;

        if (!alias)
            alias = property.replaceAll('.', '_');


        const relation: Relation = { property, alias };

        const relationPath = this.getRelationPath(relations, relation, 0);

        const relationsInfo = queryContext.relationsInfo;

        const relationPathString = relationPath.join('.')

        //check if the current relationPath matchs any valid relationsInfo path.
        const relationInfo = relationsInfo.find((item) => item.path.slice(1).join('.') === relationPathString);

        if (!relationInfo)
            throw new BadRequestException(`invalid relation to property: ${relationPathString}`);

        relation.relationInfo = relationInfo;

        relations.push(relation);

        if (!(queryContext.ignoreMultiplyingJoins && isMultiplyingCardinality(relationInfo.aggregatedCardinality)))
            if (andSelect && !queryContext.ignoreSelects)
                queryBuilder.leftJoinAndSelect(property, alias);
            else
                queryBuilder.leftJoin(property, alias);

        return relation;
    }

    protected getRelationPath(
        relations: Relation[],
        relation: Relation | undefined,
        recursiveDepth: number
    ): string[] {
        if (recursiveDepth > MAX_RECURSIVE_DEPTH)
            throw new InternalServerErrorException(RECURSIVE_DEPTH_ERROR, { cause: { relations, relation, depth: recursiveDepth } });

        //there was no relation found, so return empty array
        if (!relation)
            return [];

        const splittedProp = relation.property.split('.');

        //It should be alias.field
        if (splittedProp.length > 2)
            throw new BadRequestException(`bad relation property format: ${relation.property}`);

        //it has no alias, so it must be a first level field
        if (splittedProp.length === 1)
            return [splittedProp[0]];

        const [parentAlias, field] = splittedProp;

        //Find Parent relation
        const parentRelation = relations.find((item) => item.alias === parentAlias);

        return [...this.getRelationPath(relations, parentRelation, recursiveDepth + 1), field];
    }

    protected applyArgs(
        queryContext: QueryContext<EntityType>,
        args: FindArgs<EntityType>
    ) {
        const { queryBuilder } = queryContext;

        if (args.where) {
            const whereContext = {
                ...queryContext,
                alias: queryBuilder.alias,
                recusirveDepth: 0,
                constructField: (fieldName, value) => { return { [fieldName]: value }; },
            };
            queryBuilder.where(this.getWhereCondition(whereContext, args.where));
        }

        if (args.orderBy)
            this.applyOrderBy(queryContext, args.orderBy);

        if (args.pagination) {
            const { skip, take } = getPaginationArgs(args.pagination);
            0
            queryBuilder.offset(skip);
            queryBuilder.limit(take);
        }
    }

    protected applyOrderBy(
        queryContext: QueryContext<EntityType>,
        orderBy: OrderBy<EntityType> | OrderBy<EntityType>[]
    ) {
        const { queryBuilder } = queryContext;

        let orderByArr = (Array.isArray(orderBy)) ? orderBy : [orderBy];

        orderByArr.forEach((order) => {
            if (!order)
                return;

            const keys = Object.keys(order);

            keys.forEach((key) => {
                const value = order[key];

                if (value)
                    queryBuilder.addOrderBy(queryBuilder.alias + '.' + key, value);
            });
        });
    }

    protected getWhereCondition(
        whereContext: whereContext<EntityType>,
        where: Where<EntityType>
    ): any {
        if (whereContext.recusirveDepth > MAX_RECURSIVE_DEPTH)
            throw new InternalServerErrorException(RECURSIVE_DEPTH_ERROR, { cause: { whereContext, where, depth: whereContext.recusirveDepth } });

        const andConditions: any[] = [];
        const orConditions: any[] = [];

        const keys = Object.keys(where);

        keys.forEach((key) => {
            const value = where[key];

            if (!value)
                return;

            switch (key) {
                case '_and': andConditions.push(...this.getComplexConditions(whereContext, value))
                    break;
                case '_or': orConditions.push(...this.getComplexConditions(whereContext, value))
                    break;
                default:
                    if (this.hasFieldConditions(key, value))
                        andConditions.push(this.getFieldConditions(whereContext, key, value));
                    else
                        andConditions.push(this.relationCondition(whereContext, key, value));
            }
        })

        const andBracket = new Brackets(queryBuilder => {
            fixBracketQueryBuilder(queryBuilder, whereContext.queryBuilder);

            andConditions.forEach((condition) => {
                queryBuilder.andWhere(condition);
            })
        });

        if (orConditions.length === 0)
            return andBracket;

        const orBracket = new Brackets(queryBuilder => {
            fixBracketQueryBuilder(queryBuilder, whereContext.queryBuilder);

            if (andConditions.length > 0)
                queryBuilder.where(andBracket);

            orConditions.forEach((condition) => {
                queryBuilder.orWhere(condition);
            })
        });

        return orBracket;
    }

    protected relationCondition(
        whereContext: whereContext<EntityType>,
        fieldName: string,
        condition: Where<EntityType>
    ) {

        const alias: string = this.addRelationForCondition(whereContext, fieldName);

        const oldConstructField = whereContext.constructField;

        const constructField = (xfieldName, value) => { return oldConstructField(fieldName, { [xfieldName]: value }) };

        return this.getWhereCondition({ ...whereContext, alias, constructField, recusirveDepth: whereContext.recusirveDepth + 1 }, condition);
    }

    protected addRelationForCondition(
        whereContext: whereContext<EntityType>,
        fieldName: string
    ): string {
        const property = whereContext.alias + '.' + fieldName;

        const relation = this.addRelation(whereContext, property);

        const aggregatedCardinality = relation.relationInfo?.aggregatedCardinality;

        if (!aggregatedCardinality)
            throw new InternalServerErrorException(`no aggregatedCardinality for ${property}`, { cause: { property, relation, whereContext } });

        if (isMultiplyingCardinality(aggregatedCardinality))
            throw new InternalServerErrorException(`invalid aggregatedCardinality (${aggregatedCardinality}) for condition in property (${property}), it will cause a multiplying join`, { cause: { property, aggregatedCardinality, relation, whereContext } });

        return relation.alias;
    }

    protected getFieldConditions(
        whereContext: whereContext<EntityType>,
        fieldName: string,
        fieldCondition: unknown
    ) {
        if (
            typeof (fieldCondition) === 'string'
            || typeof (fieldCondition) === 'number'
            || typeof (fieldCondition) === 'boolean'
            || fieldCondition instanceof Date
        ) {
            return whereContext.constructField(fieldName, fieldCondition);
        }

        if (Array.isArray(fieldCondition)) {
            return whereContext.constructField(fieldName, In(fieldCondition));
        }


        if (!(typeof fieldCondition === 'object' &&
            fieldCondition !== null
        ))
            throw new InternalServerErrorException(`${fieldName} must be an object`);

        const keys = Object.keys(fieldCondition);

        const opColection: any[] = [];

        keys.forEach((key) => {
            const value = fieldCondition[key];
            const cond = conditions[key];

            if (value !== undefined && value !== undefined)
                opColection.push(cond(value));
        })

        if (opColection.length === 0)
            throw new BadRequestException(`key ${fieldName} must have a valid condition: ${JSON.stringify(fieldCondition)}`);

        let condition: any = undefined;

        if (opColection.length === 1)
            condition = opColection[0];
        else
            condition = And(...opColection);

        return whereContext.constructField(fieldName, condition);
    }

    protected getComplexConditions(
        whereContext: whereContext<EntityType>,
        conditions: Where<EntityType> | Where<EntityType>[]
    ) {
        const conditionsArr = (Array.isArray(conditions)) ? conditions : [conditions];

        return conditionsArr.map((condition) => this.getWhereCondition(whereContext, condition));
    }

    protected hasFieldConditions(
        fieldName: string,
        value: unknown
    ): boolean {
        if (value === undefined || value === null)
            throw new BadRequestException(`field ${fieldName} cannot be null or undefined`);

        if (
            typeof (value) === 'string'
            || typeof (value) === 'number'
            || typeof (value) === 'boolean'
            || value instanceof Date
            || Array.isArray(value)
        ) return true;

        const objKeys = Object.keys(value);

        if (objKeys.length === 0)
            throw new BadRequestException(`field ${fieldName} cannot be empty`);

        if (objKeys.some(item => conditionsKeys.includes(item)))
            return true;

        return false;
    }
}