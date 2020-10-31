import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import ExamWeek from './ExamWeek';

function make(props = {}) {
  const propsWithDefaults = {
    days: 5,
    modules: {},
    weekNumber: 0,
    firstDayOfExams: new Date(),
    ...props,
  };

  return mount(
    <MemoryRouter>
      <table>
        <tbody>
          <ExamWeek {...propsWithDefaults} />
        </tbody>
      </table>
    </MemoryRouter>,
  );
}

describe(ExamWeek, () => {
  test('render provided number of days', () => {
    expect(make({ days: 5 }).find('th')).toHaveLength(5);
    expect(make({ days: 6 }).find('th')).toHaveLength(6);
  });

  test('show month name when the months changes', () => {
    const weekOfApril29 = make({ firstDayOfExams: new Date('2019-04-29T00:00:00Z') });
    expect(weekOfApril29.find('th time').map((ele) => ele.text())).toEqual([
      'Apr 29',
      '30',
      'May 1',
      '2',
      '3',
    ]);

    const weekOfDec3 = make({
      weekNumber: 1,
      firstDayOfExams: new Date(new Date('2018-11-26T00:00:00Z')),
    });
    expect(weekOfDec3.find('th time').first().text()).toEqual('Dec 3');
  });

  test('highlight today', () => {
    const weekOfToday = make();
    expect(weekOfToday.find('th span').first().text()).toEqual('Today');
  });
});
