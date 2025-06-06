import { Prettify } from '@solid-nestjs/common';

type MyComplexType = {
  miTipo1: { njoda1: string; function1: () => string };
  miTipo2: { njoda2: number; function2: () => number };
  miTipo3: { njoda3: number; function3: () => number };
};

type IntersectAll<T> = {
  [K in keyof T]: (x: T[K]) => void;
}[keyof T] extends (x: infer I) => void
  ? I
  : never;

type MyIntersectedType = Prettify<IntersectAll<MyComplexType>>;
