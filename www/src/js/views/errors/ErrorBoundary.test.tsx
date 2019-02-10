import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { captureException } from 'utils/error';
import ErrorBoundary from './ErrorBoundary';

jest.mock('utils/error');
jest.mock(
  'views/errors/ErrorPage',
  () =>
    function ErrorPage() {
      return '<ErrorPage> component';
    },
);

const error = new Error('Test error'); // To be used to compare with error caught by ErrorBoundary
// Stateless React component which throws error
function ThrowsError() {
  throw error;
}

describe('ErrorBoundary', () => {
  let consoleError;

  beforeEach(() => {
    captureException.mockReset();

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
    expect(captureException).toHaveBeenCalledWith(error, expect.any(Object));
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

    expect(captureException).not.toHaveBeenCalled();
  });
});
