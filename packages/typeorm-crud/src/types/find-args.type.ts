import { StringFilterInterface, NumberFilterInterface, DateFilterInterface } from './../interfaces/misc/filters.interfaces'

type WhereField<T> =
    T extends string ? string | StringFilterInterface :
    T extends number ? number | NumberFilterInterface :
    T extends Date ? Date | DateFilterInterface :
    T extends boolean ? boolean :
    Where<T>;

type Where<T> = {
    [K in keyof T]?: WhereField<T[K]>;
} & { 
    _and?:Where<T>[],  
    _or?:Where<T>[],  
};

type OrderByField<T> =
    T extends string ? string :
    T extends number ? number :
    T extends Date ? Date :
    T extends boolean ? boolean :
    OrderBy<T>;

export type OrderBy<T> = {
    [K in keyof T]?: OrderByField<T[K]>;
};

interface InsidestTest { foo: number }

interface InsiderTest {
    deep: boolean;
    skip: InsidestTest;
}

interface InsideTest {
    nested1: string;
    nested2: InsiderTest
}

interface Test {
    prop1: string;
    prop2: number;
    prop3: Date;
    propX: Date;
    prop4: InsideTest;
}

type ResultType = Where<Test>;

function loquesea(){
  //  const prueba:ResultType = { prop1:{ _eq:"Hola" }, _or:[ { prop2:{ _between:[2,3] }, { prop4:{ nested1:{  } }  } } ] };

}