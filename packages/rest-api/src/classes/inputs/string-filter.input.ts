import { IsArray, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { StringFilter as CommonStringFilter } from "@nestjz/common";

export class StringFilter implements CommonStringFilter {

    @ApiProperty({ required: false , type: String})
    @IsString()
    @IsOptional()
    _eq?:string

    @ApiProperty({ required: false , type: String})
    @IsString()
    @IsOptional()
    _neq?:string

    @ApiProperty({ required: false , type: [String]})
    @IsArray()
    @IsOptional()
    _in?:string[]  

    @ApiProperty({ required: false , type: String})
    @IsString()
    @IsOptional()
    _startswith?:string 

    @ApiProperty({ required: false , type: String})
    @IsString()
    @IsOptional()
    _notstartswith?:string 

    @ApiProperty({ required: false , type: String})
    @IsString()
    @IsOptional()
    _endswith?:string 

    @ApiProperty({ required: false , type: String})
    @IsString()
    @IsOptional()
    _notendswith?:string 

    @ApiProperty({ required: false , type: String})
    @IsString()
    @IsOptional()
    _contains?:string 

    @ApiProperty({ required: false , type: String})
    @IsString()
    @IsOptional()
    _notcontains?:string 

    @ApiProperty({ required: false , type: String})
    @IsString()
    @IsOptional()
    _like?:string

    @ApiProperty({ required: false , type: String})
    @IsString()
    @IsOptional()
    _notlike?:string
}
