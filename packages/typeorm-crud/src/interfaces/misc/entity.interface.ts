export interface IEntity<PrimaryKeyType> {
    id: PrimaryKeyType;
}

export type IdTypeFrom<T> = T extends IEntity<infer U> ? U : never;