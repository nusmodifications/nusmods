// @flow

export type SyncConfig = {
  actions: string[], // Action types to watch for
  keyPaths?: string[], // Key paths to send to server. If absent, sends entire reducer state
};

export type PerReducerSyncConfig = { [string]: SyncConfig };
