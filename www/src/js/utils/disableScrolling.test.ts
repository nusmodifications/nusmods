import noScrollNpm from 'no-scroll';
import disableScrolling from './disableScrolling';

jest.mock('no-scroll');

describe('noScroll()', () => {
  const { body } = document;

  afterEach(() => {
    noScrollNpm.toggle.mockClear();
  });

  test('turn noScroll on or off', () => {
    disableScrolling(true);
    expect(noScrollNpm.toggle).toBeCalled();
    expect(body && body.classList.contains('no-scroll')).toBe(true);

    disableScrolling(false);
    expect(noScrollNpm.toggle).toHaveBeenCalledTimes(2);
    expect(body && body.classList.contains('no-scroll')).toBe(false);
  });

  test('not do anything if it is already on/off', () => {
    disableScrolling(false);
    expect(noScrollNpm.toggle).not.toHaveBeenCalled();
    expect(body && body.classList.contains('no-scroll')).toBe(false);

    disableScrolling(true);
    disableScrolling(true);
    disableScrolling(true);
    expect(noScrollNpm.toggle).toHaveBeenCalledTimes(1);
    expect(body && body.classList.contains('no-scroll')).toBe(true);
  });
});
