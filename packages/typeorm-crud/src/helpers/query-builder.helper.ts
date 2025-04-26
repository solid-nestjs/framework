import { And, Between, Brackets, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { Constructable } from "../types";
import { DataRetrievalOptions, Relation as RelationInterface, Entity, IdTypeFrom, ExtendedRelationInfo, FindArgsInterface } from "../interfaces";
import { getEntityRelationsExtended } from "./entity-relations.helper";
import { getPaginationArgs } from "./pagination.helper";

const conditions = {
    _eq: (value) => value,
    _neq: (value) => Not(value),
    _gt: (value) => MoreThan(value),
    _gte: (value) => MoreThanOrEqual(value),
    _lt: (value) => LessThan(value),
    _lte: (value) => LessThanOrEqual(value),
    _in: (value) => In(value),
    _between: (value) => Between(value[0],value[1]),
    _notbetween: (value) => Not(Between(value[0],value[1])),
    _startswith: (value) => Like(value+'%'),
    _notstartswith: (value) => Not(Like(value+'%')),
    _endswith: (value) => Like('%'+value),
    _notendswith: (value) => Not(Like('%'+value)),
    _contains: (value) => Like('%'+value+'%'),
    _notcontains: (value) => Not(Like('%'+value+'%')),
    _like: (value) => Like(value),
    _notlike: (value) => Not(Like(value)),
};

const conditionsKeys = Object.keys(conditions);

function fixBracketQueryBuilder(bracketQueryBuilder,queryBuilder)
{
    //bracketQueryBuilder.expressionMap.joinAttributes = queryBuilder.expressionMap.joinAttributes;
    bracketQueryBuilder.expressionMap.joinAttributes = [...queryBuilder.expressionMap.joinAttributes] ;
}

class Relation implements RelationInterface
{
    property:string;
    alias:string;
    relationInfo?:ExtendedRelationInfo;
}

function isMultiplyingJoin(relation: Relation): boolean {
    const cardinality = relation.relationInfo?.aggregatedCardinality;
    return cardinality === 'one-to-many' || cardinality ==='many-to-many';
}

interface QueryContext<EntityType extends ObjectLiteral> {
    queryBuilder: SelectQueryBuilder<EntityType>;
    relations: Relation[];
    relationsInfo: ExtendedRelationInfo[];
}

interface whereContext<EntityType extends ObjectLiteral> extends QueryContext<EntityType> {
    alias: string;
    recusirveDepth:number;
    constructField: (fieldName:string,value:any) => object;
}

const MAX_RECURSIVE_DEPTH = 20;
const RECURSIVE_DEPTH_ERROR = `Max recursive depth reached`;

export function QueryBuilderHelper<
                    IdType extends IdTypeFrom<EntityType>,
                    EntityType extends Entity<any>,
                    FindArgsType extends FindArgsInterface
                >(
                    entityType:Constructable<EntityType>,
                    argsType:Constructable<FindArgsType>
                ) {

    class QueryBuilderHelper {        
        
        static _relationsInfo?: ExtendedRelationInfo[];

        static getRelationsInfo(repository:Repository<EntityType>) : ExtendedRelationInfo[]
        {
            if(!this._relationsInfo)
                this._relationsInfo = getEntityRelationsExtended(repository);

            return this._relationsInfo;
        }

        static getQueryBuilder(repository:Repository<EntityType>,args?:FindArgsType,options?:DataRetrievalOptions) : SelectQueryBuilder<EntityType>
        {
            const mainAlias = options?.mainAlias ?? 'aa';
            const relationsList = options?.relations ?? [];
            const relationsInfo = this.getRelationsInfo(repository);
            
            const queryBuilder = repository.createQueryBuilder(mainAlias);
            
            if(options?.lockMode)
                if(options.lockMode.lockMode === "optimistic")
                    queryBuilder.setLock(options.lockMode.lockMode,options.lockMode.lockVersion);
                else
                    queryBuilder.setLock(options.lockMode.lockMode,options.lockMode.lockVersion,options.lockMode.lockTables);

            const queryContext:QueryContext<EntityType> = {
                queryBuilder: queryBuilder,
                relations: [],
                relationsInfo,
            };

            relationsList.forEach((relation) => {
                let { property, alias } = relation;

                QueryBuilderHelper.addRelation(queryContext,property,alias,true);
            });

            if(args)
                QueryBuilderHelper.applyArgs(queryContext,args);


            return queryBuilder;
        }        

        static addRelation(queryContext:QueryContext<EntityType>, property:string, alias?:string, andSelect?:boolean) : Relation
        {
            const { queryBuilder, relations } = queryContext;

            if(!property.includes('.'))
                property = queryBuilder.alias + '.' + property;

            const foundRelation = relations.find((item) => item.property === property);

            if(foundRelation)
                return foundRelation;

            if(!alias)
                alias = property.replaceAll('.','_');            

         
            const relation:Relation = { property, alias };

            const relationPath = this.getRelationPath(relations,relation,0);

            const relationsInfo = queryContext.relationsInfo;

            const relationPathString = relationPath.join('.')

            //check if the current relationPath matchs any valid relationsInfo path.
            const relationInfo = relationsInfo.find((item) => item.path.slice(1).join('.') === relationPathString );
            
            if(!relationInfo)
                throw new BadRequestException(`invalid relation to property: ${relationPathString}`);

            relation.relationInfo = relationInfo;
                       
            relations.push(relation);
            
            if(andSelect)
                queryBuilder.leftJoinAndSelect( property, alias );
            else
                queryBuilder.leftJoin( property, alias );

            return relation;
        }

        static getRelationPath(relations:Relation[],relation:Relation|undefined,recursiveDepth:number):string[]
        {
            if(recursiveDepth > MAX_RECURSIVE_DEPTH)
                throw new InternalServerErrorException(RECURSIVE_DEPTH_ERROR,{ cause: { relations, relation, depth: recursiveDepth } });

            //there was no relation found, so return empty array
            if(!relation)
                return [];

            const splittedProp = relation.property.split('.');

            //It should be alias.field
            if(splittedProp.length > 2)
                throw new BadRequestException(`bad relation property format: ${relation.property}`);

            //it has no alias, so it must be a first level field
            if(splittedProp.length === 1)
                return [splittedProp[0]];
            
            const [parentAlias, field] = splittedProp;

            //Find Parent relation
            const parentRelation = relations.find((item) => item.alias === parentAlias);

            return [...this.getRelationPath(relations,parentRelation,recursiveDepth+1),field];
        }

        static applyArgs(queryContext:QueryContext<EntityType>, args:FindArgsType)
        {
            const { queryBuilder } = queryContext;

            if(args.where)
            {
                const whereContext = { 
                    ...queryContext,
                    alias: queryBuilder.alias,
                    recusirveDepth:0,
                    constructField : (fieldName,value) => { return { [fieldName]:value }; },
                };
                queryBuilder.where(QueryBuilderHelper.getWhereCondition(whereContext,args.where));
            }

            if(args.orderBy)
                QueryBuilderHelper.applyOrderBy(queryContext,args.orderBy);
            
            if(args.pagination)
            {
                const { skip, take } = getPaginationArgs(args.pagination);
0
                queryBuilder.offset(skip);
                queryBuilder.limit(take);
            }
        }

        static applyOrderBy(queryContext:QueryContext<EntityType>,orderBy:any[])
        {
            const { queryBuilder } = queryContext;

            orderBy.forEach((order) => {
                if(!order)
                    return;

                const keys = Object.keys(order);

                keys.forEach((key) => {
                    const value = order[key];

                    if(value)
                        queryBuilder.addOrderBy(queryBuilder.alias + '.' + key,value);
                });
            });
        }

        static getWhereCondition(whereContext:whereContext<EntityType>,where:object) : any
        {
            if(whereContext.recusirveDepth > MAX_RECURSIVE_DEPTH)
                throw new InternalServerErrorException(RECURSIVE_DEPTH_ERROR,{ cause: { whereContext, where, depth: whereContext.recusirveDepth } });

            const andConditions:any[] = [];
            const orConditions:any[] = [];

            const keys = Object.keys(where);

            keys.forEach((key) => {
                const value = where[key];

                if(!value)
                    return;

                switch(key)
                {
                    case '_and': andConditions.push(...QueryBuilderHelper.getComplexConditions(whereContext,value))
                        break;            
                    case '_or': orConditions.push(...QueryBuilderHelper.getComplexConditions(whereContext,value))
                        break;
                    default:    
                        if(QueryBuilderHelper.hasFieldConditions(key,value))
                            andConditions.push(QueryBuilderHelper.getFieldConditions(whereContext,key,value));
                        else
                            andConditions.push(QueryBuilderHelper.relationCondition(whereContext,key,value));
                }      
            })

            const andBracket = new Brackets(queryBuilder => {
                fixBracketQueryBuilder(queryBuilder,whereContext.queryBuilder);

                andConditions.forEach((condition) => {
                    queryBuilder.andWhere(condition);
                })            
            });

            if(orConditions.length === 0)
                return andBracket;

            const orBracket = new Brackets(queryBuilder => {
                fixBracketQueryBuilder(queryBuilder,whereContext.queryBuilder);

                if(andConditions.length > 0)
                    queryBuilder.where(andBracket);

                orConditions.forEach((condition) => {
                    queryBuilder.orWhere(condition);
                })            
            });

            return orBracket;
        }

        static relationCondition(whereContext:whereContext<EntityType>,fieldName:string,condition:object){

            const alias:string = QueryBuilderHelper.addRelationForCondition(whereContext,fieldName);

            const oldConstructField = whereContext.constructField;

            const constructField = (xfieldName,value) => { return oldConstructField(fieldName,{[xfieldName]:value}) };

            return QueryBuilderHelper.getWhereCondition({ ...whereContext, alias, constructField, recusirveDepth:whereContext.recusirveDepth+1 },condition);          
        }

        static addRelationForCondition(whereContext:whereContext<EntityType>,fieldName:string) : string
        {
            const property = whereContext.alias + '.' + fieldName;

            const relation = this.addRelation(whereContext,property);

            const aggregatedCardinality = relation.relationInfo?.aggregatedCardinality;

            if(!aggregatedCardinality)
                throw new InternalServerErrorException(`no aggregatedCardinality for ${property}`,{ cause:{ property, relation, whereContext } });

            if(aggregatedCardinality === "one-to-many" || aggregatedCardinality == "many-to-many")
                throw new InternalServerErrorException(`invalid aggregatedCardinality (${aggregatedCardinality}) for condition in property (${property})`,{ cause:{ property, aggregatedCardinality, relation, whereContext } });

            return relation.alias;
        }

        static getFieldConditions(whereContext:whereContext<EntityType>,fieldName:string,fieldCondition:object)
        {
            if(
                typeof(fieldCondition) === 'string'
                ||typeof(fieldCondition) === 'number'
                ||typeof(fieldCondition) === 'boolean'
                ||fieldCondition instanceof Date
            )
            {
                return whereContext.constructField(fieldName,fieldCondition);
            }

            if(fieldCondition instanceof Array)
            {
                return whereContext.constructField(fieldName,In(fieldCondition));
            }

            const keys = Object.keys(fieldCondition);

            const opColection:any[] = [];

            keys.forEach((key) => {
                const value = fieldCondition[key];
                const cond = conditions[key];

                if(value !== undefined && value !== undefined)
                    opColection.push(cond(value));
            })

            if(opColection.length === 0)
                throw new BadRequestException(`key ${fieldName} must have a valid condition: ${JSON.stringify(fieldCondition)}`);

            let condition:any = undefined;
            
            if(opColection.length === 1)
                condition = opColection[0];
            else
                condition = And(...opColection);

            return whereContext.constructField(fieldName,condition);
        }    

        static getComplexConditions(whereContext:whereContext<EntityType>,conditions:object[]) {
            return conditions.map((condition) => QueryBuilderHelper.getWhereCondition(whereContext,condition));
        }

        static hasFieldConditions(fieldName:string,value:object): boolean
        {
            if(value === undefined || value === null)
                throw new BadRequestException(`field ${fieldName} cannot be null or undefined`);

            if(
                typeof(value) === 'string'
                ||typeof(value) === 'number'
                ||typeof(value) === 'boolean'
                ||value instanceof Date
                ||value instanceof Array
            ) return true;

            const objKeys = Object.keys(value);

            if(objKeys.length === 0)
                throw new BadRequestException(`field ${fieldName} cannot be empty`);

            if(objKeys.some( item => conditionsKeys.includes(item) ))
                return true;            

            return false;
        }
    }

    return QueryBuilderHelper;
}