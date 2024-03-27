import type { FC } from 'react';
import { act, render } from '@testing-library/react';
import type { MediaQuery } from 'types/views';
import { breakpointUp } from 'utils/css';
import { mockDom, mockDomReset, mockWindowMatchMedia } from 'test-utils/mockDom';
import useMediaQuery, { getMedia } from './useMediaQuery';

type Props = {
  mediaQuery: MediaQuery;
};

const Tester: FC<Props> = (props) => {
  const matchedBreakpoint = useMediaQuery(props.mediaQuery);
  return matchedBreakpoint ? <>matched</> : <>no match</>;
};

describe(useMediaQuery, () => {
  function make(mediaQuery: MediaQuery) {
    return render(<Tester mediaQuery={mediaQuery} />);
  }

  beforeEach(() => {
    mockDom();
  });

  afterEach(() => {
    mockDomReset();
  });

  test('should return whether media queries were matched', () => {
    let onMediaChangeCallback: () => void;
    const addEventListener = (_type: string, listener: (...args: unknown[]) => void) => {
      onMediaChangeCallback = listener;
    };

    mockWindowMatchMedia({ matches: true, addEventListener });
    const { container } = make(breakpointUp('md'));
    expect(container).toMatchInlineSnapshot(`
      <div>
        matched
      </div>
    `);

    mockWindowMatchMedia({ matches: false, addEventListener });
    // Trigger render when matches changes
    act(() => onMediaChangeCallback());
    expect(container).toMatchInlineSnapshot(`
      <div>
        no match
      </div>
    `);
  });

  test('should transform media query correctly', () => {
    mockWindowMatchMedia({ matches: false });
    const matchMediaSpy = jest.spyOn(window, 'matchMedia');
    expect(matchMediaSpy).not.toHaveBeenCalled();

    const jsonMediaQuery = breakpointUp('md');
    make(jsonMediaQuery);
    expect(matchMediaSpy).toHaveBeenLastCalledWith(getMedia(jsonMediaQuery));

    const stringMediaQuery = '(min-width: 100px)';
    make(stringMediaQuery);
    expect(matchMediaSpy).toHaveBeenLastCalledWith(getMedia(stringMediaQuery));

    matchMediaSpy.mockRestore();
  });
});
