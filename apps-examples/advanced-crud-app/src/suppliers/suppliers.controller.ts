import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-crud';
import {
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { CurrentContext } from '@solid-nestjs/common';
import { SuppliersService, serviceStructure } from './suppliers.service';
import { CreateSupplierDto } from './dto/inputs/create-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { DeepPartial } from 'typeorm';
import { Context } from 'vm';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class BatchUpdateInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  contactEmail: string;
}

export class BatchDeleteInput {
  @ApiProperty()
  @IsString()
  @IsEmail()
  contactEmail: string;
}

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: SuppliersService,
});

export class SuppliersController extends CrudControllerFrom(
  controllerStructure,
) {
  @Post('bulk')
  @ApiOperation({
    summary: 'Bulk create suppliers',
    description: 'Create multiple suppliers in a single operation',
  })
  @ApiBody({
    description: 'Array of supplier creation data',
    type: CreateSupplierDto,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Suppliers created successfully - returns array of created supplier IDs',
    type: String,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  async bulkInsert(
    @CurrentContext() context: Context,
    @Body() createInputs: CreateSupplierDto[],
  ): Promise<string[]> {
    const result = await this.service.bulkInsert(
      context,
      createInputs as DeepPartial<Supplier>[],
    );
    return result.ids;
  }

  @Patch('bulk/update-email-by-name')
  @ApiOperation({
    summary: 'Bulk update supplier emails by name',
    description:
      'Updates the contactEmail field for all suppliers of a given name',
  })
  @ApiBody({
    description: 'Update email to suppliers',
    type: BatchUpdateInput,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Number of suppliers updated',
    schema: {
      type: 'object',
      properties: {
        affected: {
          type: 'number',
          description: 'Number of suppliers that were updated',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.OK)
  async bulkUpdateEmailByName(
    @CurrentContext() context: Context,
    @Body() updateDto: BatchUpdateInput,
  ): Promise<{ affected: number | undefined }> {
    const result = await this.service.bulkUpdate(
      context,
      { contactEmail: updateDto.contactEmail },
      { name: updateDto.name },
    );

    return { affected: result.affected };
  }

  @Delete('bulk/delete-by-email')
  @ApiOperation({
    summary: 'Bulk delete supplier by emails',
    description: 'Deletes supplier filtering by the contactEmail field',
  })
  @ApiBody({
    description: 'Delete supplier by email',
    type: BatchDeleteInput,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Number of suppliers dleted',
    schema: {
      type: 'object',
      properties: {
        affected: {
          type: 'number',
          description: 'Number of suppliers that were deleted',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDeleteByEmail(
    @CurrentContext() context: Context,
    @Body() deleteDto: BatchDeleteInput,
  ): Promise<{ affected: number | undefined }> {
    const result = await this.service.bulkDelete(context, {
      contactEmail: deleteDto.contactEmail,
    });

    return { affected: result.affected };
  }
}
