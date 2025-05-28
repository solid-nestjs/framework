import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { FindArgsFrom, StringFilter, Where } from "@solid-nestjs/typeorm-hybrid-crud";
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

@ArgsType()
export class FindSupplierArgs extends FindArgsFrom<Supplier>({ whereType:FindSupplierWhere })
{
    
}