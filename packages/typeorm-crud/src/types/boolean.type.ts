export type BooleanType = true | false;

export type NotNullableIf<TBool extends BooleanType = false, TType = any> = TBool extends true ? TType : TType | null;