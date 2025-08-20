import { PartialType, SolidInput } from '@solid-nestjs/typeorm-hybrid-crud';
import { CreateProductDto } from './create-product.dto';

@SolidInput()
export class UpdateProductDto extends PartialType(CreateProductDto) {}
