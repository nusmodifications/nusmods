import { TimetableOptimizer } from 'utils/optimizer/timetableOptimizer';
import {
  OptimizerInput,
  OptimizerCallbacks,
  Z3WorkerMessage,
  Z3WorkerMessageKind,
  defaultConstraints,
} from 'types/optimizer';
import { OptimizerInputSmtlibConverter } from 'utils/optimizer/converter';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Jest will fix this for us
import WebpackWorker, { mockOnmessage, mockPostMessage } from './z3WebWorker.worker';

// Directly mock the converter functions, allows us to track them
const mockGenerateWeekSolveSmtLib2String = jest.fn();
const mockUpdateZ3WeeksolveOutput = jest.fn();
const mockGenerateTimetableSolveSmtLib2String = jest.fn();
const mockZ3OutputToTimetable = jest.fn();
jest.mock('utils/optimizer/converter', () =>
  // Works and lets you check for constructor calls:
  ({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    OptimizerInputSmtlibConverter: jest.fn().mockImplementation(() => ({
      generateWeekSolveSmtLib2String: mockGenerateWeekSolveSmtLib2String,
      updateZ3WeeksolveOutput: mockUpdateZ3WeeksolveOutput,
      generateTimetableSolveSmtLib2String: mockGenerateTimetableSolveSmtLib2String,
      z3OutputToTimetable: mockZ3OutputToTimetable,
    })),
  }),
);

// Mock webworker from __mocks__
jest.mock('./z3WebWorker.worker.ts');

beforeEach(() => {
  WebpackWorker.mockClear();
  mockOnmessage.mockClear();
  mockPostMessage.mockClear();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Jest will fix this for us
  OptimizerInputSmtlibConverter.mockClear();
});

const callbacks: OptimizerCallbacks = {
  onOptimizerInitialized: jest.fn(),
  onSmtLib2ResultOutput: jest.fn(),
  onSmtlib2InputCreated: jest.fn(),
  onTimetableOutput: jest.fn(),
};

describe('initOptimizer', () => {
  it('should have a clear buffer, start before the stage 1 solve, and send an init mesage', () => {
    expect(mockPostMessage).toHaveBeenCalledTimes(0);
    TimetableOptimizer.initOptimizer(callbacks);
    expect(TimetableOptimizer.printBuffer).toEqual('');
    expect(TimetableOptimizer.errBuffer).toEqual('');
    expect(TimetableOptimizer.completedStage1Solve).toBe(false);
    const message: Z3WorkerMessage = { kind: Z3WorkerMessageKind.INIT, msg: '' };
    expect(mockPostMessage).toHaveBeenCalledWith(message);
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
  });
});

describe('loadInput', () => {
  it('should call the converter', () => {
    TimetableOptimizer.initOptimizer(callbacks);
    const optInput: OptimizerInput = {
      moduleInfo: [],
      constraints: defaultConstraints,
    };
    TimetableOptimizer.loadInput(optInput);
    expect(OptimizerInputSmtlibConverter).toHaveBeenCalled();
  });
});

describe('solve', () => {
  it('should clear buffers and call the worker to optimizer', () => {
    TimetableOptimizer.initOptimizer(callbacks);
    const optInput: OptimizerInput = {
      moduleInfo: [],
      constraints: defaultConstraints,
    };
    TimetableOptimizer.loadInput(optInput);
    TimetableOptimizer.solve();
    // First call is from init, second call is from solve()
    expect(mockPostMessage.mock.calls[1][0]).toMatchObject({ kind: Z3WorkerMessageKind.OPTIMIZE });
    expect(TimetableOptimizer.printBuffer).toEqual('');
    expect(TimetableOptimizer.errBuffer).toEqual('');
  });
});

