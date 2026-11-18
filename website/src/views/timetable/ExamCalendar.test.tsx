import { mount } from 'enzyme';
import { cloneDeep, range } from 'lodash-es';
import { Link, MemoryRouter } from 'react-router-dom';

import { ModuleWithColor } from 'types/views';
import mockModules from '__mocks__/modules';
/** @vars {Module} */
import GER1000 from '__mocks__/modules/GER1000.json';
/** @vars {Module} */
import PC1222 from '__mocks__/modules/PC1222.json';
/** @vars {Module} */
import CS1010S from '__mocks__/modules/CS1010S.json';
/** @vars {Module} */
import ACC2002 from '__mocks__/modules/ACC2002.json';
import { Semester } from 'types/modules';

import ExamCalendar, { getTimeSegment } from './ExamCalendar';
import styles from './ExamCalendar.scss';

const TR_PER_WEEK = 4;
const modulesWithColor = mockModules.map((module, i) => ({
  ...module,
  colorIndex: i,
})) as unknown as ModuleWithColor[];

function make(modules: ModuleWithColor[] = [], semester: Semester = 1) {
  return mount(
    <MemoryRouter>
      <ExamCalendar semester={semester} modules={modules} />
    </MemoryRouter>,
  );
}

// AY17/18 semester 1 exams are from Nov 27 to Dec 9
//    November 2017         December 2017
// Su Mo Tu We Th Fr Sa  Su Mo Tu We Th Fr Sa
//           1  2  3  4                  1  2
//  5  6  7  8  9 10 11   3  4  5  6  7  8  9
// 12 13 14 15 16 17 18  10 11 12 13 14 15 16
// 19 20 21 22 23 24 25  17 18 19 20 21 22 23
// 26 27 28 29 30        24 25 26 27 28 29 30
//                       31
// Mock module exam dates in semester 1 -
//  - GER1000: 2017-11-25 (Sat) Afternoon
//  - CS1010S: 2017-11-29 (Wed) Evening
//  - ACC2002: 2017-12-01 (Fri) Morning
//  - CS4243:  2017-11-29 (Wed) Morning
//  - GES1021: 2017-11-29 (Wed) Evening
//  - PC1222:  2017-12-05 (Tue) Evening
//  - CS3216:  No exams
describe(ExamCalendar, () => {
  test('show the full week (Mon-Sun) when there is a Saturday exam', () => {
    // GER1000 has a Saturday exam (2017-11-25), so the weekend should be shown
    const wrapper = make([GER1000 as unknown as ModuleWithColor]);

    expect(wrapper.find('thead th')).toHaveLength(7);
    expect(wrapper.find('thead th').map((th) => th.text())).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
  });

  test('show only weekdays (Mon-Fri) when there is no Saturday exam', () => {
    const wrapper = make(modulesWithColor);

    expect(wrapper.find('thead th')).toHaveLength(5);
    expect(wrapper.find('thead th').map((th) => th.text())).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
    ]);
  });

  test('show only one week when all exams fall within the same week', () => {
    // CS1010S (2017-11-29, Wed) and ACC2002 (2017-12-01, Fri) both fall in the week of Mon
    // 2017-11-27, so only that single week should be rendered.
    const wrapper = make([
      CS1010S as unknown as ModuleWithColor,
      ACC2002 as unknown as ModuleWithColor,
    ]);

    expect(wrapper.find('tbody tr')).toHaveLength(TR_PER_WEEK);
    expect(wrapper.find(Link)).toHaveLength(2);
    expect(wrapper.find(`.${styles.dayDate} time`).first().text()).toEqual('Nov 27');
  });

  test('show only the exam week when a single module has an exam', () => {
    const wrapper = make([PC1222 as unknown as ModuleWithColor]);

    expect(wrapper.find('tbody tr')).toHaveLength(TR_PER_WEEK);
    expect(wrapper.find(`.${styles.dayDate} time`).first().text()).toEqual('Dec 4');
  });

  test('show a message instead of a table when there are no exams', () => {
    const wrapper = make([]);

    expect(wrapper.find(`.${styles.noExams}`)).toHaveLength(1);
    expect(wrapper.find('table')).toHaveLength(0);
  });

  test('show month names only in the first cell and on first weekday of month', () => {
    const wrapper = make(modulesWithColor);

    wrapper.find(`.${styles.day} h3`).forEach((element, index) => {
      if (index === 0) {
        expect(element.text()).toEqual('Nov 27');
      } else if (index === 4) {
        expect(element.text()).toEqual('Dec 1');
      } else {
        // Expect it to be a valid numeric string from 1-31
        expect(range(1, 32)).toContain(Number(element.text()));
      }
    });
  });

  test('show modules that have exams', () => {
    const wrapper = make(modulesWithColor);

    expect(
      wrapper
        .find(Link)
        .map((element) => element.find(`.${styles.moduleCode}`).text())
        .sort(),
    ).toEqual(['ACC2002', 'CS1010A', 'CS1010S', 'GES1021', 'PC1222']);
  });

  test('show modules outside the two week exam period', () => {
    const wrapper = make([GER1000 as unknown as ModuleWithColor]);

    expect(wrapper.find(Link)).toHaveLength(1);
    expect(wrapper.find('tbody tr')).toHaveLength(TR_PER_WEEK);
  });

  test('should hide modules which are hidden in timetable', () => {
    const modules = cloneDeep(modulesWithColor);
    modules[0].isHiddenInTimetable = true;
    const wrapper = make(modules);

    expect(wrapper.find(Link)).toHaveLength(4);
    expect(
      wrapper
        .find(Link)
        .map((element) => element.find(`.${styles.moduleCode}`).text())
        .sort(),
    ).toEqual(['CS1010A', 'CS1010S', 'GES1021', 'PC1222']);
  });

  test('should hide modules which are TA modules in timetable', () => {
    const modules = cloneDeep(modulesWithColor);
    modules[0].isTaInTimetable = true;
    const wrapper = make(modules);

    expect(wrapper.find(Link)).toHaveLength(4);
    expect(
      wrapper
        .find(Link)
        .map((element) => element.find(`.${styles.moduleCode}`).text())
        .sort(),
    ).toEqual(['CS1010A', 'CS1010S', 'GES1021', 'PC1222']);
  });
});

describe(getTimeSegment, () => {
  it.each([
    ['8:30 AM', 'Morning'],
    ['9:00 AM', 'Morning'],
    ['10:00 AM', 'Morning'],
    ['11:00 AM', 'Morning'],

    ['12:00 PM', 'Afternoon'],
    ['1:00 PM', 'Afternoon'],
    ['2:00 PM', 'Afternoon'],
    ['2:30 PM', 'Afternoon'],
    ['3:00 PM', 'Afternoon'],

    ['5:00 PM', 'Evening'],
    ['6:30 PM', 'Evening'],
  ])('%s is in the %s', (time, expected) => expect(getTimeSegment(time)).toBe(expected));
});
