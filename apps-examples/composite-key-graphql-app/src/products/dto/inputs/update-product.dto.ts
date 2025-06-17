import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateProductDto } from './create-product.dto';

@InputType()
export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['id']),
) {}
