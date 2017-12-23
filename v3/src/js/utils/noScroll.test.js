// @flow

import noScrollNpm from 'no-scroll';
import noScroll from './noScroll';

jest.mock('no-scroll');

describe('noScroll()', () => {
  const { body } = document;

  afterEach(() => {
    noScrollNpm.toggle.mockClear();
  });

  test('turn noScroll on or off', () => {
    noScroll(true);
    expect(noScrollNpm.toggle).toBeCalled();
    expect(body && body.classList.contains('no-scroll')).toBe(true);

    noScroll(false);
    expect(noScrollNpm.toggle).toHaveBeenCalledTimes(2);
    expect(body && body.classList.contains('no-scroll')).toBe(false);
  });

  test('not do anything if it is already on/off', () => {
    noScroll(false);
    expect(noScrollNpm.toggle).not.toHaveBeenCalled();
    expect(body && body.classList.contains('no-scroll')).toBe(false);

    noScroll(true);
    noScroll(true);
    noScroll(true);
    expect(noScrollNpm.toggle).toHaveBeenCalledTimes(1);
    expect(body && body.classList.contains('no-scroll')).toBe(true);
  });
});
