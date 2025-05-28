import { HttpStatus, Type } from "@nestjs/common";
import { ApiProperty, ApiResponse } from "@nestjs/swagger";
import { ReferenceObject, SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { applyMethodDecorators, getHttpStatusDescription } from "@solid-nestjs/common";

class ErrorResponse {
    @ApiProperty()
    statusCode!: number;

    @ApiProperty()
    message!: string;

    @ApiProperty()
    error!: string;
}

/**
 * Composite decorator for defining multiple API response types for a controller method.
 *
 * @param options - Configuration options for the API responses.
 * @param options.type - The type of the successful response. Can be a class or a function.
 * @param options.schema - The OpenAPI schema object for the response.
 * @param options.isArray - Indicates if the response is an array of the specified type.
 * @param options.successCodes - Array of HTTP status codes to be treated as successful responses. Defaults to [HttpStatus.OK].
 * @param options.errorCodes - Array of HTTP status codes to be treated as error responses. Defaults to [HttpStatus.BAD_REQUEST].
 *
 * @remarks
 * This decorator applies multiple `@ApiResponse` decorators for both success and error HTTP status codes.
 * For error responses, it uses a standard `ErrorResponse` type and provides an example payload.
 *
 * @example
 * ```typescript
 * @ApiResponses({
 *   type: UserDto,
 *   isArray: true,
 *   successCodes: [HttpStatus.OK, HttpStatus.CREATED],
 *   errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED]
 * })
 * ```
 */
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