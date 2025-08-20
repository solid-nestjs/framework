import { PartialType, SolidInput } from '@solid-nestjs/typeorm-hybrid-crud';
import { CreateSupplierDto } from './create-supplier.dto';

@SolidInput()
export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
