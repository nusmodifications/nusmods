import { shallow } from 'enzyme';
import { addDays } from 'date-fns';
import { render, screen } from '@testing-library/react';
import DayHeader, { HeaderDate } from './DayHeader';

describe(DayHeader, () => {
  const today = new Date('2016-11-23T09:00+0800');

  test('render one date when one date is specified', () => {
    const { rerender } = render(<DayHeader date={today} offset={0} />);
    expect(screen.getAllByRole('time')).toHaveLength(1);
    rerender(<DayHeader date={[today]} offset={0} />);
    expect(screen.getAllByRole('time')).toHaveLength(1);
  });

  test('render two date when more than one date is specified', () => {
    const { rerender } = render(<DayHeader date={[today, addDays(today, 1)]} offset={0} />);
    expect(screen.getAllByRole('time')).toHaveLength(2);
    rerender(<DayHeader date={[today, addDays(today, 1), addDays(today, 2)]} offset={0} />);
    expect(screen.getAllByRole('time')).toHaveLength(2);
  });

  test('render weather when it is specified', () => {
    const forecast = 'Cloudy';
    render(<DayHeader date={today} offset={0} forecast={forecast} />);
    expect(screen.getByLabelText(forecast)).toBeInTheDocument();
  });
});

describe(HeaderDate, () => {
  const today = new Date('2016-11-23T09:00+0800');

  test('render title as today if offset is zero', () => {
    render(<HeaderDate offset={0}>{today}</HeaderDate>);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  test('render title as tomorrow if offset is one', () => {
    render(<HeaderDate offset={1}>{today}</HeaderDate>);
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
  });

  test('render date as day of week if offset more than one', () => {
    const { rerender } = render(<HeaderDate offset={2}>{today}</HeaderDate>);
    expect(screen.getByRole('time')).toHaveTextContent('23rd November Wednesday');
    rerender(<HeaderDate offset={3}>{today}</HeaderDate>);
    expect(screen.getByRole('time')).toHaveTextContent('23rd November Wednesday');
  });
});
