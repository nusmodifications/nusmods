import { render, screen } from '@testing-library/react';
import { OnlineComponent } from './Online';

const jest = vi;
describe(OnlineComponent, () => {
  const testContent = <span>Test</span>;

  test('should return nothing if the app is offline', () => {
    const { container } = render(<OnlineComponent isOnline={false}>{testContent}</OnlineComponent>);
    expect(container).toBeEmptyDOMElement();
  });

  test('should return content if the app is online', () => {
    render(<OnlineComponent isOnline>{testContent}</OnlineComponent>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('should call render function with isOnline status', () => {
    const renderFn = jest.fn().mockReturnValue(null);
    const { rerender } = render(<OnlineComponent isOnline>{renderFn}</OnlineComponent>);

    expect(renderFn).toHaveBeenLastCalledWith(true);
    rerender(<OnlineComponent isOnline={false}>{renderFn}</OnlineComponent>);
    expect(renderFn).toHaveBeenLastCalledWith(false);
  });

  test('should not rerender if isLive is false', () => {
    const { container, rerender } = render(
      <OnlineComponent isOnline={false} isLive={false}>
        {testContent}
      </OnlineComponent>,
    );
    expect(container).toBeEmptyDOMElement();
    rerender(
      <OnlineComponent isOnline isLive={false}>
        {testContent}
      </OnlineComponent>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
