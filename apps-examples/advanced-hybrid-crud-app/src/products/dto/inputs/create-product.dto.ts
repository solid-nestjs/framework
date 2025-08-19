import { SolidInput, SolidField } from '@solid-nestjs/common';
import { Float, Int, ID } from '@nestjs/graphql';

@SolidInput()
export class ProductSupplierDto {
  @SolidField({
    description: 'supplier id',
    adapters: {
      graphql: {
        type: () => ID
      }
    }
  })
  id: string;
}

@SolidInput()
export class CreateProductDto {
  @SolidField({
    description: 'The name of the product'
  })
  name: string;

  @SolidField({
    description: 'The description of the product'
  })
  description: string;

  @SolidField({
    description: 'The price of the product',
    positive: true,
    adapters: {
      graphql: {
        type: () => Float
      }
    }
  })
  price: number;

  @SolidField({
    description: 'The stock quantity of the product',
    min: 0,
    adapters: {
      graphql: {
        type: () => Int
      }
    }
  })
  stock: number;

  @SolidField({
    description: 'product Supplier'
  })
  supplier: ProductSupplierDto;
}
