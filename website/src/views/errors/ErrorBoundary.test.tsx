import type { Mock } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { captureException } from 'utils/error';
import ErrorBoundary from './ErrorBoundary';

const mockCaptureException = captureException as Mock;

vi.mock('utils/error');
vi.mock('views/errors/ErrorPage', () => ({
  default: function ErrorPage() {
    return '<ErrorPage> component';
  },
}));

// To be used to compare with error caught by ErrorBoundary
const error = new Error('Test error');

// Stateless React component which throws error
const ThrowsError: React.FC<React.PropsWithChildren> = (): never => {
  throw error;
};

describe('ErrorBoundary', () => {
  let consoleError: typeof console.error;

  beforeEach(() => {
    mockCaptureException.mockReset();

    // Silence console errors
    consoleError = global.console.error;
    global.console.error = vi.fn();
  });

  afterEach(() => {
    global.console.error = consoleError;
  });

  test('should display children when there is no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Some content</div>
      </ErrorBoundary>,
    );

    expect(container).toHaveTextContent(/^Some content$/);
  });

  test('should show nothing by default when error is thrown', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowsError>Some content</ThrowsError>
      </ErrorBoundary>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(mockCaptureException).toHaveBeenCalledWith(error, expect.any(Object));
  });

  test('should show custom error page if provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorPage = vi.fn((_error: Error) => 'Custom content');

    const { container } = render(
      <ErrorBoundary errorPage={errorPage}>
        <ThrowsError>Some content</ThrowsError>
      </ErrorBoundary>,
    );

    expect(container).toHaveTextContent(/^Custom content$/);
    expect(screen.queryByText('Some content')).not.toBeInTheDocument();
    expect(errorPage).toHaveBeenCalledWith(error);
  });

  test('should not capture error if captureError is false', () => {
    render(
      <ErrorBoundary captureError={false}>
        <ThrowsError>Some content</ThrowsError>
      </ErrorBoundary>,
    );

    expect(mockCaptureException).not.toHaveBeenCalled();
  });
});
