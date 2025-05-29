import { IsNumber, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Field, InputType, Int } from "@nestjs/graphql";
import { PaginationRequest as CommonPaginationRequest } from "@solid-nestjs/common";

@InputType()
export class PaginationRequest implements CommonPaginationRequest{

    @ApiProperty({ required: false , type: Number, example:0})
    @Field(() => Int,{ nullable:true })
    @IsNumber()
    @Min(0)
    @IsOptional()
    skip?:number;

    @ApiProperty({ required: false , type: Number, example:10})
    @Field(() => Int,{ nullable:true })
    @IsNumber()
    @Min(0)
    @IsOptional()
    take?:number;

    @ApiProperty({ required: false , type: Number, example:1})
    @Field(() => Int,{ nullable:true })
    @IsNumber()
    @Min(1)
    @IsOptional()
    page?:number;

    @ApiProperty({ required: false , type: Number, example:10})
    @Field(() => Int,{ nullable:true })
    @IsNumber()
    @Min(0)
    @IsOptional()
    limit?:number;
}