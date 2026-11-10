import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash-es';

import ModuleFinderPagerButton from './ModuleFinderPagerButton';
import styles from './ModuleFinderPagerButton.scss';

// The real Tooltip is loaded lazily and only appears on hover, so render its content inline
// to check whether the button was given one.
vi.mock('views/components/Tooltip', () => ({
  default: ({ content, children }: { content: ReactNode; children: ReactNode }) => (
    <>
      {children}
      <span role="tooltip">{content}</span>
    </>
  ),
}));

describe(ModuleFinderPagerButton, () => {
  const defaultProps = {
    onClick: noop,
    children: null,
  };

  test('should render inactive and enabled by default', () => {
    render(<ModuleFinderPagerButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass(styles.active);
    expect(button).toBeEnabled();
  });

  test('should render active button', () => {
    render(<ModuleFinderPagerButton {...defaultProps} active />);
    expect(screen.getByRole('button')).toHaveClass(styles.active);
  });

  test('should render disabled button', () => {
    render(<ModuleFinderPagerButton {...defaultProps} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('should only render tooltip in appropriate conditions', () => {
    const { unmount } = render(<ModuleFinderPagerButton {...defaultProps} />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    unmount();

    render(<ModuleFinderPagerButton {...defaultProps} tooltipTitle="test" />);
    expect(screen.getByRole('tooltip')).toHaveTextContent('test');
  });

  test('should respond to clicks', async () => {
    const onClick = vi.fn();
    render(<ModuleFinderPagerButton {...defaultProps} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
