import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Column, PrimaryColumn } from 'typeorm';

@InputType()
@ObjectType('OutProductId')
export class ProductId {
  @Field(() => ID, {
    description: 'The type of the unique identifier of the product',
  })
  type: string;

  @Field(() => ID, {
    description: 'The code of the unique identifier of the product',
  })
  code: number;
}
