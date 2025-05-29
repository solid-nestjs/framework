import { IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { FindArgsFrom, getOrderByClass, getWhereClass, NumberFilter, OrderBy, OrderByTypes, StringFilter, Where } from "@solid-nestjs/typeorm-crud";
import { FindSupplierArgs } from "../../../suppliers/dto";
import { Supplier } from "../../../suppliers/entities/supplier.entity";
import { Product } from "../../entities/product.entity";

const SupplierWhere = getWhereClass(FindSupplierArgs);

class FindProductWhere implements Where<Product> {
    @ApiProperty({ type: () => StringFilter, required: false })
    @Type(() => StringFilter)
    @IsOptional()
    @ValidateNested()
    name?: StringFilter | undefined;

    @ApiProperty({ type: () => StringFilter, required: false })
    @Type(() => StringFilter)
    @IsOptional()
    @ValidateNested()   
    description?: StringFilter | undefined;

    @ApiProperty({ type: () => NumberFilter, required: false })
    @Type(() => NumberFilter)
    @IsOptional()
    @ValidateNested()  
    price?: NumberFilter | undefined;

    @ApiProperty({ type: () => NumberFilter, required: false })
    @Type(() => NumberFilter)
    @IsOptional()
    @ValidateNested()  
    stock?: NumberFilter | undefined;

    @ApiProperty({ type: () => SupplierWhere, required: false })
    @Type(() => SupplierWhere)
    @IsOptional()
    @ValidateNested()
    supplier?: Where<Supplier> | undefined;

}

const SupplierOrderBy = getOrderByClass(FindSupplierArgs);

class FindProductOrderBy implements OrderBy<Product> {

    @ApiProperty({ enum: OrderByTypes, required: false })
    @IsEnum(OrderByTypes)
    @IsOptional()
    description?: OrderByTypes | undefined;

    @ApiProperty({ enum: OrderByTypes, required: false })
    @IsEnum(OrderByTypes)
    @IsOptional()
    name?: OrderByTypes | undefined;

    @ApiProperty({ enum: OrderByTypes, required: false })
    @IsEnum(OrderByTypes)
    @IsOptional()
    price?: OrderByTypes | undefined;

    @ApiProperty({ enum: OrderByTypes, required: false })
    @IsEnum(OrderByTypes)
    @IsOptional()
    stock?: OrderByTypes | undefined;

    @ApiProperty({ type: () => SupplierOrderBy, required: false })
    @Type(() => SupplierOrderBy)
    @IsOptional()
    @ValidateNested()
    supplier?: OrderBy<Supplier> | undefined;
}

export class FindProductArgs extends FindArgsFrom<Product>({ whereType: FindProductWhere, orderByType: FindProductOrderBy })
{

}