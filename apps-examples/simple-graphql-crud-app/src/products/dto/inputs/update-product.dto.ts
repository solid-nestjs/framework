import { IsUUID } from 'class-validator';
import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { CreateProductDto } from './create-product.dto';

@InputType()
export class UpdateProductDto extends PartialType(CreateProductDto) {}
