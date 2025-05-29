import { IsEnum, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { FindArgsFrom, OrderBy, OrderByTypes, StringFilter, Where } from "@solid-nestjs/typeorm-hybrid-crud";
import { Supplier } from "../../entities/supplier.entity";

@InputType({ isAbstract: true })
class FindSupplierWhere implements Where<Supplier>
{
    @Field(() => StringFilter)
    @ApiProperty({ type: () => StringFilter, required: false })
    @Type(() => StringFilter)
    @IsOptional()
    @ValidateNested()
    name: StringFilter;

    @Field(() => StringFilter)
    @ApiProperty({ type: () => StringFilter, required: false })
    @Type(() => StringFilter)
    @IsOptional()
    @ValidateNested()
    contactEmail: StringFilter;
}

@InputType({ isAbstract: true })
class FindSupplierOrderBy implements OrderBy<Supplier> {

    @Field(() => OrderByTypes,{ nullable:true })
    @ApiProperty({ enum: OrderByTypes, required: false })
    @IsEnum(OrderByTypes)
    @IsOptional()
    name?: OrderByTypes | undefined;

    @Field(() => OrderByTypes,{ nullable:true })
    @ApiProperty({ enum: OrderByTypes, required: false })
    @IsEnum(OrderByTypes)
    @IsOptional()
    contactEmail?: OrderByTypes | undefined;
}

@ArgsType()
export class FindSupplierArgs extends FindArgsFrom<Supplier>({ whereType:FindSupplierWhere, orderByType:FindSupplierOrderBy })
{
    
}