import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { FindArgsFrom, getWhereClass, StringFilter, Where } from "@solid-nestjs/typeorm-crud";
import { FindSupplierArgs } from "../../../suppliers/dto";
import { Supplier } from "../../../suppliers/entities/supplier.entity";
import { Product } from "../../entities/product.entity";

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