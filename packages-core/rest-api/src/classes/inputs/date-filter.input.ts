import { ArrayMaxSize, ArrayMinSize, IsArray, IsDate, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DateFilter as CommonDateFilter } from "@solid-nestjs/common";

export class DateFilter implements CommonDateFilter {
    
    @ApiProperty({ required: false , type: Date})
    @IsDate()    
    @IsOptional()
    _eq?:Date
    
    @ApiProperty({ required: false , type: Date})
    @IsDate()    
    @IsOptional()
    _neq?:Date
    
    @ApiProperty({ required: false , type: Date})
    @IsDate()    
    @IsOptional()
    _gt?:Date
    
    @ApiProperty({ required: false , type: Date})
    @IsDate()    
    @IsOptional()
    _gte?:Date
    
    @ApiProperty({ required: false , type: Date})
    @IsDate()    
    @IsOptional()
    _lt?:Date
    
    @ApiProperty({ required: false , type: Date})
    @IsDate()    
    @IsOptional()
    _lte?:Date
    
    @ApiProperty({ required: false , type: [Date]})
    @IsArray()
    @IsOptional()
    _in?:Date[] 

    @ApiProperty({ required: false , type: [Date]})
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsOptional()
    _between?:Date[]

    @ApiProperty({ required: false , type: [Date]})
    @IsArray()    
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsOptional()
    _notbetween?:Date[]
}
