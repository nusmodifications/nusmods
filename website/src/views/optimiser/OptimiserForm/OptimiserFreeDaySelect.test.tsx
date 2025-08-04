import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useOptimiserForm from 'views/hooks/useOptimiserForm';
import OptimiserFreeDaySelect from './OptimiserFreeDaySelect';

jest.mock('./OptimiserFormTooltip', () => ({
  __esModule: true,
  default: () => <div />,
}));

describe('OptimiserLessonOptionSelect', () => {
  type Props = {
    hasSaturday: boolean;
  };

  const Helper: React.FC<Props> = ({ hasSaturday }) => {
    const optimiserFormFields = useOptimiserForm();
    return (
      <OptimiserFreeDaySelect hasSaturday={hasSaturday} optimiserFormFields={optimiserFormFields} />
    );
  };

  it('should not show saturday', () => {
    const { container } = render(<Helper hasSaturday={false} />);
    expect(container).toHaveTextContent('Monday');
    expect(container).toHaveTextContent('Tuesday');
    expect(container).toHaveTextContent('Wednesday');
    expect(container).toHaveTextContent('Thursday');
    expect(container).toHaveTextContent('Friday');
    expect(container).not.toHaveTextContent('Saturday');
  });

  it('should show saturday', () => {
    const { container } = render(<Helper hasSaturday />);
    expect(container).toHaveTextContent('Monday');
    expect(container).toHaveTextContent('Tuesday');
    expect(container).toHaveTextContent('Wednesday');
    expect(container).toHaveTextContent('Thursday');
    expect(container).toHaveTextContent('Friday');
    expect(container).toHaveTextContent('Saturday');
  });

  it('should toggle the selected day', async () => {
    render(<Helper hasSaturday={false} />);
    const monday = screen.getByText('Monday');
    expect(monday).not.toHaveClass('active');

    await userEvent.click(screen.getByText('Monday'));
    expect(screen.getByText('Monday')).toHaveClass('active');

    await userEvent.click(screen.getByText('Monday'));
    expect(screen.getByText('Monday')).not.toHaveClass('active');
  });
});
