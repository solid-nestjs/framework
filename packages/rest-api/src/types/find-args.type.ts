import { StringFilterInterface, NumberFilterInterface, DateFilterInterface } from './../interfaces/misc/filters.interfaces'

type WhereField<T> =
    T extends string ? string | string[] | StringFilterInterface :
    T extends number ? number | number[] | NumberFilterInterface :
    T extends Date ? Date | Date[] | DateFilterInterface :
    T extends boolean ? boolean :
    Where<T>;

export type Where<T> = {
    [K in keyof T]?: WhereField<T[K]>;
} & { 
    _and?:Where<T> | Where<T>[] ,  
    _or?: Where<T> | Where<T>[],  
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