import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaginationRequest } from "../inputs";
import { FindArgs } from "@nestjz/common";

export class DefaultArgs<EntityType> implements FindArgs<EntityType>
{
        @ApiProperty({ type: () => PaginationRequest, required: false })
        @Type(() => PaginationRequest)
        @IsOptional()
        @ValidateNested()
        pagination?:PaginationRequest;
}