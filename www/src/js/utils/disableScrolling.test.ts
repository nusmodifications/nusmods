import noScroll from 'no-scroll';
import disableScrolling from './disableScrolling';

jest.mock('no-scroll');
const mockNoScroll = noScroll as jest.Mocked<typeof noScroll>;

describe(disableScrolling, () => {
  const { body } = document;

  afterEach(() => {
    mockNoScroll.toggle.mockClear();
  });

  test('turn noScroll on or off', () => {
    disableScrolling(true);
    expect(mockNoScroll.toggle).toBeCalled();
    expect(body && body.classList.contains('no-scroll')).toBe(true);

    disableScrolling(false);
    expect(mockNoScroll.toggle).toHaveBeenCalledTimes(2);
    expect(body && body.classList.contains('no-scroll')).toBe(false);
  });

  test('not do anything if it is already on/off', () => {
    disableScrolling(false);
    expect(mockNoScroll.toggle).not.toHaveBeenCalled();
    expect(body && body.classList.contains('no-scroll')).toBe(false);

    disableScrolling(true);
    disableScrolling(true);
    disableScrolling(true);
    expect(mockNoScroll.toggle).toHaveBeenCalledTimes(1);
    expect(body && body.classList.contains('no-scroll')).toBe(true);
  });
});
