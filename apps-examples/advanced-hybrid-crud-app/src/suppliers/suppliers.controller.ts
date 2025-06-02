import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Body, HttpCode, HttpStatus, Delete, Patch } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { CurrentContext } from '@solid-nestjs/common';
import { SuppliersService, serviceStructure } from './suppliers.service';
import { Context } from 'vm';
import { IsEmail, IsString } from 'class-validator';

export class BatchRemoveInput {
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

export class BatchRecoverInput {
  @ApiProperty()
  @IsString()
  @IsEmail()
  contactEmail: string;
}

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: SuppliersService,
  operations: {
    softRemove: true,
    recover: true,
    hardRemove: true,
  },
});

export class SuppliersController extends CrudControllerFrom(
  controllerStructure,
) {
  @Delete('bulk/remove-by-email')
  @ApiOperation({
    summary: 'Bulk remove (soft) supplier by emails',
    description: 'Remove (soft) supplier filtering by the contactEmail field',
  })
  @ApiBody({
    description: 'Remove (soft)  supplier by email',
    type: BatchRemoveInput,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Number of suppliers removed',
    schema: {
      type: 'object',
      properties: {
        affected: {
          type: 'number',
          description: 'Number of suppliers that were removed(soft) ',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.OK)
  async bulkRemoveByEmail(
    @CurrentContext() context: Context,
    @Body() removeDto: BatchRemoveInput,
  ): Promise<{ affected: number | undefined | null }> {
    const result = await this.service.bulkRemove(context, {
      contactEmail: removeDto.contactEmail,
    });

    return { affected: result.affected };
  }

  @Patch('bulk/recover-by-email')
  @ApiOperation({
    summary: 'Bulk recover supplier by emails',
    description: 'Recovers supplier filtering by the contactEmail field',
  })
  @ApiBody({
    description: 'Recover supplier by email',
    type: BatchRecoverInput,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Number of suppliers recovered',
    schema: {
      type: 'object',
      properties: {
        affected: {
          type: 'number',
          description: 'Number of suppliers that were recovered',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.OK)
  async bulkRecoverByEmail(
    @CurrentContext() context: Context,
    @Body() deleteDto: BatchRecoverInput,
  ): Promise<{ affected: number | undefined | null }> {
    const result = await this.service.bulkRecover(context, {
      contactEmail: deleteDto.contactEmail,
    });

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
    description: 'Number of suppliers deleted',
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
  ): Promise<{ affected: number | undefined | null }> {
    const result = await this.service.bulkDelete(context, {
      contactEmail: deleteDto.contactEmail,
    });

    return { affected: result.affected };
  }
}
