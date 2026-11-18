import { render, screen } from '@testing-library/react';
import DayHeader, { HeaderDate } from './DayHeader';
import { addDays } from 'date-fns';

describe(DayHeader, () => {
  const today = new Date('2016-11-23T09:00+0800');

  test('render one date when one date is specified', () => {
    const { container, rerender } = render(<DayHeader date={today} offset={0} />);
    expect(container.querySelectorAll('time')).toHaveLength(1);

    rerender(<DayHeader date={[today]} offset={0} />);
    expect(container.querySelectorAll('time')).toHaveLength(1);
  });

  test('render two date when more than one date is specified', () => {
    const { container, rerender } = render(
      <DayHeader date={[today, addDays(today, 1)]} offset={0} />,
    );
    expect(container.querySelectorAll('time')).toHaveLength(2);

    rerender(<DayHeader date={[today, addDays(today, 1), addDays(today, 2)]} offset={0} />);
    expect(container.querySelectorAll('time')).toHaveLength(2);
  });

  test('render weather when it is specified', () => {
    render(<DayHeader date={today} offset={0} forecast="Cloudy" />);
    expect(screen.getByLabelText('Cloudy')).toBeInTheDocument();
  });
});

describe(HeaderDate, () => {
  const today = new Date('2016-11-23T09:00+0800');

  test('render title as today if offset is zero', () => {
    const { container } = render(<HeaderDate offset={0}>{today}</HeaderDate>);
    expect(container).toHaveTextContent('Today');
  });

  test('render title as tomorrow if offset is one', () => {
    const { container } = render(<HeaderDate offset={1}>{today}</HeaderDate>);
    expect(container).toHaveTextContent('Tomorrow');
  });

  test.each([2, 3])('render date as day of week if offset is %i', (offset) => {
    const { container } = render(<HeaderDate offset={offset}>{today}</HeaderDate>);
    const time = container.querySelector('time');
    expect(time).toHaveAttribute('dateTime', '2016-11-23T01:00:00.000Z');
    expect(time).toHaveTextContent('23rd November Wednesday');
  });
});
