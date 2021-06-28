// import { TimetableOutput, TimetableSmtlib2Converter } from './timetable_to_smtlib2';
// import { GenericTimetable } from './generic_timetable';
import Z3Worker from 'worker-loader!../workers/z3Worker';
import { Z3Message, Z3MessageKind, Z3Callbacks } from '../types/z3';

/* eslint-disable import/no-webpack-loader-syntax */
// @ts-ignore
// import {
//     DAYS,
//     HOURS_PER_DAY,
//     DAY_START_HOUR,
//     DAY_END_HOUR,
//     NUM_WEEKS,
//     HOURS_PER_WEEK,
// } from './constants'
/**
 * The Z3 manager takes a generic timetable as input and manages the lifecycle of running the
 * Z3 system to find a timetable solution.
 * Runs the web worker, receives input/output, communicates through callbacks to the calling class.
 *
 * Only one Z3 Manager per application - allows stateless components to run manager methods
 * */
export class Z3Manager {
  // static gt: GenericTimetable;
  // static conv: TimetableSmtlib2Converter;
  static smtString: string;

  static callbacks: Z3Callbacks;

  static printBuffer: string;

  static errBuffer: string;

  static worker?: Z3Worker = null;

  static completedStage1Solve: boolean; // Need to complete week-solving before timetable-solving

  static initZ3(callbacks: Z3Callbacks) {
    console.log("Starting to initialize Z3...")
    Z3Manager.callbacks = callbacks;
    Z3Manager.resetBuffers();
    Z3Manager.completedStage1Solve = false;
    // Set up worker if it's not set up
    if (!Z3Manager.worker) {
      Z3Manager.worker = new Z3Worker();
      Z3Manager.worker.onmessage = Z3Manager.receiveWorkerMessage;
    }
    Z3Manager.managerPostMessage(Z3MessageKind.INIT, '');
  }

  // /**
  //  * Register a generic timetable a set of callbacks to be called for different states in the Z3 solver lifecycle
  //  * */
  // static loadTimetable(gt: GenericTimetable) {
  //     console.log('Loaded timetable');
  //     console.log(gt);
  //     Z3Manager.gt = gt;
  //     Z3Manager.conv = new TimetableSmtlib2Converter(
  //         Z3Manager.gt,
  //         NUM_WEEKS * HOURS_PER_WEEK * 2, // Number of "half-hour" slots
  //         DAY_START_HOUR, // Start at 8am
  //         DAY_END_HOUR
  //     ); // End at 2200 (10 pm)
  // }

  // static solve() {
  //     Z3Manager.resetBuffers();
  //     const weekSolveStr = Z3Manager.conv.generateWeekSolveSmtLib2String();
  //     Z3Manager.managerPostMessage(Z3MessageKind.OPTIMIZE, weekSolveStr);
  // }

  static receiveWorkerMessage(e: any) {
    const message: Z3Message = e.data;
    // console.log("Kind: %s, Message: %s", message.kind, message.msg)
    switch (message.kind) {
      case Z3MessageKind.INITIALIZED:
        // Call the initialization callback
        console.log("Manager initialized Z3!")
        Z3Manager.callbacks.onZ3Initialized();
        break;
      // case Z3MessageKind.PRINT:
      //     Z3Manager.printBuffer += message.msg + '\n';
      //     break;
      // case Z3MessageKind.ERR:
      //     Z3Manager.errBuffer += message.msg + '\n';
      //     break;
      // case Z3MessageKind.EXIT:
      //     // Z3 Initialization exit
      //     console.log('Z3 messages on exit: ');
      //     if (Z3Manager.printBuffer === '' && Z3Manager.errBuffer === '') {
      //         console.log('Premature exit - Z3 was initializing (this is normal)');
      //         return; // Premature exit (probably initialization)
      //     }

      //     // Print buffers generically
      //     if (Z3Manager.printBuffer !== '') {
      //         console.log(Z3Manager.printBuffer);
      //     }
      //     if (Z3Manager.errBuffer !== '') {
      //         console.error(Z3Manager.errBuffer);
      //     }

      //     if (!Z3Manager.completedStage1Solve) {
      //         // Indicate that next time we call this callback, we have the timetable result
      //         Z3Manager.completedStage1Solve = true;
      //         // Update the converter with the week-solve result
      //         // TODO: enable
      //         Z3Manager.conv.update_z3_weeksolve_output(Z3Manager.printBuffer);
      //         // Generate the SMTLIB2 string based on the week-solve:w
      //         Z3Manager.smtString = Z3Manager.conv.generateTimetableSolveSmtLib2String();
      //         // Run callback to update the generated smtlib2 string
      //         Z3Manager.callbacks.onSmtlib2InputCreated(Z3Manager.smtString);
      //         // Reset state for our next optimization run
      //         Z3Manager.resetBuffers();
      //         // Two stage solve: first solve for the week constraints, then solve for the actual timetable
      //         Z3Manager.managerPostMessage(Z3MessageKind.OPTIMIZE, Z3Manager.smtString);
      //     } else {
      //         // Reset solve state
      //         Z3Manager.completedStage1Solve = false;
      //         // Deal with real solve state
      //         // Call the output callback
      //         Z3Manager.callbacks.onOutput(
      //             Z3Manager.printBuffer + '\n' + Z3Manager.errBuffer
      //         );
      //         // Process the output text we just got from the Z3 solver
      //         const timetable: TimetableOutput = Z3Manager.conv.z3_output_to_timetable(
      //             Z3Manager.printBuffer
      //         );
      //         Z3Manager.callbacks.onTimetableOutput(timetable);
      //     }

      //     break;
      default:
        break;
    }
  }

  /**
   * Generically post a message to the worker
   * */
  static managerPostMessage(kind: Z3MessageKind, msg: string) {
    const message: Z3Message = { kind, msg };
    Z3Manager.worker.postMessage(message);
  }

  static resetBuffers() {
    Z3Manager.printBuffer = '';
    Z3Manager.errBuffer = '';
  }
}
