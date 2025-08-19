import {
  SolidEntity,
  SolidField,
  SolidManyToOne,
  SolidId,
} from '@solid-nestjs/common';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { ProductId } from './product.key';
import { AutoIncrement } from '@solid-nestjs/typeorm-graphql-crud';

@SolidEntity()
@AutoIncrement<ProductId>('code')
export class Product {
  @SolidField({
    description: 'The id of the product',
    skip: ['typeorm'], // Skip TypeORM adapter for computed getter
  })
  get id(): ProductId {
    return { type: this.type, code: this.code };
  }
  set id(value) {
    this.type = value.type;
    this.code = value.code;
  }

  @SolidId({
    description: 'The type component of the composite primary key',
  })
  type: string;

  @SolidId({
    description: 'The code component of the composite primary key',
  })
  code: number;

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
    float: true,
    precision: 10,
    scale: 2,
    adapters: {
      typeorm: {
        columnType: 'decimal',
        transformer: {
          to: (value: number) => value,
          from: (value: string) => parseFloat(value),
        },
      },
      graphql: {
        type: 'Float',
      },
    },
  })
  price: number;

  @SolidField({
    description: 'The stock quantity of the product',
    adapters: {
      graphql: {
        type: 'Int',
      },
    },
  })
  stock: number;

  // Foreign key columns for the composite primary key relationship
  @SolidField({
    description: 'Supplier type foreign key component',
    nullable: true,
  })
  supplier_id_type: string;

  @SolidField({
    description: 'Supplier code foreign key component',
    nullable: true,
  })
  supplier_id_code: number;

  @SolidManyToOne(() => Supplier, supplier => supplier.products, {
    description: 'Product Supplier',
    nullable: true,
    onDelete: 'CASCADE',
    adapters: {
      typeorm: {
        joinColumn: [
          { name: 'supplier_id_type', referencedColumnName: 'type' },
          { name: 'supplier_id_code', referencedColumnName: 'code' },
        ],
      },
    },
  })
  supplier: Supplier;
}
