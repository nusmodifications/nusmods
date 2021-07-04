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

jest.mock('utils/optimizer/converter', () =>
  // Works and lets you check for constructor calls:
  ({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    OptimizerInputSmtlibConverter: jest.fn().mockImplementation(() => {}),
  }),
);
jest.mock('./z3WebWorker.worker.ts');

beforeEach(() => {
  WebpackWorker.mockClear();
  mockOnmessage.mockClear();
  mockPostMessage.mockClear();
});

const callbacks: OptimizerCallbacks = {
  onOptimizerInitialized: jest.fn(),
  onOutput: jest.fn(),
  onSmtlib2InputCreated: jest.fn(),
  onTimetableOutput: jest.fn(),
};

describe('initOptimizer', () => {
  it('should have a clear buffer, start before the stage 1 solve, and send an init mesage', () => {
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
