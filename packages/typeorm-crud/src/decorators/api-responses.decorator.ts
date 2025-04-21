import { HttpStatus, Type } from "@nestjs/common";
import { ApiProperty, ApiResponse } from "@nestjs/swagger";
import { applyMethodDecorators, getHttpStatusDescription } from "../utils";

class ErrorResponse {
    @ApiProperty()
    statusCode: number;

    @ApiProperty()
    message: string;

    @ApiProperty()
    error: string;
}

export const ApiResponses = ( { type, isArray, successCodes, errorCodes }:{ 
                                type:Type|Function, 
                                isArray?:boolean, 
                                successCodes?:HttpStatus[],
                                errorCodes?:HttpStatus[] 
                            }) => applyMethodDecorators([ 

    ...((successCodes??[HttpStatus.OK]).map((successCode) => 
        () => ApiResponse({ 
            status: successCode, 
            description: getHttpStatusDescription(successCode),
            type:type,
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