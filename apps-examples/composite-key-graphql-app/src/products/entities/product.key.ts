import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Column, PrimaryColumn } from 'typeorm';

@InputType()
@ObjectType()
export class ProductId {
  @Field(() => ID, {
    description: 'The type of the unique identifier of the product',
  })
  @PrimaryColumn()
  type: string;

  @Field(() => ID, {
    description: 'The code of the unique identifier of the product',
  })
  @PrimaryColumn()
  code: string;
}
