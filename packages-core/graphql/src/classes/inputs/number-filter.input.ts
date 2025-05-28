import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsOptional } from "class-validator";
import { Field, Float, InputType } from "@nestjs/graphql";
import { NumberFilter as CommonNumberFilter } from "@solid-nestjs/common";

@InputType()
export class NumberFilter implements CommonNumberFilter {
    
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _eq?:number
    
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _neq?:number
    
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _gt?:number
    
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _gte?:number
    
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _lt?:number
    
    @Field(() => Float,{ nullable:true })
    @IsNumber()    
    @IsOptional()
    _lte?:number
    
    @Field(() => [Float],{ nullable:true })
    @IsArray()
    @IsOptional()
    _in?:number[] 

    @Field(() => [Float],{ nullable:true })
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsOptional()
    _between?:number[]

    @Field(() => [Float],{ nullable:true })
    @IsArray()    
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsOptional()
    _notbetween?:number[]
}