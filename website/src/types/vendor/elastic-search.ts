// TypeScript black magic to extract keys of ModuleInformation which are strings
export type StringProperties<T> = Exclude<
  { [K in keyof T]: T[K] extends string | undefined ? K : never }[keyof T],
  undefined
>;

export interface ElasticSearchResult<T> {
  _id: string;
  _score: number;
  _type: string;
  _index: string;
  _source: T;
  highlight?: Partial<Record<StringProperties<T>, string[]>>;
}
