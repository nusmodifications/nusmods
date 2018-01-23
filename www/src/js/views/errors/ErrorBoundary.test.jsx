// @flow

import React, { Component } from 'react';
import { shallow, mount } from 'enzyme';
import Raven from 'raven-js';

import ErrorBoundary from './ErrorBoundary';

jest.mock('raven-js');
jest.mock(
  'views/errors/ErrorPage',
  () =>
    function ErrorPage() {
      return '<ErrorPage> component';
    },
);

// eslint-disable-next-line react/require-render-return
class ThrowsError extends Component<{
  error: Error,
}> {
  static defaultProps = {
    error: new Error('Test error'),
  };

  render() {
    throw this.props.error;
  }
}

describe('ErrorBoundary', () => {
  let consoleError;

  beforeEach(() => {
    Raven.captureException.mockReset();

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
    const error = new Error('Test error');
    const wrapper = mount(
      <ErrorBoundary>
        <ThrowsError error={error}>Some content</ThrowsError>
      </ErrorBoundary>,
    );

    expect(wrapper.isEmptyRender()).toBe(true);
    expect(Raven.captureException).toHaveBeenCalledWith(error, expect.any(Object));
  });

  test('should show custom error page if provided', () => {
    const error = new Error('Test error');
    const errorPage = jest.fn(() => 'Custom content');
    const eventId = '12345';

    Raven.lastEventId.mockReturnValue(eventId);
    const wrapper = mount(
      <ErrorBoundary errorPage={errorPage}>
        <ThrowsError error={error}>Some content</ThrowsError>
      </ErrorBoundary>,
    );

    expect(wrapper.text()).toEqual('Custom content');
    expect(errorPage).toHaveBeenCalledWith(error, eventId);
  });

  test('should not capture error if captureError is false', () => {
    mount(
      <ErrorBoundary captureError={false}>
        <ThrowsError>Some content</ThrowsError>
      </ErrorBoundary>,
    );

    expect(Raven.captureException).not.toHaveBeenCalled();
  });
});
