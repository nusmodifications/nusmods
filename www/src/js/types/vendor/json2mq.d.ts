declare module 'json2mq' {
  export interface QueryObject {
    [property: string]: string | number | boolean;
  }

  export default function json2mq(query: QueryObject | QueryObject[]): string;
}
