export interface Entity<IdType> {
  id: IdType;
}

export type IdTypeFrom<T> = T extends Entity<infer U> ? U : never;
