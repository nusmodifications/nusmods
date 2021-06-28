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

/**
 * Callbacks from the Z3 Manager
 * */
export interface Z3Callbacks {
  onZ3Initialized: any;
  onSmtlib2InputCreated(s: string): any;
  onOutput(s: string): any;
  // onTimetableOutput(timetable: TimetableOutput): any;
  onTimetableOutput(timetable: any): any;
}
