import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { captureException } from 'utils/error';
import ErrorBoundary from './ErrorBoundary';

const mockCaptureException = captureException as jest.Mock;

jest.mock('utils/error');
jest.mock(
  'views/errors/ErrorPage',
  () =>
    function ErrorPage() {
      return '<ErrorPage> component';
    },
);

// To be used to compare with error caught by ErrorBoundary
const error = new Error('Test error');

// Stateless React component which throws error
const ThrowsError: React.FC<unknown> = (): never => {
  throw error;
};

describe('ErrorBoundary', () => {
  let consoleError: typeof console.error;

  beforeEach(() => {
    mockCaptureException.mockReset();

    // Silence console errors
    consoleError = global.console.error;
    global.console.error = jest.fn();
  });

  afterEach(() => {
    global.console.error = consoleError;
  });

  test('should display children when there is no error', () => {
    const wrapper = shallow(
      <ErrorBoundary>
        <div>Some content</div>
      </ErrorBoundary>,
    );

    expect(wrapper.text()).toEqual('Some content');
  });

  test('should show nothing by default when error is thrown', () => {
    const wrapper = mount(
      <ErrorBoundary>
        <ThrowsError>Some content</ThrowsError>
      </ErrorBoundary>,
    );

    expect(wrapper.isEmptyRender()).toBe(true);
    expect(mockCaptureException).toHaveBeenCalledWith(error, expect.any(Object));
  });

  test('should show custom error page if provided', () => {
    const errorPage = jest.fn(() => 'Custom content');

    const wrapper = mount(
      <ErrorBoundary errorPage={errorPage}>
        <ThrowsError>Some content</ThrowsError>
      </ErrorBoundary>,
    );

    expect(wrapper.text()).toEqual('Custom content');
    expect(errorPage).toHaveBeenCalledWith(error);
  });

  test('should not capture error if captureError is false', () => {
    mount(
      <ErrorBoundary captureError={false}>
        <ThrowsError>Some content</ThrowsError>
      </ErrorBoundary>,
    );

    expect(mockCaptureException).not.toHaveBeenCalled();
  });
});
