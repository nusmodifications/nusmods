// import { TimetableOutput, TimetableSmtlib2Converter } from './timetable_to_smtlib2';
import { OptimizerInputSmtlibConverter } from 'utils/optimizer/converter';
import {
  OptimizerInput,
  OptimizerOutput,
  OptimizerCallbacks,
  Z3WorkerMessage,
  Z3WorkerMessageKind,
} from 'types/optimizer';
import { DAY_START_HOUR, DAY_END_HOUR, NUM_WEEKS, HOURS_PER_WEEK } from 'utils/optimizer/constants';
// ts extension is necessary from webpack documentation for worker-loader
// eslint-disable-next-line import/extensions
import WebpackWorker from './z3WebWorker.worker.ts';

/**
 * The TimetableOptimizer takes a generic timetable as input and manages the lifecycle of running the
 * Z3 system to find a timetable solution.
 * Runs the web worker, receives input/output, communicates through callbacks to the calling class.
 *
 * Only one TimetableOptimizer per application - allows stateless components to run manager methods
 * */
export class TimetableOptimizer {
  static optInput: OptimizerInput;

  static converter: OptimizerInputSmtlibConverter;

  static smtString: string;

  static callbacks: OptimizerCallbacks;

  static printBuffer: string;

  static errBuffer: string;

  static worker: WebpackWorker;

  static completedStage1Solve: boolean; // Need to complete week-solving before timetable-solving

  static initOptimizer(callbacks: OptimizerCallbacks) {
    console.log('Starting to initialize Z3...');
    TimetableOptimizer.callbacks = callbacks;
    TimetableOptimizer.resetBuffers();
    TimetableOptimizer.completedStage1Solve = false;
    // Set up worker if it's not set up
    if (!TimetableOptimizer.worker) {
      TimetableOptimizer.worker = new WebpackWorker();
      TimetableOptimizer.worker.onmessage = TimetableOptimizer.receiveWorkerMessage;
    }
    TimetableOptimizer.managerPostMessage(Z3WorkerMessageKind.INIT, '');
  }

  /**
   * Register a generic timetable a set of callbacks to be called for different states in the Z3 solver lifecycle
   * */
  static loadInput(optInput: OptimizerInput) {
    console.log('Loaded optimizer input');
    console.log(optInput);
    TimetableOptimizer.optInput = optInput;
    TimetableOptimizer.converter = new OptimizerInputSmtlibConverter(
      TimetableOptimizer.optInput,
      NUM_WEEKS * HOURS_PER_WEEK * 2, // Number of "half-hour" slots
      DAY_START_HOUR, // Start at 0800 (8 am)
      DAY_END_HOUR, /// End at 2200 (10 pm)
    );
  }

  static solve() {
    TimetableOptimizer.resetBuffers();
    // TODO handle errors from this generation
    const weekSolveStr = TimetableOptimizer.converter.generateWeekSolveSmtLib2String();
    TimetableOptimizer.managerPostMessage(Z3WorkerMessageKind.OPTIMIZE, weekSolveStr);
  }

  static receiveWorkerMessage(e) {
    const message: Z3WorkerMessage = e.data;
    // console.log("Kind: %s, Message: %s", message.kind, message.msg)
    switch (message.kind) {
      case Z3WorkerMessageKind.INITIALIZED:
        // Call the initialization callback
        console.log('Manager initialized Z3!');
        TimetableOptimizer.callbacks.onOptimizerInitialized();
        break;
      case Z3WorkerMessageKind.PRINT:
        TimetableOptimizer.printBuffer += `${message.msg}\n`;
        break;
      case Z3WorkerMessageKind.ERR:
        TimetableOptimizer.errBuffer += `${message.msg}\n`;
        break;
      case Z3WorkerMessageKind.EXIT:
        // Z3 Initialization exit
        console.log('Z3 messages on exit: ');
        if (TimetableOptimizer.printBuffer === '' && TimetableOptimizer.errBuffer === '') {
          console.log('Premature exit - Z3 was initializing (this is normal)');
          return; // Premature exit (probably initialization)
        }

        // Print buffers generically
        if (TimetableOptimizer.printBuffer !== '') {
          console.log(TimetableOptimizer.printBuffer);
        }
        if (TimetableOptimizer.errBuffer !== '') {
          console.error(TimetableOptimizer.errBuffer);
        }

        if (!TimetableOptimizer.completedStage1Solve) {
          // Indicate that next time we call this callback, we have the timetable result
          TimetableOptimizer.completedStage1Solve = true;
          // Update the converter with the week-solve result
          // TODO: enable
          TimetableOptimizer.converter.updateZ3WeeksolveOutput(TimetableOptimizer.printBuffer);
          // Generate the SMTLIB2 string based on the week-solve:w
          TimetableOptimizer.smtString = TimetableOptimizer.converter.generateTimetableSolveSmtLib2String();
          // Run callback to update the generated smtlib2 string
          TimetableOptimizer.callbacks.onSmtlib2InputCreated(TimetableOptimizer.smtString);
          // Reset state for our next optimization run
          TimetableOptimizer.resetBuffers();
          // Two stage solve: first solve for the week constraints, then solve for the actual timetable
          TimetableOptimizer.managerPostMessage(
            Z3WorkerMessageKind.OPTIMIZE,
            TimetableOptimizer.smtString,
          );
        } else {
          // Reset solve state
          TimetableOptimizer.completedStage1Solve = false;
          // Deal with real solve state
          // Call the output callback
          TimetableOptimizer.callbacks.onOutput(
            `${TimetableOptimizer.printBuffer}\n${TimetableOptimizer.errBuffer}`,
          );
          // Process the output text we just got from the Z3 solver
          const timetable: OptimizerOutput = TimetableOptimizer.converter.z3OutputToTimetable(
            TimetableOptimizer.printBuffer,
          );
          TimetableOptimizer.callbacks.onTimetableOutput(timetable);
        }
        break;
      default:
        break;
    }
  }

  /**
   * Generically post a message to the worker
   * */
  static managerPostMessage(kind: Z3WorkerMessageKind, msg: string) {
    const message: Z3WorkerMessage = { kind, msg };
    TimetableOptimizer.worker.postMessage(message);
  }

  static resetBuffers() {
    TimetableOptimizer.printBuffer = '';
    TimetableOptimizer.errBuffer = '';
  }
}
