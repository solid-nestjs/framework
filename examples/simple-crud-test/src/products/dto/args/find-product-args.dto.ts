import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { Where } from "@solid-nestjs/common";
import { FindArgsFrom, getWhereClass, StringFilter } from "@solid-nestjs/rest-api";
import { FindSupplierArgs } from "../../../suppliers/dto";
import { Product } from "../../entities/product.entity";
import { Supplier } from "src/suppliers/entities/supplier.entity";

const SupplierWhere = getWhereClass(FindSupplierArgs);

class FindProductWhere implements Where<Product>
{
    @ApiProperty({ type: () => StringFilter, required: false })
    @Type(() => StringFilter)
    @IsOptional()
    @ValidateNested()
    name?: StringFilter;

    @ApiProperty({ type: () => SupplierWhere, required: false })
    @Type(() => SupplierWhere)
    @IsOptional()
    @ValidateNested()
    supplier?: Where<Supplier> | undefined;
}



export class FindProductArgs extends FindArgsFrom<Product>({ whereType:FindProductWhere })
{
    
}