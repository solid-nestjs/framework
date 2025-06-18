import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Column, PrimaryColumn } from 'typeorm';

@InputType()
@ObjectType('OutSupplierId')
export class SupplierId {
  @Field(() => ID, {
    description: 'The type of the unique identifier of the supplier',
  })
  @PrimaryColumn()
  type: string;

  @Field(() => ID, {
    description: 'The code of the unique identifier of the supplier',
  })
  @PrimaryColumn()
  code: number;
}
