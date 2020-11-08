import { mount } from 'enzyme';
import _ from 'lodash';
import { Link, MemoryRouter } from 'react-router-dom';

import { ModuleWithColor } from 'types/views';
import mockModules from '__mocks__/modules';
/** @vars {Module} */
import GER1000 from '__mocks__/modules/GER1000.json';
import { Semester } from 'types/modules';

import ExamCalendar, { getTimeSegment } from './ExamCalendar';
import styles from './ExamCalendar.scss';

const TR_PER_WEEK = 4;
const modulesWithColor = (mockModules.map((module, i) => ({
  ...module,
  colorIndex: i,
})) as unknown) as ModuleWithColor[];

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
  test('only show Saturday if there is a Saturday exam', () => {
    const withSaturdayExams = make([(GER1000 as unknown) as ModuleWithColor]);
    const withoutSaturdayExams = make(modulesWithColor);

    expect(withSaturdayExams.find('thead th')).toHaveLength(6);
    expect(withoutSaturdayExams.find('thead th')).toHaveLength(5);
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
        expect(_.range(1, 32)).toContain(Number(element.text()));
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
    ).toEqual(['ACC2002', 'CS1010S', 'GES1021', 'PC1222']);
  });

  test('show modules outside the two week exam period', () => {
    const wrapper = make([(GER1000 as unknown) as ModuleWithColor]);

    expect(wrapper.find(Link)).toHaveLength(1);
    expect(wrapper.find('tbody tr')).toHaveLength(TR_PER_WEEK);
  });

  test('should hide modules which are hidden in timetable', () => {
    const modules = _.cloneDeep(modulesWithColor);
    modules[0].hiddenInTimetable = true;
    const wrapper = make(modules);

    expect(wrapper.find(Link)).toHaveLength(3);
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
