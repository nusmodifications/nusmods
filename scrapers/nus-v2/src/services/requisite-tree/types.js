// @flow

export type ParseTree = string | { ['and' | 'or']: ParseTree[] };
