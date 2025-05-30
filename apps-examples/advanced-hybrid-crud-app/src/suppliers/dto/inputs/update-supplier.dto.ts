import { IsUUID } from 'class-validator';
import { Field, ID, InputType } from '@nestjs/graphql';
import { PartialType } from '@solid-nestjs/typeorm-hybrid-crud';
import { CreateSupplierDto } from './create-supplier.dto';

@InputType()
export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @Field(() => ID)
  @IsUUID()
  id?: string;
}
