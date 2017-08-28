// flow-typed signature: ed0c55e4880f1d7efe818066cce3b080
// flow-typed version: <<STUB>>/immutability-helper_v2.3.1/flow_v0.51.0

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
