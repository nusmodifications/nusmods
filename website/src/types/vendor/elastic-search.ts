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

// ElasticSearch filters are either SearchKit query builder objects (http://docs.searchkit.co/stable/core/QueryDSL.html)
// or raw ES JSON DSL (https://www.elastic.co/guide/en/elasticsearch/reference/6.8/query-dsl.html)
// Typing the JSON DSL is too hard, so we just use any
export type ElasticSearchFilter = any; // eslint-disable-line @typescript-eslint/no-explicit-any
