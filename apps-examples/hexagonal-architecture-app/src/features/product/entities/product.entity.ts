import { SolidEntity, SolidId, SolidField, SolidCreatedAt, SolidUpdatedAt } from '@solid-nestjs/typeorm-hybrid-crud';

@SolidEntity()
export class Product {
  @SolidId()
  id: number;

  @SolidField()
  name: string;

  @SolidField()
  price: number;

  @SolidField()
  stock: number;


  @SolidCreatedAt()
  createdAt: Date;

  @SolidUpdatedAt()
  updatedAt: Date;
}