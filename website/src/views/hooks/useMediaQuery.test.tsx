import { act, render } from '@testing-library/react';
import { breakpointUp } from 'utils/css';
import type { FC } from 'react';
import { mockDom, mockDomReset, mockWindowMatchMedia } from 'test-utils/mockDom';
import useMediaQuery from './useMediaQuery';

const Tester: FC = () => {
  const matchedBreakpoint = useMediaQuery(breakpointUp('md'));
  return matchedBreakpoint ? <>matched</> : <>no match</>;
};

describe(useMediaQuery, () => {
  beforeEach(() => {
    mockDom();
  });

  afterEach(() => {
    mockDomReset();
  });

  test('should display correct module based on matching', () => {
    let onMediaChangeCallback: () => void;
    const addEventListener = (_type: string, listener: (...args: unknown[]) => void) => {
      onMediaChangeCallback = listener;
    };

    mockWindowMatchMedia({ matches: true, addEventListener });
    const { container } = render(<Tester />);
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
});
