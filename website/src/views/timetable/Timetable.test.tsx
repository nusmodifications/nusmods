import { render } from '@testing-library/react';
import { ColoredLesson, InteractableLesson, TimetableArrangement } from 'types/timetables';
import { TimePeriod } from 'types/venues';
import Timetable from './Timetable';

function renderTimetable(days: string[], highlightPeriod?: TimePeriod) {
  // Force the HOC's clock to Sunday in Singapore time so current-day shading is stable.
  window.history.replaceState({}, '', '?date=2026-10-04T10:00:00Z');
  const lessons = Object.fromEntries(days.map((day) => [day, [[]]])) as TimetableArrangement<
    ColoredLesson | InteractableLesson
  >;

  return render(<Timetable lessons={lessons} highlightPeriod={highlightPeriod} />);
}

function getDayNames(container: HTMLElement) {
  return Array.from(container.querySelectorAll('.dayNameText')).map((element) => element.textContent);
}

describe('Timetable weekend columns', () => {
  it('shows weekdays only when there are no weekend lessons', () => {
    const { container } = renderTimetable([]);

    expect(getDayNames(container)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  });

  it('shows Saturday for a Saturday lesson without adding Sunday', () => {
    const { container } = renderTimetable(['Saturday']);

    expect(getDayNames(container)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });

  it('shows both weekend columns for Sunday lessons', () => {
    const { container } = renderTimetable(['Sunday']);

    expect(getDayNames(container)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
  });

  it('keeps Saturday and Sunday together when both have lessons', () => {
    const { container } = renderTimetable(['Saturday', 'Sunday']);

    expect(getDayNames(container)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
  });

  it('shows Sunday and Saturday for a Sunday highlight when there are no Sunday lessons', () => {
    const { container } = renderTimetable([], {
      day: 6,
      startTime: '1100',
      endTime: '1200',
    });

    expect(getDayNames(container)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
    const sunday = Array.from(container.querySelectorAll('.day')).find(
      (column) => column.querySelector('.dayNameText')?.textContent === 'Sun',
    );
    expect(sunday?.querySelector('.highlight')).not.toBeNull();
  });

  it('applies current-day shading and highlights to Sunday', () => {
    const { container } = renderTimetable(['Sunday'], {
      day: 6,
      startTime: '1100',
      endTime: '1200',
    });
    const dayColumns = Array.from(container.querySelectorAll('.day'));
    const saturday = dayColumns.find((column) => column.querySelector('.dayNameText')?.textContent === 'Sat');
    const sunday = dayColumns.find((column) => column.querySelector('.dayNameText')?.textContent === 'Sun');

    expect(saturday?.querySelector('.currentDay')).toBeNull();
    expect(saturday?.querySelector('.highlight')).toBeNull();
    expect(sunday?.querySelector('.currentDay')).not.toBeNull();
    expect(sunday?.querySelector('.highlight')).not.toBeNull();
  });
});
