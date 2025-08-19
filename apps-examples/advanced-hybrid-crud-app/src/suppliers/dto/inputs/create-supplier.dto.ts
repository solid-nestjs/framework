import { SolidInput, SolidField } from '@solid-nestjs/common';
import { Float, Int } from '@nestjs/graphql';

@SolidInput()
export class SupplierProductDto {
  @SolidField({
    description: 'The name of the product',
  })
  name: string;

  @SolidField({
    description: 'The description of the product',
  })
  description: string;

  @SolidField({
    description: 'The price of the product',
    positive: true,
    adapters: {
      graphql: {
        type: () => Float,
      },
    },
  })
  price: number;

  @SolidField({
    description: 'The stock quantity of the product',
    min: 0,
    adapters: {
      graphql: {
        type: () => Int,
      },
    },
  })
  stock: number;
}

@SolidInput()
export class CreateSupplierDto {
  @SolidField({
    description: 'The name of the supplier',
  })
  name: string;

  @SolidField({
    description: 'The email of the supplier',
    email: true,
  })
  contactEmail: string;

  @SolidField({
    description: 'Supplier`s products',
    nullable: true
  })
  products?: SupplierProductDto[];
}
