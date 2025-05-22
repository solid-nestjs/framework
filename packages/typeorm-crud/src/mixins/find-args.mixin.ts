import { IsArray, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { SetMetadata, mixin } from "@nestjs/common";
import { ApiProperty, ApiSchema, PartialType } from "@nestjs/swagger";
import { Constructable } from "../types";
import { Pagination } from "../classes/inputs";

export const WHERE_CLASS_KEY = 'WhereClass';
export const ORDER_BY_CLASS_KEY = 'OrderByClass';

export function 
    FindArgs<
        WhereStructureType extends Constructable = Constructable,
        OrderByStructureType extends Constructable = Constructable
    > (
        whereStructureType?: WhereStructureType,
        orderByStructureType?: OrderByStructureType
    ){    
        
    class ArgsClass
    {        
        @ApiProperty({ type: () => Pagination, required: false })
        @Type(() => Pagination)
        @IsOptional()
        @ValidateNested()
        pagination?:Pagination;
    }

    let returnedClass:Constructable<ArgsClass> = ArgsClass;

    if(whereStructureType)
    {
        @ApiSchema({ name: whereStructureType.name })
        class WhereClass extends PartialType(whereStructureType)
        {        
            @ApiProperty({ type: () => [whereStructureType], required: false, example: [] })
            @IsArray()
            @Type(() => WhereClass)
            @IsOptional()
            @ValidateNested()
            _and?:WhereClass[];
        
            @ApiProperty({ type: () => [whereStructureType], required: false, example: [] })
            @IsArray()
            @Type(() => WhereClass)
            @IsOptional()
            @ValidateNested()
            _or?:WhereClass[];
        }

        @SetMetadata(WHERE_CLASS_KEY,WhereClass)
        class ArgsClassWithWhere extends returnedClass
        {
            @ApiProperty({ type: () => WhereClass, required: false })
            @Type(() => WhereClass)
            @IsOptional()
            @ValidateNested()
            where?:WhereClass;
        }

        returnedClass = ArgsClassWithWhere;
    }
    
    if(orderByStructureType)
    {
        @ApiSchema({ name: orderByStructureType.name })
        class OrderByClass extends PartialType(orderByStructureType)
        { }

        @SetMetadata(ORDER_BY_CLASS_KEY,OrderByClass)
        class ArgsClassWithOrderBy extends returnedClass
        {
            @ApiProperty({ type: () => [OrderByClass], required: false })
            @IsArray()
            @Type(() => OrderByClass)
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