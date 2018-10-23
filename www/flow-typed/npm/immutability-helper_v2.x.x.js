// flow-typed signature: 3cc3f82c44c38a00a4c58053d4dcb5ce
// flow-typed version: <<STUB>>/immutability-helper_v2.6.6/flow_v0.69.0

declare module 'immutability-helper' {
  declare type UpdateQuery = {
    [string]: UpdateQuery,
    $push?: any[],
    $unshift?: any[],
    $splice?: any[][],
    $set?: any,
    $unset?: string[],
    $merge?: any,
    $apply?: (any) => any,
  };

  declare type UpdateFn = (value: any, object: any) => any;

  declare export default function update<T>(data: T, update: UpdateQuery): T;
  declare export function extend(name: string, fn: UpdateFn): void;
  declare export function newContext(): {
    extend: (name: string, fn: UpdateFn) => void,
  };
}
