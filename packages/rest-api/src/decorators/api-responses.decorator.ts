import { HttpStatus, Type } from "@nestjs/common";
import { ApiProperty, ApiResponse } from "@nestjs/swagger";
import { ReferenceObject, SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { applyMethodDecorators, getHttpStatusDescription } from "@nestjz/common";

class ErrorResponse {
    @ApiProperty()
    statusCode!: number;

    @ApiProperty()
    message!: string;

    @ApiProperty()
    error!: string;
}

export const ApiResponses = ( { type, schema, isArray, successCodes, errorCodes }:{ 
                                type?:Type|Function, 
                                schema?:SchemaObject & Partial<ReferenceObject>,
                                isArray?:boolean, 
                                successCodes?:HttpStatus[],
                                errorCodes?:HttpStatus[] 
                            }) => applyMethodDecorators([ 

    ...((successCodes??[HttpStatus.OK]).map((successCode) => 
        () => ApiResponse({ 
            status: successCode, 
            description: getHttpStatusDescription(successCode),
            type:type,
            schema:schema,
            isArray
        })
    )),
    ...((errorCodes??[HttpStatus.BAD_REQUEST]).map((errorCode) => 
        () => ApiResponse({ 
            status: errorCode, 
            description: getHttpStatusDescription(errorCode),
            type:ErrorResponse,
            example:{
                statusCode: errorCode,
                error: getHttpStatusDescription(errorCode),
                message: "error message"
            }
        })
    )),
]);