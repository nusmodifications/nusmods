/**
 * Minimal ElasticSearch response types. Vendored from
 * `website/src/types/vendor/elastic-search.ts`.
 */

export type StringProperties<T> = Exclude<
  { [K in keyof T]: T[K] extends string | undefined ? K : never }[keyof T],
  undefined
>;

export interface ElasticSearchResult<T> {
  _id: string;
  _index: string;
  _score: number;
  _source: T;
  highlight?: Partial<Record<StringProperties<T>, Array<string>>>;
}

export interface ElasticSearchResponse<T> {
  hits: {
    hits: Array<ElasticSearchResult<T>>;
    total: number | { relation?: string; value: number };
  };
}
