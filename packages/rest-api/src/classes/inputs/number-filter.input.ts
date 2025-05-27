import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { NumberFilter as CommonNumberFilter } from "@solid-nestjs/common";

export class NumberFilter implements CommonNumberFilter {
    
    @ApiProperty({ required: false , type: Number})
    @IsNumber()    
    @IsOptional()
    _eq?:number
    
    @ApiProperty({ required: false , type: Number})
    @IsNumber()    
    @IsOptional()
    _neq?:number
    
    @ApiProperty({ required: false , type: Number})
    @IsNumber()    
    @IsOptional()
    _gt?:number
    
    @ApiProperty({ required: false , type: Number})
    @IsNumber()    
    @IsOptional()
    _gte?:number
    
    @ApiProperty({ required: false , type: Number})
    @IsNumber()    
    @IsOptional()
    _lt?:number
    
    @ApiProperty({ required: false , type: Number})
    @IsNumber()    
    @IsOptional()
    _lte?:number
    
    @ApiProperty({ required: false , type: [Number]})
    @IsArray()
    @IsOptional()
    _in?:number[] 

    @ApiProperty({ required: false , type: [Number]})
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsOptional()
    _between?:number[]

    @ApiProperty({ required: false , type: [Number]})
    @IsArray()    
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsOptional()
    _notbetween?:number[]
}