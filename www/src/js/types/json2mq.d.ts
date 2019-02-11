declare module 'json2mq' {
  export interface QueryObject {
    [property: string]: string | number | boolean;
    [index: number]: QueryObject;
  }

  export default function json2mq(query: QueryObject): string;
}
