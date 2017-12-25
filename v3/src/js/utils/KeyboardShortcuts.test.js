// @flow
import KeyboardShortcuts from './KeyboardShortcuts';

describe('KeyboardShortcuts', () => {
  test('bindKey', () => {
    const kb = new KeyboardShortcuts(document);
    const callback = jest.fn();
    const KEY_X = 88;
    const KEY_RANDOM = 42;
    kb.bindKey(KEY_X, callback);

    const xEvent = new KeyboardEvent('keydown', { keyCode: KEY_X });
    document.dispatchEvent(xEvent);
    expect(callback).toHaveBeenCalledTimes(1);

    const nonXEvent = new KeyboardEvent('keydown', { keyCode: KEY_RANDOM });
    document.dispatchEvent(nonXEvent);
    expect(callback).toHaveBeenCalledTimes(1);

    document.dispatchEvent(xEvent);
    expect(callback).toHaveBeenCalledTimes(2);

    window.dispatchEvent(xEvent);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