describe('receiveWorkerMessage', () => {
  it('should call the initialized callback when the worker sends an initialized message', () => {
    TimetableOptimizer.initOptimizer(callbacks);
    // Send initialized message
    const messageData: Z3WorkerMessage = { kind: Z3WorkerMessageKind.INITIALIZED, msg: '' };
    const msg: MessageEvent = new MessageEvent('placeholderType', {
      data: messageData,
      lastEventId: 'placeholder',
      origin: 'placeholder',
      ports: [],
      source: null,
    });
    expect(callbacks.onOptimizerInitialized).toBeCalledTimes(0);
    TimetableOptimizer.receiveWorkerMessage(msg);
    expect(callbacks.onOptimizerInitialized).toBeCalledTimes(1);
  });

  it('should add to the stdout buffer when it receives a print message', () => {
    TimetableOptimizer.initOptimizer(callbacks);
    // Send initialized message
    const messageData: Z3WorkerMessage = { kind: Z3WorkerMessageKind.PRINT, msg: 'someData' };
    const msg: MessageEvent = new MessageEvent('placeholderType', {
      data: messageData,
      lastEventId: 'placeholder',
      origin: 'placeholder',
      ports: [],
      source: null,
    });
    expect(TimetableOptimizer.printBuffer).toEqual('');
    TimetableOptimizer.receiveWorkerMessage(msg);
    expect(TimetableOptimizer.printBuffer).toEqual(`${messageData.msg}\n`);
    expect(TimetableOptimizer.errBuffer).toEqual('');
  });

  it('should add to the stderr buffer when it receives an error message', () => {
    TimetableOptimizer.initOptimizer(callbacks);
    // Send initialized message
    const messageData: Z3WorkerMessage = { kind: Z3WorkerMessageKind.ERR, msg: 'someData' };
    const msg: MessageEvent = new MessageEvent('placeholderType', {
      data: messageData,
      lastEventId: 'placeholder',
      origin: 'placeholder',
      ports: [],
      source: null,
    });
    expect(TimetableOptimizer.errBuffer).toEqual('');
    TimetableOptimizer.receiveWorkerMessage(msg);
    expect(TimetableOptimizer.errBuffer).toEqual(`${messageData.msg}\n`);
    expect(TimetableOptimizer.printBuffer).toEqual('');
  });

  it('should not do anything if an unknown message type is passed', () => {
    TimetableOptimizer.initOptimizer(callbacks);
    // Send initialized message
    const messageData: Z3WorkerMessage = { kind: Z3WorkerMessageKind.ABORT, msg: 'someData' };
    const msg: MessageEvent = new MessageEvent('placeholderType', {
      data: messageData,
      lastEventId: 'placeholder',
      origin: 'placeholder',
      ports: [],
      source: null,
    });

    TimetableOptimizer.receiveWorkerMessage(msg);
    expect(TimetableOptimizer.printBuffer).toEqual('');
    expect(TimetableOptimizer.errBuffer).toEqual('');
    expect(callbacks.onSmtlib2InputCreated).not.toBeCalled();
    expect(callbacks.onSmtLib2ResultOutput).not.toBeCalled();
    expect(callbacks.onTimetableOutput).not.toBeCalled();
  });

  it('should return without calling any callbacks if the buffers are empty', () => {
    TimetableOptimizer.initOptimizer(callbacks);
    // Send initialized message
    const messageData: Z3WorkerMessage = { kind: Z3WorkerMessageKind.EXIT, msg: '' };
    const msg: MessageEvent = new MessageEvent('placeholderType', {
      data: messageData,
      lastEventId: 'placeholder',
      origin: 'placeholder',
      ports: [],
      source: null,
    });

    expect(TimetableOptimizer.printBuffer).toEqual('');
    expect(TimetableOptimizer.errBuffer).toEqual('');
    TimetableOptimizer.receiveWorkerMessage(msg);
    expect(callbacks.onSmtlib2InputCreated).not.toBeCalled();
    expect(callbacks.onSmtLib2ResultOutput).not.toBeCalled();
    expect(callbacks.onTimetableOutput).not.toBeCalled();
  });

  it('should run the stage 1 solve procedure if it is not already completed', () => {
    TimetableOptimizer.initOptimizer(callbacks);
    TimetableOptimizer.printBuffer = 'some smt2lib stuff';
    // Send initialized message
    const messageData: Z3WorkerMessage = { kind: Z3WorkerMessageKind.EXIT, msg: '' };
    const msg: MessageEvent = new MessageEvent('placeholderType', {
      data: messageData,
      lastEventId: 'placeholder',
      origin: 'placeholder',
      ports: [],
      source: null,
    });
    TimetableOptimizer.receiveWorkerMessage(msg);
    expect(TimetableOptimizer.completedStage1Solve).toBe(true); // should get updated to progress to next stage
    expect(mockUpdateZ3WeeksolveOutput).toBeCalledWith('some smt2lib stuff');
    expect(mockGenerateTimetableSolveSmtLib2String).toBeCalled();
    expect(callbacks.onSmtLib2ResultOutput).not.toBeCalled();
    expect(callbacks.onSmtlib2InputCreated).toBeCalled();
    expect(mockPostMessage.mock.calls[1][0]).toMatchObject({ kind: Z3WorkerMessageKind.OPTIMIZE });
  });

  it('should run the timetable solve procedure if the week solve is completed', () => {
    TimetableOptimizer.initOptimizer(callbacks);
    TimetableOptimizer.completedStage1Solve = true;
    TimetableOptimizer.printBuffer = 'some smt2lib stuff';
    // Send initialized message
    const messageData: Z3WorkerMessage = { kind: Z3WorkerMessageKind.EXIT, msg: '' };
    const msg: MessageEvent = new MessageEvent('placeholderType', {
      data: messageData,
      lastEventId: 'placeholder',
      origin: 'placeholder',
      ports: [],
      source: null,
    });
    TimetableOptimizer.receiveWorkerMessage(msg);

    expect(TimetableOptimizer.completedStage1Solve).toBe(false); // should get reset
    expect(mockUpdateZ3WeeksolveOutput).toBeCalledWith('some smt2lib stuff');
    expect(callbacks.onSmtLib2ResultOutput).toBeCalledWith('some smt2lib stuff\n');
    expect(mockZ3OutputToTimetable).toBeCalledWith('some smt2lib stuff');
    expect(callbacks.onTimetableOutput).toBeCalled();
  });
});
