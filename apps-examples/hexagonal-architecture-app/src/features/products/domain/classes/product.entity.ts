import { IdValueObject, NameValueObject } from '@core/domain/value-objects';

interface ProductPrototype {
  name: NameValueObject;
  price: number;
  stock: number;
}

type ConstructorArgs = ProductPrototype & { id?: IdValueObject };

type CreateArgs = ProductPrototype;

type RestoreArgs = ProductPrototype & { id: IdValueObject };

type UpdateArgs = Partial<ProductPrototype>;

export class Product {
  private _id: IdValueObject;
  private _name: NameValueObject;
  private _price: number;
  private _stock: number;

  private constructor(proto: ConstructorArgs) {
    this._id = proto.id;
    this._name = proto.name;
    this._price = proto.price;
    this._stock = proto.stock;

    this.validate();
  }

  static create(args: CreateArgs) {
    return new Product(args);
  }

  static restore(args: RestoreArgs) {
    return new Product(args);
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get price() {
    return this._price;
  }

  get stock() {
    return this._stock;
  }

  update(args: UpdateArgs) {
    this._name = args.name;
    this._price = args.price;
    this._stock = args.stock;
  }

  private validate(): void {}
}
