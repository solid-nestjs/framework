import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Field, ID, InputType } from '@nestjs/graphql';

/*
@InputType()
export class SupplierIdDto {
  @Field({ description: 'The type of the product' })
  @IsNotEmpty()
  @IsString()
  type: string;
}
*/

@InputType()
export class CreateSupplierDto {
  @Field(() => ID, { description: 'The type of the product' })
  @IsNotEmpty()
  @IsString()
  type: string;

  get id() {
    return { type: this.type };
  }

  // @Field(() => SupplierIdDto, { description: 'id of the product' })
  // @IsNotEmpty()
  // id: SupplierIdDto;

  @Field({ description: 'The name of the supplier' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ description: 'The email of the supplier' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  contactEmail: string;
}
