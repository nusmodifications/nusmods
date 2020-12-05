import { act, render } from '@testing-library/react';
import useMediaQuery from './useMediaQuery';
import { breakpointUp } from 'utils/css';
import { FC } from 'react';
import { mockWindowMatchMedia } from 'test-utils/mockDom';

const Tester: FC = () => {
  const matchedBreakpoint = useMediaQuery(breakpointUp('md'));

  if (matchedBreakpoint) {
    return <div />;
  } else {
    return null;
  }
};

describe(useMediaQuery, () => {
  function make() {
    return render(<Tester />);
  }

  test('should hide module when screen size is small', () => {
    let onMediaChangeCallback: () => void;
    const addEventListener = (_type: string, listener: (...args: unknown[]) => void) => {
      onMediaChangeCallback = listener;
    };

    mockWindowMatchMedia({ matches: true, addEventListener });
    const { container } = make();
    expect(container).not.toBeEmptyDOMElement();

    mockWindowMatchMedia({ matches: false, addEventListener });
    // Trigger render when matches changes
    act(() => onMediaChangeCallback());
    expect(container).toBeEmptyDOMElement();
  });
});
