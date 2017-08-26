// @flow

import HistoryDebouncer from './HistoryDebouncer';

function createHistoryMock() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
  };
}

beforeEach(() => {
  jest.spyOn(Date, 'now')
    .mockReturnValue(0);
});

afterEach(() => {
  Date.now.mockRestore();
});

test('HistoryDebouncer should call history.push() at the leading edge', () => {
  const mock = createHistoryMock();
  const history = new HistoryDebouncer(mock);

  history.push('test-1');
  Date.now.mockReturnValue(30.1 * 1000);
  history.push('test-2', { test: 'state' });

  expect(mock.push.mock.calls).toEqual([
    ['test-1', undefined],
    ['test-2', { test: 'state' }],
  ]);
  expect(mock.replace).not.toBeCalled();
});

test('HistoryDebouncer should call history.replace() within wait', () => {
  const mock = createHistoryMock();
  const history = new HistoryDebouncer(mock);

  history.push('test-1');

  Date.now.mockReturnValue(2 * 1000);
  history.push('test-2', { test: 'state' });

  Date.now.mockReturnValue(30.1 * 1000);
  history.push('test-3');

  Date.now.mockReturnValue(62.2 * 1000);
  history.push('test-4');

  expect(mock.push.mock.calls).toEqual([
    ['test-1', undefined],
    ['test-4', undefined],
  ]);

  expect(mock.replace.mock.calls).toEqual([
    ['test-2', { test: 'state' }],
    ['test-3', undefined],
  ]);
});

test('HistoryDebouncer should accept a wait time as second parameter', () => {
  const mock = createHistoryMock();
  const history = new HistoryDebouncer(mock, 10 * 1000);

  history.push('test-1');
  Date.now.mockReturnValue(10.1 * 1000);
  history.push('test-2');

  expect(mock.push.mock.calls).toEqual([
    ['test-1', undefined],
    ['test-2', undefined],
  ]);
});
