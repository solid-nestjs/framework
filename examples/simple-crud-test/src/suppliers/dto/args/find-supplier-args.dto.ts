import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { Where } from "@nestjz/common";
import { FindArgsFrom, StringFilter } from "@nestjz/rest-api";
import { Supplier } from "../../entities/supplier.entity";

class FindSupplierWhere implements Where<Supplier>
{
    @ApiProperty({ type: () => StringFilter, required: false })
    @Type(() => StringFilter)
    @IsOptional()
    @ValidateNested()
    name?: StringFilter;

    @ApiProperty({ type: () => StringFilter, required: false })
    @Type(() => StringFilter)
    @IsOptional()
    @ValidateNested()
    contactEmail?: StringFilter;
}

export class FindSupplierArgs extends FindArgsFrom<Supplier>({ whereType:FindSupplierWhere })
{
    
}