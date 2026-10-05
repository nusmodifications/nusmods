import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useOptimiserForm from 'views/hooks/useOptimiserForm';
import OptimiserFreeDaySelect from './OptimiserFreeDaySelect';

vi.mock('./OptimiserFormTooltip', () => ({
  __esModule: true,
  default: () => <div />,
}));

describe('OptimiserLessonOptionSelect', () => {
  type Props = {
    hasSaturday: boolean;
    hasSunday: boolean;
  };

  const Helper: React.FC<Props> = ({ hasSaturday, hasSunday }) => {
    const optimiserFormFields = useOptimiserForm();
    return (
      <OptimiserFreeDaySelect
        hasSaturday={hasSaturday}
        hasSunday={hasSunday}
        optimiserFormFields={optimiserFormFields}
      />
    );
  };

  it('should not show saturday', () => {
    const { container } = render(<Helper hasSaturday={false} hasSunday={false} />);
    expect(container).toHaveTextContent('Monday');
    expect(container).toHaveTextContent('Tuesday');
    expect(container).toHaveTextContent('Wednesday');
    expect(container).toHaveTextContent('Thursday');
    expect(container).toHaveTextContent('Friday');
    expect(container).not.toHaveTextContent('Saturday');
    expect(container).not.toHaveTextContent('Sunday');
  });

  it('should show saturday when a saturday class is available', () => {
    const { container } = render(<Helper hasSaturday hasSunday={false} />);
    expect(container).toHaveTextContent('Monday');
    expect(container).toHaveTextContent('Tuesday');
    expect(container).toHaveTextContent('Wednesday');
    expect(container).toHaveTextContent('Thursday');
    expect(container).toHaveTextContent('Friday');
    expect(container).toHaveTextContent('Saturday');
    expect(container).not.toHaveTextContent('Sunday');
  });

  it('should show sunday when a sunday class is available', () => {
    const { container } = render(<Helper hasSaturday={false} hasSunday />);
    expect(container).toHaveTextContent('Sunday');
    expect(container).not.toHaveTextContent('Saturday');
  });

  it('should show both weekend days when both have classes', () => {
    const { container } = render(<Helper hasSaturday hasSunday />);
    expect(container).toHaveTextContent('Saturday');
    expect(container).toHaveTextContent('Sunday');
  });

  it('should toggle the selected day', async () => {
    render(<Helper hasSaturday={false} hasSunday={false} />);
    const monday = screen.getByText('Monday');
    expect(monday).not.toHaveClass('active');

    await userEvent.click(screen.getByText('Monday'));
    expect(screen.getByText('Monday')).toHaveClass('active');

    await userEvent.click(screen.getByText('Monday'));
    expect(screen.getByText('Monday')).not.toHaveClass('active');
  });

  it('should allow Sunday to be selected as a free day', async () => {
    render(<Helper hasSaturday={false} hasSunday />);
    const sunday = screen.getByRole('checkbox', { name: 'Sunday' });

    expect(sunday).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sunday);
    expect(sunday).toHaveAttribute('aria-checked', 'true');
  });
});
