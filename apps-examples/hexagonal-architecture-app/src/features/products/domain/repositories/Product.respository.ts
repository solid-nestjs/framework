import { Context } from '../../../../common';
import { IdValueObject } from '@core/domain/value-objects';
import { Product } from '../classes/product.entity';

export interface ProductRepository {
  create(context: Context, dto: Product): Promise<Product>;
  update(context: Context, dto: Product): Promise<Product>;
  delete(context: Context, id: IdValueObject): Promise<Product>;

  findById(context: Context, id: IdValueObject): Promise<Product>;
  findAll(context: Context): Promise<Product[]>; //Query de where, order by, pagination
}
