import { IsArray, IsOptional, ValidateNested } from "class-validator";
import { Type as TransformerType } from "class-transformer";
import { SetMetadata, Type, mixin } from "@nestjs/common";
import { ApiProperty, ApiSchema, PartialType } from "@nestjs/swagger";
import { Constructable, FindArgs, OrderBy, Where } from "@solid-nestjs/common";
import { PaginationRequest } from "../classes/inputs";
import { FindArgsStructure } from "../interfaces";

export const WHERE_CLASS_KEY = 'WhereClass';
export const ORDER_BY_CLASS_KEY = 'OrderByClass';

export function 
    FindArgsFrom<
        EntityType,
        WhereType extends Where<EntityType> = Where<EntityType>,
        OrderByType extends OrderBy<EntityType> = OrderBy<EntityType>
    > (
        findArgsStructure?: FindArgsStructure<EntityType,WhereType,OrderByType>
    ) : Type<FindArgs<EntityType>> {    
        
    const { whereType, orderByType } = findArgsStructure ?? {};

    class ArgsClass implements FindArgs<EntityType>
    {        
        @ApiProperty({ type: () => PaginationRequest, required: false })
        @TransformerType(() => PaginationRequest)
        @IsOptional()
        @ValidateNested()
        pagination?:PaginationRequest;
    }

    let returnedClass:Constructable<ArgsClass> = ArgsClass;

    if(whereType)
    {
        @ApiSchema({ name: whereType.name })
        class WhereClass extends PartialType(whereType as Constructable)
        {        
            @ApiProperty({ type: () => [whereType], required: false, example: [] })
            @IsArray()
            @TransformerType(() => WhereClass)
            @IsOptional()
            @ValidateNested()
            _and?:WhereClass[];
        
            @ApiProperty({ type: () => [whereType], required: false, example: [] })
            @IsArray()
            @TransformerType(() => WhereClass)
            @IsOptional()
            @ValidateNested()
            _or?:WhereClass[];
        }

        @SetMetadata(WHERE_CLASS_KEY,WhereClass)
        class ArgsClassWithWhere extends returnedClass
        {
            @ApiProperty({ type: () => WhereClass, required: false })
            @TransformerType(() => WhereClass)
            @IsOptional()
            @ValidateNested()
            where?:WhereClass;
        }

        returnedClass = ArgsClassWithWhere;
    }
    
    if(orderByType)
    {
        @ApiSchema({ name: orderByType.name })
        class OrderByClass extends PartialType(orderByType as Constructable)
        { }

        @SetMetadata(ORDER_BY_CLASS_KEY,OrderByClass)
        class ArgsClassWithOrderBy extends returnedClass
        {
            @ApiProperty({ type: () => [OrderByClass], required: false })
            @IsArray()
            @TransformerType(() => OrderByClass)
            @IsOptional()
            @ValidateNested()
            orderBy?:OrderByClass[];
        }

        returnedClass = ArgsClassWithOrderBy;
    }   

    return mixin(returnedClass);
 }

export function getWhereClass(findArgsType){
    return Reflect.getMetadata(WHERE_CLASS_KEY, findArgsType);
}

export function getOrderByClass(findArgsType){
    return Reflect.getMetadata(ORDER_BY_CLASS_KEY, findArgsType);
}