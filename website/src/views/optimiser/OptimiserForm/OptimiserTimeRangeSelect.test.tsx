import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useOptimiserForm from 'views/hooks/useOptimiserForm';
import {
  OptimiserLessonTimeRangeSelect,
  OptimiserLunchTimeRangeSelect,
  OptimiserTimeRangeSelect,
  TimeRangeSelectProps,
} from './OptimiserTimeRangeSelect';

jest.mock('./OptimiserFormTooltip', () => ({
  __esModule: true,
  default: () => <div />,
}));

const SELECT_LABEL_TEXT = 'Choose a time from the given range';

describe('OptimiserTimeRangeSelect', () => {
  it('should call setTime when valuue is changed', async () => {
    const setTime = jest.fn();
    const props: TimeRangeSelectProps = {
      id: 'test',
      currentValue: '0800',
      timeValues: ['0800', '0830', '0900'],
      setTime,
    };
    render(<OptimiserTimeRangeSelect {...props} />);
    const select = screen.getByLabelText(SELECT_LABEL_TEXT);
    expect(select).toHaveValue('0800');
    expect(select).toHaveDisplayValue('08:00');

    await userEvent.selectOptions(select, '08:30');
    expect(setTime).toHaveBeenCalledWith('0830');
  });
});

describe('OptimiserLessonTimeRangeSelect', () => {
  const Helper: React.FC = () => {
    const optimiserFormFields = useOptimiserForm();
    return <OptimiserLessonTimeRangeSelect optimiserFormFields={optimiserFormFields} />;
  };

  it('should update the lesson time range', async () => {
    render(<Helper />);
    const selects = screen.getAllByLabelText(SELECT_LABEL_TEXT);
    expect(selects).toHaveLength(2);
    expect(selects.at(0)).toHaveValue('0800');
    expect(selects.at(1)).toHaveValue('1900');

    await userEvent.selectOptions(selects.at(0)!, '0830');
    expect(selects.at(0)).toHaveValue('0830');
    expect(selects.at(1)).toHaveValue('1900');

    await userEvent.selectOptions(selects.at(1)!, '1200');
    expect(selects.at(0)).toHaveValue('0830');
    expect(selects.at(1)).toHaveValue('1200');
  });
});

describe('OptimiserLunchTimeRangeSelect', () => {
  const Helper: React.FC = () => {
    const optimiserFormFields = useOptimiserForm();
    return <OptimiserLunchTimeRangeSelect optimiserFormFields={optimiserFormFields} />;
  };

  it('should update the lunch time range', async () => {
    render(<Helper />);
    const selects = screen.getAllByLabelText(SELECT_LABEL_TEXT);
    expect(selects).toHaveLength(2);
    expect(selects.at(0)).toHaveValue('1200');
    expect(selects.at(1)).toHaveValue('1400');

    await userEvent.selectOptions(selects.at(0)!, '1100');
    expect(selects.at(0)).toHaveValue('1100');
    expect(selects.at(1)).toHaveValue('1400');

    await userEvent.selectOptions(selects.at(1)!, '1700');
    expect(selects.at(0)).toHaveValue('1100');
    expect(selects.at(1)).toHaveValue('1700');
  });
});
