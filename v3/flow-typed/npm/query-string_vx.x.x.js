// flow-typed signature: 616a32a8b9d57465069774bfbacc9880
// flow-typed version: <<STUB>>/query-string_v5.0.0/flow_v0.51.0

declare module 'query-string' {
  declare type ArrayFormat = 'none' | 'index' | 'bracket';

  declare type ParseOptions = {
    arrayFormat: ArrayFormat,
  };

  declare type StringifyOptions = {
    strict: boolean,
    encode: boolean,
    arrayFormat: ArrayFormat,
  };

  declare module.exports: {
    parse(string: string, options?: ParseOptions): Object,
    stringify(object: Object, options?: StringifyOptions): string,
    extract(string: string): string,
  };
}
