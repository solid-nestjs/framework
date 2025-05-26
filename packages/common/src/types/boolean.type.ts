export type BooleanType = true | false;

export type NotNullableIf<TBool extends BooleanType = false, TType = any> = TBool extends true ? TType : TType | null;

export type If<TBool extends BooleanType = false, TType1 = any,TType2 = any> = TBool extends true ? TType1 : TType2;