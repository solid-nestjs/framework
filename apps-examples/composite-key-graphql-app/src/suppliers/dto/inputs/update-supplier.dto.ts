import { InputType, PartialType } from '@nestjs/graphql';
import { CreateSupplierDto } from './create-supplier.dto';

@InputType()
export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
