import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { FindArgsFrom, getWhereClass, StringFilter, Where } from "@solid-nestjs/typeorm-hybrid-crud";
import { FindSupplierArgs } from "../../../suppliers/dto";
import { Supplier } from "../../../suppliers/entities/supplier.entity";
import { Product } from "../../entities/product.entity";

const SupplierWhere = getWhereClass(FindSupplierArgs);

@InputType({ isAbstract: true })
class FindProductWhere implements Where<Product>
{
    @Field(() => StringFilter)
    @ApiProperty({ type: () => StringFilter, required: false })
    @Type(() => StringFilter)
    @IsOptional()
    @ValidateNested()
    name: StringFilter;

    @Field(() => SupplierWhere)
    @ApiProperty({ type: () => SupplierWhere, required: false })
    @Type(() => SupplierWhere)
    @IsOptional()
    @ValidateNested()
    supplier: Where<Supplier> | undefined;
}

@ArgsType()
export class FindProductArgs extends FindArgsFrom<Product>({ whereType:FindProductWhere })
{
    
}