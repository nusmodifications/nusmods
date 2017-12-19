// @flow

import createHistory from 'history/createMemoryHistory'; // eslint-disable-line import/no-extraneous-dependencies
import HistoryDebouncer from './HistoryDebouncer';

describe('HistoryDebouncer', () => {
  function createHistoryMock(initialEntries = []) {
    const history = createHistory(initialEntries);
    jest.spyOn(history, 'push');
    jest.spyOn(history, 'replace');

    return history;
  }

  beforeEach(() => {
    jest.spyOn(Date, 'now')
      .mockReturnValue(0);
  });

  afterEach(() => {
    Date.now.mockRestore();
  });

  test('should call history.push() at the leading edge', () => {
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

  test('should call history.replace() within wait', () => {
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

  test('should accept a wait time as second parameter', () => {
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

  test('should not navigate if the provided path is the same as the current one', () => {
    const mock = createHistoryMock(['/']);
    const history = new HistoryDebouncer(mock);

    history.push('/');
    expect(mock.push).not.toHaveBeenCalled();
    expect(mock.replace).not.toHaveBeenCalled();

    history.push('/new');
    history.push({ path: '/new' });
    expect(mock.replace).toHaveBeenCalledTimes(1);

    history.push({ path: '/new', search: 'test=1' });
    history.push('/new?test=1');
    expect(mock.replace).toHaveBeenCalledTimes(2);
  });
});
