/**
 * WebWorker script to run and communicate with the Z3 Solver (z3w.wasm).
 * Imports the emscripten wrapper file z3w.js (must be accessible on the server).
 * After import, initializes the Z3 solver, which may require downloading z3w.wasm from the server.
 * */
import { Z3Message, Z3MessageKind } from 'types/optimizer';

// Only one solver instance
let solver = null;

// Context variable from self, removes self error
// eslint-disable-next-line no-restricted-globals
const ctx = self;

/**
 * Initializes the Z3 system and sends a mesage back when the runtime is initialized
 * */
function startZ3() {
  // Imports all names from z3w.js (includes Z3, etc)
  ctx.importScripts(`${ctx.location.origin}/z3w.js`);
  // TODO give vendor types to Z3?
  solver = Z3({
    ENVIRONMENT: 'WORKER', // Setup for a WebWorker environemtn
    onRuntimeInitialized,
    print(message: string) {
      postMessage(Z3MessageKind.PRINT, message);
    },
    printErr(message: string) {
      postMessage(Z3MessageKind.ERR, message);
    },
    postRun() {
      postMessage(Z3MessageKind.EXIT, '');
    },
  });
}

/**
 * Send a message to the worker caller that we have initialized the Z3 system
 * */
function onRuntimeInitialized() {
  postMessage(Z3MessageKind.INITIALIZED, '');
}

/**
 * Generic function to post a message back to the caller of this worker
 * */
function postMessage(kind: Z3MessageKind, msg: string) {
  const message: Z3Message = { kind, msg };
  ctx.postMessage(message);
}

function runZ3(input: string) {
  // Input filename doesn't matter
  const INPUT_FNAME = 'input.smt2';
  // Run using smtlib2 mode
  const args = ['-smt2', INPUT_FNAME];
  // This writes the required smtlib2 code to the emscripten virtual filesystem
  solver.FS.writeFile(INPUT_FNAME, input, { encoding: 'utf8' });
  // Finally, runs the solver. The print / printErr function will be called as required
  solver.callMain(args);
  // Run when the solver is done
  postMessage(Z3MessageKind.EXIT, '');
}

/**
 * Main handler for all incoming messages
 * */
ctx.addEventListener(
  'message',
  (e) => {
    const message: Z3Message = e.data;
    switch (message.kind) {
      case Z3MessageKind.INIT:
        startZ3();
        break;
      case Z3MessageKind.OPTIMIZE:
        runZ3(message.msg);
        break;
      default:
        break;
    }
  },
  false,
);
