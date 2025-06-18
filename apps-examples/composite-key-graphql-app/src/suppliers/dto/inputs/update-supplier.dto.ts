import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateSupplierDto } from './create-supplier.dto';

@InputType()
export class UpdateSupplierDto extends PartialType(
  OmitType(CreateSupplierDto, ['id', 'type']),
) {}
