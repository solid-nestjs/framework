import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Field, Float, InputType } from "@nestjs/graphql";
import { NumberFilter as CommonNumberFilter } from "@solid-nestjs/common";

@InputType()
export class NumberFilter implements CommonNumberFilter {
    
    @ApiProperty({ required: false , type: Number})
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _eq?:number
    
    @ApiProperty({ required: false , type: Number})
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _neq?:number
    
    @ApiProperty({ required: false , type: Number})
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _gt?:number
    
    @ApiProperty({ required: false , type: Number})
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _gte?:number
    
    @ApiProperty({ required: false , type: Number})
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _lt?:number
    
    @ApiProperty({ required: false , type: Number})
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _lte?:number
    
    @ApiProperty({ required: false , type: [Number]})
    @Field(() => [Float],{ nullable:true })
    @IsArray()
    @IsOptional()
    _in?:number[] 

    @ApiProperty({ required: false , type: [Number]})
    @Field(() => [Float],{ nullable:true })
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsOptional()
    _between?:number[]

    @ApiProperty({ required: false , type: [Number]})
    @Field(() => [Float],{ nullable:true })
    @IsArray()    
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsOptional()
    _notbetween?:number[]
}