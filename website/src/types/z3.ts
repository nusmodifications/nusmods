export enum Z3MessageKind {
  // Request to init
  INIT = 'INIT',
  // Z3 initialized
  INITIALIZED = 'INITIALIZED',
  // Run the optimizer
  OPTIMIZE = 'OPTIMIZE',
  // Print output
  PRINT = 'PRINT',
  // Error
  ERR = 'ERR',
  // Z3 finished runnung
  EXIT = 'EXIT',
  // Z3 aborted
  ABORT = 'ABORT',
}

/**
 * Message to be sent back and forth between a Z3 worker and any callers
 * */
export interface Z3Message {
  kind: Z3MessageKind;
  msg: string;
}
